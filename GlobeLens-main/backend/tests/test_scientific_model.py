from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from backend.app.models.common import (
    DataQualityInfo,
    ObservationPoint,
    ProcessingProvenance,
    ScientificSpatialGrid,
    ScientificTimeSeries,
)
from backend.app.models.region import SpatialBoundingBox


def test_scientific_timeseries_model():
    """Verify ScientificTimeSeries maintains units, provenance, and point structure."""
    provenance = ProcessingProvenance(
        source_daac="NASA GES DISC",
        satellite_mission="GPM Core Observatory",
        sensor_instrument="IMERG DPR+GMI",
        processing_level="Level 3 Final Run Monthly",
        algorithm_version="V07",
        retrieval_method="OPeNDAP / CMR Granule",
        source_doi_or_url="https://doi.org/10.5067/GPM/IMERG/3B-MONTH/07",
    )
    quality = DataQualityInfo(
        valid_data_fraction=0.98,
        fill_value_encountered=-9999.9,
        quality_flag_description="IMERG precipitation quality index threshold >= 1",
        cloud_screened=True,
    )
    bbox = SpatialBoundingBox(
        min_lat=-5.0,
        max_lat=-2.0,
        min_lon=-65.0,
        max_lon=-60.0,
    )
    points = [
        ObservationPoint(
            timestamp=datetime(2023, 1, 15, tzinfo=timezone.utc),
            latitude=-3.465,
            longitude=-62.216,
            value=8.45,
            is_valid=True,
            raw_quality_code=1,
        ),
        ObservationPoint(
            timestamp=datetime(2023, 2, 15, tzinfo=timezone.utc),
            latitude=-3.465,
            longitude=-62.216,
            value=11.20,
            is_valid=True,
            raw_quality_code=1,
        ),
    ]

    series = ScientificTimeSeries(
        dataset_id="gpm_imerg",
        product_id="GPM_3IMERGM_07",
        variable_id="precipitation",
        variable_name="Precipitation Calibrated",
        original_units="mm/hr",
        spatial_selection=bbox,
        points=points,
        quality_info=quality,
        provenance=provenance,
    )

    data = series.model_dump()
    assert data["dataset_id"] == "gpm_imerg"
    assert data["original_units"] == "mm/hr"
    assert len(data["points"]) == 2
    assert data["quality_info"]["valid_data_fraction"] == 0.98
    assert data["provenance"]["sensor_instrument"] == "IMERG DPR+GMI"

    # Verify JSON round-trip
    json_str = series.model_dump_json()
    reloaded = ScientificTimeSeries.model_validate_json(json_str)
    assert reloaded.original_units == "mm/hr"
    assert len(reloaded.points) == 2


def test_scientific_spatial_grid_model():
    """Verify ScientificSpatialGrid maintains 2D grid dimensions and coordinates."""
    provenance = ProcessingProvenance(
        source_daac="NASA LP DAAC",
        satellite_mission="Terra",
        sensor_instrument="MODIS",
        processing_level="Level 3 16-Day",
        algorithm_version="061",
        retrieval_method="AppEEARS REST",
    )
    quality = DataQualityInfo(
        valid_data_fraction=1.0,
        cloud_screened=True,
    )
    grid = ScientificSpatialGrid(
        dataset_id="modis_terra_aqua",
        product_id="MOD13A2_061",
        variable_id="NDVI",
        original_units="dimensionless",
        timestamp=datetime(2023, 6, 1, tzinfo=timezone.utc),
        latitudes=[-3.0, -3.1, -3.2],
        longitudes=[-62.0, -62.1, -62.2, -62.3],
        data_shape=[3, 4],
        fill_value=-3000.0,
        quality_info=quality,
        provenance=provenance,
    )
    assert grid.data_shape == [3, 4]
    assert len(grid.latitudes) == 3
    assert len(grid.longitudes) == 4


def test_coordinate_validation():
    """Verify bounds checking catches invalid latitude / longitude."""
    with pytest.raises(ValidationError):
        SpatialBoundingBox(
            min_lat=-95.0,  # invalid latitude < -90
            max_lat=10.0,
            min_lon=0.0,
            max_lon=10.0,
        )
