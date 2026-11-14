from datetime import datetime, timezone
import numpy as np
import pytest
import xarray as xr

from backend.app.models.region import SpatialBoundingBox
from backend.app.services.processor import ScientificDataProcessor


def test_standardize_coordinates_0_to_360():
    """Verify processor converts 0..360 longitude coordinates to -180..180."""
    lats = np.array([-10.0, 0.0, 10.0])
    lons = np.array([350.0, 355.0, 0.0, 5.0, 10.0])  # 350 -> -10, 355 -> -5

    ds = xr.Dataset(
        data_vars={"temp": (["lat", "lon"], np.ones((3, 5)))},
        coords={"lat": lats, "lon": lons},
    )
    norm_ds, lat_name, lon_name = ScientificDataProcessor.standardize_coordinates(ds)
    assert lat_name == "lat"
    assert lon_name == "lon"
    norm_lons = norm_ds[lon_name].values
    assert np.all(norm_lons >= -180.0)
    assert np.all(norm_lons <= 180.0)
    assert -10.0 in norm_lons
    assert -5.0 in norm_lons


def test_descending_latitude_slicing():
    """Verify processor handles descending latitude coordinates (90 to -90)."""
    lats = np.array([20.0, 10.0, 0.0, -10.0, -20.0])  # Descending
    lons = np.array([-60.0, -50.0, -40.0])

    ds = xr.Dataset(
        data_vars={"temp": (["lat", "lon"], np.arange(15).reshape(5, 3))},
        coords={"lat": lats, "lon": lons},
    )
    bbox = SpatialBoundingBox(min_lat=-5.0, max_lat=15.0, min_lon=-55.0, max_lon=-45.0)
    subset = ScientificDataProcessor.slice_bounding_box(ds, bbox, "lat", "lon")
    sub_lats = subset["lat"].values
    assert 10.0 in sub_lats
    assert 0.0 in sub_lats
    assert 20.0 not in sub_lats
    assert -20.0 not in sub_lats
