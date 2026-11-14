from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.models.dataset import DatasetVariable, VariableListResponse
from backend.app.registry.datasets import get_dataset, get_variable, list_all_variables

router = APIRouter()


@router.get(
    "/variables",
    response_model=VariableListResponse,
    summary="List Environmental Variables",
    description="Returns all measurable physical variables across registered NASA Earth science datasets.",
)
async def get_all_variables(
    dataset_id: Optional[str] = Query(
        None,
        description="Filter variables by parent dataset slug (e.g. 'gpm_imerg', 'modis_terra_aqua')",
    ),
    category: Optional[str] = Query(
        None,
        description="Filter variables by physical category (e.g. 'Precipitation', 'Vegetation', 'Atmosphere')",
    ),
) -> VariableListResponse:
    if dataset_id:
        ds = get_dataset(dataset_id)
        if not ds:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset '{dataset_id}' not found.",
            )
        variables = ds.available_variables
    else:
        variables = list_all_variables()

    if category:
        variables = [v for v in variables if v.physical_category.lower() == category.lower()]

    return VariableListResponse(
        total_variables=len(variables),
        variables=variables,
    )


@router.get(
    "/variables/{variable_id}",
    response_model=DatasetVariable,
    summary="Get Specific Environmental Variable Metadata",
    description="Look up measurement units, valid range, fill values, and description for a specific variable.",
)
async def get_variable_by_id(variable_id: str) -> DatasetVariable:
    var = get_variable(variable_id)
    if not var:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "VariableNotFound",
                "message": f"Variable with identifier '{variable_id}' is not registered in TerraTrend.",
            },
        )
    return var
