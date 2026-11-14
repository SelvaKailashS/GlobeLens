from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple, Union

from backend.app.models.common import DataQualityInfo, ObservationPoint
from backend.app.models.region import SpatialBoundingBox
from backend.app.providers.base import BaseDatasetProvider
from backend.app.services.processor import processor


class MERRA2Provider(BaseDatasetProvider):
    """
    NASA MERRA-2 Atmospheric Reanalysis Provider.
    Product: M2TMNXSLV Version 5.12.4 (Monthly 2D Surface Atmospheric Diagnostics)
    Organization: NASA GMAO (Global Modeling and Assimilation Office) / GES DISC
    """

    def __init__(self):
        super().__init__(
            dataset_id="merra2_reanalysis",
            provider_name="NASA GMAO / GES DISC",
            documentation_url="https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/",
            cmr_short_name="M2TMNXSLV",
            cmr_version="5.12.4",
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
        Extract atmospheric reanalysis fields from MERRA-2 NetCDF4 file.
        Preserves original SI physical units (Kelvin, kg m-2 s-1, m/s).
        """
        var_meta = self.get_variable_metadata(variable_id)

        return processor.extract_variable_timeseries(
            file_path=file_path,
            variable_name=var_meta.variable_id,
            bbox=bounding_box,
            scale_factor=var_meta.scale_factor,
            add_offset=var_meta.add_offset,
            fill_value=var_meta.fill_value or 1.0e15,
            quality_var_name=None,
            quality_filter_fn=None,
            fixed_timestamp=timestamp,
        )
