from datetime import date, datetime
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field
from scipy import stats

from backend.app.core.auth import auth_manager
from backend.app.models.analysis import (
    AnalysisMethod,
    AnalysisMethodListResponse,
    AnalysisRunRequest,
    RegionalComparisonResponse,
    RegionalSummary,
)
from backend.app.models.common import ObservationPoint, ScientificTimeSeries
from backend.app.providers import get_provider
from backend.app.registry.analysis import get_analysis_method, list_analysis_methods
from backend.app.registry.datasets import get_dataset
from backend.app.registry.regions import get_region
from backend.app.services.analysis import ComprehensiveAnalysisResult, ScientificTrendAnalyzer
from backend.app.services.jobs import job_manager, JobStatus

router = APIRouter(prefix="/analysis", tags=["Statistical Trend Analysis"])


class RegionalComparisonRequest(BaseModel):
    """Payload to trigger side-by-side comparative analysis of 2 or more study regions."""
    region_ids: List[str] = Field(..., min_length=2, max_length=5, description="List of 2 to 5 registered region IDs")
    dataset_id: str = Field(..., description="Registered dataset ID (e.g. 'modis_ndvi_monthly', 'gpm_imerg')")
    variable_id: str = Field(..., description="Documented variable ID")
    start_date: date = Field(..., description="Start of historical observation window")
    end_date: date = Field(..., description="End of historical observation window")
    alpha: float = Field(0.05, ge=0.001, le=0.20, description="Significance threshold")


@router.get(
    "/methods",
    response_model=AnalysisMethodListResponse,
    summary="List Statistical and Trend Analysis Methods",
    description="Returns documentation of statistical methodologies (Mann-Kendall, Sen's slope, Pettitt, etc.), minimum observations, assumptions, and output metrics.",
)
async def get_all_analysis_methods(
    category: Optional[str] = Query(
        None,
        description="Filter by method category (e.g. 'trend_detection', 'trend_magnitude', 'change_point')",
    ),
) -> AnalysisMethodListResponse:
    methods = list_analysis_methods()
    if category:
        methods = [m for m in methods if m.category.lower() == category.lower()]

    return AnalysisMethodListResponse(
        total_methods=len(methods),
        methods=methods,
    )


@router.get(
    "/methods/{method_id}",
    response_model=AnalysisMethod,
    summary="Get Specific Analysis Method Details",
    description="Look up mathematical formulation, assumptions, and required observations for a specific method.",
)
async def get_method_by_id(method_id: str) -> AnalysisMethod:
    method = get_analysis_method(method_id)
    if not method:
        valid_ids = [m.method_id for m in list_analysis_methods()]
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "AnalysisMethodNotFound",
                "message": f"Analysis method '{method_id}' is not registered in TerraTrend.",
                "valid_methods": valid_ids,
            },
        )
    return method


@router.post(
    "/run",
    response_model=ComprehensiveAnalysisResult,
    summary="Execute Statistical Trend Investigation",
    description="Calculates Linear Regression, Mann-Kendall test, Sen's Slope, Seasonal Mann-Kendall, Pettitt Change-Point, and Standardized Anomalies with grounded plain-language narrative.",
)
async def run_trend_analysis(req: AnalysisRunRequest) -> ComprehensiveAnalysisResult:
    points: List[ObservationPoint] = []
    var_id = req.variable_id or "variable"
    var_name = req.variable_name or var_id
    region_name = req.region_name or "Selected Region"
    units = req.original_units or "units"

    if req.job_id:
        job = await job_manager.get_job(req.job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Job '{req.job_id}' not found.",
            )
        if job.status != JobStatus.COMPLETED or not job.result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Job '{req.job_id}' has status '{job.status}'; must be 'completed' with observations.",
            )
        points = job.result.points
        var_id = job.result.variable_id
        var_name = job.result.variable_name
        units = job.result.original_units
    elif req.points:
        points = req.points
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'job_id' or 'points' must be supplied in analysis request.",
        )

    if not points:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Observation series is empty.",
        )

    try:
        result = ScientificTrendAnalyzer.run_comprehensive_analysis(
            points=points,
            variable_id=var_id,
            original_units=units,
            region_name=region_name,
            variable_name=var_name,
            alpha=req.alpha,
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Statistical analysis calculation failed: {str(exc)}",
        )


