export const variables = [
  {
    id: 'T2M',
    name: 'Air Temperature (2m)',
    unit: '°C',
    category: 'Thermal',
    description: 'Dry bulb air temperature measured at 2 meters above Earth’s surface.',
    indicates: 'Surface warming, atmospheric heat accumulation, and thermal extremes.'
  },
  {
    id: 'T2M_MAX',
    name: 'Max Air Temperature',
    unit: '°C',
    category: 'Thermal',
    description: 'Maximum daily air temperature at 2 meters elevation.',
    indicates: 'Peak heat stress, extreme heatwaves, and seasonal peak drift.'
  },
  {
    id: 'T2M_MIN',
    name: 'Min Air Temperature',
    unit: '°C',
    category: 'Thermal',
    description: 'Minimum daily air temperature at 2 meters elevation.',
    indicates: 'Nighttime cooling deficits and urban heat island retention.'
  },
  {
    id: 'PRECTOTCORR',
    name: 'Precipitation Flux',
    unit: 'mm/day',
    category: 'Hydrological',
    description: 'Bias-corrected precipitation total capturing convective and stratiform rain.',
    indicates: 'Monsoon intensity shifts, drought vulnerability, and hydro-climatic anomalies.'
  },
  {
    id: 'RH2M',
    name: 'Relative Humidity (2m)',
    unit: '%',
    category: 'Moisture',
    description: 'Ratio of actual water vapor pressure to saturation vapor pressure at 2m.',
    indicates: 'Atmospheric moisture availability, evaporative demand, and thermal comfort.'
  },
  {
    id: 'WS2M',
    name: 'Wind Speed (2m)',
    unit: 'm/s',
    category: 'Dynamics',
    description: 'Horizontal wind velocity measured at 2 meters above the ground.',
    indicates: 'Atmospheric boundary layer energy, breeze circulation, and evaporative forcing.'
  },
  {
    id: 'GWETTOP',
    name: 'Surface Soil Moisture',
    unit: 'fraction (0–1)',
    category: 'Hydrological',
    description: 'Top-layer (0–5 cm) volumetric soil wetness fraction from GLDAS / MERRA-2.',
    indicates: 'Agricultural drought risk, soil-atmosphere coupling, and run-off potential.'
  },
  {
    id: 'NDVI',
    name: 'Vegetation Index (NDVI)',
    unit: 'index (-0.2 to 1.0)',
    category: 'Biosphere',
    description: 'Normalized Difference Vegetation Index from MODIS Terra & Aqua instruments.',
    indicates: 'Canopy greenness, photosynthetic activity, and forest cover dynamics.'
  },
  {
    id: 'ALLSKY_SFC_SW_DWN',
    name: 'Solar Insolation',
    unit: 'MJ/m²/day',
    category: 'Radiation',
    description: 'All-sky surface shortwave downward irradiance incident on a horizontal surface.',
    indicates: 'Solar surface radiative forcing, cloud attenuation, and photovoltaic resource.'
  },
  {
    id: 'TO3',
    name: 'Total Column Ozone',
    unit: 'Dobson Units (DU)',
    category: 'Atmospheric',
    description: 'Total atmospheric column ozone concentration measured by OMI and satellite sounders.',
    indicates: 'Stratospheric ozone layer recovery and ultraviolet solar radiation transmission.'
  },
  {
    id: 'CHLO',
    name: 'Ocean Chlorophyll-a',
    unit: 'mg/m³',
    category: 'Oceanic',
    description: 'Near-surface ocean chlorophyll concentration derived from satellite ocean color.',
    indicates: 'Marine phytoplankton biomass, ocean primary productivity, and coastal upwelling.'
  }
]

