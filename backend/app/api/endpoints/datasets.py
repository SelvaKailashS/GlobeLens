from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.models.dataset import DatasetEntry, DatasetListResponse, IntegrationStatus
from backend.app.registry.datasets import get_dataset, list_datasets

router = APIRouter()


@router.get(
    "/datasets",
    response_model=DatasetListResponse,
    summary="List Registered NASA Earth Science Datasets",
    description="Returns metadata for all registered datasets with optional filtering by integration status or provider.",
)
async def get_all_datasets(
    status_filter: Optional[IntegrationStatus] = Query(
        None,
        alias="status",
        description="Filter datasets by integration lifecycle status",
    ),
    provider_filter: Optional[str] = Query(
        None,
        alias="provider",
        description="Filter datasets by data provider / DAAC substring",
    ),
) -> DatasetListResponse:
    datasets = list_datasets()
    if status_filter:
        datasets = [d for d in datasets if d.integration_status == status_filter]
    if provider_filter:
        datasets = [d for d in datasets if provider_filter.lower() in d.provider.lower()]

    return DatasetListResponse(
        total_datasets=len(datasets),
        datasets=datasets,
    )


@router.get(
    "/datasets/{dataset_id}",
    response_model=DatasetEntry,
    summary="Get Specific Dataset Metadata",
    description="Look up verified scientific metadata and variable specifications for a single dataset ID.",
)
async def get_dataset_by_id(dataset_id: str) -> DatasetEntry:
    entry = get_dataset(dataset_id)
    if not entry:
        valid_ids = [d.dataset_id for d in list_datasets()]
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "DatasetNotFound",
                "message": f"Dataset with identifier '{dataset_id}' is not registered in TerraTrend.",
                "valid_identifiers": valid_ids,
            },
        )
    return entry
