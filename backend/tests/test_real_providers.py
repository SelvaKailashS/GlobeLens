from datetime import date, datetime, timezone
from pathlib import Path
import pytest

from backend.app.models.region import SpatialBoundingBox
from backend.app.providers import get_provider
from backend.tests.fixtures.sample_generator import (
    create_airs_sample,
    create_gldas_sample,
    create_gpm_sample,
    create_merra2_sample,
    create_modis_sample,
    create_omi_sample,
)


@pytest.fixture
def temp_data_dir(tmp_path: Path) -> Path:
    return tmp_path


def test_gpm_provider_processing(temp_data_dir: Path):
    """Test GPM IMERG provider processing on NetCDF4 sample."""
    sample_file = temp_data_dir / "gpm_sample.nc"
    create_gpm_sample(sample_file)

    provider = get_provider("gpm_imerg")
    bbox = SpatialBoundingBox(min_lat=-4.5, max_lat=-3.5, min_lon=-62.5, max_lon=-61.0)

    points, q_info = provider.process_granule_file(
        file_path=sample_file,
        variable_id="precipitation",
        bounding_box=bbox,
        quality_filter=True,
    )

    assert len(points) == 1
    point = points[0]
    assert point.is_valid
    assert point.value is not None
    # Precipitation in mm/hr should be positive
    assert 1.0 <= point.value <= 15.0
    assert q_info.valid_data_fraction > 0.0
    assert q_info.cloud_screened  # quality filter applied


def test_modis_provider_processing(temp_data_dir: Path):
    """Test MODIS provider processing for NDVI and LST with scale factors and bitmasks."""
    sample_file = temp_data_dir / "modis_sample.nc"
    create_modis_sample(sample_file)

    provider = get_provider("modis_terra_aqua")
    bbox = SpatialBoundingBox(min_lat=-4.5, max_lat=-3.5, min_lon=-62.5, max_lon=-61.0)

    # Test NDVI extraction with 0.0001 scale factor
    ndvi_points, ndvi_q = provider.process_granule_file(
        file_path=sample_file,
        variable_id="_1_km_16_days_NDVI",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert len(ndvi_points) == 1
    assert ndvi_points[0].is_valid
    # NDVI physical range is -0.2 to 1.0 (vegetation ~0.65 to 0.88)
    assert 0.60 <= ndvi_points[0].value <= 0.90

    # Test LST extraction with 0.02 scale factor -> ~300 Kelvin
    lst_points, lst_q = provider.process_granule_file(
        file_path=sample_file,
        variable_id="LST_Day_1km",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert len(lst_points) == 1
    assert lst_points[0].is_valid
    # Land surface temp in tropical Amazon: 290 - 315 Kelvin
    assert 290.0 <= lst_points[0].value <= 315.0


def test_airs_provider_processing(temp_data_dir: Path):
    """Test AIRS Version 7.0 provider temperature and ozone extraction."""
    sample_file = temp_data_dir / "airs_sample.nc"
    create_airs_sample(sample_file)

    provider = get_provider("airs_aqua")
    bbox = SpatialBoundingBox(min_lat=-4.5, max_lat=-3.5, min_lon=-62.5, max_lon=-61.0)

    points, q_info = provider.process_granule_file(
        file_path=sample_file,
        variable_id="SurfAirTemp_A",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert len(points) == 1
    assert points[0].is_valid
    # Surface Air Temp in Kelvin
    assert 295.0 <= points[0].value <= 305.0

    # Test Ozone in Dobson Units
    o3_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="TotO3_A",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 250.0 <= o3_points[0].value <= 300.0


def test_omi_provider_processing(temp_data_dir: Path):
    """Test OMI provider trace gas columns and aerosol measurements."""
    sample_file = temp_data_dir / "omi_sample.nc"
    create_omi_sample(sample_file)

    provider = get_provider("omi_aura")
    bbox = SpatialBoundingBox(min_lat=-4.5, max_lat=-3.5, min_lon=-62.5, max_lon=-61.0)

    # Total Ozone Column in Dobson Units
    o3_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="ColumnAmountO3",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 260.0 <= o3_points[0].value <= 300.0

    # Tropospheric NO2 Column
    no2_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="TroposphericColumnAmountNO2",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 1.0e14 <= no2_points[0].value <= 1.0e16

    # UV Aerosol Index
    ai_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="UVAerosolIndex",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 0.0 <= ai_points[0].value <= 5.0

    # Aerosol Optical Depth
    aod_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="AerosolOpticalDepth",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 0.05 <= aod_points[0].value <= 1.0


def test_merra2_provider_processing(temp_data_dir: Path):
    """Test MERRA-2 provider reanalysis air temperature and precipitation flux."""
    sample_file = temp_data_dir / "merra2_sample.nc"
    create_merra2_sample(sample_file)

    provider = get_provider("merra2_reanalysis")
    bbox = SpatialBoundingBox(min_lat=-4.5, max_lat=-3.5, min_lon=-62.5, max_lon=-61.0)

    # 2m Air Temp in Kelvin
    t2m_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="T2M",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 296.0 <= t2m_points[0].value <= 303.0

    # Precipitation flux in kg m-2 s-1
    precip_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="PRECTOTCORR",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 1.0e-6 <= precip_points[0].value <= 1.0e-3


def test_gldas_provider_processing(temp_data_dir: Path):
    """Test GLDAS Noah LSM hydrology provider soil moisture and evapotranspiration."""
    sample_file = temp_data_dir / "gldas_sample.nc"
    create_gldas_sample(sample_file)

    provider = get_provider("gldas_hydrology")
    bbox = SpatialBoundingBox(min_lat=-4.5, max_lat=-3.5, min_lon=-62.5, max_lon=-61.0)

    # Soil moisture in kg/m²
    soil_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="SoilMoi0_10cm_inst",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 15.0 <= soil_points[0].value <= 45.0

    # Evapotranspiration in kg m-2 s-1
    evap_points, _ = provider.process_granule_file(
        file_path=sample_file,
        variable_id="Evap_tavg",
        bounding_box=bbox,
        quality_filter=True,
    )
    assert 1.0e-6 <= evap_points[0].value <= 1.0e-4
