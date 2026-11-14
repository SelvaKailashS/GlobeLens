import os
from pathlib import Path
from typing import Any, Dict, Optional
import httpx
from pydantic import BaseModel

from backend.app.config import get_settings


class EarthdataAuthenticationError(Exception):
    """Raised when NASA Earthdata authentication credentials are missing, invalid, or expired."""

    def __init__(self, message: Optional[str] = None):
        default_message = (
            "NASA Earthdata credentials are required for live data retrieval. "
            "To configure access:\n"
            "  1. Register for a free Earthdata account at: https://urs.earthdata.nasa.gov/\n"
            "  2. Generate a Personal Access Token under 'My Profile' -> 'Generate Token':\n"
            "     https://urs.earthdata.nasa.gov/users/tokens\n"
            "  3. Set the token in your environment or backend/.env file:\n"
            "     EARTHDATA_TOKEN=your_token_here\n"
            "  Alternatively, set EARTHDATA_USERNAME and EARTHDATA_PASSWORD.\n"
            "Note: Never commit credentials to source control."
        )
        super().__init__(message or default_message)


class EarthdataCredentials(BaseModel):
    """Container for resolved Earthdata credentials."""
    token: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None

    @property
    def has_credentials(self) -> bool:
        return bool(self.token or (self.username and self.password))


class EarthdataAuthManager:
    """
    Manages NASA Earthdata Login (URS) authentication.
    Supports Personal Access Tokens (Bearer), Username/Password basic auth,
    and fallback to system .netrc configuration.
    """

    def __init__(self):
        self._settings = get_settings()

    def get_credentials(self) -> EarthdataCredentials:
        """Resolve credentials from environment variables, settings, or .netrc."""
        # 1. Check Bearer Token (Highest Priority & Most Secure)
        token = (
            os.getenv("EARTHDATA_TOKEN")
            or os.getenv("NASA_EARTHDATA_TOKEN")
            or self._settings.nasa_earthdata_token
        )
        if token and token.strip() and not token.startswith("your_"):
            return EarthdataCredentials(token=token.strip())

        # 2. Check Username & Password
        username = (
            os.getenv("EARTHDATA_USERNAME")
            or os.getenv("NASA_EARTHDATA_USERNAME")
            or self._settings.nasa_earthdata_username
        )
        password = (
            os.getenv("EARTHDATA_PASSWORD")
            or os.getenv("NASA_EARTHDATA_PASSWORD")
            or self._settings.nasa_earthdata_password
        )
        if (
            username
            and password
            and not username.startswith("your_")
            and not password.startswith("your_")
        ):
            return EarthdataCredentials(username=username.strip(), password=password.strip())

        # 3. Check ~/.netrc (Standard NASA tool fallback)
        netrc_path = Path.home() / ".netrc"
        if not netrc_path.exists():
            netrc_path = Path.home() / "_netrc"

        if netrc_path.exists():
            try:
                import netrc
                auths = netrc.netrc(str(netrc_path))
                account = auths.authenticators("urs.earthdata.nasa.gov")
                if account:
                    return EarthdataCredentials(username=account[0], password=account[2])
            except Exception:
                pass

        return EarthdataCredentials()

    def is_authenticated(self) -> bool:
        """Check whether valid credentials are configured."""
        creds = self.get_credentials()
        return creds.has_credentials

    def get_auth_headers(self) -> Dict[str, str]:
        """
        Returns HTTP headers for authenticated NASA DAAC requests.
        Raises EarthdataAuthenticationError if no credentials are configured.
        """
        creds = self.get_credentials()
        if not creds.has_credentials:
            raise EarthdataAuthenticationError()

        if creds.token:
            return {
                "Authorization": f"Bearer {creds.token}",
                "User-Agent": "TerraTrend-NASA-SpaceApps/0.1.0 (Earth Systems Trend Detective)",
            }
        return {
            "User-Agent": "TerraTrend-NASA-SpaceApps/0.1.0 (Earth Systems Trend Detective)",
        }

    async def verify_credentials(self) -> Dict[str, Any]:
        """
        Actively verifies Earthdata credentials against URS.
        Returns user/token info or raises EarthdataAuthenticationError.
        """
        creds = self.get_credentials()
        if not creds.has_credentials:
            raise EarthdataAuthenticationError(
                "No NASA Earthdata credentials configured. Set EARTHDATA_TOKEN in your environment."
            )

        headers = self.get_auth_headers()
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            try:
                # Test against Earthdata URS token verification or CMR user endpoint
                if creds.token:
                    resp = await client.get(
                        "https://urs.earthdata.nasa.gov/api/users/tokens",
                        headers=headers,
                    )
                    if resp.status_code in [200, 201]:
                        return {"status": "authenticated", "auth_method": "token", "valid": True}
                    elif resp.status_code == 401:
                        raise EarthdataAuthenticationError("NASA Earthdata Token is invalid or expired.")
                elif creds.username and creds.password:
                    resp = await client.get(
                        f"https://urs.earthdata.nasa.gov/api/users/{creds.username}",
                        auth=(creds.username, creds.password),
                        headers=headers,
                    )
                    if resp.status_code == 200:
                        return {"status": "authenticated", "auth_method": "basic", "username": creds.username, "valid": True}
                    elif resp.status_code == 401:
                        raise EarthdataAuthenticationError("Invalid NASA Earthdata username or password.")

                return {"status": "unverified", "valid": False}
            except httpx.RequestError as exc:
                raise EarthdataAuthenticationError(f"Network error communicating with NASA Earthdata Login: {str(exc)}")


# Global singleton instance
auth_manager = EarthdataAuthManager()
