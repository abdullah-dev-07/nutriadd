import json
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database — Azure Database for MySQL Flexible Server in production.
    # TLS is enforced automatically whenever the host isn't localhost (see app/db/base.py).
    DATABASE_URL: str = "mysql+aiomysql://user:password@localhost:3306/nutriadd"

    # Media storage — product/promo/document files are stored as plain files on the
    # VPS filesystem under MEDIA_ROOT, and served publicly by Nginx (not FastAPI) at
    # MEDIA_BASE_URL/media/... The DB only ever stores the resulting HTTPS URL string,
    # never binary data.
    MEDIA_ROOT: str = "/var/www/nutriadd/media"
    MEDIA_BASE_URL: str = "https://api.nutriadd.store"
    MEDIA_PRODUCT_DIR: str = "products"
    MEDIA_PROMO_DIR: str = "promo"

    # DEAD CONFIG — Azure Blob Storage is no longer used (media moved to VPS disk).
    # These fields are retained only so leftover AZURE_* lines in an old .env don't
    # cause errors. Do NOT wire new code to them.
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_ACCOUNT: str = ""
    AZURE_STORAGE_KEY: str = ""
    AZURE_STORAGE_PRODUCT_CONTAINER: str = "product-images"
    AZURE_STORAGE_PROMO_CONTAINER: str = "promo-media"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Transactional email (SMTP) — order confirmation to the customer + a
    # notification to the business inbox. Credentials come from env only, never
    # hardcoded. When SMTP_HOST is empty, emails are logged instead of sent, so
    # local dev and order creation never fail just because email isn't configured.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_USE_TLS: bool = True  # STARTTLS on 587; set false + port 465 for SSL
    SMTP_USE_SSL: bool = False
    # "From" address shown to recipients (e.g. orders@nutriadd.store).
    EMAIL_FROM: str = ""
    EMAIL_FROM_NAME: str = "NutriAdd"
    # Business mailbox that receives a copy/notification of every new order.
    ORDER_NOTIFY_EMAIL: str = ""
    # Public site URL used to build order links inside emails.
    SITE_URL: str = "https://nutriadd.store"

    # CORS — accepts either a JSON array ("[\"https://a.com\",\"https://b.com\"]")
    # or a plain comma-separated string ("https://a.com,https://b.com"), so it's
    # easy to set in a plain .env file on the VM without worrying about JSON quoting.
    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        stripped = self.CORS_ORIGINS.strip()
        if stripped.startswith("["):
            return json.loads(stripped)
        return [origin.strip() for origin in stripped.split(",") if origin.strip()]

    # App
    PROJECT_NAME: str = "NutriAdd API"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
