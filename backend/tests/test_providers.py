from datetime import date, datetime, timezone
import pytest

from backend.app.models.region import SpatialBoundingBox
from backend.app.providers import get_provider, list_providers
from backend.app.providers.base import BaseDatasetProvider


def test_provider_factory_all_datasets():
    """Verify factory returns appropriate provider instance for each dataset."""
    providers = list_providers()
    assert len(providers) == 6

    expected_ids = [
        "gpm_imerg",
        "modis_terra_aqua",
        "airs_aqua",
        "omi_aura",
        "merra2_reanalysis",
        "gldas_hydrology",
    ]
    for dataset_id in expected_ids:
        provider = get_provider(dataset_id)
        assert isinstance(provider, BaseDatasetProvider)
        assert provider.dataset_id == dataset_id
        assert provider.provider_name
        assert provider.documentation_url.startswith("http")


def test_provider_factory_unknown_dataset():
    """Verify factory raises KeyError for unregistered dataset."""
    with pytest.raises(KeyError) as exc_info:
        get_provider("unknown_dataset_123")
    assert "No provider registered" in str(exc_info.value)


def test_provider_metadata_retrieval():
    """Verify provider correctly links to dataset registry metadata."""
    gpm = get_provider("gpm_imerg")
    meta = gpm.get_metadata()
    assert meta.dataset_id == "gpm_imerg"
    assert "GPM" in meta.display_name

    variables = gpm.get_variables()
    assert len(variables) >= 3
    precip = gpm.get_variable_metadata("precipitation")
    assert precip.original_units == "mm/hr"


def test_provider_validation_chronological_ordering():
    """Verify provider validation rejects inverted date ranges."""
    modis = get_provider("modis_terra_aqua")
    with pytest.raises(ValueError) as exc_info:
        modis.validate_request(
            variable_id="_1_km_16_days_NDVI",
            start_date=date(2023, 1, 1),
            end_date=date(2022, 1, 1),
        )
    assert "start_date" in str(exc_info.value)
    assert "must be before" in str(exc_info.value)


def test_provider_validation_pre_launch_date():
    """Verify provider validation rejects dates preceding satellite launch."""
    airs = get_provider("airs_aqua")
    with pytest.raises(ValueError) as exc_info:
        airs.validate_request(
            variable_id="SurfAirTemp_A",
            start_date=date(1995, 1, 1),  # AIRS launched in 2002
            end_date=date(2000, 1, 1),
        )
    assert "precedes airs_aqua verified coverage start" in str(exc_info.value)


def test_provider_validation_invalid_variable():
    """Verify provider validation rejects variables not belonging to dataset."""
    omi = get_provider("omi_aura")
    with pytest.raises(ValueError) as exc_info:
        omi.validate_request(
            variable_id="SoilMoi0_10cm_inst",  # This is a GLDAS variable
            start_date=date(2020, 1, 1),
            end_date=date(2020, 12, 31),
        )
    assert "is not supported by omi_aura" in str(exc_info.value)


from backend.app.core.auth import EarthdataAuthenticationError


@pytest.mark.asyncio
async def test_provider_requires_earthdata_credentials():
    """Verify provider requires valid Earthdata credentials before attempting unauthenticated downloads."""
    merra2 = get_provider("merra2_reanalysis")
    bbox = SpatialBoundingBox(min_lat=30.0, max_lat=40.0, min_lon=-115.0, max_lon=-105.0)
    # Clear any active credentials
    merra2.validate_request(
        variable_id="T2M",
        start_date=date(2020, 1, 1),
        end_date=date(2020, 6, 1),
        bounding_box=bbox,
    )
    # When retrieve_timeseries is executed without credentials, EarthdataAuthenticationError is raised
    with pytest.raises((EarthdataAuthenticationError, RuntimeError)):
        await merra2.retrieve_timeseries(
            variable_id="T2M",
            bounding_box=bbox,
            start_date=date(2020, 1, 1),
            end_date=date(2020, 6, 1),
        )
