from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple, Union

from backend.app.models.common import DataQualityInfo, ObservationPoint
from backend.app.models.region import SpatialBoundingBox
from backend.app.providers.base import BaseDatasetProvider
from backend.app.services.processor import processor


class GLDASProvider(BaseDatasetProvider):
    """
    NASA Global Land Data Assimilation System (GLDAS) Noah LSM Provider.
    Product: GLDAS_NOAH025_M Version 2.1 (Monthly 0.25 degree Noah Land Surface Model)
    Organization: NASA GSFC Hydrological Sciences Laboratory / GES DISC
    """

    def __init__(self):
        super().__init__(
            dataset_id="gldas_hydrology",
            provider_name="NASA GSFC / GES DISC",
            documentation_url="https://ldas.gsfc.nasa.gov/gldas/gldas-get-data",
            cmr_short_name="GLDAS_NOAH025_M",
            cmr_version="2.1",
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
        Extract hydrological and land surface observations from GLDAS Noah NetCDF4 file.
        Preserves original physical flux units (kg m-2 s-1) and storage depths (kg/m²).
        """
        var_meta = self.get_variable_metadata(variable_id)

        return processor.extract_variable_timeseries(
            file_path=file_path,
            variable_name=var_meta.variable_id,
            bbox=bounding_box,
            scale_factor=var_meta.scale_factor,
            add_offset=var_meta.add_offset,
            fill_value=var_meta.fill_value or -9999.0,
            quality_var_name=None,
            quality_filter_fn=None,
            fixed_timestamp=timestamp,
        )
