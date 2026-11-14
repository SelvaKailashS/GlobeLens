import { NasaTileSourceConfig, EnvironmentalVariableId } from "@/types/terratrend";

/**
 * NASA Earth Science Data Integration Architecture
 * 
 * This service defines the connection blueprints, contracts, and endpoint specifications
 * for connecting TerraTrend to official NASA Earth Science APIs, Global Imagery Browse Services (GIBS),
 * and the planned FastAPI Python analysis backend.
 * 
 * STATUS: Prepared for integration (currently operating in demonstration mode).
 */

export interface NasaEarthdataConfig {
  baseUrl: string;
  cmrSearchEndpoint: string;
  tokenEndpoint: string;
  gibsWmtsBase: string;
  fastApiBackendUrl: string;
}

export const NASA_ENDPOINTS: NasaEarthdataConfig = {
  baseUrl: "https://earthdata.nasa.gov",
  cmrSearchEndpoint: "https://cmr.earthdata.nasa.gov/search/granules.json",
  tokenEndpoint: "https://urs.earthdata.nasa.gov/api/v2/token",
  gibsWmtsBase: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best",
  fastApiBackendUrl: process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1",
};

/**
 * NASA GIBS (Global Imagery Browse Services) Tile Specifications
 * Ready to plug into MapLibre GL raster layers when live telemetry is enabled.
 */
export const NASA_GIBS_TILE_LAYERS: Record<EnvironmentalVariableId, NasaTileSourceConfig> = {
  temperature: {
    id: "gibs-modis-lst",
    name: "MODIS Terra Land Surface Temp Day (8-Day Composite)",
    layerIdentifier: "MODIS_Terra_Land_Surface_Temp_Day",
    format: "image/png",
    wmtsTemplateUrl: `${NASA_ENDPOINTS.gibsWmtsBase}/MODIS_Terra_Land_Surface_Temp_Day/default/{Time}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
    tileMatrixSet: "EPSG3857",
    availableDateRange: {
      start: "2000-02-24",
      end: "present",
    },
    attribution: "NASA EOSDIS GIBS / LP DAAC",
    status: "placeholder_ready",
  },
  precipitation: {
    id: "gibs-gpm-imerg",
    name: "GPM IMERG Late Precipitation Rate (Half-Hourly / Monthly)",
    layerIdentifier: "IMERG_Precipitation_Rate",
    format: "image/png",
    wmtsTemplateUrl: `${NASA_ENDPOINTS.gibsWmtsBase}/IMERG_Precipitation_Rate/default/{Time}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
    tileMatrixSet: "EPSG3857",
    availableDateRange: {
      start: "2014-03-12",
      end: "present",
    },
    attribution: "NASA Precipitation Processing System (PPS) / GES DISC",
    status: "placeholder_ready",
  },
  vegetation: {
    id: "gibs-modis-ndvi",
    name: "MODIS Terra 16-Day Vegetation Indices (NDVI 250m)",
    layerIdentifier: "MODIS_Terra_NDVI_16Day",
    format: "image/png",
    wmtsTemplateUrl: `${NASA_ENDPOINTS.gibsWmtsBase}/MODIS_Terra_NDVI_16Day/default/{Time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`,
    tileMatrixSet: "EPSG3857",
    availableDateRange: {
      start: "2000-02-18",
      end: "present",
    },
    attribution: "NASA EOSDIS GIBS / LP DAAC",
    status: "placeholder_ready",
  },
  air_quality: {
    id: "gibs-omi-no2",
    name: "Aura OMI Tropospheric NO2 Column (Cloud Screened)",
    layerIdentifier: "OMI_NO2_Tropospheric_Column",
    format: "image/png",
    wmtsTemplateUrl: `${NASA_ENDPOINTS.gibsWmtsBase}/OMI_NO2_Tropospheric_Column/default/{Time}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
    tileMatrixSet: "EPSG3857",
    availableDateRange: {
      start: "2004-10-01",
      end: "present",
    },
    attribution: "NASA Aura Validation Data Center (AVDC) / GES DISC",
    status: "placeholder_ready",
  },
};

/**
 * Contract specification for future FastAPI backend endpoints
 */
export interface FastApiTrendAnalysisRequest {
  regionGeoJson: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  variable: EnvironmentalVariableId;
  startDate: string;
  endDate: string;
  resolution: "daily" | "monthly";
  statisticalTests: ("mann_kendall" | "sen_slope" | "pettitt" | "theil_sen")[];
}

export interface FastApiTrendAnalysisResponse {
  timeseries: {
    dates: string[];
    observed: number[];
    trend_line: number[];
    anomalies: number[];
  };
  statistics: {
    slope_per_decade: number;
    p_value: number;
    z_score: number;
    tau: number;
    is_significant: boolean;
    change_point_index?: number;
  };
  raster_tiles_url?: string;
}

/**
 * Verification helper to test connectivity when user configures a live backend or NASA key
 */
export async function checkNasaBackendHealth(): Promise<{
  connected: boolean;
  message: string;
  timestamp: string;
}> {
  return {
    connected: false,
    message: "FastAPI / NASA Earthdata backend not connected. Operating in high-fidelity demonstration mode.",
    timestamp: "2024-10-15T12:00:00.000Z",
  };
}
