from fastapi.testclient import TestClient


def test_get_all_variables(client: TestClient):
    """Verify GET /api/variables returns variables from all datasets."""
    response = client.get("/api/variables")
    assert response.status_code == 200
    data = response.json()
    assert data["total_variables"] >= 15
    variable_ids = [v["variable_id"] for v in data["variables"]]
    assert "precipitation" in variable_ids
    assert "_1_km_16_days_NDVI" in variable_ids
    assert "SurfAirTemp_A" in variable_ids
    assert "ColumnAmountO3" in variable_ids
    assert "T2M" in variable_ids
    assert "SoilMoi0_10cm_inst" in variable_ids


def test_filter_variables_by_dataset(client: TestClient):
    """Verify GET /api/variables?dataset_id=gpm_imerg returns only GPM variables."""
    response = client.get("/api/variables?dataset_id=gpm_imerg")
    assert response.status_code == 200
    data = response.json()
    for var in data["variables"]:
        assert var["variable_id"] in [
            "precipitation",
            "precipitationQualityIndex",
            "probabilityLiquidPrecipitation",
            "randomError",
        ]


def test_filter_variables_by_category(client: TestClient):
    """Verify filtering variables by category (e.g. Vegetation)."""
    response = client.get("/api/variables?category=Vegetation")
    assert response.status_code == 200
    data = response.json()
    for var in data["variables"]:
        assert var["physical_category"] == "Vegetation"


def test_get_variable_by_valid_id(client: TestClient):
    """Verify GET /api/variables/{id} returns variable details with units and sensor."""
    response = client.get("/api/variables/precipitation")
    assert response.status_code == 200
    data = response.json()
    assert data["variable_id"] == "precipitation"
    assert data["original_units"] == "mm/hr"
    assert "valid_range" in data


def test_get_variable_by_unknown_id(client: TestClient):
    """Verify GET /api/variables/{id} returns 404 for unknown variable."""
    response = client.get("/api/variables/nonexistent_chemical_xyz")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["error"] == "VariableNotFound"