def _generate_synthetic_regional_points(
    region_id: str,
    variable_id: str,
    start_date: date,
    end_date: date,
    units: str,
) -> List[ObservationPoint]:
    """
    Generate calibrated synthetic observation time series for demonstration/testing
    when live NASA credentials are not present or offline.
    Uses realistic base climatology and trends specific to each region.
    """
    date_range = pd.date_range(start_date, end_date, freq="MS")
    n = len(date_range)
    if n == 0:
        return []

    # Deterministic seed based on region_id and variable_id
    seed = sum(ord(c) for c in (region_id + variable_id)) % (2**31 - 1)
    rng = np.random.RandomState(seed)

    # Base values and slopes calibrated to physical climate
    params = {
        "coimbatore": {"base": 28.5 if "temp" in variable_id else 0.45, "slope": 0.025, "seasonal_amp": 3.0, "noise": 0.5},
        "chennai": {"base": 29.8 if "temp" in variable_id else 0.55, "slope": 0.038, "seasonal_amp": 4.5, "noise": 0.6},
        "madurai": {"base": 31.0 if "temp" in variable_id else 0.38, "slope": 0.042, "seasonal_amp": 5.0, "noise": 0.7},
        "amazon_basin": {"base": 26.5 if "temp" in variable_id else 0.75, "slope": -0.015 if "ndvi" in variable_id else 0.02, "seasonal_amp": 1.5, "noise": 0.3},
        "sahel_belt": {"base": 29.0 if "temp" in variable_id else 0.25, "slope": 0.018, "seasonal_amp": 6.0, "noise": 0.8},
        "greenland_ice": {"base": -12.0 if "temp" in variable_id else 0.10, "slope": 0.065, "seasonal_amp": 15.0, "noise": 1.2},
    }

    p = params.get(region_id, {"base": 20.0, "slope": 0.02, "seasonal_amp": 4.0, "noise": 0.5})

    region_meta = get_region(region_id)
    lat = region_meta.center_lat if region_meta else 0.0
    lon = region_meta.center_lon if region_meta else 0.0

    points: List[ObservationPoint] = []
    for i, dt in enumerate(date_range):
        years = i / 12.0
        # Annual sinusoidal seasonal cycle
        seasonal = p["seasonal_amp"] * np.sin(2 * np.pi * (dt.month - 1) / 12.0)
        trend = p["slope"] * years
        noise = rng.normal(0, p["noise"] * 0.2)
        val = p["base"] + trend + seasonal + noise
        
        # Inject realistic change point around 60% mark
        if i > int(n * 0.6):
            val += p["slope"] * 0.5

        # Ensure physically non-negative for precip / NDVI
        if "precip" in variable_id or "ndvi" in variable_id or "ozone" in variable_id:
            val = max(0.01, val)
        if "ndvi" in variable_id:
            val = min(0.95, val)

        # 3% chance of missing/cloud observation
        is_cloudy = (rng.uniform(0, 1) < 0.03)
        obs_val = None if is_cloudy else round(float(val), 4)

        points.append(
            ObservationPoint(
                timestamp=dt.to_pydatetime(),
                latitude=lat,
                longitude=lon,
                value=obs_val,
                is_valid=not is_cloudy,
                raw_quality_code=0 if not is_cloudy else 15,
            )
        )
    return points


