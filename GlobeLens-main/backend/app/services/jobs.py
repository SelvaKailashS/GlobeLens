import asyncio
from datetime import date, datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
import uuid
from pydantic import BaseModel, Field

from backend.app.models.common import ScientificTimeSeries
from backend.app.models.region import SpatialBoundingBox
from backend.app.providers import get_provider


class JobStatus(str, Enum):
    QUEUED = "queued"
    SEARCHING = "searching"
    DOWNLOADING = "downloading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobRecord(BaseModel):
    """Execution state tracking for asynchronous data retrieval jobs."""
    job_id: str = Field(..., description="Unique job UUID")
    dataset_id: str
    variable_id: str
    start_date: str
    end_date: str
    status: JobStatus = JobStatus.QUEUED
    progress_percent: int = 0
    message: str = "Job queued for processing"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    result: Optional[ScientificTimeSeries] = None


class JobManager:
    """
    Manages long-running asynchronous data retrieval and processing tasks.
    """

    def __init__(self):
        self._jobs: Dict[str, JobRecord] = {}
        self._lock = asyncio.Lock()

    async def create_job(
        self,
        dataset_id: str,
        variable_id: str,
        start_date: date,
        end_date: date,
    ) -> JobRecord:
        """Create and register a new pending retrieval job."""
        job_id = str(uuid.uuid4())
        job = JobRecord(
            job_id=job_id,
            dataset_id=dataset_id,
            variable_id=variable_id,
            start_date=start_date.isoformat(),
            end_date=end_date.isoformat(),
            status=JobStatus.QUEUED,
            progress_percent=0,
            message="Job queued for NASA data retrieval",
        )
        async with self._lock:
            self._jobs[job_id] = job
        return job

    async def get_job(self, job_id: str) -> Optional[JobRecord]:
        """Look up job state by ID."""
        async with self._lock:
            return self._jobs.get(job_id)

    async def update_job(
        self,
        job_id: str,
        status: JobStatus,
        progress: int,
        message: str,
        result: Optional[ScientificTimeSeries] = None,
        error: Optional[str] = None,
    ) -> None:
        """Update job progress and state."""
        async with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.status = status
                job.progress_percent = progress
                job.message = message
                job.updated_at = datetime.now(timezone.utc)
                if result:
                    job.result = result
                if error:
                    job.error = error
                if status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                    job.completed_at = datetime.now(timezone.utc)

    async def execute_retrieval_job(
        self,
        job_id: str,
        dataset_id: str,
        variable_id: str,
        bbox: SpatialBoundingBox,
        start_date: date,
        end_date: date,
        quality_filter: bool = True,
    ) -> None:
        """
        Background worker executing the data retrieval pipeline asynchronously.
        """
        try:
            await self.update_job(
                job_id,
                JobStatus.SEARCHING,
                15,
                f"Searching NASA CMR catalog for '{dataset_id}' granules",
            )
            provider = get_provider(dataset_id)

            await self.update_job(
                job_id,
                JobStatus.DOWNLOADING,
                40,
                "Downloading and verifying NASA data granules",
            )

            # Retrieve and process time series
            series = await provider.retrieve_timeseries(
                variable_id=variable_id,
                bounding_box=bbox,
                start_date=start_date,
                end_date=end_date,
                quality_filter=quality_filter,
            )

            await self.update_job(
                job_id,
                JobStatus.PROCESSING,
                85,
                "Applying spatial extraction, quality masking, and time aggregation",
            )

            await self.update_job(
                job_id,
                JobStatus.COMPLETED,
                100,
                f"Successfully extracted {len(series.points)} observation points with full provenance",
                result=series,
            )

        except Exception as exc:
            await self.update_job(
                job_id,
                JobStatus.FAILED,
                0,
                f"Data retrieval failed: {str(exc)}",
                error=str(exc),
            )


# Global singleton
job_manager = JobManager()
