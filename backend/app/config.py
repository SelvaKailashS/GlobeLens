from functools import lru_cache
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables and .env file.
    Follows secure credential handling best practices.
    """
    app_name: str = "TerraTrend NASA Earth Science Backend"
    app_version: str = "0.1.0"
    description: str = (
        "FastAPI scientific backend for NASA Space Apps Challenge: "
        "Be an Earth Systems Trend Detective!"
    )
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/api"
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS Allowed Origins
    # Defaults to local Next.js development server
    cors_origins: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # NASA Earthdata URS Credentials
    nasa_earthdata_username: str | None = None
    nasa_earthdata_password: str | None = None
    nasa_earthdata_token: str | None = None

    # NASA Services Base URLs
    appeears_api_url: str = "https://appeears.earthdatacloud.nasa.gov/api/v1"
    ges_disc_base_url: str = "https://disc.gsfc.nasa.gov"
    cmr_search_url: str = "https://cmr.earthdata.nasa.gov/search/granules.json"
    gibs_wmts_base_url: str = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best"

    # Local Cache & Data Storage Paths
    data_cache_dir: str = "data/cache"
    data_storage_dir: str = "data/raw"
    cache_max_size_gb: float = 10.0
    download_timeout_seconds: int = 120
    max_granules_per_request: int = 120
    allow_mock_fallback: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
