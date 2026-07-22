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

    # Azure Blob Storage — all product/promo/document media lives here; the DB only
    # ever stores the resulting HTTPS URLs, never binary data.
    # Authenticate EITHER with a full connection string, OR with account name + key.
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_ACCOUNT: str = ""
    AZURE_STORAGE_KEY: str = ""
    # These must match the real container names in your storage account.
    AZURE_STORAGE_PRODUCT_CONTAINER: str = "product-images"
    AZURE_STORAGE_PROMO_CONTAINER: str = "promo-media"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

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
