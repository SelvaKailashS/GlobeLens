import { EnvironmentalVariable, EnvironmentalVariableId } from "@/types/terratrend";

export const ENVIRONMENTAL_VARIABLES: Record<EnvironmentalVariableId, EnvironmentalVariable> = {
  temperature: {
    id: "temperature",
    name: "Land Surface Temperature Anomaly",
    shortName: "LST Anomaly",
    unit: "°C",
    sensor: "MODIS (Terra & Aqua)",
    satellite: "Terra / Aqua (MOD11A1 / MYD11A1)",
    description: "Thermal infrared radiance converted to land surface temperature departure relative to the 2000–2015 climatological baseline.",
    baseline: "2000–2015 Mean (0.05° Grid)",
    color: "#f43f5e", // Rose / Red
    colorRgb: "244, 63, 94",
    colorScale: {
      min: "#3b82f6", // Blue (-3°C)
      mid: "#f8fafc", // White (0°C)
      max: "#ef4444", // Red (+3°C)
      labelMin: "-3.0°C (Cooling)",
      labelMid: "0.0°C (Baseline)",
      labelMax: "+3.0°C (Warming)",
    },
    sampleRange: [-3.5, 4.2],
    typicalRateUnit: "°C / decade",
    demoNotice: "Demonstration Layer: Modeled on published MODIS LST anomaly patterns. Not direct live NASA telemetry.",
  },
  precipitation: {
    id: "precipitation",
    name: "Total Precipitation Deviation",
    shortName: "Precipitation",
    unit: "mm/month",
    sensor: "DPR & GMI (GPM Core Observatory)",
    satellite: "NASA Global Precipitation Measurement (GPM IMERG)",
    description: "Multi-satellite precipitation estimates with gauge calibration measuring monthly precipitation deficit or surplus.",
    baseline: "2001–2020 Multi-Satellite Climatology",
    color: "#06b6d4", // Cyan
    colorRgb: "6, 182, 212",
    colorScale: {
      min: "#b45309", // Brown (Drought)
      mid: "#e2e8f0", // Light Grey (Normal)
      max: "#0284c7", // Deep Cyan / Blue (Surplus)
      labelMin: "-80 mm (Severe Deficit)",
      labelMid: "0 mm (Normal)",
      labelMax: "+120 mm (Excess)",
    },
    sampleRange: [-100, 150],
    typicalRateUnit: "mm / decade",
    demoNotice: "Demonstration Layer: Modeled on GPM IMERG monthly precipitation anomaly distributions.",
  },
  vegetation: {
    id: "vegetation",
    name: "Normalized Difference Vegetation Index",
    shortName: "NDVI Index",
    unit: "NDVI (-1 to 1)",
    sensor: "MODIS Surface Reflectance",
    satellite: "Terra MODIS (MOD13A2 / MYD13A2)",
    description: "Canopy greenness and photosynthetic activity derived from red and near-infrared reflectance ratios.",
    baseline: "Seasonal Maxima Median (2000–2010)",
    color: "#10b981", // Emerald
    colorRgb: "16, 185, 129",
    colorScale: {
      min: "#78350f", // Bare soil / Barren
      mid: "#fef08a", // Shrub / Sparse
      max: "#15803d", // Dense Canopy
      labelMin: "0.05 (Barren/Desiccated)",
      labelMid: "0.45 (Moderate Canopy)",
      labelMax: "0.88 (Dense Forest)",
    },
    sampleRange: [0.1, 0.85],
    typicalRateUnit: "NDVI units / decade",
    demoNotice: "Demonstration Layer: Synthesized from MODIS 16-day composite vegetative trends.",
  },
  air_quality: {
    id: "air_quality",
    name: "Tropospheric NO₂ Column Density",
    shortName: "NO₂ Density",
    unit: "μmol/m²",
    sensor: "TROPOMI / OMI",
    satellite: "Sentinel-5P / Aura (Aura OMI OMNO2)",
    description: "Vertical column density of atmospheric nitrogen dioxide in the troposphere, serving as an indicator of anthropogenic fossil emissions.",
    baseline: "2018–2021 TROPOMI V2 Operational Baseline",
    color: "#a855f7", // Purple / Violet
    colorRgb: "168, 85, 247",
    colorScale: {
      min: "#1e1b4b", // Low (< 20)
      mid: "#eab308", // Medium (80)
      max: "#dc2626", // High (> 200)
      labelMin: "15 μmol/m² (Clean Air)",
      labelMid: "75 μmol/m² (Suburban)",
      labelMax: "240 μmol/m² (Industrial)",
    },
    sampleRange: [10, 250],
    typicalRateUnit: "μmol/m² / decade",
    demoNotice: "Demonstration Layer: Synthesized based on TROPOMI tropospheric trace gas column observations.",
  },
};

export const VARIABLES_LIST: EnvironmentalVariable[] = Object.values(ENVIRONMENTAL_VARIABLES);
