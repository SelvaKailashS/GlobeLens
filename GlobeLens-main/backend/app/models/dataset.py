from enum import Enum
from typing import List, Optional, Tuple
from pydantic import BaseModel, Field, HttpUrl, computed_field


class IntegrationStatus(str, Enum):
    """
    Status of backend dataset integration.
    Clearly distinguishes operational state without pretending data retrieval works.
    """
    IMPLEMENTED = "implemented"
    IN_DEVELOPMENT = "in_development"
    PLANNED = "planned"
    UNAVAILABLE = "unavailable"


class DatasetVariable(BaseModel):
    """
    Metadata specification for an individual variable within a NASA Earth science dataset.
    Preserves original units, scale factors, and data dictionaries.
    """
    variable_id: str = Field(..., description="Technical identifier used in data files / APIs")
    display_name: str = Field(..., description="Human-readable variable label")
    units: str = Field(..., description="Documented measurement unit (e.g., mm/hr, Kelvin, dimensionless)")
    description: str = Field(..., description="Scientific variable definition")
    cf_standard_name: Optional[str] = Field(None, description="Climate and Forecast (CF) metadata standard name")
    scale_factor: float = Field(default=1.0, description="Multiplication factor to obtain real physical value")
    add_offset: float = Field(default=0.0, description="Additive offset to obtain real physical value")
    fill_value: Optional[float] = Field(None, description="Documented missing / fill value in source data files")
    valid_range: Optional[Tuple[float, float]] = Field(None, description="Expected minimum and maximum physical range")
    category: Optional[str] = Field(None, description="Physical domain category")

    @computed_field
    @property
    def physical_category(self) -> str:
        """Categorical domain grouping."""
        if self.category:
            return self.category
        vid = self.variable_id.lower()
        if "ndvi" in vid or "evi" in vid:
            return "Vegetation"
        if "precip" in vid or "rain" in vid:
            return "Precipitation"
        if "temp" in vid or "lst" in vid:
            return "Temperature"
        if "soil" in vid or "evap" in vid or "qs" in vid:
            return "Hydrology"
        if "o3" in vid or "no2" in vid:
            return "Atmospheric Composition"
        return "Atmosphere"

    @computed_field
    @property
    def original_units(self) -> str:
        """Alias for units to match canonical scientific nomenclature."""
        return self.units


class SpatialResolution(BaseModel):
    """Spatial resolution metadata for a gridded or swath dataset."""
    value: float = Field(..., description="Numeric resolution value (e.g. 0.1, 1000)")
    unit: str = Field(..., description="Unit of measurement (degrees, meters, km)")
    description: str = Field(..., description="Human-readable description (e.g., '0.1 deg x 0.1 deg (~10 km)')")
    projection: str = Field(default="WGS84", description="Source projection (e.g. WGS84, Sinusoidal)")

    @property
    def horizontal_degrees(self) -> float:
        """Resolution value in horizontal degrees."""
        return self.value



class TemporalCoverage(BaseModel):
    """Documented temporal bounds of the dataset."""
    start_date: str = Field(..., description="Beginning of observation record (YYYY-MM-DD)")
    end_date: Optional[str] = Field(None, description="End of record or None for ongoing operational missions")
    latency: Optional[str] = Field(None, description="Typical processing delay (e.g. '2-3 months', 'real-time')")


class DatasetEntry(BaseModel):
    """
    Authoritative metadata entry in the TerraTrend dataset registry.
    Strictly follows official NASA mission specifications.
    """
    dataset_id: str = Field(..., description="Unique slug identifier (e.g. 'gpm_imerg')")
    display_name: str = Field(..., description="Full descriptive dataset title")
    short_name: str = Field(..., description="Abbreviated title (e.g. 'GPM IMERG')")
    provider: str = Field(..., description="NASA DAAC, Science Center or Project (e.g. 'NASA GES DISC / PPS')")
    description: str = Field(..., description="Summary of the mission, instrument, and scientific utility")
    product_id: str = Field(..., description="Official verified NASA product ID (e.g. 'GPM_3IMERGM_07')")
    processing_level: str = Field(..., description="NASA processing tier (e.g. 'Level 3 Gridded', 'Level 4 Model')")
    available_variables: List[DatasetVariable] = Field(..., description="List of documented physical variables")
    temporal_resolution: str = Field(..., description="Cadence of observation (e.g. 'Monthly', 'Daily', '16-Day')")
    spatial_resolution: SpatialResolution = Field(..., description="Spatial grid geometry")
    temporal_coverage: TemporalCoverage = Field(..., description="Documented time bounds")
    access_method: str = Field(..., description="Documented access protocol (e.g. 'AppEEARS REST API', 'GES DISC HTTPS')")
    documentation_url: str = Field(..., description="Official NASA documentation link")
    integration_status: IntegrationStatus = Field(..., description="Current status in TerraTrend platform")


class DatasetListResponse(BaseModel):
    """Response envelope for dataset discovery."""
    total_datasets: int
    datasets: List[DatasetEntry]


class VariableListResponse(BaseModel):
    """Response envelope for variable metadata discovery."""
    total_variables: int
    variables: List[DatasetVariable]
