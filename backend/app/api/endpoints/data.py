from datetime import date
from typing import Any, Dict, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, Response, status
from pydantic import BaseModel, Field

from backend.app.core.auth import auth_manager
from backend.app.models.common import ScientificTimeSeries
from backend.app.models.region import SpatialBoundingBox
from backend.app.providers import get_provider
from backend.app.registry.regions import get_region
from backend.app.services.cache import cache_manager
from backend.app.services.jobs import job_manager, JobRecord, JobStatus

router = APIRouter(prefix="/data", tags=["NASA Data Acquisition"])


class DataQueryBase(BaseModel):
    """Base schema for spatial and temporal data queries."""
    dataset_id: str = Field(..., examples=["gpm_imerg"], description="Registered dataset ID")
    variable_id: str = Field(..., examples=["precipitation"], description="Documented variable identifier")
    start_date: date = Field(..., examples=["2023-01-01"], description="Observation start date")
    end_date: date = Field(..., examples=["2023-06-01"], description="Observation end date")
    region_id: Optional[str] = Field(None, examples=["amazon_basin"], description="Registered region slug")
    bounding_box: Optional[SpatialBoundingBox] = Field(None, description="Custom spatial bounding box")


class DataPreviewResponse(BaseModel):
    """Catalog preview returning granule count and size without full download."""
    dataset_id: str
    variable_id: str
    variable_name: str
    original_units: str
    granules_found: int
    estimated_size_mb: float
    temporal_coverage: Dict[str, str]
    bounding_box: SpatialBoundingBox
    is_cached: bool
    authentication_status: Dict[str, Any]
    access_method: str


class DataRetrieveResponse(BaseModel):
    """Response returned upon submission of an asynchronous retrieval job."""
    job_id: str
    status: JobStatus
    message: str
    poll_url: str
    result_url: str


def resolve_bounding_box(query: DataQueryBase) -> SpatialBoundingBox:
    """Resolve bounding box from query, prioritizing explicit box over region_id."""
    if query.bounding_box:
        return query.bounding_box
    if query.region_id:
        region = get_region(query.region_id)
        if not region:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region '{query.region_id}' not found in registry.",
            )
        return region.bounding_box

    # Fallback to global tropical belt if neither is specified
    return SpatialBoundingBox(min_lat=-20.0, max_lat=20.0, min_lon=-180.0, max_lon=180.0)


@router.post(
    "/preview",
    response_model=DataPreviewResponse,
    summary="Preview NASA Data Availability",
    description="Fast catalog query to check matching NASA granules, estimated data volume, and cache state.",
)
async def preview_data(query: DataQueryBase) -> DataPreviewResponse:
    try:
        provider = get_provider(query.dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

    bbox = resolve_bounding_box(query)
    try:
        provider.validate_request(query.variable_id, query.start_date, query.end_date, bbox)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    var_meta = provider.get_variable_metadata(query.variable_id)

    # Search CMR for granule count and size
    try:
        granules = await provider.search_granules(
            start_date=query.start_date,
            end_date=query.end_date,
            bounding_box=bbox,
            limit=100,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"CMR Catalog search error: {str(exc)}",
        )

    total_size = sum(g.granule_size_mb for g in granules)

    # Check local cache state
    query_hash = cache_manager.compute_query_hash(
        dataset_id=query.dataset_id,
        variable_id=query.variable_id,
        start_date=query.start_date,
        end_date=query.end_date,
        bbox=bbox,
    )
    is_cached = cache_manager.get_cached_timeseries(query_hash) is not None

    creds = auth_manager.get_credentials()
    auth_state = {
        "configured": creds.has_credentials,
        "method": "token" if creds.token else ("basic" if creds.username else "none"),
    }

    return DataPreviewResponse(
        dataset_id=query.dataset_id,
        variable_id=query.variable_id,
        variable_name=var_meta.display_name,
        original_units=var_meta.original_units,
        granules_found=len(granules),
        estimated_size_mb=round(total_size, 2),
        temporal_coverage={
            "start": query.start_date.isoformat(),
            "end": query.end_date.isoformat(),
        },
        bounding_box=bbox,
        is_cached=is_cached,
        authentication_status=auth_state,
        access_method=provider.get_metadata().access_method,
    )


@router.post(
    "/retrieve",
    response_model=DataRetrieveResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit NASA Data Retrieval Job",
    description="Initiates asynchronous acquisition, regional subsetting, quality filtering, and time aggregation.",
)
async def retrieve_data(
    query: DataQueryBase,
    background_tasks: BackgroundTasks,
    quality_filter: bool = True,
) -> DataRetrieveResponse:
    try:
        provider = get_provider(query.dataset_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

    bbox = resolve_bounding_box(query)
    try:
        provider.validate_request(query.variable_id, query.start_date, query.end_date, bbox)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    # Create tracked job record
    job = await job_manager.create_job(
        dataset_id=query.dataset_id,
        variable_id=query.variable_id,
        start_date=query.start_date,
        end_date=query.end_date,
    )

    # Dispatch to background task execution
    background_tasks.add_task(
        job_manager.execute_retrieval_job,
        job_id=job.job_id,
        dataset_id=query.dataset_id,
        variable_id=query.variable_id,
        bbox=bbox,
        start_date=query.start_date,
        end_date=query.end_date,
        quality_filter=quality_filter,
    )

    return DataRetrieveResponse(
        job_id=job.job_id,
        status=job.status,
        message="Data retrieval job accepted and running asynchronously",
        poll_url=f"/api/data/jobs/{job.job_id}",
        result_url=f"/api/data/jobs/{job.job_id}/result",
    )


@router.get(
    "/jobs/{job_id}",
    response_model=JobRecord,
    summary="Get Retrieval Job Status",
    description="Check progress, state, and status messages for an ongoing data acquisition job.",
)
async def get_job_status(job_id: str) -> JobRecord:
    job = await job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Retrieval job '{job_id}' not found.",
        )
    return job


@router.get(
    "/jobs/{job_id}/result",
    response_model=ScientificTimeSeries,
    summary="Get Completed Retrieval Job Result",
    description="Returns standardized scientific time series with observations, quality metrics, and full provenance.",
)
async def get_job_result(job_id: str, response: Response) -> ScientificTimeSeries:
    job = await job_manager.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Retrieval job '{job_id}' not found.",
        )

    if job.status == JobStatus.COMPLETED and job.result:
        return job.result

    if job.status == JobStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "RetrievalFailed",
                "message": job.message,
                "details": job.error,
            },
        )

    # Job still running
    response.status_code = status.HTTP_202_ACCEPTED
    raise HTTPException(
        status_code=status.HTTP_202_ACCEPTED,
        detail={
            "status": job.status,
            "progress_percent": job.progress_percent,
            "message": job.message,
        },
    )
