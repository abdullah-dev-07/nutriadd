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

    # Database (Neon Postgres in production — include "?ssl=require" in the URL)
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/nutriadd"

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS — accepts either a JSON array ("[\"https://a.com\",\"https://b.com\"]")
    # or a plain comma-separated string ("https://a.com,https://b.com"), so it's
    # easy to paste into Railway's env var UI without worrying about JSON quoting.
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
