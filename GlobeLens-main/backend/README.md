# TerraTrend — NASA Earth Science Python Backend (Milestones 1 & 2)

FastAPI scientific data backend for the **NASA Space Apps Challenge: "Be an Earth Systems Trend Detective!"**

The backend provides:
1. **Authoritative Scientific Metadata Registries** for 6 major NASA missions (GPM IMERG, MODIS Terra/Aqua, AIRS Aqua, OMI Aura, MERRA-2, and GLDAS Noah).
2. **Real NASA Data Providers** with automated NASA CMR catalog discovery, Earthdata Login (URS) authentication, atomic granule downloading, deterministic local caching, NetCDF4/HDF5 parsing, spatial regional subsetting, quality bitmask filtering, and temporal aggregation.
3. **Standardized Scientific Data Model** preserving original physical units, scale factors, and data provenance without synthetic fabrication or silent conversions.
4. **Statistical Trend Detection Methodology Registries** (Mann-Kendall, Sen's Slope, Hirsch-Slack Seasonal Mann-Kendall, Pettitt Change-Point, and OLS regression).
5. **Asynchronous Data Acquisition API** supporting long-running background download jobs with progress tracking and job polling.

---

## 1. Directory Structure

```
backend/
├── .env.example              # Template for Earthdata credentials & CORS configuration
├── .gitignore                # Ignores .venv, caches, logs, .env, and satellite raster files
├── .python-version           # Pinned to Python 3.12
├── pyproject.toml            # Project dependencies & pytest configuration
├── README.md                 # Backend documentation
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI application setup, CORS, lifespan
│   ├── config.py             # Pydantic Settings & environment variable configuration
│   ├── core/
│   │   ├── __init__.py
│   │   └── auth.py           # NASA Earthdata Login (URS) Bearer & Basic auth manager
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py         # Master API router mounting endpoints under /api
│   │   └── endpoints/
│   │       ├── health.py     # GET /api/health
│   │       ├── datasets.py   # GET /api/datasets, GET /api/datasets/{id}
│   │       ├── regions.py    # GET /api/regions, GET /api/regions/{id}
│   │       ├── variables.py  # GET /api/variables, GET /api/variables/{id}
│   │       ├── analysis.py   # GET /api/analysis/methods, GET /api/analysis/methods/{id}
│   │       └── data.py       # POST /api/data/preview, POST /api/data/retrieve, GET /api/data/jobs/*
│   ├── models/
│   │   ├── dataset.py        # DatasetEntry, DatasetVariable, SpatialResolution, etc.
│   │   ├── region.py         # RegionMetadata, SpatialBoundingBox
│   │   ├── analysis.py       # AnalysisMethod specification
│   │   └── common.py         # ScientificTimeSeries, ScientificSpatialGrid, ObservationPoint
│   ├── registry/
│   │   ├── datasets.py       # 6 verified NASA datasets (GPM, MODIS, AIRS, OMI, MERRA-2, GLDAS)
│   │   ├── regions.py        # 8 representative scientific study regions
│   │   └── analysis.py       # Non-parametric & parametric trend analysis methods
│   ├── services/
│   │   ├── cmr.py            # NASA Common Metadata Repository (CMR) search client
│   │   ├── cache.py          # Deterministic granule & timeseries caching manager
│   │   ├── processor.py      # Xarray NetCDF/HDF subsetting, quality masking, and unit preservation
│   │   └── jobs.py           # Async background job lifecycle manager
│   └── providers/
│       ├── __init__.py       # Provider registry & get_provider() factory
│       ├── base.py           # BaseDatasetProvider abstract class
│       ├── gpm.py            # GPM IMERG Precipitation provider
│       ├── modis.py          # MODIS Vegetation & LST provider
│       ├── airs.py           # AIRS Atmospheric Sounder provider
│       ├── omi.py            # OMI Ozone & Trace Gas provider
│       ├── merra2.py         # MERRA-2 Atmospheric Reanalysis provider
│       └── gldas.py          # GLDAS Hydrology & Soil Moisture provider
└── tests/
    ├── conftest.py           # TestClient fixture
    ├── fixtures/
    │   ├── __init__.py
    │   └── sample_generator.py # NetCDF4 CF-compliant sample generator for 6 NASA products
    ├── test_health.py        # Health and root discovery tests
    ├── test_registry.py      # Comprehensive registry metadata tests
    ├── test_datasets_api.py  # Dataset listing, filtering, and 404 tests
    ├── test_regions_api.py   # Geographic study regions tests
    ├── test_variables_api.py # Environmental variable listing & filtering tests
    ├── test_analysis_api.py  # Statistical methods documentation tests
    ├── test_providers.py     # Provider interface & validation tests
    ├── test_real_providers.py # Provider extraction, scaling, and QA filtering tests
    ├── test_processor.py     # Spatial extraction and coordinate normalization tests
    ├── test_cache.py         # Deterministic query hashing & cache roundtrip tests
    ├── test_auth.py          # Earthdata authentication & error handling tests
    ├── test_data_api.py      # Preview, retrieve, and job polling API tests
    ├── test_scientific_model.py # Common data model & serialization tests
    └── test_integration_nasa.py # Live NASA CMR catalog tests (enabled with RUN_NASA_LIVE_TESTS=1)
```

---

## 2. Supported NASA Datasets & Verified Products

| Dataset Slug | Mission / Sensor | Verified NASA Product ID | CMR Short Name | Primary Variables | Original Units | Spatial Res. | Temporal Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `gpm_imerg` | GPM Core (DPR+GMI) | `GPM_3IMERGM_07` | `GPM_3IMERGM` | Precipitation Rate (`precipitation`), QA Index | `mm/hr`, `dimensionless` | 0.1° (~10 km) | 2000-06-01 – present |
| `modis_terra_aqua` | Terra/Aqua (MODIS) | `MOD13A2_061` / `MOD11A2_061` | `MOD13A2`, `MOD11A2` | 16-Day NDVI, 16-Day EVI, LST Day/Night | `dimensionless`, `Kelvin` | 1 km | 2000-02-18 – present |
| `airs_aqua` | Aqua (AIRS) | `AIRS3STM_7.0` | `AIRS3STM` | Surface Air Temp (`SurfAirTemp_A`), Total Ozone | `Kelvin`, `Dobson Units` | 1.0° | 2002-08-31 – present |
| `omi_aura` | Aura (OMI) | `OMTO3e_003` / `OMNO2d_003` / `OMAERUVd_003` | `OMTO3e`, `OMNO2d`, `OMAERUVd` | Total Ozone, Tropospheric NO2, UV Aerosol Index, AOD | `Dobson Units`, `molecules/cm²`, `dimensionless` | 0.25° / 1.0° | 2004-10-01 – present |
| `merra2_reanalysis` | GMAO GEOS-5 Model | `M2TMNXSLV_5.12.4` | `M2TMNXSLV` | 2m Air Temp (`T2M`), Bias-Corrected Precip (`PRECTOTCORR`) | `Kelvin`, `kg m-2 s-1` | 0.5° x 0.625° | 1980-01-01 – present |
| `gldas_hydrology` | Noah LSM Model | `GLDAS_NOAH025_M_2.1` | `GLDAS_NOAH025_M` | Soil Moisture 0-10cm (`SoilMoi0_10cm_inst`), Evapotranspiration | `kg/m²`, `kg m-2 s-1` | 0.25° | 2000-01-01 – present |

---

## 3. NASA Earthdata Authentication

To retrieve live NASA Earth science data:
1. Register for a free NASA Earthdata account at [https://urs.earthdata.nasa.gov/](https://urs.earthdata.nasa.gov/).
2. Generate a Personal Access Token in your profile under **Generate Token**: [https://urs.earthdata.nasa.gov/users/tokens](https://urs.earthdata.nasa.gov/users/tokens).
3. Set your token in the environment or in `backend/.env`:
   ```bash
   EARTHDATA_TOKEN=your_token_here
   ```
   *(Alternatively, set `EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD`)*

> [!IMPORTANT]
> The backend automatically validates credentials before initiating downloads and never logs or leaks tokens to client interfaces or source repositories.

---

## 4. Running the Tests

### Fast Deterministic Offline Test Suite (53 Tests)
```bash
# Uses generated CF-compliant NetCDF4 fixtures (no network required)
pytest backend/tests -v -m "not integration"
```

### Live NASA CMR Network Integration Tests (6 Tests)
```bash
# Connects to live NASA CMR search API
$env:RUN_NASA_LIVE_TESTS="1"; pytest backend/tests/test_integration_nasa.py -v
```

---

## 5. API Endpoints

- `GET /api/health` — Health check & registry statistics
- `GET /api/datasets` — All registered NASA datasets (filter by `status`, `provider`)
- `GET /api/datasets/{id}` — Single dataset metadata and available variables
- `GET /api/regions` — 8 curated study regions with bounding boxes
- `GET /api/variables` — Catalog of measurable physical parameters across all missions
- `GET /api/analysis/methods` — Non-parametric & parametric trend detection algorithms
- `POST /api/data/preview` — Fast catalog preview of matching granules and volume
- `POST /api/data/retrieve` — Enqueue asynchronous data acquisition & subsetting job
- `GET /api/data/jobs/{job_id}` — Poll job status, progress %, and messages
- `GET /api/data/jobs/{job_id}/result` — Retrieve standardized `ScientificTimeSeries` result with full provenance
