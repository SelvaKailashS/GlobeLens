from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel, Field

from backend.app.config import get_settings
from backend.app.registry.analysis import list_analysis_methods
from backend.app.registry.datasets import list_datasets
from backend.app.registry.regions import list_regions

router = APIRouter()


class HealthResponse(BaseModel):
    """System health check response."""
    status: str = Field(..., examples=["healthy"])
    service: str = Field(..., examples=["TerraTrend Scientific API"])
    version: str = Field(..., examples=["0.1.0"])
    environment: str = Field(..., examples=["development"])
    timestamp_utc: str = Field(...)
    datasets_registered: int = Field(..., examples=[6])
    regions_registered: int = Field(..., examples=[8])
    methods_registered: int = Field(..., examples=[6])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Backend Health Check",
    description="Returns backend operational status and registry counts.",
)
async def check_health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        timestamp_utc=datetime.now(timezone.utc).isoformat(),
        datasets_registered=len(list_datasets()),
        regions_registered=len(list_regions()),
        methods_registered=len(list_analysis_methods()),
    )
