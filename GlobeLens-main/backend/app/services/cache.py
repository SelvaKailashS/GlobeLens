import hashlib
import json
import os
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import aiofiles
import httpx

from backend.app.config import get_settings
from backend.app.core.auth import auth_manager
from backend.app.models.common import ScientificTimeSeries
from backend.app.models.region import SpatialBoundingBox


class DataCacheManager:
    """
    Manages deterministic local storage, raw granule downloads, and cached scientific products.
    Prevents redundant network traffic and ensures atomic download integrity.
    """

    def __init__(self):
        self.settings = get_settings()
        self.cache_dir = Path(self.settings.data_cache_dir)
        self.granules_dir = self.cache_dir / "granules"
        self.timeseries_dir = self.cache_dir / "timeseries"
        self.grids_dir = self.cache_dir / "grids"

        # Ensure directory structures exist
        self.granules_dir.mkdir(parents=True, exist_ok=True)
        self.timeseries_dir.mkdir(parents=True, exist_ok=True)
        self.grids_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def compute_query_hash(
        dataset_id: str,
        variable_id: str,
        start_date: date,
        end_date: date,
        bbox: Optional[SpatialBoundingBox] = None,
        region_id: Optional[str] = None,
        temporal_resolution: Optional[str] = None,
    ) -> str:
        """
        Generate a deterministic SHA-256 hash identifying an exact user query.
        """
        bbox_str = (
            f"{bbox.min_lat:.3f},{bbox.max_lat:.3f},{bbox.min_lon:.3f},{bbox.max_lon:.3f}"
            if bbox
            else (region_id or "global")
        )
        content = (
            f"{dataset_id.lower()}|{variable_id.lower()}|{start_date.isoformat()}|"
            f"{end_date.isoformat()}|{bbox_str}|{temporal_resolution or 'default'}"
        )
        return hashlib.sha256(content.encode("utf-8")).hexdigest()[:24]

    @staticmethod
    def compute_granule_hash(download_url: str) -> str:
        """Deterministic hash for a remote NASA granule URL."""
        return hashlib.sha256(download_url.strip().encode("utf-8")).hexdigest()[:24]

    def get_granule_cache_path(self, download_url: str) -> Tuple[Path, Path]:
        """
        Returns (data_file_path, metadata_json_path) for a remote granule URL.
        """
        ghash = self.compute_granule_hash(download_url)
        # Extract original filename from URL
        url_filename = download_url.split("?")[0].split("/")[-1]
        if not url_filename or "." not in url_filename:
            url_filename = f"granule_{ghash}.nc"

        target_dir = self.granules_dir / ghash
        target_dir.mkdir(parents=True, exist_ok=True)
        data_path = target_dir / url_filename
        meta_path = target_dir / f"{url_filename}.meta.json"
        return data_path, meta_path

    def is_granule_cached(self, download_url: str) -> bool:
        """Check if granule is already fully downloaded and verified."""
        data_path, meta_path = self.get_granule_cache_path(download_url)
        return data_path.exists() and meta_path.exists() and data_path.stat().st_size > 0

    async def download_granule(
        self,
        download_url: str,
        expected_size_mb: Optional[float] = None,
    ) -> Path:
        """
        Download a remote NASA granule using authenticated Earthdata stream.
        Uses temporary file with atomic rename to prevent corrupted partial files.
        """
        data_path, meta_path = self.get_granule_cache_path(download_url)
        if self.is_granule_cached(download_url):
            return data_path

        temp_path = data_path.with_suffix(f"{data_path.suffix}.tmp_download")
        headers = auth_manager.get_auth_headers()

        async with httpx.AsyncClient(
            timeout=float(self.settings.download_timeout_seconds),
            follow_redirects=True,
        ) as client:
            try:
                async with client.stream("GET", download_url, headers=headers) as response:
                    if response.status_code == 401 or response.status_code == 403:
                        raise RuntimeError(
                            f"NASA Earthdata authentication failed (HTTP {response.status_code}) while downloading {download_url}. "
                            f"Please check your EARTHDATA_TOKEN or credentials."
                        )
                    if response.status_code != 200:
                        raise RuntimeError(
                            f"Failed downloading granule from NASA (HTTP {response.status_code}): {download_url}"
                        )

                    total_bytes = 0
                    sha256 = hashlib.sha256()

                    async with aiofiles.open(temp_path, "wb") as f:
                        async for chunk in response.aiter_bytes(chunk_size=65536):
                            total_bytes += len(chunk)
                            sha256.update(chunk)
                            await f.write(chunk)

                # Atomic rename after full download completes successfully
                if temp_path.exists():
                    if data_path.exists():
                        data_path.unlink()
                    temp_path.rename(data_path)

                # Write metadata record
                meta_info = {
                    "source_url": download_url,
                    "downloaded_at_utc": datetime.now(timezone.utc).isoformat(),
                    "size_bytes": total_bytes,
                    "sha256": sha256.hexdigest(),
                    "file_name": data_path.name,
                }
                async with aiofiles.open(meta_path, "w", encoding="utf-8") as f:
                    await f.write(json.dumps(meta_info, indent=2))

                return data_path

            except Exception as exc:
                # Cleanup incomplete temporary download
                if temp_path.exists():
                    try:
                        temp_path.unlink()
                    except OSError:
                        pass
                raise exc

    def get_cached_timeseries(self, query_hash: str) -> Optional[ScientificTimeSeries]:
        """Retrieve pre-computed scientific time series from local cache."""
        target_file = self.timeseries_dir / f"{query_hash}.json"
        if target_file.exists():
            try:
                with open(target_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return ScientificTimeSeries.model_validate(data)
            except Exception:
                return None
        return None

    def save_cached_timeseries(self, query_hash: str, series: ScientificTimeSeries) -> None:
        """Store computed scientific time series to local cache."""
        target_file = self.timeseries_dir / f"{query_hash}.json"
        temp_file = target_file.with_suffix(".tmp")
        try:
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(series.model_dump_json(indent=2))
            if target_file.exists():
                target_file.unlink()
            temp_file.rename(target_file)
        except Exception:
            if temp_file.exists():
                temp_file.unlink()


# Default singleton
cache_manager = DataCacheManager()
