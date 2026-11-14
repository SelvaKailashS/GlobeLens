from pathlib import Path
import numpy as np
import pandas as pd
import xarray as xr


def create_gpm_sample(file_path: Path) -> Path:
    """Generate a realistic GPM IMERG Level 3 sample NetCDF file."""
    lats = np.linspace(-5.0, -3.0, 20)
    lons = np.linspace(-63.0, -60.0, 30)
    time = pd.date_range("2023-01-15", periods=1)

    # 1 time, 20 lat, 30 lon
    precip_data = np.random.uniform(2.0, 12.0, size=(1, 20, 30))
    # inject fill values
    precip_data[0, 0, :5] = -9999.9

    qa_data = np.random.uniform(0.3, 0.9, size=(1, 20, 30))
    liquid_data = np.random.uniform(85.0, 100.0, size=(1, 20, 30))

    ds = xr.Dataset(
        data_vars={
            "precipitation": (["time", "lat", "lon"], precip_data, {"units": "mm/hr", "_FillValue": -9999.9}),
            "precipitationQualityIndex": (["time", "lat", "lon"], qa_data, {"units": "dimensionless"}),
            "probabilityLiquidPrecipitation": (["time", "lat", "lon"], liquid_data, {"units": "%"}),
        },
        coords={
            "time": time,
            "lat": lats,
            "lon": lons,
        },
        attrs={
            "title": "GPM IMERG Final Precipitation L3 1 month 0.1 degree x 0.1 degree V07",
            "Conventions": "CF-1.7",
        },
    )
    file_path.parent.mkdir(parents=True, exist_ok=True)
    ds.to_netcdf(file_path, engine="netcdf4")
    return file_path


def create_modis_sample(file_path: Path) -> Path:
    """Generate a realistic MODIS Vegetation & LST sample NetCDF file."""
    lats = np.linspace(-5.0, -3.0, 20)
    lons = np.linspace(-63.0, -60.0, 30)
    time = pd.date_range("2023-01-01", periods=1)

    # NDVI raw values around 7500 (representing 0.75 NDVI with scale factor 0.0001)
    ndvi_raw = np.random.randint(6500, 8800, size=(1, 20, 30)).astype(float)
    ndvi_raw[0, 0, :3] = -3000.0  # fill value

    # LST raw values around 15000 (representing 300 Kelvin with scale factor 0.02)
    lst_raw = np.random.randint(14500, 15500, size=(1, 20, 30)).astype(float)
    lst_raw[0, 0, :2] = 0.0  # fill value

    # QA bitmasks (0 = good quality)
    qa_data = np.zeros((1, 20, 30), dtype=np.int16)
    qa_data[0, -1, :] = 1  # some cloudy/marginal pixels

    ds = xr.Dataset(
        data_vars={
            "_1_km_16_days_NDVI": (
                ["time", "lat", "lon"],
                ndvi_raw,
                {"scale_factor": 0.0001, "add_offset": 0.0, "_FillValue": -3000.0, "units": "NDVI ratio"},
            ),
            "250m_16_days_VI_Quality": (["time", "lat", "lon"], qa_data, {"units": "bitmask"}),
            "LST_Day_1km": (
                ["time", "lat", "lon"],
                lst_raw,
                {"scale_factor": 0.02, "add_offset": 0.0, "_FillValue": 0.0, "units": "Kelvin"},
            ),
            "QC_Day": (["time", "lat", "lon"], qa_data, {"units": "bitmask"}),
        },
        coords={
            "time": time,
            "lat": lats,
            "lon": lons,
        },
        attrs={"title": "MODIS Terra Vegetation and Land Surface Temperature L3 1km"},
    )
    file_path.parent.mkdir(parents=True, exist_ok=True)
    ds.to_netcdf(file_path, engine="netcdf4")
    return file_path


def create_airs_sample(file_path: Path) -> Path:
    """Generate a realistic AIRS Version 7.0 sample NetCDF file."""
    lats = np.linspace(-5.0, -3.0, 10)
    lons = np.linspace(-63.0, -60.0, 10)
    time = pd.date_range("2023-01-15", periods=1)

    air_temp = np.random.uniform(296.0, 303.0, size=(1, 10, 10))
    air_temp[0, 0, 0] = -9999.0
    skin_temp = np.random.uniform(298.0, 305.0, size=(1, 10, 10))
    tot_o3 = np.random.uniform(260.0, 280.0, size=(1, 10, 10))

    ds = xr.Dataset(
        data_vars={
            "SurfAirTemp_A": (["time", "lat", "lon"], air_temp, {"units": "Kelvin", "_FillValue": -9999.0}),
            "SurfSkinTemp_A": (["time", "lat", "lon"], skin_temp, {"units": "Kelvin", "_FillValue": -9999.0}),
            "TotO3_A": (["time", "lat", "lon"], tot_o3, {"units": "Dobson Units (DU)", "_FillValue": -9999.0}),
        },
        coords={
            "time": time,
            "lat": lats,
            "lon": lons,
        },
        attrs={"title": "Aqua/AIRS L3 Monthly Standard Physical Retrieval (AIRS-only) V7.0"},
    )
    file_path.parent.mkdir(parents=True, exist_ok=True)
    ds.to_netcdf(file_path, engine="netcdf4")
    return file_path