export const datasets = [
  { 
    id: 'POWER', 
    name: 'NASA POWER', 
    mission: 'POWER',
    resolution: '0.5° × 0.625° Grid',
    description: 'Prediction Of Worldwide Energy Resources reanalysis synthesis (1981–present).',
    variables: ['T2M', 'PRECTOTCORR', 'RH2M', 'ALLSKY_SFC_SW_DWN', 'WS2M']
  },
  { 
    id: 'MERRA-2', 
    name: 'NASA MERRA-2', 
    mission: 'GMAO Reanalysis',
    resolution: '0.5° × 0.625° Lat/Lon',
    description: 'Modern-Era Retrospective analysis for Research and Applications, Version 2 assimilation archive.',
    variables: ['T2M', 'T2M_MAX', 'T2M_MIN', 'GWETTOP', 'WS2M']
  },
  { 
    id: 'MODIS', 
    name: 'NASA MODIS', 
    mission: 'Terra & Aqua',
    resolution: '250m – 1km Spatial',
    description: 'Moderate Resolution Imaging Spectroradiometer monitoring global surface reflectance and biospheric dynamics.',
    variables: ['NDVI', 'Surface Reflectance', 'Fire Radiative Power']
  },
  { 
    id: 'GPM', 
    name: 'NASA GPM', 
    mission: 'GPM Core Observatory',
    resolution: '0.1° × 0.1° (IMERG)',
    description: 'Global Precipitation Measurement constellation providing unified worldwide rainfall observations.',
    variables: ['PRECTOTCORR', 'Precipitation Rate', 'Storm Structure']
  },
  { 
    id: 'GLDAS', 
    name: 'NASA GLDAS', 
    mission: 'Land Assimilation',
    resolution: '0.25° × 0.25°',
    description: 'Global Land Data Assimilation System combining satellite and ground-based meteorological observations.',
    variables: ['GWETTOP', 'Soil Moisture Root Zone', 'Evapotranspiration']
  },
  { 
    id: 'OMI', 
    name: 'NASA OMI', 
    mission: 'Aura Satellite',
    resolution: '13 × 24 km Footprint',
    description: 'Ozone Monitoring Instrument aboard the Aura satellite tracking atmospheric trace gases and aerosols.',
    variables: ['TO3', 'NO2', 'SO2', 'Aerosol Index']
  },
  { 
    id: 'AIRS', 
    name: 'NASA AIRS', 
    mission: 'Aqua Sounder',
    resolution: '45 km Hyperspectral',
    description: 'Atmospheric Infrared Sounder observing high-precision vertical temperature and moisture profiles.',
    variables: ['Atmospheric Temp', 'Water Vapor', 'CO2 Profiles']
  }
]

export const locations = [
  { id: 'coimbatore', name: 'Coimbatore', region: 'Tamil Nadu, India', lat: 11.0168, lng: 76.9558, elevation: '411m' },
  { id: 'chennai', name: 'Chennai', region: 'Tamil Nadu, India', lat: 13.0827, lng: 80.2707, elevation: '6m' },
  { id: 'bengaluru', name: 'Bengaluru', region: 'Karnataka, India', lat: 12.9716, lng: 77.5946, elevation: '920m' },
  { id: 'mumbai', name: 'Mumbai', region: 'Maharashtra, India', lat: 19.0760, lng: 72.8777, elevation: '14m' },
  { id: 'delhi', name: 'Delhi', region: 'National Capital Region, India', lat: 28.6139, lng: 77.2090, elevation: '216m' },
]

export const timeLabels = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']

const temperature = [25.1, 25.0, 25.3, 25.4, 25.2, 25.7, 25.8, 25.9, 26.0, 26.2, 26.1, 26.4, 26.5, 26.7, 26.8]
const precipitation = [2.85, 2.72, 2.94, 2.67, 2.62, 2.81, 2.74, 2.68, 2.55, 2.61, 2.48, 2.39, 2.44, 2.32, 2.29]
const soilMoisture = [0.42, 0.41, 0.43, 0.39, 0.38, 0.40, 0.37, 0.36, 0.35, 0.36, 0.34, 0.33, 0.34, 0.32, 0.31]
const vegetation = [0.52, 0.54, 0.51, 0.49, 0.48, 0.50, 0.47, 0.46, 0.45, 0.47, 0.44, 0.43, 0.45, 0.42, 0.41]
const windSpeed = [2.4, 2.5, 2.3, 2.6, 2.7, 2.5, 2.4, 2.6, 2.8, 2.7, 2.9, 2.8, 3.0, 3.1, 3.2]

export const demoSeries = {
  T2M: temperature,
  T2M_MAX: [31.2, 31.0, 31.5, 31.7, 31.4, 32.0, 32.1, 32.3, 32.5, 32.8, 32.6, 33.1, 33.2, 33.5, 33.7],
  T2M_MIN: [19.8, 19.7, 19.9, 20.1, 19.9, 20.3, 20.4, 20.5, 20.6, 20.8, 20.7, 21.0, 21.1, 21.3, 21.4],
  PRECTOTCORR: precipitation,
  RH2M: [72, 71, 73, 72, 70, 71, 69, 68, 69, 67, 68, 66, 65, 64, 65],
  WS2M: windSpeed,
  GWETTOP: soilMoisture,
  NDVI: vegetation,
  ALLSKY_SFC_SW_DWN: [5.42, 5.51, 5.48, 5.58, 5.62, 5.55, 5.68, 5.71, 5.76, 5.82, 5.79, 5.90, 5.94, 6.02, 6.08],
  TO3: [265, 268, 264, 267, 270, 266, 269, 271, 273, 272, 275, 276, 274, 278, 279],
  CHLO: [0.35, 0.36, 0.34, 0.37, 0.35, 0.38, 0.36, 0.39, 0.37, 0.40, 0.38, 0.41, 0.39, 0.42, 0.43]
}

