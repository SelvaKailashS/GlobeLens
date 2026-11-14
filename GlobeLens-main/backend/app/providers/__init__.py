from typing import Dict
# pyrefly: ignore[missing-import]
from backend.app.providers.airs import AIRSProvider
# pyrefly: ignore[missing-import]
from backend.app.providers.base import BaseDatasetProvider
# pyrefly: ignore[missing-import]
from backend.app.providers.gldas import GLDASProvider
# pyrefly: ignore[missing-import]
from backend.app.providers.gpm import GPMProvider
# pyrefly: ignore[missing-import]
from backend.app.providers.merra2 import MERRA2Provider
# pyrefly: ignore[missing-import]
from backend.app.providers.modis import MODISProvider
# pyrefly: ignore[missing-import]
from backend.app.providers.omi import OMIProvider

_PROVIDER_INSTANCES: Dict[str, BaseDatasetProvider] = {
    "gpm_imerg": GPMProvider(),
    "modis_terra_aqua": MODISProvider(),
    "airs_aqua": AIRSProvider(),
    "omi_aura": OMIProvider(),
    "merra2_reanalysis": MERRA2Provider(),
    "gldas_hydrology": GLDASProvider(),
}


def get_provider(dataset_id: str) -> BaseDatasetProvider:
    """
    Factory function returning the provider instance for a dataset ID.
    Raises KeyError if dataset_id is not registered.
    """
    key = dataset_id.lower()
    if key not in _PROVIDER_INSTANCES:
        registered = ", ".join(_PROVIDER_INSTANCES.keys())
        raise KeyError(
            f"No provider registered for dataset_id '{dataset_id}'. Registered: [{registered}]"
        )
    return _PROVIDER_INSTANCES[key]


def list_providers() -> Dict[str, BaseDatasetProvider]:
    """Return dictionary of all registered providers."""
    return dict(_PROVIDER_INSTANCES)


__all__ = [
    "BaseDatasetProvider",
    "GPMProvider",
    "MODISProvider",
    "AIRSProvider",
    "OMIProvider",
    "MERRA2Provider",
    "GLDASProvider",
    "get_provider",
    "list_providers",
]
