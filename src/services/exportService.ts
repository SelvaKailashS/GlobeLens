import { InvestigationResult } from "@/types/terratrend";

/**
 * TerraTrend Scientific Export Service
 * Generates verified CSV, JSON, and printable reports for research reproducibility.
 */

export function exportInvestigationAsCsv(result: InvestigationResult): void {
  const headers = [
    "Date",
    "Timestamp_UTC",
    `Observed_${result.variable.unit.replace(/[^a-zA-Z0-9]/g, "_")}`,
    "Trend_Estimate",
    "Lower_95_CI",
    "Upper_95_CI",
    "Standardized_Anomaly_Z",
    "Is_Interpolated",
  ];

  const rows = result.timeSeries.map((pt) => [
    pt.date,
    new Date(pt.timestamp).toISOString(),
    pt.observed !== null ? pt.observed.toFixed(4) : "",
    pt.trend.toFixed(4),
    pt.lowerConfidence.toFixed(4),
    pt.upperConfidence.toFixed(4),
    pt.anomaly.toFixed(4),
    pt.isInterpolated ? "true" : "false",
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      `# TerraTrend Earth Systems Trend Investigation`,
      `# Region: ${result.region.name} (${result.region.category})`,
      `# Variable: ${result.variable.name} [${result.variable.unit}]`,
      `# Sensor: ${result.variable.sensor} on ${result.variable.satellite}`,
      `# Sen's Slope: ${result.statistics.ratePerDecade}`,
      `# Mann-Kendall P-Value: ${result.statistics.pValue.toFixed(6)} (${result.statistics.statisticalSignificance})`,
      `# Generated: ${result.generatedAt}`,
      headers.join(","),
      ...rows.map((e) => e.join(",")),
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `TerraTrend_${result.region.id}_${result.variable.id}_${result.config.startDate}_${result.config.endDate}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportInvestigationAsJson(result: InvestigationResult): void {
  const exportPayload = {
    metadata: {
      application: "TerraTrend Earth Systems Trend Detective",
      challenge: "NASA Space Apps Challenge",
      exported_at: new Date().toISOString(),
      data_mode: result.statistics.isDemoData ? "SYNTHETIC_DEMONSTRATION" : "LIVE_NASA_EARTHDATA",
    },
    investigation_config: result.config,
    region: {
      id: result.region.id,
      name: result.region.name,
      category: result.region.category,
      coordinates: result.region.coordinates,
      area_km2: result.region.areaKm2,
      climate_context: result.region.climateContext,
      target_phenomena: result.region.targetPhenomena,
    },
    variable: {
      id: result.variable.id,
      name: result.variable.name,
      unit: result.variable.unit,
      sensor: result.variable.sensor,
      satellite: result.variable.satellite,
      baseline: result.variable.baseline,
    },
    statistical_diagnostics: {
      trend_direction: result.statistics.direction,
      annual_slope: result.statistics.annualSlope,
      rate_per_decade: result.statistics.ratePerDecade,
      sens_slope: result.statistics.senSlope,
      confidence_interval_95: result.statistics.confidenceInterval,
      mann_kendall_p_value: result.statistics.pValue,
      mann_kendall_z_score: result.statistics.mannKendallZ,
      mann_kendall_s_statistic: result.statistics.mannKendallS,
      r_squared: result.statistics.rSquared,
      is_statistically_significant: result.statistics.isSignificant,
      data_coverage_percent: result.statistics.dataCoveragePercent,
      valid_observations: result.statistics.validObservations,
      total_time_intervals: result.statistics.totalPoints,
    },
    scientific_interpretation: {
      what_changed: result.interpretation.whatChanged,
      where_changed: result.interpretation.whereChanged,
      how_fast_changed: result.interpretation.howFastChanged,
      is_statistically_significant: result.interpretation.isSignificant,
      physical_mechanisms: result.interpretation.physicalMechanisms,
      scientific_implication: result.interpretation.scientificImplication,
      recommended_follow_ups: result.interpretation.recommendedFollowUps,
    },
    timeseries: result.timeSeries,
  };

  const jsonString =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonString);
  link.setAttribute(
    "download",
    `TerraTrend_${result.region.id}_${result.variable.id}_${result.config.startDate}_${result.config.endDate}.json`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
