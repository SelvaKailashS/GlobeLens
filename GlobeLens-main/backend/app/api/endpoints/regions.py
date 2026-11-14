from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.app.models.region import RegionListResponse, RegionMetadata
from backend.app.registry.regions import get_region, list_regions

router = APIRouter()


@router.get(
    "/regions",
    response_model=RegionListResponse,
    summary="List Supported Geographic Study Regions",
    description="Returns a curated set of 8 globally significant ecological, cryospheric, and climatic investigation regions.",
)
async def get_all_regions(
    category: Optional[str] = Query(
        None,
        description="Filter regions by biome or climatic category (e.g. 'Tropical', 'Polar', 'Arid')",
    ),
) -> RegionListResponse:
    regions = list_regions()
    if category:
        regions = [r for r in regions if r.category.lower() == category.lower()]

    return RegionListResponse(
        total_regions=len(regions),
        regions=regions,
    )


@router.get(
    "/regions/{region_id}",
    response_model=RegionMetadata,
    summary="Get Specific Region Metadata",
    description="Look up geographic bounding box, centroid, and climatic context for a specific study region.",
)
async def get_region_by_id(region_id: str) -> RegionMetadata:
    region = get_region(region_id)
    if not region:
        valid_ids = [r.region_id for r in list_regions()]
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "RegionNotFound",
                "message": f"Region with identifier '{region_id}' is not registered in TerraTrend.",
                "valid_identifiers": valid_ids,
            },
        )
    return region