@router.post(
    "/compare",
    response_model=RegionalComparisonResponse,
    summary="Compare Trends Across Multiple Study Regions",
    description="Executes side-by-side trend investigations for 2 to 5 regions, computing comparative rates, pairwise correlation, and plain-language scientific synthesis.",
)
async def compare_regions(req: RegionalComparisonRequest) -> RegionalComparisonResponse:
    if req.start_date >= req.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Start date ({req.start_date}) must be earlier than end date ({req.end_date}).",
        )

    # Validate dataset and variable
    try:
        provider = get_provider(req.dataset_id)
        var_meta = provider.get_variable_metadata(req.variable_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dataset or variable invalid: {str(exc)}",
        )

    regional_summaries: List[RegionalSummary] = []
    regional_series: Dict[str, pd.Series] = {}

    for r_id in req.region_ids:
        region = get_region(r_id)
        if not region:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region '{r_id}' not found in registry.",
            )

        points: List[ObservationPoint] = []
        is_demo = False

        # Attempt to retrieve real data if credentials exist
        if auth_manager.is_authenticated():
            try:
                timeseries = await provider.retrieve_timeseries(
                    variable_id=req.variable_id,
                    bounding_box=region.bounding_box,
                    start_date=req.start_date,
                    end_date=req.end_date,
                    quality_filter=True,
                )
                points = timeseries.points
            except Exception:
                # Fallback to calibrated synthetic demonstration data
                points = _generate_synthetic_regional_points(
                    region_id=r_id,
                    variable_id=req.variable_id,
                    start_date=req.start_date,
                    end_date=req.end_date,
                    units=var_meta.original_units,
                )
                is_demo = True
        else:
            # Demonstration mode when unauthenticated
            points = _generate_synthetic_regional_points(
                region_id=r_id,
                variable_id=req.variable_id,
                start_date=req.start_date,
                end_date=req.end_date,
                units=var_meta.original_units,
            )
            is_demo = True

        analysis_res = ScientificTrendAnalyzer.run_comprehensive_analysis(
            points=points,
            variable_id=req.variable_id,
            original_units=var_meta.original_units,
            region_name=region.name,
            variable_name=var_meta.display_name,
            alpha=req.alpha,
        )

        # Build clean series for pairwise correlation
        series, _ = ScientificTrendAnalyzer._clean_series(points)
        regional_series[r_id] = series

        sens = analysis_res.sens_slope
        mk = analysis_res.mann_kendall
        pettitt = analysis_res.pettitt_change_point

        mean_v = float(series.mean()) if len(series) > 0 else 0.0
        std_v = float(series.std()) if len(series) > 1 else 0.0

        regional_summaries.append(
            RegionalSummary(
                region_id=r_id,
                region_name=region.name,
                category=region.category,
                total_observations=analysis_res.observation_count,
                valid_observations=analysis_res.valid_observation_count,
                coverage_fraction=analysis_res.data_coverage_fraction,
                sens_slope_per_year=sens.slope if sens else 0.0,
                sens_slope_per_decade=sens.rate_per_decade if sens else 0.0,
                confidence_interval_95=sens.confidence_interval_95 if sens else (0.0, 0.0),
                mann_kendall_tau=mk.tau if mk else 0.0,
                mann_kendall_p_value=mk.p_value if mk else 1.0,
                trend_direction=analysis_res.overall_trend_direction,
                is_significant=analysis_res.is_statistically_significant,
                pettitt_has_break=pettitt.has_change_point if pettitt else False,
                pettitt_break_date=pettitt.change_point_date if pettitt else None,
                mean_value=round(mean_v, 4),
                std_value=round(std_v, 4),
                is_demonstration_data=is_demo,
            )
        )

    # Compute pairwise correlation
    pairwise_corr: Dict[str, float] = {}
    r_list = list(regional_series.keys())
    for i in range(len(r_list)):
        for j in range(i + 1, len(r_list)):
            r1, r2 = r_list[i], r_list[j]
            s1, s2 = regional_series[r1], regional_series[r2]
            # align on common timestamps
            aligned = pd.concat([s1, s2], axis=1, join="inner").dropna()
            if len(aligned) >= 5:
                r_val, _ = stats.pearsonr(aligned.iloc[:, 0], aligned.iloc[:, 1])
                pairwise_corr[f"{r1}_vs_{r2}"] = round(float(r_val), 3)

    # Synthesize plain-language comparative evaluation
    fastest_region = max(regional_summaries, key=lambda s: abs(s.sens_slope_per_decade))
    all_sig = [s for s in regional_summaries if s.is_significant]
    sig_count = len(all_sig)

    synthesis_lines = [
        f"Comparative investigation of {var_meta.display_name} across {len(regional_summaries)} regions "
        f"between {req.start_date} and {req.end_date} reveals differing dynamic trajectories.",
        f"The most pronounced rate of change was observed in {fastest_region.region_name} with a Sen's slope of "
        f"{fastest_region.sens_slope_per_decade:+.4g} {var_meta.original_units}/decade (Kendall's tau = {fastest_region.mann_kendall_tau:+.3f}).",
    ]

    if sig_count == len(regional_summaries):
        synthesis_lines.append(
            f"All {sig_count} regions exhibited statistically significant monotonic trends at the alpha = {req.alpha} level."
        )
    elif sig_count > 0:
        sig_names = ", ".join(s.region_name for s in all_sig)
        synthesis_lines.append(
            f"Statistically significant trends were confirmed in {sig_count} region(s): {sig_names}. "
            f"Other regions did not exceed the significance threshold."
        )
    else:
        synthesis_lines.append(
            "None of the compared regions demonstrated statistically significant monotonic trends over this observation window."
        )

    if pairwise_corr:
        corr_strs = [f"{k}: r = {v:+.2f}" for k, v in pairwise_corr.items()]
        synthesis_lines.append(f"Pairwise temporal coherence across regions: {'; '.join(corr_strs)}.")

    cautions = [
        "Regional comparison relies on spatial averages across bounding extents which may smooth out sharp local elevation or microclimate gradients.",
        "Discrepancies in observation quality or cloud coverage between humid coastal regions (e.g., Chennai) and inland foothills (e.g., Coimbatore) can influence comparative signal fidelity.",
        "Demonstration Data Notice: If unauthenticated, time series are generated using calibrated synthetic baselines and labeled explicitly as demonstration.",
    ]

    return RegionalComparisonResponse(
        dataset_id=req.dataset_id,
        variable_id=req.variable_id,
        variable_name=var_meta.display_name,
        original_units=var_meta.original_units,
        start_date=req.start_date.isoformat(),
        end_date=req.end_date.isoformat(),
        alpha=req.alpha,
        regions=regional_summaries,
        pairwise_correlations=pairwise_corr,
        comparative_synthesis=" ".join(synthesis_lines),
        scientific_cautions=cautions,
    )
