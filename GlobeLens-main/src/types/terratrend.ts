import type * as GeoJSON from "geojson";

export type EnvironmentalVariableId = "temperature" | "precipitation" | "vegetation" | "air_quality";

export interface EnvironmentalVariable {
  id: EnvironmentalVariableId;
  name: string;
  shortName: string;
  unit: string;
  sensor: string;
  satellite: string;
  description: string;
  baseline: string;
  color: string;
  colorRgb: string;
  colorScale: {
    min: string;
    mid: string;
    max: string;
    labelMin: string;
    labelMid: string;
    labelMax: string;
  };
  sampleRange: [number, number];
  typicalRateUnit: string;
  demoNotice: string;
}

export interface GeographicRegion {
  id: string;
  name: string;
  category: "Tropical" | "Polar" | "Arid" | "Highland" | "Marine" | "Continental";
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
  areaKm2: number;
  boundaryGeoJson: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
  description: string;
  climateContext: string;
  targetPhenomena: string;
}

export interface InvestigationConfig {
  variableId: EnvironmentalVariableId;
  regionId: string;
  startDate: string;
  endDate: string;
  resolution: "daily" | "monthly";
}

export interface TimeSeriesPoint {
  date: string;
  timestamp: number;
  observed: number;
  trend: number;
  upperConfidence: number;
  lowerConfidence: number;
  anomaly: number;
  isInterpolated?: boolean;
}

export interface StatisticalSummary {
  direction: "Rapid Increase" | "Moderate Increase" | "Stable / No Trend" | "Moderate Decrease" | "Rapid Decrease";
  directionType: "increasing" | "decreasing" | "stable";
  rateOfChange: string;
  ratePerDecade: string;
  annualSlope: number;
  statisticalSignificance: string;
  isSignificant: boolean;
  confidenceInterval: string;
  pValue: number;
  mannKendallZ: number;
  mannKendallS: number;
  senSlope: number;
  rSquared: number;
  dataCoveragePercent: number;
  validObservations: number;
  totalPoints: number;
  baselinePeriod: string;
  isDemoData: true;
}

export interface ScientificInterpretation {
  whatChanged: string;
  whereChanged: string;
  howFastChanged: string;
  isSignificant: string;
  physicalMechanisms: string[];
  scientificImplication: string;
  recommendedFollowUps: string[];
  isDemoData: true;
}

export interface InvestigationResult {
  config: InvestigationConfig;
  region: GeographicRegion;
  variable: EnvironmentalVariable;
  timeSeries: TimeSeriesPoint[];
  statistics: StatisticalSummary;
  interpretation: ScientificInterpretation;
  generatedAt: string;
}

/**
 * Interface prepared for future NASA Earthdata & GIBS integration
 */
export interface NasaTileSourceConfig {
  id: string;
  name: string;
  layerIdentifier: string;
  format: "image/png" | "image/jpeg" | "image/tiff";
  wmtsTemplateUrl: string;
  tileMatrixSet: "EPSG3857" | "EPSG4326";
  availableDateRange: {
    start: string;
    end: string;
  };
  attribution: string;
  status: "placeholder_ready" | "connected";
}

export interface SavedInvestigation {
  id: string;
  title: string;
  regionName: string;
  variableName: string;
  dateRange: string;
  keyFinding: string;
  significance: string;
  createdAt: string;
  config: InvestigationConfig;
}
