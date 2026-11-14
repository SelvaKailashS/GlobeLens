from abc import ABC, abstractmethod
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
# pyrefly: ignore[missing-import]
from backend.app.config import get_settings
# pyrefly: ignore[missing-import]
from backend.app.core.auth import auth_manager, EarthdataAuthenticationError
# pyrefly: ignore[missing-import]
from backend.app.models.common import (
    DataQualityInfo,
    ObservationPoint,
    ProcessingProvenance,
    ScientificSpatialGrid,
    ScientificTimeSeries,
)
# pyrefly: ignore[missing-import]
from backend.app.models.dataset import DatasetEntry, DatasetVariable
# pyrefly: ignore[missing-import]
from backend.app.models.region import SpatialBoundingBox
# pyrefly: ignore[missing-import]
from backend.app.registry.datasets import get_dataset
# pyrefly: ignore[missing-import]
from backend.app.services.cache import cache_manager
# pyrefly: ignore[missing-import]
from backend.app.services.cmr import cmr_client, CMRGranule
# pyrefly: ignore[missing-import]
from backend.app.services.processor import processor


class BaseDatasetProvider(ABC):
    """
    Abstract base provider defining the uniform interface for NASA Earth science datasets.
    
    Subclasses encapsulate dataset-specific access protocols (CMR Search, AppEEARS REST,
    GES DISC HTTPS, Earthdata Cloud S3), temporal/spatial request validation, and
    transformations into the canonical TerraTrend scientific data model.
    """

    def __init__(
        self,
        dataset_id: str,
        provider_name: str,
        documentation_url: str,
        cmr_short_name: str,
        cmr_version: Optional[str] = None,
    ):
        self._dataset_id = dataset_id
        self._provider_name = provider_name
        self._documentation_url = documentation_url
        self._cmr_short_name = cmr_short_name
        self._cmr_version = cmr_version

    @property
    def dataset_id(self) -> str:
        """Unique identifier slug for this dataset (e.g. 'gpm_imerg')."""
        return self._dataset_id

    @property
    def provider_name(self) -> str:
        """Official name of the archiving facility or organization."""
        return self._provider_name

    @property
    def documentation_url(self) -> str:
        """Authoritative documentation or user guide URL."""
        return self._documentation_url

    @property
    def cmr_short_name(self) -> str:
        """NASA CMR catalog short name for granule discovery."""
        return self._cmr_short_name

    @property
    def cmr_version(self) -> Optional[str]:
        """NASA CMR product version string."""
        return self._cmr_version

    def get_metadata(self) -> DatasetEntry:
        """Retrieve authoritative metadata entry from the registry."""
        entry = get_dataset(self._dataset_id)
        if not entry:
            raise ValueError(f"Provider '{self._dataset_id}' not found in dataset registry.")
        return entry

    def get_variables(self) -> List[DatasetVariable]:
        """List variables supported by this provider."""
        return self.get_metadata().available_variables

    def get_variable_metadata(self, variable_id: str) -> DatasetVariable:
        """Look up metadata for a specific variable, supporting common aliases."""
        target = variable_id.lower().strip()
        variables = {v.variable_id.lower(): v for v in self.get_variables()}
        if target in variables:
            return variables[target]

        # Check substring match or suffix (e.g. 'ndvi' matches '_1_km_16_days_ndvi')
        for k, v in variables.items():
            if target in k or k in target:
                return v

        # Check common alias dictionary
        aliases = {
            "ndvi": ["_1_km_16_days_ndvi", "ndvi"],
            "evi": ["_1_km_16_days_evi", "evi"],
            "lst": ["lst_day_1km", "lst_night_1km", "lst"],
            "lst_day": ["lst_day_1km"],
            "temperature": ["t2m", "temperature_a", "lst_day_1km"],
            "precipitation": ["precipitation", "prectotcorr", "precipitationcal"],
            "rainfall": ["precipitation", "prectotcorr"],
            "soil_moisture": ["soilmoist_p_targ", "soilmoist_s_targ", "rootzonesoilmoist"],
            "evapotranspiration": ["evap_targ", "evap"],
            "ozone": ["columnamounto3"],
            "no2": ["troposphericverticalcolumndio2"],
            "aod": ["uv_aerosolindex", "absorbingaerosolopticaldepth"],
        }
        if target in aliases:
            for alt in aliases[target]:
                if alt in variables:
                    return variables[alt]

        supported = ", ".join(v.variable_id for v in self.get_variables())
        raise ValueError(
            f"Variable '{variable_id}' is not supported by {self.dataset_id}. "
            f"Supported variables: [{supported}]"
        )

    def validate_request(
        self,
        variable_id: str,
        start_date: date,
        end_date: date,
        bounding_box: Optional[SpatialBoundingBox] = None,
    ) -> None:
        """
        Validate request parameters against dataset metadata, coverage, and spatial boundaries.
        """
        # Validate variable
        self.get_variable_metadata(variable_id)

        # Validate date chronological ordering
        if start_date > end_date:
            raise ValueError(
                f"Invalid date range: start_date ({start_date.isoformat()}) must be before "
                f"or equal to end_date ({end_date.isoformat()})."
            )

        # Validate against verified dataset temporal coverage
        metadata = self.get_metadata()
        if metadata.temporal_coverage.start_date:
            coverage_start = date.fromisoformat(metadata.temporal_coverage.start_date)
            if start_date < coverage_start:
                raise ValueError(
                    f"Requested start_date ({start_date.isoformat()}) precedes {self.dataset_id} "
                    f"verified coverage start ({coverage_start.isoformat()})."
                )

        if metadata.temporal_coverage.end_date and metadata.temporal_coverage.end_date != "present":
            coverage_end = date.fromisoformat(metadata.temporal_coverage.end_date)
            if end_date > coverage_end:
                raise ValueError(
                    f"Requested end_date ({end_date.isoformat()}) exceeds {self.dataset_id} "
                    f"verified coverage end ({coverage_end.isoformat()})."
                )

        # Validate bounding box if provided
        if bounding_box:
            if bounding_box.min_lat > bounding_box.max_lat:
                raise ValueError(
                    f"Invalid latitude range: min_lat ({bounding_box.min_lat}) > max_lat ({bounding_box.max_lat})."
                )
            if bounding_box.min_lon > bounding_box.max_lon:
                raise ValueError(
                    f"Invalid longitude range: min_lon ({bounding_box.min_lon}) > max_lon ({bounding_box.max_lon})."
                )

    async def search_granules(
        self,
        start_date: date,
        end_date: date,
        bounding_box: Optional[SpatialBoundingBox] = None,
        limit: int = 50,
    ) -> List[CMRGranule]:
        """
        Search for matching data granules using NASA CMR.
        """
        return await cmr_client.search_granules(
            short_name=self.cmr_short_name,
            version=self.cmr_version,
            start_date=start_date,
            end_date=end_date,
            bounding_box=bounding_box,
            page_size=limit,
        )

    @abstractmethod
    def process_granule_file(
        self,
        file_path: Union[str, Path],
        variable_id: str,
        bounding_box: SpatialBoundingBox,
        quality_filter: bool = True,
        timestamp: Optional[datetime] = None,
    ) -> Tuple[List[ObservationPoint], DataQualityInfo]:
        """
        Subclass-specific extraction of variables, scale factors, and quality masks from a downloaded file.
        """
        pass

    async def retrieve_timeseries(
        self,
        variable_id: str,
        bounding_box: SpatialBoundingBox,
        start_date: date,
        end_date: date,
        quality_filter: bool = True,
        max_granules: Optional[int] = None,
    ) -> ScientificTimeSeries:
        """
        Full scientific pipeline:
        1. Validate request parameters.
        2. Check deterministic local cache.
        3. Query CMR catalog for matching granules.
        4. Authenticate and download granules.
        5. Process granules into canonical observations.
        6. Build ScientificTimeSeries and cache result.
        """
        self.validate_request(variable_id, start_date, end_date, bounding_box)
        var_meta = self.get_variable_metadata(variable_id)
        metadata = self.get_metadata()

        # Check deterministic cache first
        query_hash = cache_manager.compute_query_hash(
            dataset_id=self.dataset_id,
            variable_id=variable_id,
            start_date=start_date,
            end_date=end_date,
            bbox=bounding_box,
        )
        cached_ts = cache_manager.get_cached_timeseries(query_hash)
        if cached_ts:
            return cached_ts

        # Search NASA CMR
        settings = get_settings()
        limit = max_granules or settings.max_granules_per_request
        granules = await self.search_granules(
            start_date=start_date,
            end_date=end_date,
            bounding_box=bounding_box,
            limit=limit,
        )

        if not granules:
            raise RuntimeError(
                f"No NASA granules found in CMR catalog for product '{self.cmr_short_name}' "
                f"between {start_date.isoformat()} and {end_date.isoformat()}."
            )

        # Verify authentication before initiating downloads
        if not auth_manager.is_authenticated():
            raise EarthdataAuthenticationError(
                f"Cannot download {len(granules)} granules for '{self.dataset_id}'. "
                f"NASA Earthdata credentials missing. Set EARTHDATA_TOKEN in your environment."
            )

        all_points: List[ObservationPoint] = []
        valid_fractions: List[float] = []
        fill_val_encountered: Optional[float] = None
        cloud_screened = False

        for granule in granules:
            if not granule.download_url:
                continue

            file_path = await cache_manager.download_granule(granule.download_url)
            obs_points, q_info = self.process_granule_file(
                file_path=file_path,
                variable_id=variable_id,
                bounding_box=bounding_box,
                quality_filter=quality_filter,
                timestamp=granule.time_start,
            )
            all_points.extend(obs_points)
            valid_fractions.append(q_info.valid_data_fraction)
            if q_info.fill_value_encountered is not None:
                fill_val_encountered = q_info.fill_value_encountered
            if q_info.cloud_screened:
                cloud_screened = True

        # Sort points by timestamp
        all_points.sort(key=lambda p: p.timestamp)

        mean_valid_fraction = (
            float(sum(valid_fractions) / len(valid_fractions)) if valid_fractions else 0.0
        )

        quality_summary = DataQualityInfo(
            valid_data_fraction=round(mean_valid_fraction, 4),
            fill_value_encountered=fill_val_encountered,
            quality_flag_description=(
                f"Applied quality filtering: {quality_filter}. Filtered across {len(granules)} granules."
            ),
            cloud_screened=cloud_screened,
        )

        provenance = ProcessingProvenance(
            source_daac=metadata.provider,
            satellite_mission=metadata.short_name,
            sensor_instrument=metadata.display_name,
            processing_level=metadata.processing_level,
            algorithm_version=self.cmr_version or "V1.0",
            retrieval_method=metadata.access_method,
            source_doi_or_url=metadata.documentation_url,
            processed_at=datetime.now(timezone.utc),
        )

        series = ScientificTimeSeries(
            dataset_id=self.dataset_id,
            product_id=metadata.product_id,
            variable_id=var_meta.variable_id,
            variable_name=var_meta.display_name,
            original_units=var_meta.original_units,
            scale_factor=var_meta.scale_factor,
            add_offset=var_meta.add_offset,
            spatial_selection=bounding_box,
            points=all_points,
            quality_info=quality_summary,
            provenance=provenance,
            metadata={
                "temporal_resolution": metadata.temporal_resolution,
                "granules_processed": len(granules),
                "query_hash": query_hash,
            },
        )

        # Cache final time series
        cache_manager.save_cached_timeseries(query_hash, series)
        return series
