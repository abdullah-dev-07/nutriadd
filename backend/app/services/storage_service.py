"""Local filesystem media storage.

Product/promo/document files are written as plain files on the VPS disk under
settings.MEDIA_ROOT and served publicly by Nginx (not FastAPI) from
settings.MEDIA_BASE_URL/media/... The database only ever stores the resulting
HTTPS URL string, never binary data.

Nginx maps the public /media/ path to MEDIA_ROOT, e.g.:
    location /media/ { alias /var/www/nutriadd/media/; ... }
so a file saved at {MEDIA_ROOT}/{subdir}/{name} is reachable at
{MEDIA_BASE_URL}/media/{subdir}/{name}.
"""
from pathlib import Path

from app.core.config import settings


def save_media(subdir: str, filename: str, data: bytes) -> str:
    """Write `data` to {MEDIA_ROOT}/{subdir}/{filename}, creating the directory if
    needed, and return the public URL Nginx serves it at.

    The service process (systemd user `nutriadd`) must own/​write MEDIA_ROOT.
    """
    dest_dir = Path(settings.MEDIA_ROOT) / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    (dest_dir / filename).write_bytes(data)

    base = settings.MEDIA_BASE_URL.rstrip("/")
    return f"{base}/media/{subdir}/{filename}"
