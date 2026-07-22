from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


# Neon's pooled (PgBouncer, transaction-mode) connection string doesn't support
# asyncpg's server-side prepared statement cache, so disable it whenever the
# driver is asyncpg. This is a no-op for the direct (non-pooled) Neon string too.
_connect_args = {"statement_cache_size": 0} if settings.DATABASE_URL.startswith("postgresql+asyncpg") else {}

engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True, connect_args=_connect_args)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)
