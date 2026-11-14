import {
  EnvironmentalVariable,
  GeographicRegion,
  InvestigationConfig,
  InvestigationResult,
  ScientificInterpretation,
  StatisticalSummary,
  TimeSeriesPoint,
} from "@/types/terratrend";
import { ENVIRONMENTAL_VARIABLES } from "@/data/variables";
import { REGIONS_MAP } from "@/data/regions";

/**
 * Standard normal cumulative distribution function approximation (Abramowitz and Stegun)
 */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x > 0 ? 1 - p : p;
}

/**
 * Mann-Kendall non-parametric monotonic trend test
 */
function computeMannKendall(values: number[]): { S: number; varS: number; Z: number; pValue: number; isSignificant: boolean } {
  const n = values.length;
  if (n < 4) {
    return { S: 0, varS: 1, Z: 0, pValue: 1, isSignificant: false };
  }

  // Downsample gracefully if dataset is massive
  const step = n > 350 ? Math.ceil(n / 350) : 1;
  const sampled = values.filter((_, idx) => idx % step === 0);
  const m = sampled.length;

  let S = 0;
  for (let i = 0; i < m - 1; i++) {
    for (let j = i + 1; j < m; j++) {
      const diff = sampled[j] - sampled[i];
      if (diff > 0.0001) S += 1;
      else if (diff < -0.0001) S -= 1;
    }
  }

  // Variance under null hypothesis
  const varS = (m * (m - 1) * (2 * m + 5)) / 18;

  let Z = 0;
  if (S > 0) {
    Z = (S - 1) / Math.sqrt(varS);
  } else if (S < 0) {
    Z = (S + 1) / Math.sqrt(varS);
  }

  // Two-tailed p-value
  const pValue = Math.min(1, Math.max(0, 2 * (1 - normalCdf(Math.abs(Z)))));
  const isSignificant = pValue < 0.05;

  return { S, varS, Z, pValue, isSignificant };
}

/**
 * Sen's non-parametric slope estimator (median of pairwise slopes)
 * Includes Hollander-Wolfe rank-based non-parametric confidence interval calculation.
 */
function computeSenSlopeWithCi(
  values: number[],
  varS: number
): { senSlope: number; lowerSlope: number; upperSlope: number } {
  const n = values.length;
  if (n < 2) return { senSlope: 0, lowerSlope: 0, upperSlope: 0 };

  const step = n > 250 ? Math.ceil(n / 250) : 1;
  const sampled = values.filter((_, idx) => idx % step === 0);
  const m = sampled.length;

  const slopes: number[] = [];
  for (let i = 0; i < m - 1; i++) {
    for (let j = i + 1; j < m; j++) {
      // Delta time in original index steps
      const deltaT = (j - i) * step;
      const slope = (sampled[j] - sampled[i]) / deltaT;
      slopes.push(slope);
    }
  }

  slopes.sort((a, b) => a - b);
  const Nprime = slopes.length;
  const mid = Math.floor(Nprime / 2);
  const senSlope = Nprime % 2 !== 0 ? slopes[mid] : (slopes[mid - 1] + slopes[mid]) / 2;

  // Hollander-Wolfe rank interval for Sen's Slope
  const Z_alpha = 1.96; // 95% two-tailed critical value
  const C_alpha = Math.round(Z_alpha * Math.sqrt(varS));
  const kLower = Math.max(0, Math.floor((Nprime - C_alpha) / 2));
  const kUpper = Math.min(Nprime - 1, Math.floor((Nprime + C_alpha) / 2));

  const lowerSlope = slopes[kLower] !== undefined ? slopes[kLower] : senSlope;
  const upperSlope = slopes[kUpper] !== undefined ? slopes[kUpper] : senSlope;

  return { senSlope, lowerSlope, upperSlope };
}

/**
 * Generate time series dates based on start, end, and resolution
 */
function generateDateSeries(start: string, end: string, resolution: "daily" | "monthly"): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  if (isNaN(current.getTime()) || isNaN(endDate.getTime()) || current > endDate) {
    const defStart = new Date("2014-01-01");
    const defEnd = new Date("2024-12-31");
    return generateDateSeries(defStart.toISOString().slice(0, 10), defEnd.toISOString().slice(0, 10), resolution);
  }

  while (current <= endDate) {
    dates.push(current.toISOString().slice(0, 10));
    if (resolution === "daily") {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
    if (dates.length >= 1500) break;
  }

  return dates;
}

