"""Azure Blob Storage wrapper.

All product/promo/document media lives in Blob Storage; the database only ever
stores the resulting HTTPS URLs (never binary data). Authentication uses EITHER a
full connection string (AZURE_STORAGE_CONNECTION_STRING) OR an account name + key
(AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_KEY).
"""
from functools import lru_cache

from azure.storage.blob import BlobServiceClient, ContentSettings
from fastapi import HTTPException, status

from app.core.config import settings


@lru_cache
def _client() -> BlobServiceClient:
    # Prefer a full connection string when provided.
    if settings.AZURE_STORAGE_CONNECTION_STRING:
        return BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
    # Otherwise authenticate with account name + shared key.
    if settings.AZURE_STORAGE_ACCOUNT and settings.AZURE_STORAGE_KEY:
        account_url = f"https://{settings.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net"
        return BlobServiceClient(account_url=account_url, credential=settings.AZURE_STORAGE_KEY)
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=(
            "Azure Blob Storage is not configured. Set AZURE_STORAGE_CONNECTION_STRING, "
            "or AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_KEY."
        ),
    )


def upload_file(container: str, blob_name: str, data: bytes, content_type: str) -> str:
    """Upload bytes to `container/blob_name`, overwriting if present, and return the
    public HTTPS URL. The container is expected to already exist with public
    blob-read access (created once during deployment / by the seed script)."""
    blob_client = _client().get_blob_client(container=container, blob=blob_name)
    blob_client.upload_blob(
        data,
        overwrite=True,
        content_settings=ContentSettings(content_type=content_type),
    )
    return blob_client.url


def ensure_container(container: str) -> None:
    """Create the container with public blob-read access if it doesn't exist.
    Used by the seed script so a fresh deployment is self-provisioning."""
    container_client = _client().get_container_client(container)
    if not container_client.exists():
        container_client.create_container(public_access="blob")
