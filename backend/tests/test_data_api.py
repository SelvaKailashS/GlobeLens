from datetime import date
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from backend.app.services.cmr import CMRGranule


def test_data_preview_endpoint(client: TestClient):
    """Verify POST /api/data/preview queries catalog and returns metadata and granule count."""
    mock_granules = [
        CMRGranule(
            granule_ur="GPM_3IMERGM_202301",
            title="3B-MO.MS.MRG.3IMERG.20230101-S000000-E235959.01.V07B.HDF5",
            time_start="2023-01-01T00:00:00Z",
            time_end="2023-01-31T23:59:59Z",
            granule_size_mb=42.5,
            download_url="https://gpm1.gesdisc.eosdis.nasa.gov/data/GPM_L3/GPM_3IMERGM.07/2023/sample.HDF5",
        )
    ]

    payload = {
        "dataset_id": "gpm_imerg",
        "variable_id": "precipitation",
        "start_date": "2023-01-01",
        "end_date": "2023-01-31",
        "region_id": "amazon_basin",
    }

    with patch("backend.app.services.cmr.CMRClient.search_granules", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = mock_granules

        response = client.post("/api/data/preview", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["dataset_id"] == "gpm_imerg"
        assert data["variable_id"] == "precipitation"
        assert data["original_units"] == "mm/hr"
        assert data["granules_found"] == 1
        assert data["estimated_size_mb"] == 42.5
        assert "authentication_status" in data


def test_data_preview_invalid_variable(client: TestClient):
    """Verify POST /api/data/preview rejects unverified/missing variable."""
    payload = {
        "dataset_id": "gpm_imerg",
        "variable_id": "nonexistent_fictional_variable",
        "start_date": "2023-01-01",
        "end_date": "2023-01-31",
        "region_id": "amazon_basin",
    }
    response = client.post("/api/data/preview", json=payload)
    assert response.status_code == 400
    assert "not supported" in response.json()["detail"]


def test_data_retrieve_and_job_lifecycle(client: TestClient):
    """Verify POST /api/data/retrieve enqueues background job with polling URLs."""
    payload = {
        "dataset_id": "gpm_imerg",
        "variable_id": "precipitation",
        "start_date": "2023-01-01",
        "end_date": "2023-01-31",
        "region_id": "amazon_basin",
    }

    response = client.post("/api/data/retrieve", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "queued"
    assert "/api/data/jobs/" in data["poll_url"]
    assert "/result" in data["result_url"]

    job_id = data["job_id"]

    # Poll job status
    poll_resp = client.get(f"/api/data/jobs/{job_id}")
    assert poll_resp.status_code == 200
    job_info = poll_resp.json()
    assert job_info["job_id"] == job_id
    assert job_info["dataset_id"] == "gpm_imerg"


def test_get_nonexistent_job(client: TestClient):
    """Verify 404 for unknown job ID."""
    response = client.get("/api/data/jobs/nonexistent-uuid-12345")
    assert response.status_code == 404
