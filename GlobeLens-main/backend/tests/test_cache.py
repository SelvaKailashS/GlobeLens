from datetime import date, datetime, timezone
from pathlib import Path

from backend.app.models.common import (
    DataQualityInfo,
    ObservationPoint,
    ProcessingProvenance,
    ScientificTimeSeries,
)
from backend.app.models.region import SpatialBoundingBox
from backend.app.services.cache import DataCacheManager


def test_deterministic_query_hashing():
    """Verify that identical queries produce identical hashes, and differences alter the hash."""
    bbox = SpatialBoundingBox(min_lat=-5.0, max_lat=-3.0, min_lon=-65.0, max_lon=-60.0)

    hash1 = DataCacheManager.compute_query_hash(
        dataset_id="gpm_imerg",
        variable_id="precipitation",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 6, 1),
        bbox=bbox,
    )
    hash2 = DataCacheManager.compute_query_hash(
        dataset_id="gpm_imerg",
        variable_id="precipitation",
        start_date=date(2023, 1, 1),
        end_date=date(2023, 6, 1),
        bbox=bbox,
    )
    assert hash1 == hash2

    hash3 = DataCacheManager.compute_query_hash(
        dataset_id="gpm_imerg",
        variable_id="precipitation",
        start_date=date(2023, 1, 2),  # different date
        end_date=date(2023, 6, 1),
        bbox=bbox,
    )
    assert hash1 != hash3


def test_timeseries_cache_roundtrip(tmp_path: Path, monkeypatch):
    """Verify saving and retrieving ScientificTimeSeries from cache."""
    cache = DataCacheManager()
    cache.timeseries_dir = tmp_path / "timeseries"
    cache.timeseries_dir.mkdir(parents=True, exist_ok=True)

    bbox = SpatialBoundingBox(min_lat=-5.0, max_lat=-3.0, min_lon=-65.0, max_lon=-60.0)
    series = ScientificTimeSeries(
        dataset_id="gpm_imerg",
        product_id="GPM_3IMERGM_07",
        variable_id="precipitation",
        variable_name="Precipitation Rate",
        original_units="mm/hr",
        spatial_selection=bbox,
        points=[
            ObservationPoint(
                timestamp=datetime(2023, 1, 15, tzinfo=timezone.utc),
                latitude=-4.0,
                longitude=-62.5,
                value=5.42,
                is_valid=True,
            )
        ],
        quality_info=DataQualityInfo(valid_data_fraction=1.0, cloud_screened=True),
        provenance=ProcessingProvenance(
            source_daac="NASA GES DISC",
            satellite_mission="GPM Core",
            sensor_instrument="IMERG",
            processing_level="Level 3",
            algorithm_version="V07",
            retrieval_method="CMR / HTTPS",
        ),
    )

    query_hash = "test_hash_12345"
    assert cache.get_cached_timeseries(query_hash) is None

    cache.save_cached_timeseries(query_hash, series)
    reloaded = cache.get_cached_timeseries(query_hash)
    assert reloaded is not None
    assert reloaded.dataset_id == "gpm_imerg"
    assert reloaded.points[0].value == 5.42
