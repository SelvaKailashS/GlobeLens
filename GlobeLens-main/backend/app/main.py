from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import api_router
from backend.app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management."""
    settings = get_settings()
    # Ensure cache and storage directories exist safely
    Path(settings.data_cache_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.data_storage_dir).mkdir(parents=True, exist_ok=True)
    yield
    # Clean shutdown tasks if any


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=settings.description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount master API router under configured prefix (/api)
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/", include_in_schema=False)
async def root():
    """Root entry point providing discovery links."""
    return JSONResponse(
        content={
            "app": settings.app_name,
            "version": settings.app_version,
            "challenge": "NASA Space Apps Challenge — Be an Earth Systems Trend Detective!",
            "documentation": "/docs",
            "api_prefix": settings.api_prefix,
            "endpoints": {
                "health": f"{settings.api_prefix}/health",
                "datasets": f"{settings.api_prefix}/datasets",
                "regions": f"{settings.api_prefix}/regions",
                "variables": f"{settings.api_prefix}/variables",
                "analysis_methods": f"{settings.api_prefix}/analysis/methods",
                "data_preview": f"{settings.api_prefix}/data/preview",
                "data_retrieve": f"{settings.api_prefix}/data/retrieve",
            },
        }
    )
