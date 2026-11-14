from datetime import date, datetime
from pathlib import Path
from typing import List, Optional, Tuple, Union
import numpy as np

from backend.app.models.common import DataQualityInfo, ObservationPoint
from backend.app.models.region import SpatialBoundingBox
from backend.app.providers.base import BaseDatasetProvider
from backend.app.services.cmr import cmr_client, CMRGranule
from backend.app.services.processor import processor


class MODISProvider(BaseDatasetProvider):
    """
    NASA MODIS Terra/Aqua Provider.
    Products: MOD13A2.061 (Vegetation Indices 16-Day 1km) and MOD11A2.061 (Land Surface Temperature 8-Day 1km)
    DAAC: NASA LP DAAC (Land Processes Distributed Active Archive Center)
    """

    def __init__(self):
        super().__init__(
            dataset_id="modis_terra_aqua",
            provider_name="NASA LP DAAC / USGS EROS",
            documentation_url="https://lpdaac.usgs.gov/products/mod13a2v061/",
            cmr_short_name="MOD13A2",
            cmr_version="061",
        )

    def _get_cmr_product_for_variable(self, variable_id: str) -> str:
        """Route to appropriate MODIS product ID based on variable."""
        vid = variable_id.lower()
        if "lst" in vid or "temp" in vid:
            return "MOD11A2"
        return "MOD13A2"

    async def search_granules(
        self,
        start_date: date,
        end_date: date,
        bounding_box: Optional[SpatialBoundingBox] = None,
        limit: int = 50,
        variable_id: Optional[str] = None,
    ) -> List[CMRGranule]:
        """Search CMR targeting either MOD13A2 (Vegetation) or MOD11A2 (LST)."""
        product = self._get_cmr_product_for_variable(variable_id or "ndvi")
        return await cmr_client.search_granules(
            short_name=product,
            version=self.cmr_version,
            start_date=start_date,
            end_date=end_date,
            bounding_box=bounding_box,
            page_size=limit,
        )

    def process_granule_file(
        self,
        file_path: Union[str, Path],
        variable_id: str,
        bounding_box: SpatialBoundingBox,
        quality_filter: bool = True,
        timestamp: Optional[datetime] = None,
    ) -> Tuple[List[ObservationPoint], DataQualityInfo]:
        """
        Extract MODIS vegetative indices or Land Surface Temperature from HDF/NetCDF granule.
        Applies verified MODIS scale factors (0.0001 for NDVI/EVI, 0.02 for LST) and quality bitmasks.
        """
        var_meta = self.get_variable_metadata(variable_id)

        quality_filter_fn = None
        quality_var = None
        if quality_filter:
            if "lst" in variable_id.lower():
                quality_var = "QC_Day"
                # Bit 0-1 == 0 means mandatory QA flags good data
                quality_filter_fn = lambda q: np.asarray((q.astype(int) & 0b11) == 0, dtype=bool)
            else:
                quality_var = "250m_16_days_VI_Quality"
                quality_filter_fn = lambda q: np.asarray((q.astype(int) & 0b11) == 0, dtype=bool)

        return processor.extract_variable_timeseries(
            file_path=file_path,
            variable_name=var_meta.variable_id,
            bbox=bounding_box,
            scale_factor=var_meta.scale_factor,
            add_offset=var_meta.add_offset,
            fill_value=var_meta.fill_value or -3000.0,
            quality_var_name=quality_var,
            quality_filter_fn=quality_filter_fn,
            fixed_timestamp=timestamp,
        )
