from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
# pyrefly: ignore[missing-import]
from backend.app.models.region import SpatialBoundingBox


class DataQualityInfo(BaseModel):
    """
    Standardized data quality container.
    Preserves original bitmasks, valid data fractions, and cloud screening flags.
    """
    valid_data_fraction: float = Field(..., ge=0.0, le=1.0, description="Ratio of non-fill/non-cloud observations")
    fill_value_encountered: Optional[float] = Field(None, description="Original source missing/fill value sentinel")
    quality_flag_description: Optional[str] = Field(None, description="Definition of quality mask or bit flags")
    quality_bits_summary: Optional[Dict[str, int]] = Field(None, description="Histogram of quality flag bits if present")
    cloud_screened: bool = Field(default=False, description="Whether cloud-screening algorithms were applied")


class ProcessingProvenance(BaseModel):
    """
    Provenance tracking for scientific reproducibility.
    Records data origin, algorithm version, and download/processing history.
    """
    source_daac: str = Field(..., description="Archiving facility (e.g. 'NASA LP DAAC', 'NASA GES DISC')")
    satellite_mission: str = Field(..., description="Platform (e.g. 'Terra', 'Aqua', 'GPM Core Observatory', 'Aura')")
    sensor_instrument: str = Field(..., description="Instrument (e.g. 'MODIS', 'IMERG DPR+GMI', 'AIRS', 'OMI')")
    processing_level: str = Field(..., description="Processing tier (e.g. 'L3 Gridded Daily', 'L4 Reanalysis')")
    algorithm_version: str = Field(..., description="Official algorithm release (e.g. 'V07', 'V061', 'V7.0')")
    retrieval_method: str = Field(..., description="Access interface (e.g. 'AppEEARS REST', 'OPeNDAP', 'CMR Granule')")
    source_doi_or_url: Optional[str] = Field(None, description="Official DOI citation or documentation URL")
    processed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp of extraction/processing")


class ObservationPoint(BaseModel):
    """Single observation with spatial, temporal, and quality attributes."""
    timestamp: datetime = Field(..., description="UTC observation timestamp")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees (WGS84)")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees (WGS84)")
    value: Optional[float] = Field(None, description="Physical value in original units; None if missing/fill")
    is_valid: bool = Field(default=True, description="True if value passes QA criteria and is not a fill value")
    raw_quality_code: Optional[int] = Field(None, description="Underlying integer quality flag from source dataset")


class ScientificTimeSeries(BaseModel):
    """
    Canonical standardized time-series representation.
    Guarantees no silent unit conversion or loss of metadata provenance.
    """
    dataset_id: str = Field(..., description="Source dataset slug (e.g. 'gpm_imerg')")
    product_id: str = Field(..., description="NASA product identifier (e.g. 'GPM_3IMERGM_07')")
    variable_id: str = Field(..., description="Technical variable key")
    variable_name: str = Field(..., description="Descriptive variable label")
    original_units: str = Field(..., description="Authoritative original physical unit from source DAAC")
    scale_factor: float = Field(default=1.0, description="Scale factor applied to raw sensor storage values")
    add_offset: float = Field(default=0.0, description="Additive offset applied to raw sensor storage values")
    
    spatial_selection: SpatialBoundingBox = Field(..., description="Geographic extent of observation aggregation")
    points: List[ObservationPoint] = Field(..., description="Sequential time-series data points")
    
    quality_info: DataQualityInfo = Field(..., description="Observational quality metrics")
    provenance: ProcessingProvenance = Field(..., description="Traceable scientific processing history")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional source attributes and headers")


class ScientificSpatialGrid(BaseModel):
    """
    Canonical standardized 2D spatial grid representation for map rendering and spatial analysis.
    """
    dataset_id: str
    product_id: str
    variable_id: str
    original_units: str
    timestamp: datetime
    latitudes: List[float] = Field(..., description="Grid coordinate latitudes (1D array)")
    longitudes: List[float] = Field(..., description="Grid coordinate longitudes (1D array)")
    data_shape: List[int] = Field(..., description="[rows, cols] grid dimensions")
    fill_value: Optional[float] = None
    quality_info: DataQualityInfo
    provenance: ProcessingProvenance
