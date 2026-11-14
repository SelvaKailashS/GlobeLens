from fastapi import APIRouter
from backend.app.api.endpoints import analysis, data, datasets, health, regions, timeseries, variables

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(datasets.router, tags=["Datasets"])
api_router.include_router(regions.router, tags=["Regions"])
api_router.include_router(variables.router, tags=["Variables"])
api_router.include_router(analysis.router, tags=["Statistical Trend Analysis"])
api_router.include_router(timeseries.router, tags=["Time Series Aggregation"])
api_router.include_router(data.router, tags=["NASA Data Acquisition"])
