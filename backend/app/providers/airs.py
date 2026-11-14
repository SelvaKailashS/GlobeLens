# pyrefly: ignore[missing-import]
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple, Union

# pyrefly: ignore[missing-import]
from backend.app.models.common import DataQualityInfo, ObservationPoint
# pyrefly: ignore[missing-import]
from backend.app.models.region import SpatialBoundingBox
# pyrefly: ignore[missing-import]
from backend.app.providers.base import BaseDatasetProvider
# pyrefly: ignore[missing-import]
from backend.app.services.processor import processor


class AIRSProvider(BaseDatasetProvider):
    """
    NASA Atmospheric Infrared Sounder (AIRS) on Aqua satellite Provider.
    Product: AIRS3STM Version 7.0 (Monthly 1x1 degree Gridded Physical Retrieval, AIRS-only)
    DAAC: NASA GES DISC
    """

    def __init__(self):
        super().__init__(
            dataset_id="airs_aqua",
            provider_name="NASA GES DISC",
            documentation_url="https://disc.gsfc.nasa.gov/datasets/AIRS3STM_7.0/summary",
            cmr_short_name="AIRS3STM",
            cmr_version="7.0",
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
        Extract atmospheric profile and temperature observations from AIRS Level 3 V7.0 NetCDF/HDF file.
        Preserves original thermodynamic temperature in Kelvin and ozone in Dobson Units.
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
