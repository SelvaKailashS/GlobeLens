from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """Verify health endpoint returns 200, healthy status, and registry stats."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "TerraTrend" in data["service"]
    assert data["version"] == "0.1.0"
    assert data["datasets_registered"] == 6
    assert data["regions_registered"] >= 8
    assert data["methods_registered"] >= 5
    assert "timestamp_utc" in data


def test_root_endpoint(client: TestClient):
    """Verify root endpoint provides API discovery metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "TerraTrend" in data["app"]
    assert "endpoints" in data
    assert data["endpoints"]["health"] == "/api/health"
    assert data["endpoints"]["datasets"] == "/api/datasets"
