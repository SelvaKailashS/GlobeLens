from starlette.testclient import TestClient
from backend.app.main import app


def test_endpoints():
    client = TestClient(app)
    
    # 1. Health
    h = client.get("/api/health")
    assert h.status_code == 200, f"Health error: {h.text}"
    print("Health check OK:", h.json()["status"])
    
    # 2. Regions
    reg_resp = client.get("/api/regions")
    assert reg_resp.status_code == 200
    regions = reg_resp.json()["regions"]
    reg_ids = [r["region_id"] for r in regions]
    assert "coimbatore" in reg_ids
    assert "chennai" in reg_ids
    assert "madurai" in reg_ids
    print(f"Regions OK: {len(regions)} total (including Coimbatore, Chennai, Madurai)")
    
    # 3. Regional comparison
    comp_resp = client.post(
        "/api/analysis/compare",
        json={
            "region_ids": ["coimbatore", "chennai", "madurai"],
            "dataset_id": "modis_terra_aqua",
            "variable_id": "ndvi",
            "start_date": "2021-01-01",
            "end_date": "2023-12-31",
            "alpha": 0.05,
        },
    )
    assert comp_resp.status_code == 200, f"Compare failed: {comp_resp.text}"
    comp_data = comp_resp.json()
    print("Regional Comparison Synthesis:", comp_data["comparative_synthesis"][:120] + "...")
    assert len(comp_data["regions"]) == 3
    for r in comp_data["regions"]:
        print(f"  -> {r['region_name']}: slope={r['sens_slope_per_decade']}/decade, p={r['mann_kendall_p_value']}")
    print("Pairwise Correlations:", comp_data["pairwise_correlations"])
    
    # 4. Timeseries aggregation
    ts_resp = client.post(
        "/api/timeseries/aggregate",
        json={
            "dataset_id": "modis_ndvi_monthly",
            "variable_id": "ndvi",
            "original_units": "dimensionless",
            "frequency": "annual",
            "statistic": "mean",
            "points": [
                {"timestamp": f"2023-0{m}-15T00:00:00Z", "latitude": 11.0, "longitude": 76.9, "value": 0.5 + m*0.01, "is_valid": True}
                for m in range(1, 10)
            ],
        },
    )
    assert ts_resp.status_code == 200, f"Timeseries failed: {ts_resp.text}"
    ts_data = ts_resp.json()
    print(f"Timeseries Aggregation OK: {ts_data['total_aggregated_points']} annual points, mean={ts_data['summary_mean']}")

    print("\nALL LIVE ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
