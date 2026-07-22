import ssl
from urllib.parse import urlsplit

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def _build_connect_args() -> dict:
    """Azure Database for MySQL Flexible Server enforces TLS. aiomysql doesn't read
    an ?ssl= URL flag the way asyncpg does, so we pass an SSLContext explicitly for
    any non-local MySQL host. Local dev (localhost / 127.0.0.1) connects without TLS."""
    if not settings.DATABASE_URL.startswith("mysql+aiomysql"):
        return {}
    host = (urlsplit(settings.DATABASE_URL).hostname or "").lower()
    if host in {"localhost", "127.0.0.1", "::1", ""}:
        return {}
    return {"ssl": ssl.create_default_context()}


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_recycle=280,
    connect_args=_build_connect_args(),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)
