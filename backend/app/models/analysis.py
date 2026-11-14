from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from backend.app.models.common import ObservationPoint


class AnalysisMethod(BaseModel):
    """
    Documentation of an analytical or statistical method supported by the TerraTrend backend.
    Explains mathematical basis, assumptions, and observational requirements.
    """
    method_id: str = Field(..., description="Technical identifier (e.g. 'mann_kendall')")
    name: str = Field(..., description="Scientific method label")
    category: str = Field(..., description="Analysis classification (e.g. 'trend_detection', 'change_point')")
    description: str = Field(..., description="Summary of the statistical technique")
    mathematical_basis: str = Field(..., description="Summary of mathematical formulation (e.g. rank correlation)")
    minimum_observations: int = Field(..., description="Minimum data points required for statistical validity")
    assumptions: List[str] = Field(..., description="Underlying mathematical and sampling assumptions")
    outputs_provided: List[str] = Field(..., description="Metrics computed (e.g. p-value, slope, test statistic)")
    suitable_variables: List[str] = Field(..., description="Recommended environmental variable types")
    library_source: str = Field(..., description="Python library implementation used (e.g. 'pymannkendall', 'scipy.stats')")


class AnalysisMethodListResponse(BaseModel):
    """Response envelope for statistical methods."""
    total_methods: int
    methods: List[AnalysisMethod]


class AnalysisRunRequest(BaseModel):
    """Payload to trigger comprehensive trend investigation on an observation series."""
    job_id: Optional[str] = Field(None, description="Completed retrieval job ID to analyze")
    points: Optional[List[ObservationPoint]] = Field(None, description="Direct list of observations to analyze")
    variable_id: Optional[str] = Field(None, description="Variable technical key")
    variable_name: Optional[str] = Field(None, description="Human-friendly variable title")
    region_id: Optional[str] = Field(None, description="Region technical ID")
    region_name: Optional[str] = Field(None, description="Region label")
    original_units: Optional[str] = Field(None, description="Physical observation units")
    alpha: float = Field(0.05, ge=0.001, le=0.20, description="Significance threshold (alpha)")


class RegionalSummary(BaseModel):
    """Summary of trend metrics for a single region in a comparison."""
    region_id: str
    region_name: str
    category: str
    total_observations: int
    valid_observations: int
    coverage_fraction: float
    sens_slope_per_year: float
    sens_slope_per_decade: float
    confidence_interval_95: Tuple[float, float]
    mann_kendall_tau: float
    mann_kendall_p_value: float
    trend_direction: str
    is_significant: bool
    pettitt_has_break: bool
    pettitt_break_date: Optional[str] = None
    mean_value: float
    std_value: float
    is_demonstration_data: bool = False


class RegionalComparisonResponse(BaseModel):
    """Multi-region comparative trend analysis response."""
    dataset_id: str
    variable_id: str
    variable_name: str
    original_units: str
    start_date: str
    end_date: str
    alpha: float
    regions: List[RegionalSummary]
    pairwise_correlations: Dict[str, float] = Field(default_factory=dict, description="Pearson correlation between regional series")
    comparative_synthesis: str = Field(..., description="Scientifically grounded plain-language comparative analysis")
    scientific_cautions: List[str] = Field(default_factory=list, description="Caveats regarding spatial resolution and microclimates")

