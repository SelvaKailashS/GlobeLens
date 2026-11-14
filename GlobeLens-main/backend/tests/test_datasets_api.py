from fastapi.testclient import TestClient


def test_get_all_datasets(client: TestClient):
    """Verify GET /api/datasets returns list of all 6 datasets."""
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert data["total_datasets"] == 6
    assert len(data["datasets"]) == 6
    dataset_ids = [d["dataset_id"] for d in data["datasets"]]
    assert "gpm_imerg" in dataset_ids
    assert "modis_terra_aqua" in dataset_ids
    assert "airs_aqua" in dataset_ids
    assert "omi_aura" in dataset_ids
    assert "merra2_reanalysis" in dataset_ids
    assert "gldas_hydrology" in dataset_ids


def test_filter_datasets_by_status(client: TestClient):
    """Verify filtering datasets by integration status query parameter."""
    response = client.get("/api/datasets?status=implemented")
    assert response.status_code == 200
    data = response.json()
    assert data["total_datasets"] == 6
    for ds in data["datasets"]:
        assert ds["integration_status"] == "implemented"


def test_filter_datasets_by_provider(client: TestClient):
    """Verify filtering datasets by provider substring."""
    response = client.get("/api/datasets?provider=GES+DISC")
    assert response.status_code == 200
    data = response.json()
    assert data["total_datasets"] >= 3
    for ds in data["datasets"]:
        assert "GES DISC" in ds["provider"]


def test_get_dataset_by_valid_id(client: TestClient):
    """Verify GET /api/datasets/{id} returns full metadata for each dataset."""
    for dataset_id in ["gpm_imerg", "modis_terra_aqua", "airs_aqua", "omi_aura", "merra2_reanalysis", "gldas_hydrology"]:
        response = client.get(f"/api/datasets/{dataset_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["dataset_id"] == dataset_id
        assert len(data["available_variables"]) > 0
        assert "spatial_resolution" in data
        assert "temporal_coverage" in data


def test_get_dataset_by_unknown_id(client: TestClient):
    """Verify GET /api/datasets/{id} returns 404 for unknown dataset ID with informative detail."""
    response = client.get("/api/datasets/fictitious_satellite_xyz")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert data["detail"]["error"] == "DatasetNotFound"
    assert "fictitious_satellite_xyz" in data["detail"]["message"]
    assert "valid_identifiers" in data["detail"]
    assert "gpm_imerg" in data["detail"]["valid_identifiers"]