def create_omi_sample(file_path: Path) -> Path:
    """Generate a realistic OMI Ozone & Trace Gas sample NetCDF file."""
    lats = np.linspace(-5.0, -3.0, 15)
    lons = np.linspace(-63.0, -60.0, 15)
    time = pd.date_range("2023-01-15", periods=1)

    ozone = np.random.uniform(265.0, 290.0, size=(1, 15, 15))
    no2 = np.random.uniform(1.0e15, 4.0e15, size=(1, 15, 15))
    ai = np.random.uniform(0.2, 1.8, size=(1, 15, 15))
    aod = np.random.uniform(0.1, 0.45, size=(1, 15, 15))

    ds = xr.Dataset(
        data_vars={
            "ColumnAmountO3": (["time", "lat", "lon"], ozone, {"units": "Dobson Units (DU)", "_FillValue": -1.2676506e30}),
            "TroposphericColumnAmountNO2": (["time", "lat", "lon"], no2, {"units": "molecules/cm²", "_FillValue": -1.2676506e30}),
            "UVAerosolIndex": (["time", "lat", "lon"], ai, {"units": "index unit", "_FillValue": -1.2676506e30}),
            "AerosolOpticalDepth": (["time", "lat", "lon"], aod, {"units": "dimensionless", "_FillValue": -1.2676506e30}),
        },
        coords={
            "time": time,
            "lat": lats,
            "lon": lons,
        },
        attrs={"title": "OMI/Aura L3 Gridded Atmospheric Composition"},
    )
    file_path.parent.mkdir(parents=True, exist_ok=True)
    ds.to_netcdf(file_path, engine="netcdf4")
    return file_path


def create_merra2_sample(file_path: Path) -> Path:
    """Generate a realistic MERRA-2 Atmospheric Reanalysis sample NetCDF file."""
    lats = np.linspace(-5.0, -3.0, 12)
    lons = np.linspace(-63.0, -60.0, 12)
    time = pd.date_range("2023-01-15", periods=1)

    t2m = np.random.uniform(297.0, 301.0, size=(1, 12, 12))
    prectot = np.random.uniform(2.0e-5, 8.0e-5, size=(1, 12, 12))  # kg m-2 s-1

    ds = xr.Dataset(
        data_vars={
            "T2M": (["time", "lat", "lon"], t2m, {"units": "Kelvin", "_FillValue": 1.0e15}),
            "PRECTOTCORR": (["time", "lat", "lon"], prectot, {"units": "kg m-2 s-1", "_FillValue": 1.0e15}),
        },
        coords={
            "time": time,
            "lat": lats,
            "lon": lons,
        },
        attrs={"title": "MERRA-2 M2TMNXSLV Monthly 2D Surface Diagnostics"},
    )
    file_path.parent.mkdir(parents=True, exist_ok=True)
    ds.to_netcdf(file_path, engine="netcdf4")
    return file_path


def create_gldas_sample(file_path: Path) -> Path:
    """Generate a realistic GLDAS Noah LSM sample NetCDF file."""
    lats = np.linspace(-5.0, -3.0, 12)
    lons = np.linspace(-63.0, -60.0, 12)
    time = pd.date_range("2023-01-15", periods=1)

    soil_m = np.random.uniform(20.0, 40.0, size=(1, 12, 12))
    evap = np.random.uniform(1.0e-5, 3.5e-5, size=(1, 12, 12))
    rainf = np.random.uniform(2.0e-5, 6.0e-5, size=(1, 12, 12))

    ds = xr.Dataset(
        data_vars={
            "SoilMoi0_10cm_inst": (["time", "lat", "lon"], soil_m, {"units": "kg/m²", "_FillValue": -9999.0}),
            "Evap_tavg": (["time", "lat", "lon"], evap, {"units": "kg m-2 s-1", "_FillValue": -9999.0}),
            "Rainf_tavg": (["time", "lat", "lon"], rainf, {"units": "kg m-2 s-1", "_FillValue": -9999.0}),
        },
        coords={
            "time": time,
            "lat": lats,
            "lon": lons,
        },
        attrs={"title": "GLDAS Noah LSM Monthly L4 0.25 degree"},
    )
    file_path.parent.mkdir(parents=True, exist_ok=True)
    ds.to_netcdf(file_path, engine="netcdf4")
    return file_path