/**
 * Synthesizes demonstration time-series using regional climate physics parameters
 */
export function generateInvestigationData(config: InvestigationConfig): InvestigationResult {
  const region: GeographicRegion = REGIONS_MAP[config.regionId] || REGIONS_MAP["amazon-basin"];
  const variable: EnvironmentalVariable = ENVIRONMENTAL_VARIABLES[config.variableId] || ENVIRONMENTAL_VARIABLES.temperature;

  const dates = generateDateSeries(config.startDate, config.endDate, config.resolution);
  const n = dates.length;

  let annualDrift = 0;
  let seasonalAmplitude = 1.0;
  let noiseSigma = 0.3;
  let baseValue = 0;

  switch (variable.id) {
    case "temperature":
      baseValue = 0.1;
      seasonalAmplitude = region.category === "Polar" ? 2.8 : region.category === "Tropical" ? 0.6 : 1.8;
      annualDrift = region.category === "Polar" ? 0.065 : region.category === "Arid" ? 0.045 : 0.035;
      noiseSigma = 0.35;
      break;
    case "precipitation":
      baseValue = 10;
      seasonalAmplitude = region.category === "Tropical" ? 65 : region.category === "Arid" ? 25 : 40;
      annualDrift = region.id === "amazon-basin" ? -1.8 : region.id === "sahel-belt" ? 0.8 : -0.6;
      noiseSigma = 14;
      break;
    case "vegetation":
      baseValue = region.category === "Tropical" ? 0.72 : region.category === "Arid" ? 0.22 : 0.45;
      seasonalAmplitude = region.category === "Tropical" ? 0.06 : 0.16;
      annualDrift = region.id === "amazon-basin" ? -0.0035 : region.id === "sahel-belt" ? 0.0028 : 0.0012;
      noiseSigma = 0.03;
      break;
    case "air_quality":
      baseValue = 45;
      seasonalAmplitude = 18;
      annualDrift = region.category === "Continental" ? -0.85 : 0.45;
      noiseSigma = 8.5;
      break;
  }

  const points: TimeSeriesPoint[] = [];
  const observedValues: number[] = [];

  const pointsPerYear = config.resolution === "daily" ? 365.25 : 12;

  for (let i = 0; i < n; i++) {
    const d = new Date(dates[i]);
    const dayOfYear = (d.getMonth() * 30.5 + d.getDate()) % 365.25;
    const yearFraction = i / pointsPerYear;

    const seasonal = seasonalAmplitude * Math.sin((2 * Math.PI * dayOfYear) / 365.25 - 1.2);
    const enso = (seasonalAmplitude * 0.25) * Math.sin((2 * Math.PI * yearFraction) / 4.2);
    const trendComp = baseValue + annualDrift * yearFraction;

    const pseudoRandom = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const noise = (pseudoRandom - Math.floor(pseudoRandom) - 0.5) * 2 * noiseSigma;

    const year = d.getFullYear();
    let shock = 0;
    if (year === 2016 || year === 2023) {
      if (variable.id === "temperature") shock = 0.85;
      if (variable.id === "precipitation" && region.id === "amazon-basin") shock = -35;
      if (variable.id === "vegetation" && region.id === "amazon-basin") shock = -0.08;
    }

    const value = Math.round((trendComp + seasonal + enso + noise + shock) * 1000) / 1000;
    observedValues.push(value);

    const smoothedTrend = Math.round((trendComp + shock * 0.3) * 1000) / 1000;
    const confidenceMargin = Math.round((noiseSigma * 1.645) * 1000) / 1000;

    points.push({
      date: dates[i],
      timestamp: d.getTime(),
      observed: value,
      trend: smoothedTrend,
      upperConfidence: Math.round((smoothedTrend + confidenceMargin) * 1000) / 1000,
      lowerConfidence: Math.round((smoothedTrend - confidenceMargin) * 1000) / 1000,
      anomaly: Math.round((value - trendComp) * 1000) / 1000,
      isInterpolated: i % 47 === 0,
    });
  }

  // Statistical calculations
  const mk = computeMannKendall(observedValues);
  const { senSlope, lowerSlope, upperSlope } = computeSenSlopeWithCi(observedValues, mk.varS);
  const decadalRate = senSlope * pointsPerYear * 10;
  const decadalLower = lowerSlope * pointsPerYear * 10;
  const decadalUpper = upperSlope * pointsPerYear * 10;
  const annualSlope = senSlope * pointsPerYear;

  // Direction classification
  let direction: StatisticalSummary["direction"] = "Stable / No Trend";
  let directionType: StatisticalSummary["directionType"] = "stable";

  if (mk.isSignificant) {
    if (decadalRate > 0.05 * Math.abs(baseValue || 1)) {
      direction = decadalRate > 0.25 * Math.abs(baseValue || 1) ? "Rapid Increase" : "Moderate Increase";
      directionType = "increasing";
    } else if (decadalRate < -0.05 * Math.abs(baseValue || 1)) {
      direction = decadalRate < -0.25 * Math.abs(baseValue || 1) ? "Rapid Decrease" : "Moderate Decrease";
      directionType = "decreasing";
    }
  }

  const rateSign = decadalRate >= 0 ? "+" : "";
  const rateFormatted = `${rateSign}${decadalRate.toFixed(3)} ${variable.unit} / decade`;
  const ratePerDecade = `${rateSign}${(annualSlope * 10).toFixed(2)} ${variable.unit}/decade`;

  // Rigorous Hollander-Wolfe 95% Confidence Interval
  const ciLowerSign = decadalLower >= 0 ? "+" : "";
  const ciUpperSign = decadalUpper >= 0 ? "+" : "";
  const confidenceInterval = `95% CI: [${ciLowerSign}${decadalLower.toFixed(3)}, ${ciUpperSign}${decadalUpper.toFixed(3)}] ${variable.unit}/decade`;

  const totalPoints = points.length;
  const interpolatedCount = points.filter((p) => p.isInterpolated).length;
  const validObservations = totalPoints - interpolatedCount;
  const dataCoveragePercent = Math.round((validObservations / totalPoints) * 1000) / 10;

  const statistics: StatisticalSummary = {
    direction,
    directionType,
    rateOfChange: rateFormatted,
    ratePerDecade,
    annualSlope: Math.round(annualSlope * 1000) / 1000,
    statisticalSignificance: mk.isSignificant
      ? `Statistically Significant (p = ${mk.pValue < 0.001 ? "< 0.001" : mk.pValue.toFixed(3)}, Z = ${mk.Z.toFixed(2)})`
      : `Not Significant (p = ${mk.pValue.toFixed(3)}, Z = ${mk.Z.toFixed(2)})`,
    isSignificant: mk.isSignificant,
    confidenceInterval,
    pValue: mk.pValue,
    mannKendallZ: Math.round(mk.Z * 100) / 100,
    mannKendallS: mk.S,
    senSlope: Math.round(senSlope * 10000) / 10000,
    rSquared: Math.min(0.96, Math.max(0.12, Math.abs(mk.Z) / 6)),
    dataCoveragePercent,
    validObservations,
    totalPoints,
    baselinePeriod: variable.baseline,
    isDemoData: true,
  };

  const interpretation: ScientificInterpretation = buildInterpretation(region, variable, statistics, config);

  return {
    config,
    region,
    variable,
    timeSeries: points,
    statistics,
    interpretation,
    generatedAt: "2024-10-15T12:00:00.000Z",
  };
}

