from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.models.common import ObservationPoint
from backend.app.services.jobs import job_manager, JobStatus
from backend.app.services.timeseries import (
    AggregatedTimeSeries,
    AggregationStatistic,
    TemporalFrequency,
    timeseries_service,
)

router = APIRouter(prefix="/timeseries", tags=["Time Series Aggregation"])


class TimeSeriesAggregationRequest(BaseModel):
    """Request payload for temporal resampling and aggregation."""
    job_id: Optional[str] = Field(None, description="Completed retrieval job ID to aggregate")
    points: Optional[List[ObservationPoint]] = Field(None, description="Direct list of observations to aggregate")
    dataset_id: Optional[str] = Field("custom_series", description="Dataset identifier")
    variable_id: Optional[str] = Field("variable", description="Variable identifier")
    original_units: Optional[str] = Field("units", description="Measurement units")
    frequency: TemporalFrequency = Field(TemporalFrequency.MONTHLY, description="Temporal frequency (daily, monthly, annual)")
    statistic: AggregationStatistic = Field(AggregationStatistic.MEAN, description="Aggregation statistic (mean, sum, median, min, max)")


@router.post(
    "/aggregate",
    response_model=AggregatedTimeSeries,
    summary="Resample & Aggregate Time Series",
    description="Resamples Earth observation time series into daily, monthly, or annual intervals using specified statistical reduction (mean, sum, median, min, max).",
)
async def aggregate_time_series(req: TimeSeriesAggregationRequest) -> AggregatedTimeSeries:
    points: List[ObservationPoint] = []
    dataset_id = req.dataset_id or "custom_series"
    variable_id = req.variable_id or "variable"
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
                detail=f"Job '{req.job_id}' is not in COMPLETED state (current status: {job.status}).",
            )
        points = job.result.points
        dataset_id = job.result.dataset_id
        variable_id = job.result.variable_id
        units = job.result.original_units
    elif req.points:
        points = req.points
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'job_id' or 'points' must be provided in aggregation request.",
        )

    if not points:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No observations available to aggregate.",
        )

    try:
        result = timeseries_service.aggregate_points(
            points=points,
            dataset_id=dataset_id,
            variable_id=variable_id,
            original_units=units,
            frequency=req.frequency,
            statistic=req.statistic,
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Temporal aggregation failed: {str(exc)}",
        )
