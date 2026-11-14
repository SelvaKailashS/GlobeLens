import os
from datetime import date
import pytest

from backend.app.models.region import SpatialBoundingBox
from backend.app.services.cmr import cmr_client


# Run only when explicitly marked or when RUN_NASA_LIVE_TESTS is set
live_tests_enabled = os.getenv("RUN_NASA_LIVE_TESTS", "0") == "1"


@pytest.mark.integration
@pytest.mark.skipif(not live_tests_enabled, reason="Live NASA network tests disabled (set RUN_NASA_LIVE_TESTS=1)")
@pytest.mark.asyncio
async def test_live_cmr_search_gpm():
    """Verify live NASA CMR catalog returns real GPM IMERG granules."""
    granules = await cmr_client.search_granules(
        short_name="GPM_3IMERGM",
        version="07",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 2, 1),
        page_size=2,
    )
    assert len(granules) > 0
    assert "3IMERG" in granules[0].title
    assert granules[0].download_url is not None


@pytest.mark.integration
@pytest.mark.skipif(not live_tests_enabled, reason="Live NASA network tests disabled (set RUN_NASA_LIVE_TESTS=1)")
@pytest.mark.asyncio
async def test_live_cmr_search_modis():
    """Verify live NASA CMR catalog returns real MODIS MOD13A2 granules."""
    bbox = SpatialBoundingBox(min_lat=-4.0, max_lat=-3.0, min_lon=-61.0, max_lon=-60.0)
    granules = await cmr_client.search_granules(
        short_name="MOD13A2",
        version="061",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 2, 1),
        bounding_box=bbox,
        page_size=2,
    )
    assert len(granules) > 0
    assert "MOD13A2" in granules[0].title


@pytest.mark.integration
@pytest.mark.skipif(not live_tests_enabled, reason="Live NASA network tests disabled (set RUN_NASA_LIVE_TESTS=1)")
@pytest.mark.asyncio
async def test_live_cmr_search_airs():
    """Verify live NASA CMR catalog returns real AIRS Version 7.0 granules."""
    granules = await cmr_client.search_granules(
        short_name="AIRS3STM",
        version="7.0",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 2, 1),
        page_size=2,
    )
    assert len(granules) > 0
    assert "AIRS" in granules[0].title


@pytest.mark.integration
@pytest.mark.skipif(not live_tests_enabled, reason="Live NASA network tests disabled (set RUN_NASA_LIVE_TESTS=1)")
@pytest.mark.asyncio
async def test_live_cmr_search_merra2():
    """Verify live NASA CMR catalog returns real MERRA-2 M2TMNXSLV granules."""
    granules = await cmr_client.search_granules(
        short_name="M2TMNXSLV",
        version="5.12.4",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 2, 1),
        page_size=2,
    )
    assert len(granules) > 0
    assert "MERRA2" in granules[0].title


@pytest.mark.integration
@pytest.mark.skipif(not live_tests_enabled, reason="Live NASA network tests disabled (set RUN_NASA_LIVE_TESTS=1)")
@pytest.mark.asyncio
async def test_live_cmr_search_omi():
    """Verify live NASA CMR catalog returns real OMI OMTO3e granules."""
    granules = await cmr_client.search_granules(
        short_name="OMTO3e",
        version="003",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 1, 3),
        page_size=2,
    )
    assert len(granules) > 0
    assert "OMI" in granules[0].title or "OMTO3e" in granules[0].title


@pytest.mark.integration
@pytest.mark.skipif(not live_tests_enabled, reason="Live NASA network tests disabled (set RUN_NASA_LIVE_TESTS=1)")
@pytest.mark.asyncio
async def test_live_cmr_search_gldas():
    """Verify live NASA CMR catalog returns real GLDAS Noah LSM granules."""
    granules = await cmr_client.search_granules(
        short_name="GLDAS_NOAH025_M",
        version="2.1",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 2, 1),
        page_size=2,
    )
    assert len(granules) > 0
    assert "GLDAS" in granules[0].title