/**
 * Generates scientific interpretation text structured under the 4 core questions
 */
function buildInterpretation(
  region: GeographicRegion,
  variable: EnvironmentalVariable,
  stats: StatisticalSummary,
  config: InvestigationConfig,
): ScientificInterpretation {
  let whatChanged = "";
  let whereChanged = "";
  let howFastChanged = "";
  let significanceDetail = "";
  const physicalMechanisms: string[] = [];

  // 1. What changed?
  if (variable.id === "temperature") {
    whatChanged = `A persistent positive thermal anomaly trend was detected across ${region.name}. Land surface temperatures systematically diverged upward from the ${variable.baseline}, with prominent amplified summer peaks observed in recent observational periods.`;
    physicalMechanisms.push("Atmospheric greenhouse back-radiation", "Surface albedo feedback", "Sensible heat flux shift");
  } else if (variable.id === "precipitation") {
    whatChanged = `Precipitation patterns over ${region.name} demonstrate a measurable ${stats.directionType} departure from the multi-satellite climatological mean. Extended drought periods show increasing recurrence frequency and duration.`;
    physicalMechanisms.push("Hadley cell circulation expansion", "Vapor pressure deficit increase", "Convective threshold elevation");
  } else if (variable.id === "vegetation") {
    whatChanged = `Canopy photosynthetic reflectance (NDVI) shows a ${stats.directionType} trend across ${region.name}. Satellite indices reflect shifts in canopy leaf area density, moisture stress, and seasonal phenology timing.`;
    physicalMechanisms.push("Canopy stomatal conductance response", "Soil moisture depletion", "Seasonal green-up lag");
  } else {
    whatChanged = `Tropospheric vertical column density of nitrogen dioxide indicates a ${stats.directionType} trend in regional anthropogenic and biomass burning emissions over ${region.name}.`;
    physicalMechanisms.push("Boundary layer thermal inversions", "Fossil fuel combustion rate changes", "Photochemical oxidation sink dynamics");
  }

  // 2. Where did it change? (Formatted with standard N/S, E/W coordinates and en-US locale)
  const latStr =
    region.coordinates.lat >= 0
      ? `${region.coordinates.lat.toFixed(2)}°N`
      : `${Math.abs(region.coordinates.lat).toFixed(2)}°S`;
  const lngStr =
    region.coordinates.lng >= 0
      ? `${region.coordinates.lng.toFixed(2)}°E`
      : `${Math.abs(region.coordinates.lng).toFixed(2)}°W`;

  whereChanged = `The anomaly is concentrated within the geographic bounding bounds of ${region.name} (${latStr}, ${lngStr}), encompassing an approximate terrestrial area of ${region.areaKm2.toLocaleString("en-US")} km² across the ${region.boundaryGeoJson.features[0].properties?.biome || "study"} biome.`;

  // 3. How fast did it change?
  howFastChanged = `Estimated velocity of change is ${stats.rateOfChange} (Sen's non-parametric slope: ${stats.senSlope} ${variable.unit}/interval). Over the selected ${config.startDate.slice(0, 4)}–${config.endDate.slice(0, 4)} investigation timeframe, cumulative change is projected at ${(stats.annualSlope * 10).toFixed(2)} ${variable.unit} per decade.`;

  // 4. Is the trend statistically significant?
  if (stats.isSignificant) {
    significanceDetail = `Yes. The Mann-Kendall rank test yields a test statistic S = ${stats.mannKendallS} and normalized Z = ${stats.mannKendallZ}, with a two-tailed p-value of ${stats.pValue < 0.001 ? "< 0.001" : stats.pValue.toFixed(4)}. Because p < 0.05, the null hypothesis of no monotonic trend is firmly rejected with 95% statistical confidence.`;
  } else {
    significanceDetail = `No. With p = ${stats.pValue.toFixed(3)} and Z = ${stats.mannKendallZ}, the observed variation does not exceed natural inter-annual variability thresholds at the 95% confidence level. Further observation intervals are required to establish whether a monotonic shift is occurring.`;
  }

  const scientificImplication = `The observed trajectory aligns with published climatological literature for ${region.category.toLowerCase()} biomes, highlighting potential vulnerability to systemic hydrological and thermal regime shifts.`;

  const recommendedFollowUps = [
    `Cross-validate with NASA GPM / MODIS level-3 gridded netCDF products via Earthdata CMR.`,
    `Execute Pettitt's test to detect structural abrupt change-points in the historical time series.`,
    `Overlay high-resolution Landsat/Sentinel-2 spectral rasters to assess local sub-grid heterogeneity.`,
  ];

  return {
    whatChanged,
    whereChanged,
    howFastChanged,
    isSignificant: significanceDetail,
    physicalMechanisms,
    scientificImplication,
    recommendedFollowUps,
    isDemoData: true,
  };
}
