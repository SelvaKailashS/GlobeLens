from typing import Dict, List, Optional
from backend.app.models.dataset import (
    DatasetEntry,
    DatasetVariable,
    IntegrationStatus,
    SpatialResolution,
    TemporalCoverage,
)

# Authoritative NASA Earth Science Dataset Registry
DATASET_REGISTRY: Dict[str, DatasetEntry] = {
    # 1. GPM IMERG — Precipitation
    "gpm_imerg": DatasetEntry(
        dataset_id="gpm_imerg",
        display_name="Global Precipitation Measurement (GPM) IMERG Final Precipitation L3",
        short_name="GPM IMERG",
        provider="NASA Goddard Space Flight Center (GSFC) / Precipitation Processing System (PPS) / GES DISC",
        description=(
            "The Integrated Multi-satellitE Retrievals for GPM (IMERG) provides global precipitation estimates "
            "combining passive microwave radiometer measurements from the GPM Constellation, microwave-calibrated "
            "infrared satellite estimates, and monthly surface precipitation gauge analysis."
        ),
        product_id="GPM_3IMERGM_07",
        processing_level="Level 3 Gridded",
        available_variables=[
            DatasetVariable(
                variable_id="precipitation",
                display_name="Precipitation Rate",
                units="mm/hr",
                description="Merged microwave-infrared precipitation estimate rate",
                cf_standard_name="precipitation_flux",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.9,
                valid_range=(0.0, 300.0),
            ),
            DatasetVariable(
                variable_id="precipitationQualityIndex",
                display_name="Precipitation Quality Index",
                units="dimensionless",
                description="Gauge weighting and relative error estimation quality index",
                cf_standard_name=None,
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.9,
                valid_range=(0.0, 1.0),
            ),
            DatasetVariable(
                variable_id="probabilityLiquidPrecipitation",
                display_name="Probability of Liquid Precipitation",
                units="%",
                description="Diagnostic probability that the precipitation phase is liquid",
                cf_standard_name="probability_of_liquid_precipitation",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.9,
                valid_range=(0.0, 100.0),
            ),
            DatasetVariable(
                variable_id="randomError",
                display_name="Precipitation Random Error",
                units="mm/hr",
                description="Random error metric for precipitation estimates derived from gauge and satellite uncertainty",
                cf_standard_name=None,
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.9,
                valid_range=(0.0, 300.0),
            ),
        ],
        temporal_resolution="Monthly",
        spatial_resolution=SpatialResolution(
            value=0.1,
            unit="degrees",
            description="0.1 deg x 0.1 deg (~10 km at equator) global grid (90S - 90N)",
            projection="WGS84",
        ),
        temporal_coverage=TemporalCoverage(
            start_date="2000-06-01",
            end_date=None,
            latency="Approx. 3.5 months for Final run",
        ),
        access_method="NASA GES DISC HTTPS / OPeNDAP / Giovanni",
        documentation_url="https://gpm.nasa.gov/data/imerg",
        integration_status=IntegrationStatus.IMPLEMENTED,
    ),

    # 2. MODIS — Vegetation Indices and Land Surface Temperature
    "modis_terra_aqua": DatasetEntry(
        dataset_id="modis_terra_aqua",
        display_name="MODIS Terra & Aqua Vegetation Indices and Land Surface Temperature",
        short_name="MODIS Terra/Aqua",
        provider="NASA Land Processes Distributed Active Archive Center (LP DAAC) / USGS EROS",
        description=(
            "Moderate Resolution Imaging Spectroradiometer (MODIS) aboard NASA's Terra and Aqua satellites. "
            "Provides continuity global observations of vegetative canopy photosynthetic activity (NDVI/EVI) "
            "and land surface temperature (LST) and emissivity."
        ),
        product_id="MOD13A2_061 / MOD11A2_061",
        processing_level="Level 3 Gridded Tile",
        available_variables=[
            DatasetVariable(
                variable_id="_1_km_16_days_NDVI",
                display_name="Normalized Difference Vegetation Index (NDVI)",
                units="NDVI ratio",
                description="Atmospherically-corrected surface reflectance ratio (NIR - Red)/(NIR + Red)",
                cf_standard_name="normalized_difference_vegetation_index",
                scale_factor=0.0001,
                add_offset=0.0,
                fill_value=-3000.0,
                valid_range=(-2000.0, 10000.0),
            ),
            DatasetVariable(
                variable_id="_1_km_16_days_EVI",
                display_name="Enhanced Vegetation Index (EVI)",
                units="EVI ratio",
                description="Vegetation index optimized for high biomass canopy density with residual atmospheric decoupling",
                cf_standard_name="enhanced_vegetation_index",
                scale_factor=0.0001,
                add_offset=0.0,
                fill_value=-3000.0,
                valid_range=(-2000.0, 10000.0),
            ),
            DatasetVariable(
                variable_id="LST_Day_1km",
                display_name="Land Surface Temperature (Daytime)",
                units="Kelvin",
                description="Daytime radiometrically calibrated land surface skin temperature",
                cf_standard_name="surface_temperature",
                scale_factor=0.02,
                add_offset=0.0,
                fill_value=0.0,
                valid_range=(7500.0, 65535.0),
            ),
            DatasetVariable(
                variable_id="LST_Night_1km",
                display_name="Land Surface Temperature (Nighttime)",
                units="Kelvin",
                description="Nighttime radiometrically calibrated land surface skin temperature",
                cf_standard_name="surface_temperature",
                scale_factor=0.02,
                add_offset=0.0,
                fill_value=0.0,
                valid_range=(7500.0, 65535.0),
            ),
            DatasetVariable(
                variable_id="QC_Day",
                display_name="Daytime Quality Control Bits",
                units="bitmask",
                description="Daytime LST quality control flags, emissivity errors, and cloud obscuration indicators",
                cf_standard_name=None,
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=None,
                valid_range=(0.0, 255.0),
            ),
        ],
        temporal_resolution="16-Day (Vegetation) / 8-Day (Temperature)",
        spatial_resolution=SpatialResolution(
            value=1000.0,
            unit="meters",
            description="1 km nominal sinusoidal tile grid (MODIS Sinusoidal projection)",
            projection="Sinusoidal",
        ),
        temporal_coverage=TemporalCoverage(
            start_date="2000-02-18",
            end_date=None,
            latency="Approx. 8-16 days composite cycle",
        ),
        access_method="NASA LP DAAC AppEEARS REST API / Earthdata Search",
        documentation_url="https://appeears.earthdatacloud.nasa.gov/",
        integration_status=IntegrationStatus.IMPLEMENTED,
    ),

    # 3. AIRS — Atmospheric Temperature & Moisture Profiles
    "airs_aqua": DatasetEntry(
        dataset_id="airs_aqua",
        display_name="AIRS/Aqua Level 3 Monthly Standard Physical Retrieval",
        short_name="AIRS Atmospheric Sounder",
        provider="NASA Goddard Earth Sciences Data and Information Services Center (GES DISC)",
        description=(
            "Atmospheric Infrared Sounder (AIRS) aboard NASA's Aqua satellite. High-spectral-resolution infrared "
            "sounder retrieving global vertical temperature and water vapor profiles, greenhouse gases, and cloud characteristics. "
            "Version 7.0 designates the AIRS-only retrieval (AIRS3STM) as the official uninterrupted continuous climate record "
            "(August 2002 to present) following the AMSU-A microwave sounder anomaly in 2016."
        ),
        product_id="AIRS3STM_7.0",
        processing_level="Level 3 Gridded Global",
        available_variables=[
            DatasetVariable(
                variable_id="SurfAirTemp_A",
                display_name="Surface Air Temperature (Ascending / Day)",
                units="Kelvin",
                description="Near-surface air temperature from ascending daylight overpasses",
                cf_standard_name="air_temperature",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(180.0, 340.0),
            ),
            DatasetVariable(
                variable_id="SurfSkinTemp_A",
                display_name="Surface Skin Temperature (Ascending)",
                units="Kelvin",
                description="Infrared radiative skin temperature of the land/ocean surface",
                cf_standard_name="surface_temperature",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(180.0, 340.0),
            ),
            DatasetVariable(
                variable_id="Temperature_A",
                display_name="Atmospheric Temperature Profile (Ascending)",
                units="Kelvin",
                description="Vertical air temperature retrieved across 24 standard pressure levels (1000 hPa to 1 hPa)",
                cf_standard_name="air_temperature",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(150.0, 340.0),
            ),
            DatasetVariable(
                variable_id="TotO3_A",
                display_name="Total Column Ozone (Ascending)",
                units="Dobson Units (DU)",
                description="Total integrated atmospheric ozone column from surface to top of atmosphere",
                cf_standard_name="equivalent_thickness_at_stp_of_atmosphere_ozone_content",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(100.0, 600.0),
            ),
            DatasetVariable(
                variable_id="RelHum_A",
                display_name="Relative Humidity Profile",
                units="%",
                description="Atmospheric relative humidity retrieved across pressure levels",
                cf_standard_name="relative_humidity",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(0.0, 100.0),
            ),
        ],
        temporal_resolution="Monthly",
        spatial_resolution=SpatialResolution(
            value=1.0,
            unit="degrees",
            description="1.0 deg x 1.0 deg global latitude/longitude grid (180 lat x 360 lon)",
            projection="WGS84",
        ),
        temporal_coverage=TemporalCoverage(
            start_date="2002-08-31",
            end_date=None,
            latency="Approx. 1 month after observation period",
        ),
        access_method="NASA GES DISC HTTPS / OPeNDAP / Giovanni",
        documentation_url="https://disc.gsfc.nasa.gov/datasets/AIRS3STM_7.0/summary",
        integration_status=IntegrationStatus.IMPLEMENTED,
    ),

    # 4. OMI — Ozone and Atmospheric Composition
    "omi_aura": DatasetEntry(
        dataset_id="omi_aura",
        display_name="OMI/Aura Level 3 Daily Global Gridded Trace Gas Columns",
        short_name="OMI Ozone & Trace Gases",
        provider="NASA Goddard Earth Sciences Data and Information Services Center (GES DISC) / KNMI",
        description=(
            "Ozone Monitoring Instrument (OMI) aboard NASA's Aura spacecraft. Nadir-viewing UV/Visible spectrometer "
            "measuring total ozone column, sulfur dioxide (SO2), nitrogen dioxide (NO2), and absorbing aerosol index. "
            "Note on Aerosols: OMTO3e provides the qualitative/semi-quantitative UV Aerosol Index (UVAerosolIndex), "
            "which detects absorbing dust and smoke plumes via spectral contrast. Quantitative extinction Aerosol "
            "Optical Depth (AOD) is provided by OMAERUVd (near-UV multi-wavelength aerosol extinction product)."
        ),
        product_id="OMTO3e_003 / OMNO2d_003 / OMAERUVd_003",
        processing_level="Level 3 Gridded Global",
        available_variables=[
            DatasetVariable(
                variable_id="ColumnAmountO3",
                display_name="Total Column Ozone",
                units="Dobson Units (DU)",
                description="Best total ozone column amount from TOMS Version 8 algorithm",
                cf_standard_name="equivalent_thickness_at_stp_of_atmosphere_ozone_content",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-1.2676506e30,
                valid_range=(50.0, 700.0),
            ),
            DatasetVariable(
                variable_id="TroposphericColumnAmountNO2",
                display_name="Tropospheric Column NO2 Density",
                units="molecules/cm²",
                description="Vertical column density of nitrogen dioxide in the tropospheric boundary layer",
                cf_standard_name="troposphere_mole_content_of_nitrogen_dioxide",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-1.2676506e30,
                valid_range=(0.0, 1.0e17),
            ),
            DatasetVariable(
                variable_id="ColumnAmountNO2TropCloudScreened",
                display_name="Cloud-Screened Tropospheric NO2 Column",
                units="molecules/cm²",
                description="Tropospheric NO2 column with effective cloud fraction threshold (< 30%) applied",
                cf_standard_name=None,
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-1.2676506e30,
                valid_range=(0.0, 1.0e17),
            ),
            DatasetVariable(
                variable_id="UVAerosolIndex",
                display_name="UV Aerosol Index",
                units="index unit",
                description="Residual radiance difference indicating absorbing desert dust, volcanic ash, and biomass smoke plumes (OMTO3e)",
                cf_standard_name=None,
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-1.2676506e30,
                valid_range=(-5.0, 15.0),
            ),
            DatasetVariable(
                variable_id="AerosolOpticalDepth",
                display_name="Near-UV Aerosol Optical Depth (388 nm)",
                units="dimensionless",
                description="Quantitative total column aerosol extinction optical depth at 388 nm from OMAERUVd (near-UV algorithm). Distinguished from qualitative UV Aerosol Index in OMTO3e.",
                cf_standard_name="atmosphere_optical_thickness_due_to_ambient_aerosol_particles",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-1.2676506e30,
                valid_range=(0.0, 5.0),
            ),
        ],
        temporal_resolution="Daily",
        spatial_resolution=SpatialResolution(
            value=0.25,
            unit="degrees",
            description="0.25 deg x 0.25 deg global grid (OMTO3e/OMNO2d) and 1.0 deg grid (OMAERUVd)",
            projection="WGS84",
        ),
        temporal_coverage=TemporalCoverage(
            start_date="2004-10-01",
            end_date=None,
            latency="Daily operational delivery",
        ),
        access_method="NASA GES DISC HTTPS / OPeNDAP / Giovanni",
        documentation_url="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary",
        integration_status=IntegrationStatus.IMPLEMENTED,
    ),

    # 5. MERRA-2 — Atmospheric Reanalysis
    "merra2_reanalysis": DatasetEntry(
        dataset_id="merra2_reanalysis",
        display_name="Modern-Era Retrospective analysis for Research and Applications, Version 2",
        short_name="MERRA-2 Reanalysis",
        provider="NASA Global Modeling and Assimilation Office (GMAO) / GES DISC",
        description=(
            "MERRA-2 is NASA's atmospheric reanalysis for the modern satellite era using the Goddard Earth Observing "
            "System (GEOS-5) atmospheric model coupled with the Gridpoint Statistical Interpolation (GSI) analysis scheme. "
            "Assimilates space-based aerosol optical depth and radiance observations."
        ),
        product_id="M2TMNXSLV_5.12.4 / M2TMNXFLX_5.12.4",
        processing_level="Level 4 Reanalysis Assimilation",
        available_variables=[
            DatasetVariable(
                variable_id="T2M",
                display_name="2-Meter Air Temperature",
                units="Kelvin",
                description="Air temperature at 2 meters above surface diagnostic level",
                cf_standard_name="air_temperature",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=1.0e15,
                valid_range=(180.0, 340.0),
            ),
            DatasetVariable(
                variable_id="PRECTOTCORR",
                display_name="Total Precipitation Flux (Bias-Corrected)",
                units="kg/m²/s",
                description="Total precipitation rate corrected with satellite and surface gauge climatology",
                cf_standard_name="precipitation_flux",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=1.0e15,
                valid_range=(0.0, 0.05),
            ),
            DatasetVariable(
                variable_id="EVP",
                display_name="Total Surface Evaporation",
                units="kg/m²/s",
                description="Total evaporation from surface soil, canopy interception, and transpiration",
                cf_standard_name="water_evaporation_flux",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=1.0e15,
                valid_range=(-0.005, 0.05),
            ),
            DatasetVariable(
                variable_id="SPEED",
                display_name="10-Meter Wind Speed",
                units="m/s",
                description="Diagnostic horizontal wind speed magnitude at 10 meters above the displacement height",
                cf_standard_name="wind_speed",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=1.0e15,
                valid_range=(0.0, 100.0),
            ),
            DatasetVariable(
                variable_id="TS",
                display_name="Surface Skin Temperature",
                units="Kelvin",
                description="Radiative equilibrium skin temperature at land/water interface",
                cf_standard_name="surface_temperature",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=1.0e15,
                valid_range=(180.0, 340.0),
            ),
        ],
        temporal_resolution="Monthly Mean (tavgM)",
        spatial_resolution=SpatialResolution(
            value=0.5,
            unit="degrees",
            description="0.5 deg latitude x 0.625 deg longitude global grid (361 lat x 576 lon)",
            projection="WGS84",
        ),
        temporal_coverage=TemporalCoverage(
            start_date="1980-01-01",
            end_date=None,
            latency="Approx. 2-3 weeks latency",
        ),
        access_method="NASA GES DISC HTTPS / OPeNDAP / Giovanni",
        documentation_url="https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/",
        integration_status=IntegrationStatus.IMPLEMENTED,
    ),

    # 6. GLDAS — Land Surface and Hydrological Variables
    "gldas_hydrology": DatasetEntry(
        dataset_id="gldas_hydrology",
        display_name="Global Land Data Assimilation System (GLDAS) Noah LSM L4 Monthly",
        short_name="GLDAS Hydrology",
        provider="NASA GSFC Hydrological Sciences Laboratory / GES DISC",
        description=(
            "GLDAS integrates satellite and ground-based observational data products, using advanced land surface modeling "
            "(Noah Land Surface Model Version 2.1) and data assimilation techniques to generate optimal fields of land "
            "surface states and hydrological flux variables."
        ),
        product_id="GLDAS_NOAH025_M_2.1",
        processing_level="Level 4 Land Surface Assimilation",
        available_variables=[
            DatasetVariable(
                variable_id="SoilMoi0_10cm_inst",
                display_name="Soil Moisture (0 - 10 cm layer)",
                units="kg/m²",
                description="Volumetric soil water content in the uppermost 0-10 cm layer",
                cf_standard_name="soil_moisture_content",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(0.0, 100.0),
            ),
            DatasetVariable(
                variable_id="Evap_tavg",
                display_name="Total Evapotranspiration Rate",
                units="kg/m²/s",
                description="Average rate of total moisture evapotranspiration from vegetation and bare soil",
                cf_standard_name="water_evapotranspiration_flux",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(0.0, 0.005),
            ),
            DatasetVariable(
                variable_id="Rainf_tavg",
                display_name="Rainfall Rate",
                units="kg/m²/s",
                description="Rainfall rate forcing applied to the Noah land surface model",
                cf_standard_name="rainfall_flux",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(0.0, 0.01),
            ),
            DatasetVariable(
                variable_id="Qs_acc",
                display_name="Surface Runoff Amount",
                units="kg/m²",
                description="Accumulated surface overland storm runoff",
                cf_standard_name="surface_runoff_amount",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(0.0, 1000.0),
            ),
            DatasetVariable(
                variable_id="SWE_inst",
                display_name="Snow Water Equivalent",
                units="kg/m²",
                description="Instantaneous water content equivalent stored in snowpack",
                cf_standard_name="surface_snow_amount",
                scale_factor=1.0,
                add_offset=0.0,
                fill_value=-9999.0,
                valid_range=(0.0, 2000.0),
            ),
        ],
        temporal_resolution="Monthly",
        spatial_resolution=SpatialResolution(
            value=0.25,
            unit="degrees",
            description="0.25 deg x 0.25 deg global terrestrial grid (60S - 90N, 1440 x 600)",
            projection="WGS84",
        ),
        temporal_coverage=TemporalCoverage(
            start_date="2000-01-01",
            end_date=None,
            latency="Approx. 1-2 months latency",
        ),
        access_method="NASA GES DISC HTTPS / OPeNDAP / Giovanni",
        documentation_url="https://ldas.gsfc.nasa.gov/gldas/gldas-get-data",
        integration_status=IntegrationStatus.IMPLEMENTED,
    ),
}


def list_datasets(status: Optional[IntegrationStatus] = None) -> List[DatasetEntry]:
    """Retrieve all registered datasets, optionally filtered by integration status."""
    datasets = list(DATASET_REGISTRY.values())
    if status is not None:
        return [d for d in datasets if d.integration_status == status]
    return datasets


def get_dataset(dataset_id: str) -> Optional[DatasetEntry]:
    """Retrieve metadata entry for a specific dataset ID."""
    return DATASET_REGISTRY.get(dataset_id.lower())


def list_all_variables() -> List[DatasetVariable]:
    """Collect a flattened list of all documented variables across all registered datasets."""
    variables: List[DatasetVariable] = []
    for entry in DATASET_REGISTRY.values():
        variables.extend(entry.available_variables)
    return variables


def get_variable(variable_id: str) -> Optional[DatasetVariable]:
    """Retrieve metadata entry for a specific variable identifier across all datasets."""
    var_lower = variable_id.lower()
    for entry in DATASET_REGISTRY.values():
        for var in entry.available_variables:
            if var.variable_id.lower() == var_lower:
                return var
    return None

