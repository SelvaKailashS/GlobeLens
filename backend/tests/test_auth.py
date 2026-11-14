import os
import pytest

from backend.app.core.auth import EarthdataAuthenticationError, EarthdataAuthManager


def test_auth_manager_missing_credentials(monkeypatch):
    """Verify EarthdataAuthManager raises informative error when credentials are not configured."""
    monkeypatch.delenv("EARTHDATA_TOKEN", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_TOKEN", raising=False)
    monkeypatch.delenv("EARTHDATA_USERNAME", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_USERNAME", raising=False)
    monkeypatch.delenv("EARTHDATA_PASSWORD", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_PASSWORD", raising=False)

    manager = EarthdataAuthManager()
    # Explicitly clear settings credentials if cached
    manager._settings.nasa_earthdata_token = None
    manager._settings.nasa_earthdata_username = None
    manager._settings.nasa_earthdata_password = None

    creds = manager.get_credentials()
    assert not creds.has_credentials

    with pytest.raises(EarthdataAuthenticationError) as exc_info:
        manager.get_auth_headers()
    assert "NASA Earthdata credentials are required" in str(exc_info.value)
    assert "https://urs.earthdata.nasa.gov/" in str(exc_info.value)


def test_auth_manager_with_token(monkeypatch):
    """Verify Bearer token from environment is used in authorization header."""
    sample_token = "mock_test_token_earthdata_12345"
    monkeypatch.setenv("EARTHDATA_TOKEN", sample_token)

    manager = EarthdataAuthManager()
    creds = manager.get_credentials()
    assert creds.has_credentials
    assert creds.token == sample_token

    headers = manager.get_auth_headers()
    assert "Authorization" in headers
    assert headers["Authorization"] == f"Bearer {sample_token}"
    assert "TerraTrend" in headers["User-Agent"]


def test_auth_manager_rejects_placeholder_tokens(monkeypatch):
    """Verify placeholder tokens like 'your_token_here' are treated as unconfigured."""
    monkeypatch.setenv("EARTHDATA_TOKEN", "your_token_here")
    manager = EarthdataAuthManager()
    manager._settings.nasa_earthdata_token = None
    creds = manager.get_credentials()
    assert not creds.has_credentials
