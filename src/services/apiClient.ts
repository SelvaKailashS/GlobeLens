/**
 * TerraTrend Frontend API Client
 * Connects Next.js to the Python FastAPI NASA Earth Science Backend.
 * Supports typed requests, polling of async data retrieval jobs,
 * statistical analysis execution, and regional comparison.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface ApiHealthResponse {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp_utc: string;
  datasets_registered: number;
  regions_registered: number;
  methods_registered: number;
}

export interface ApiRegionMetadata {
  region_id: string;
  name: string;
  category: string;
  center_lat: number;
  center_lon: number;
  area_sq_km: number;
  description: string;
  climate_context: string;
  target_phenomena: string;
  bounding_box: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
}

export interface ApiObservationPoint {
  timestamp: string;
  latitude: number;
  longitude: number;
  value: number | null;
  is_valid: boolean;
  raw_quality_code?: number | null;
}

export interface ApiScientificTimeSeries {
  dataset_id: string;
  product_id: string;
  variable_id: string;
  variable_name: string;
  original_units: string;
  scale_factor: number;
  add_offset: number;
  points: ApiObservationPoint[];
  quality_info: {
    valid_data_fraction: number;
    fill_value_encountered?: number | null;
    quality_flag_description?: string | null;
    cloud_screened: boolean;
  };
  provenance: {
    source_daac: string;
    satellite_mission: string;
    sensor_instrument: string;
    processing_level: string;
    algorithm_version: string;
    retrieval_method: string;
    source_doi_or_url?: string | null;
    processed_at: string;
  };
}

export interface ApiComprehensiveAnalysisResult {
  variable_id: string;
  original_units: string;
  observation_count: number;
  valid_observation_count: number;
  data_coverage_fraction: number;
  time_range_start: string;
  time_range_end: string;
  significance_threshold: number;
  overall_trend_direction: string;
  is_statistically_significant: boolean;
  linear_regression?: {
    slope: number;
    intercept: number;
    r_squared: number;
    p_value: number;
    standard_error: number;
    confidence_interval_95: [number, number];
    is_significant: boolean;
  };
  mann_kendall?: {
    trend: string;
    p_value: number;
    z_score: number;
    tau: number;
    s_statistic: number;
    var_s: number;
    is_significant: boolean;
  };
  sens_slope?: {
    slope: number;
    intercept: number;
    confidence_interval_95: [number, number];
    rate_per_decade: number;
    rate_unit: string;
  };
  seasonal_mann_kendall?: {
    trend: string;
    p_value: number;
    z_score: number;
    tau: number;
    seasonal_slopes: Record<string, number>;
    is_significant: boolean;
  };
  pettitt_change_point?: {
    has_change_point: boolean;
    change_point_index?: number | null;
    change_point_date?: string | null;
    statistic_k: number;
    p_value: number;
    pre_shift_mean?: number | null;
    post_shift_mean?: number | null;
  };
  standardized_anomalies?: {
    monthly_climatology_mean: Record<string, number>;
    monthly_climatology_std: Record<string, number>;
    anomalies: Array<{
      timestamp: string;
      observed_value: number;
      climatological_mean: number;
      anomaly_value: number;
      z_score: number;
      is_extreme: boolean;
    }>;
    extreme_positive_count: number;
    extreme_negative_count: number;
  };
  plain_language_interpretation: string;
  scientific_limitations: string[];
}

export interface ApiRegionalSummary {
  region_id: string;
  region_name: string;
  category: string;
  total_observations: number;
  valid_observations: number;
  coverage_fraction: number;
  sens_slope_per_year: number;
  sens_slope_per_decade: number;
  confidence_interval_95: [number, number];
  mann_kendall_tau: number;
  mann_kendall_p_value: number;
  trend_direction: string;
  is_significant: boolean;
  pettitt_has_break: boolean;
  pettitt_break_date?: string | null;
  mean_value: number;
  std_value: number;
  is_demonstration_data: boolean;
}

export interface ApiRegionalComparisonResponse {
  dataset_id: string;
  variable_id: string;
  variable_name: string;
  original_units: string;
  start_date: string;
  end_date: string;
  alpha: number;
  regions: ApiRegionalSummary[];
  pairwise_correlations: Record<string, number>;
  comparative_synthesis: string;
  scientific_cautions: string[];
}

export class TerraTrendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /** Check API health */
  async getHealth(): Promise<ApiHealthResponse> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  }

  /** List all registered study regions */
  async getRegions(): Promise<ApiRegionMetadata[]> {
    const res = await fetch(`${this.baseUrl}/regions`);
    if (!res.ok) throw new Error(`Failed to fetch regions: ${res.statusText}`);
    const data = await res.json();
    return data.regions;
  }

  /** Execute comprehensive trend analysis on an observation series or job result */
  async runAnalysis(params: {
    job_id?: string;
    points?: ApiObservationPoint[];
    variable_id?: string;
    variable_name?: string;
    region_id?: string;
    region_name?: string;
    original_units?: string;
    alpha?: number;
  }): Promise<ApiComprehensiveAnalysisResult> {
    const res = await fetch(`${this.baseUrl}/analysis/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Trend analysis failed: ${res.statusText}`);
    }
    return res.json();
  }

  /** Compare trends across 2 to 5 study regions */
  async compareRegions(params: {
    region_ids: string[];
    dataset_id: string;
    variable_id: string;
    start_date: string;
    end_date: string;
    alpha?: number;
  }): Promise<ApiRegionalComparisonResponse> {
    const res = await fetch(`${this.baseUrl}/analysis/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Regional comparison failed: ${res.statusText}`);
    }
    return res.json();
  }

  /** Preview data availability in NASA CMR without full download */
  async previewData(query: {
    dataset_id: string;
    variable_id: string;
    start_date: string;
    end_date: string;
    region_id?: string;
  }) {
    const res = await fetch(`${this.baseUrl}/data/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Data preview failed: ${res.statusText}`);
    }
    return res.json();
  }

  /** Resample and aggregate time series (daily, monthly, annual) */
  async aggregateTimeSeries(params: {
    job_id?: string;
    points?: ApiObservationPoint[];
    dataset_id?: string;
    variable_id?: string;
    original_units?: string;
    frequency?: "daily" | "monthly" | "annual";
    statistic?: "mean" | "sum" | "median" | "min" | "max";
  }) {
    const res = await fetch(`${this.baseUrl}/timeseries/aggregate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Aggregation failed: ${res.statusText}`);
    }
    return res.json();
  }
}

export const apiClient = new TerraTrendApiClient();
