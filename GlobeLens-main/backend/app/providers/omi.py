from datetime import date, datetime
from pathlib import Path
from typing import List, Optional, Tuple, Union

from backend.app.models.common import DataQualityInfo, ObservationPoint
from backend.app.models.region import SpatialBoundingBox
from backend.app.providers.base import BaseDatasetProvider
from backend.app.services.cmr import cmr_client, CMRGranule
from backend.app.services.processor import processor


class OMIProvider(BaseDatasetProvider):
    """
    NASA Ozone Monitoring Instrument (OMI) on Aura satellite Provider.
    Products: OMTO3e (Ozone & UV Aerosol Index), OMNO2d (Nitrogen Dioxide), OMAERUVd (Aerosol Optical Depth)
    DAAC: NASA GES DISC / KNMI
    """

    def __init__(self):
        super().__init__(
            dataset_id="omi_aura",
            provider_name="NASA GES DISC / KNMI",
            documentation_url="https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary",
            cmr_short_name="OMTO3e",
            cmr_version="003",
        )

    def _get_cmr_product_for_variable(self, variable_id: str) -> str:
        """Route to appropriate OMI product ID based on variable."""
        vid = variable_id.lower()
        if "no2" in vid:
            return "OMNO2d"
        elif "aerosolopticaldepth" in vid or "aod" in vid:
            return "OMAERUVd"
        return "OMTO3e"

    async def search_granules(
        self,
        start_date: date,
        end_date: date,
        bounding_box: Optional[SpatialBoundingBox] = None,
        limit: int = 50,
        variable_id: Optional[str] = None,
    ) -> List[CMRGranule]:
        """Search CMR targeting OMTO3e, OMNO2d, or OMAERUVd."""
        product = self._get_cmr_product_for_variable(variable_id or "ozone")
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
        Extract atmospheric trace gas columns or aerosol measurements from OMI HDF5/NetCDF file.
        Preserves original units (Dobson Units, molecules/cm², index units).
        """
        var_meta = self.get_variable_metadata(variable_id)

        return processor.extract_variable_timeseries(
            file_path=file_path,
            variable_name=var_meta.variable_id,
            bbox=bounding_box,
            scale_factor=var_meta.scale_factor,
            add_offset=var_meta.add_offset,
            fill_value=var_meta.fill_value or -1.2676506e30,
            quality_var_name=None,
            quality_filter_fn=None,
            fixed_timestamp=timestamp,
        )
