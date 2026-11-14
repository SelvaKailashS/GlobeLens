from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple, Union
import numpy as np

from backend.app.models.common import DataQualityInfo, ObservationPoint
from backend.app.models.region import SpatialBoundingBox
from backend.app.providers.base import BaseDatasetProvider
from backend.app.services.processor import processor


class GPMProvider(BaseDatasetProvider):
    """
    NASA Global Precipitation Measurement (GPM) IMERG Provider.
    Product: GPM_3IMERGM (Monthly), GPM_3IMERGDF (Daily) Version 07
    DAAC: NASA GES DISC / Precipitation Processing System (PPS)
    """

    def __init__(self):
        super().__init__(
            dataset_id="gpm_imerg",
            provider_name="NASA GES DISC / PPS",
            documentation_url="https://gpm.nasa.gov/data/imerg",
            cmr_short_name="GPM_3IMERGM",
            cmr_version="07",
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
        Extract precipitation observations from GPM IMERG NetCDF4/HDF5 file.
        Preserves original rate units (mm/hr) and applies gauge weighting QA threshold.
        """
        var_meta = self.get_variable_metadata(variable_id)

        quality_filter_fn = None
        quality_var = None
        if quality_filter and variable_id == "precipitation":
            quality_var = "precipitationQualityIndex"
            # Require gauge weighting/quality index >= 0.4 for reliable land precipitation
            quality_filter_fn = lambda q: np.asarray(q >= 0.4, dtype=bool)

        return processor.extract_variable_timeseries(
            file_path=file_path,
            variable_name=var_meta.variable_id,
            bbox=bounding_box,
            scale_factor=var_meta.scale_factor,
            add_offset=var_meta.add_offset,
            fill_value=var_meta.fill_value or -9999.9,
            quality_var_name=quality_var,
            quality_filter_fn=quality_filter_fn,
            fixed_timestamp=timestamp,
        )
