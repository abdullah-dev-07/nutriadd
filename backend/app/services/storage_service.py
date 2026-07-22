"""Azure Blob Storage wrapper.

All product/promo/document media lives in Blob Storage; the database only ever
stores the resulting HTTPS URLs (never binary data). Authentication uses the
account connection string from settings.AZURE_STORAGE_CONNECTION_STRING.
"""
from functools import lru_cache

from azure.storage.blob import BlobServiceClient, ContentSettings
from fastapi import HTTPException, status

from app.core.config import settings


@lru_cache
def _client() -> BlobServiceClient:
    if not settings.AZURE_STORAGE_CONNECTION_STRING:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure Blob Storage is not configured (AZURE_STORAGE_CONNECTION_STRING is empty).",
        )
    return BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)


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
