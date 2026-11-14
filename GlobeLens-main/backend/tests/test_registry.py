from backend.app.models.dataset import IntegrationStatus
from backend.app.registry.analysis import ANALYSIS_REGISTRY, list_analysis_methods
from backend.app.registry.datasets import DATASET_REGISTRY, list_datasets
from backend.app.registry.regions import REGIONS_REGISTRY, list_regions


def test_six_required_datasets_present():
    """Verify all 6 NASA Earth science datasets are present in registry."""
    required_ids = [
        "gpm_imerg",
        "modis_terra_aqua",
        "airs_aqua",
        "omi_aura",
        "merra2_reanalysis",
        "gldas_hydrology",
    ]
    for dataset_id in required_ids:
        assert dataset_id in DATASET_REGISTRY, f"Missing required dataset: {dataset_id}"


def test_dataset_metadata_completeness():
    """Verify all registry entries contain complete, verified metadata fields."""
    datasets = list_datasets()
    assert len(datasets) == 6

    for ds in datasets:
        assert ds.dataset_id, "dataset_id cannot be empty"
        assert ds.display_name, "display_name cannot be empty"
        assert ds.provider, "provider cannot be empty"
        assert ds.description, "description cannot be empty"
        assert len(ds.available_variables) > 0, f"No variables defined for {ds.dataset_id}"
        assert ds.temporal_resolution, "temporal_resolution missing"
        assert ds.spatial_resolution.horizontal_degrees > 0, "spatial resolution horizontal missing"
        assert ds.temporal_coverage.start_date, "temporal coverage start missing"
        assert ds.access_method, "access_method missing"
        assert ds.product_id, "product_id missing"
        assert ds.documentation_url.startswith("http"), "documentation_url must be valid URL"
        assert ds.integration_status in [
            IntegrationStatus.IMPLEMENTED,
            IntegrationStatus.IN_DEVELOPMENT,
            IntegrationStatus.PLANNED,
            IntegrationStatus.UNAVAILABLE,
        ]


def test_dataset_variables_have_original_units():
    """Verify variables preserve documented original units and valid ranges."""
    for ds in list_datasets():
        for var in ds.available_variables:
            assert var.variable_id, f"Empty variable_id in {ds.dataset_id}"
            assert var.display_name, f"Empty display_name for {var.variable_id}"
            assert var.original_units, f"Units must be defined for {var.variable_id}"
            assert var.valid_range is None or len(var.valid_range) == 2


def test_integration_statuses_are_accurate():
    """Verify all 6 datasets reflect IMPLEMENTED status as real data providers are wired in Milestone 2."""
    for ds_id in ["gpm_imerg", "modis_terra_aqua", "airs_aqua", "omi_aura", "merra2_reanalysis", "gldas_hydrology"]:
        ds = DATASET_REGISTRY[ds_id]
        assert ds.integration_status == IntegrationStatus.IMPLEMENTED


def test_regions_registry_validity():
    """Verify all geographic study regions have valid coordinates and descriptions."""
    regions = list_regions()
    assert len(regions) >= 8

    for region in regions:
        assert -90.0 <= region.center_lat <= 90.0
        assert -180.0 <= region.center_lon <= 180.0
        bbox = region.bounding_box
        assert bbox.min_lat <= bbox.max_lat
        assert bbox.min_lon <= bbox.max_lon
        assert region.area_sq_km > 0
        assert len(region.description) > 20
        assert len(region.climate_context) > 20
        assert len(region.target_phenomena) > 10


def test_analysis_methods_registry_validity():
    """Verify all statistical analysis methods have mathematical basis and assumptions."""
    methods = list_analysis_methods()
    assert len(methods) >= 5

    required_methods = ["mann_kendall", "sen_slope", "seasonal_mann_kendall", "pettitt_test", "ols_linear_regression"]
    for method_id in required_methods:
        assert method_id in ANALYSIS_REGISTRY
        method = ANALYSIS_REGISTRY[method_id]
        assert method.minimum_observations >= 5
        assert len(method.assumptions) >= 2
        assert len(method.outputs_provided) >= 2
        assert method.library_source