export const demoAnalysis = {
  variable: 'T2M',
  variableName: 'Air Temperature (2m)',
  variableLabel: 'Air Temperature (2m)',
  unit: '°C',
  location: 'Coimbatore',
  region: 'Tamil Nadu, India',
  coordinates: { lat: 11.0168, lng: 76.9558 },
  period: '2010–2024',
  direction: 'Increasing',
  slope: 0.13,
  slopeUnit: '°C / year',
  percentChange: 6.8,
  pValue: 0.018,
  confidenceInterval: '[0.041, 0.218] °C / year',
  ci: '+0.041 to +0.218',
  significance: 'Statistically significant (p < 0.05)',
  mannKendall: 'Significant upward monotonic trend (S = 73, p = 0.018)',
  senSlope: '+0.124 °C / year (95% CI: 0.041 to 0.218)',
  summary: 'Non-parametric Mann-Kendall test detects a statistically significant warming trend of +0.13 °C/year over the 2010–2024 observational window in Coimbatore. Sen\'s slope estimator confirms steady upward drift with p = 0.018, ruling out random interannual variability at the 95% confidence tier.',
  series: temperature,
  values: temperature,
  labels: timeLabels,
  min: 25.0,
  max: 26.8,
  mean: 25.91,
  dataset: 'NASA POWER (MERRA-2 assimilation)',
}

export const demoMapPoints = [
  { id: 'coimbatore', name: 'Coimbatore', region: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, trend: 'Increasing', slope: 0.13, value: '+0.13 °C/yr', significance: 'p = 0.018 (Significant)' },
  { id: 'chennai', name: 'Chennai', region: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, trend: 'Increasing', slope: 0.08, value: '+0.08 °C/yr', significance: 'p = 0.042 (Significant)' },
  { id: 'bengaluru', name: 'Bengaluru', region: 'Karnataka', lat: 12.9716, lng: 77.5946, trend: 'Increasing', slope: 0.11, value: '+0.11 °C/yr', significance: 'p = 0.027 (Significant)' },
  { id: 'mumbai', name: 'Mumbai', region: 'Maharashtra', lat: 19.0760, lng: 72.8777, trend: 'Increasing', slope: 0.09, value: '+0.09 °C/yr', significance: 'p = 0.035 (Significant)' },
  { id: 'delhi', name: 'Delhi', region: 'National Capital Region', lat: 28.6139, lng: 77.2090, trend: 'Increasing', slope: 0.17, value: '+0.17 °C/yr', significance: 'p = 0.009 (Significant)' },
  { id: 'nairobi', name: 'Nairobi', region: 'Kenya', lat: -1.2921, lng: 36.8219, trend: 'Decreasing', slope: -0.05, value: '-0.05 mm/yr', significance: 'p = 0.061 (Not Sig)' },
  { id: 'tokyo', name: 'Tokyo', region: 'Japan', lat: 35.6762, lng: 139.6503, trend: 'Increasing', slope: 0.12, value: '+0.12 °C/yr', significance: 'p = 0.021 (Significant)' },
  { id: 'london', name: 'London', region: 'United Kingdom', lat: 51.5074, lng: -0.1278, trend: 'Increasing', slope: 0.09, value: '+0.09 °C/yr', significance: 'p = 0.039 (Significant)' },
]

export const recentActivity = [
  { location: 'Coimbatore', variable: 'T2M', slope: 0.13, time: '10 min ago' },
  { location: 'Chennai', variable: 'T2M', slope: 0.08, time: '25 min ago' },
  { location: 'Bengaluru', variable: 'GWETTOP', slope: -0.01, time: '1 hour ago' },
  { location: 'Delhi', variable: 'T2M', slope: 0.17, time: '2 hours ago' },
]

export function getVariable(id) {
  return variables.find((item) => item.id === id) || variables[0]
}

export function getSeries(id) {
  return demoSeries[id] || demoSeries.T2M
}
