from fastapi.testclient import TestClient


def test_get_all_analysis_methods(client: TestClient):
    """Verify GET /api/analysis/methods returns documented statistical methods."""
    response = client.get("/api/analysis/methods")
    assert response.status_code == 200
    data = response.json()
    assert data["total_methods"] >= 5
    method_ids = [m["method_id"] for m in data["methods"]]
    assert "mann_kendall" in method_ids
    assert "sen_slope" in method_ids
    assert "pettitt_test" in method_ids
    assert "ols_linear_regression" in method_ids


def test_filter_analysis_methods_by_category(client: TestClient):
    """Verify filtering methods by category."""
    response = client.get("/api/analysis/methods?category=trend_detection")
    assert response.status_code == 200
    data = response.json()
    for m in data["methods"]:
        assert m["category"] == "trend_detection"


def test_get_analysis_method_by_valid_id(client: TestClient):
    """Verify GET /api/analysis/methods/{id} returns mathematical basis and assumptions."""
    response = client.get("/api/analysis/methods/mann_kendall")
    assert response.status_code == 200
    data = response.json()
    assert data["method_id"] == "mann_kendall"
    assert "mathematical_basis" in data
    assert len(data["assumptions"]) > 0
    assert len(data["outputs_provided"]) > 0
    assert data["minimum_observations"] >= 10
    assert "pymannkendall" in data["library_source"]


def test_get_analysis_method_by_unknown_id(client: TestClient):
    """Verify GET /api/analysis/methods/{id} returns 404 for unknown method."""
    response = client.get("/api/analysis/methods/quantum_trend_fictional")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["error"] == "AnalysisMethodNotFound"
    assert "valid_methods" in data["detail"]
