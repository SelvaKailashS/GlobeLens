from typing import List
from pydantic import BaseModel, Field


class SpatialBoundingBox(BaseModel):
    """Geographic bounding box in decimal degrees (WGS84)."""
    min_lat: float = Field(..., ge=-90.0, le=90.0, description="Southernmost latitude boundary")
    max_lat: float = Field(..., ge=-90.0, le=90.0, description="Northernmost latitude boundary")
    min_lon: float = Field(..., ge=-180.0, le=180.0, description="Westernmost longitude boundary")
    max_lon: float = Field(..., ge=-180.0, le=180.0, description="Easternmost longitude boundary")


class RegionMetadata(BaseModel):
    """Geographic study region metadata for regional trend investigation."""
    region_id: str = Field(..., description="Unique slug identifier (e.g. 'amazon_basin')")
    name: str = Field(..., description="Full descriptive geographic name")
    category: str = Field(..., description="Biome / climate classification (e.g. 'Tropical', 'Polar')")
    center_lat: float = Field(..., ge=-90.0, le=90.0, description="Representative centroid latitude")
    center_lon: float = Field(..., ge=-180.0, le=180.0, description="Representative centroid longitude")
    bounding_box: SpatialBoundingBox = Field(..., description="Spatial extent bounding box")
    area_sq_km: float = Field(..., description="Approximate terrestrial/marine area in square kilometers")
    description: str = Field(..., description="Scientific importance and ecological description")
    climate_context: str = Field(..., description="Climatic regime and driving atmospheric circulations")
    target_phenomena: str = Field(..., description="Primary environmental signals monitored in this region")


class RegionListResponse(BaseModel):
    """Response envelope for geographic region discovery."""
    total_regions: int
    regions: List[RegionMetadata]
