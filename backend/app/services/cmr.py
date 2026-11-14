from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel, Field

from backend.app.config import get_settings
from backend.app.models.region import SpatialBoundingBox


class CMRGranule(BaseModel):
    """Metadata representing an individual NASA data granule discovered in CMR."""
    granule_ur: str = Field(..., description="Unique granule identifier in CMR")
    title: str = Field(..., description="Granule filename or title")
    time_start: datetime = Field(..., description="Start of observation UTC")
    time_end: Optional[datetime] = Field(None, description="End of observation UTC")
    granule_size_mb: float = Field(default=0.0, description="Granule file size in Megabytes")
    download_url: Optional[str] = Field(None, description="Direct HTTPS download link")
    opendap_url: Optional[str] = Field(None, description="OPeNDAP service endpoint if available")
    s3_url: Optional[str] = Field(None, description="Direct S3 cloud access URI (AWS us-west-2)")


class CMRClient:
    """
    Client for NASA's Common Metadata Repository (CMR) Search API.
    Enables spatio-temporal granule discovery across all NASA Distributed Active Archive Centers (DAACs).
    """

    def __init__(self, base_url: Optional[str] = None):
        settings = get_settings()
        self.search_url = base_url or settings.cmr_search_url
        self.timeout = float(settings.download_timeout_seconds)

    async def search_granules(
        self,
        short_name: str,
        version: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        bounding_box: Optional[SpatialBoundingBox] = None,
        page_size: int = 50,
    ) -> List[CMRGranule]:
        """
        Query CMR for matching granules within the temporal and spatial envelope.
        """
        params: Dict[str, Any] = {
            "short_name": short_name,
            "page_size": min(page_size, 200),
            "sort_key[]": "start_date",
        }
        if version:
            params["version"] = version

        # Format temporal range YYYY-MM-DDTHH:MM:SSZ
        if start_date and end_date:
            t_start = f"{start_date.isoformat()}T00:00:00Z"
            t_end = f"{end_date.isoformat()}T23:59:59Z"
            params["temporal"] = f"{t_start},{t_end}"
        elif start_date:
            t_start = f"{start_date.isoformat()}T00:00:00Z"
            params["temporal"] = f"{t_start},"

        # Format spatial bounding box: min_lon,min_lat,max_lon,max_lat (West, South, East, North)
        if bounding_box:
            params["bounding_box"] = (
                f"{bounding_box.min_lon},{bounding_box.min_lat},"
                f"{bounding_box.max_lon},{bounding_box.max_lat}"
            )

        headers = {
            "User-Agent": "TerraTrend-NASA-SpaceApps/0.1.0 (Earth Systems Trend Detective)",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(self.search_url, params=params, headers=headers)
            if response.status_code != 200:
                raise RuntimeError(
                    f"CMR Search failed with status {response.status_code}: {response.text}"
                )

            data = response.json()
            feed = data.get("feed", {})
            entries = feed.get("entry", [])

            granules: List[CMRGranule] = []
            for entry in entries:
                granule_ur = entry.get("title") or entry.get("id")
                title = entry.get("title", "")
                
                # Parse timestamps
                time_start_str = entry.get("time_start")
                time_end_str = entry.get("time_end")
                time_start = (
                    datetime.fromisoformat(time_start_str.replace("Z", "+00:00"))
                    if time_start_str
                    else datetime.now(timezone.utc)
                )
                time_end = (
                    datetime.fromisoformat(time_end_str.replace("Z", "+00:00"))
                    if time_end_str
                    else None
                )

                size_mb = float(entry.get("granule_size", 0.0))

                # Parse links
                download_url: Optional[str] = None
                opendap_url: Optional[str] = None
                s3_url: Optional[str] = None

                links = entry.get("links", [])
                for link in links:
                    href = link.get("href", "")
                    rel = link.get("rel", "")
                    inherited = link.get("inherited", False)

                    if not inherited and ("data#" in rel or "download" in rel):
                        # Filter to actual data files
                        if any(href.lower().endswith(ext) for ext in [".nc", ".nc4", ".hdf", ".hdf5", ".h5", ".he5", ".tif"]):
                            download_url = href
                    if "opendap" in href.lower() or "dods" in href.lower():
                        opendap_url = href
                    if href.startswith("s3://"):
                        s3_url = href

                # Fallback if download link wasn't tagged with rel=data#
                if not download_url:
                    for link in links:
                        href = link.get("href", "")
                        if any(href.lower().endswith(ext) for ext in [".nc", ".nc4", ".hdf", ".hdf5", ".h5", ".he5", ".tif"]):
                            download_url = href
                            break

                granules.append(
                    CMRGranule(
                        granule_ur=granule_ur,
                        title=title,
                        time_start=time_start,
                        time_end=time_end,
                        granule_size_mb=round(size_mb, 2),
                        download_url=download_url,
                        opendap_url=opendap_url,
                        s3_url=s3_url,
                    )
                )

            return granules


# Default singleton
cmr_client = CMRClient()
