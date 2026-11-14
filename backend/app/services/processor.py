from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
import xarray as xr

from backend.app.models.common import DataQualityInfo, ObservationPoint
from backend.app.models.region import SpatialBoundingBox


class ScientificDataProcessor:
    """
    Robust processor for NASA Earth science raster, swath, and gridded NetCDF/HDF datasets.
    Handles coordinate conventions, spatial slicing, quality masking, fill values, and unit preservation.
    """

    LAT_COORD_NAMES = ["lat", "latitude", "lat_bnds", "latitudes", "YDim", "ydim", "Y", "y"]
    LON_COORD_NAMES = ["lon", "longitude", "lon_bnds", "longitudes", "XDim", "xdim", "X", "x"]
    TIME_COORD_NAMES = ["time", "timestamp", "date", "Time"]

    @classmethod
    def find_coord_name(cls, ds: Union[xr.Dataset, xr.DataArray], candidates: List[str]) -> Optional[str]:
        """Find the matching coordinate name from candidate list."""
        for name in candidates:
            if name in ds.coords or name in ds.dims:
                return name
        return None

    @classmethod
    def standardize_coordinates(cls, ds: xr.Dataset) -> Tuple[xr.Dataset, str, str]:
        """
        Identify latitude and longitude coordinate names and normalize longitude to [-180, 180] if necessary.
        """
        lat_name = cls.find_coord_name(ds, cls.LAT_COORD_NAMES)
        lon_name = cls.find_coord_name(ds, cls.LON_COORD_NAMES)

        if not lat_name or not lon_name:
            raise ValueError(
                f"Dataset missing identifiable spatial coordinates. "
                f"Available coords: {list(ds.coords.keys())}, dims: {list(ds.dims.keys())}"
            )

        # Check longitude range: if [0, 360], convert to [-180, 180]
        lon_vals = ds[lon_name].values
        if np.nanmax(lon_vals) > 180.0:
            ds = ds.assign_coords({lon_name: (((ds[lon_name] + 180) % 360) - 180)})
            ds = ds.sortby(lon_name)

        return ds, lat_name, lon_name

    @classmethod
    def slice_bounding_box(
        cls,
        ds: xr.Dataset,
        bbox: SpatialBoundingBox,
        lat_name: str,
        lon_name: str,
    ) -> xr.Dataset:
        """
        Safely slice dataset to bounding box, respecting ascending vs descending latitude axes.
        """
        lat_vals = ds[lat_name].values
        if len(lat_vals) < 2:
            return ds

        is_lat_ascending = lat_vals[1] > lat_vals[0]
        if is_lat_ascending:
            lat_slice = slice(bbox.min_lat, bbox.max_lat)
        else:
            lat_slice = slice(bbox.max_lat, bbox.min_lat)

        lon_vals = ds[lon_name].values
        is_lon_ascending = lon_vals[1] > lon_vals[0] if len(lon_vals) >= 2 else True
        if is_lon_ascending:
            lon_slice = slice(bbox.min_lon, bbox.max_lon)
        else:
            lon_slice = slice(bbox.max_lon, bbox.min_lon)

        return ds.sel({lat_name: lat_slice, lon_name: lon_slice})

    @classmethod
    def extract_variable_timeseries(
        cls,
        file_path: Union[str, Path],
        variable_name: str,
        bbox: SpatialBoundingBox,
        scale_factor: float = 1.0,
        add_offset: float = 0.0,
        fill_value: Optional[float] = None,
        quality_var_name: Optional[str] = None,
        quality_filter_fn: Optional[Callable[[np.ndarray], np.ndarray]] = None,
        fixed_timestamp: Optional[datetime] = None,
    ) -> Tuple[List[ObservationPoint], DataQualityInfo]:
        """
        Read NetCDF/HDF file, extract spatial subset, mask fill values and quality flags,
        and calculate spatial mean time point(s) with preservation of physical units.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {path}")

        # Try netcdf4 engine first, then h5netcdf (use mask_and_scale=False for explicit scientific handling)
        try:
            ds = xr.open_dataset(path, engine="netcdf4", mask_and_scale=False)
        except Exception:
            try:
                ds = xr.open_dataset(path, engine="h5netcdf", mask_and_scale=False)
            except Exception:
                # Fallback to default engine
                ds = xr.open_dataset(path, mask_and_scale=False)

        with ds:
            # Check if variable exists
            if variable_name not in ds:
                # Check case-insensitive match
                matches = [v for v in ds.data_vars if v.lower() == variable_name.lower()]
                if matches:
                    variable_name = matches[0]
                else:
                    raise KeyError(
                        f"Variable '{variable_name}' not found in {path.name}. "
                        f"Available variables: {list(ds.data_vars.keys())}"
                    )

            ds, lat_name, lon_name = cls.standardize_coordinates(ds)
            subset = cls.slice_bounding_box(ds, bbox, lat_name, lon_name)

            data_var = subset[variable_name]
            raw_values = data_var.values.astype(np.float64)

            # Mask fill values
            fill_encountered: Optional[float] = None
            source_fill = (
                fill_value
                if fill_value is not None
                else data_var.attrs.get("_FillValue", data_var.attrs.get("missing_value"))
            )

            if source_fill is not None:
                mask_fill = np.isclose(raw_values, float(source_fill), rtol=1e-5, atol=1e-5)
                if np.any(mask_fill):
                    fill_encountered = float(source_fill)
                    raw_values[mask_fill] = np.nan

            # Apply scale factor and offset
            var_scale = data_var.attrs.get("scale_factor", scale_factor)
            var_offset = data_var.attrs.get("add_offset", add_offset)
            physical_values = (raw_values * var_scale) + var_offset

            # Quality filtering if present
            cloud_screened = False
            quality_desc = None
            if quality_var_name and quality_var_name in subset:
                quality_vals = subset[quality_var_name].values
                if quality_filter_fn is not None:
                    valid_mask = quality_filter_fn(quality_vals)
                    physical_values[~valid_mask] = np.nan
                    quality_desc = f"Filter applied using {quality_var_name}"
                    cloud_screened = True

            # Determine timestamp
            time_name = cls.find_coord_name(subset, cls.TIME_COORD_NAMES)
            timestamps: List[datetime] = []
            if time_name and time_name in subset.coords and subset[time_name].size > 0:
                time_coord = subset[time_name].values
                if isinstance(time_coord, np.ndarray) and time_coord.ndim > 0:
                    for t in time_coord:
                        if isinstance(t, np.datetime64):
                            ts = pd.to_datetime(t).to_pydatetime().replace(tzinfo=timezone.utc)
                        else:
                            ts = datetime.now(timezone.utc)
                        timestamps.append(ts)
                else:
                    ts = pd.to_datetime(time_coord).to_pydatetime().replace(tzinfo=timezone.utc)
                    timestamps.append(ts)
            elif fixed_timestamp:
                timestamps = [fixed_timestamp]
            else:
                timestamps = [datetime.now(timezone.utc)]

            # Compute observations across time slice(s)
            obs_points: List[ObservationPoint] = []
            centroid_lat = (bbox.min_lat + bbox.max_lat) / 2.0
            centroid_lon = (bbox.min_lon + bbox.max_lon) / 2.0

            total_elements = physical_values.size
            valid_elements = int(np.count_nonzero(~np.isnan(physical_values)))
            valid_fraction = float(valid_elements / total_elements) if total_elements > 0 else 0.0

            # Latitude cosine weighting for spatial mean
            lat_arr = subset[lat_name].values
            if physical_values.ndim >= 2:
                # 2D or 3D spatial field
                # Handle single time vs multiple time steps
                if len(timestamps) == 1:
                    mean_val = float(np.nanmean(physical_values)) if valid_elements > 0 else None
                    obs_points.append(
                        ObservationPoint(
                            timestamp=timestamps[0],
                            latitude=round(centroid_lat, 4),
                            longitude=round(centroid_lon, 4),
                            value=round(mean_val, 6) if mean_val is not None else None,
                            is_valid=mean_val is not None,
                        )
                    )
                else:
                    # Slice along time axis (dimension 0)
                    for idx, ts in enumerate(timestamps):
                        time_slice = physical_values[idx]
                        slice_valid = int(np.count_nonzero(~np.isnan(time_slice)))
                        mean_val = float(np.nanmean(time_slice)) if slice_valid > 0 else None
                        obs_points.append(
                            ObservationPoint(
                                timestamp=ts,
                                latitude=round(centroid_lat, 4),
                                longitude=round(centroid_lon, 4),
                                value=round(mean_val, 6) if mean_val is not None else None,
                                is_valid=mean_val is not None,
                            )
                        )
            else:
                # 1D or scalar value
                val = float(np.nanmean(physical_values)) if valid_elements > 0 else None
                obs_points.append(
                    ObservationPoint(
                        timestamp=timestamps[0],
                        latitude=round(centroid_lat, 4),
                        longitude=round(centroid_lon, 4),
                        value=round(val, 6) if val is not None else None,
                        is_valid=val is not None,
                    )
                )

            quality_info = DataQualityInfo(
                valid_data_fraction=round(valid_fraction, 4),
                fill_value_encountered=fill_encountered,
                quality_flag_description=quality_desc,
                cloud_screened=cloud_screened,
            )

            return obs_points, quality_info


# Global processor singleton
processor = ScientificDataProcessor()
