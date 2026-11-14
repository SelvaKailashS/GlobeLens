from fastapi.testclient import TestClient


def test_get_all_regions(client: TestClient):
    """Verify GET /api/regions returns 8 study regions."""
    response = client.get("/api/regions")
    assert response.status_code == 200
    data = response.json()
    assert data["total_regions"] >= 8
    assert len(data["regions"]) >= 8

    region_ids = [r["region_id"] for r in data["regions"]]
    assert "amazon_basin" in region_ids
    assert "greenland_ice" in region_ids
    assert "sahel_belt" in region_ids
    assert "tibetan_plateau" in region_ids


def test_filter_regions_by_category(client: TestClient):
    """Verify filtering regions by category (e.g. Polar)."""
    response = client.get("/api/regions?category=Polar")
    assert response.status_code == 200
    data = response.json()
    assert data["total_regions"] >= 2
    for r in data["regions"]:
        assert r["category"].lower() == "polar"


def test_get_region_by_valid_id(client: TestClient):
    """Verify GET /api/regions/{id} returns region metadata with bounding box."""
    response = client.get("/api/regions/amazon_basin")
    assert response.status_code == 200
    data = response.json()
    assert data["region_id"] == "amazon_basin"
    assert data["name"] == "Amazon Rainforest Basin"
    assert data["area_sq_km"] == 6700000.0
    assert "bounding_box" in data
    bbox = data["bounding_box"]
    assert bbox["min_lat"] < bbox["max_lat"]
    assert bbox["min_lon"] < bbox["max_lon"]
    assert "climate_context" in data


def test_get_region_by_unknown_id(client: TestClient):
    """Verify GET /api/regions/{id} returns 404 for unknown region."""
    response = client.get("/api/regions/atlantis_unknown")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["error"] == "RegionNotFound"
    assert "valid_identifiers" in data["detail"]
