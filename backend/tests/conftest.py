from typing import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.deps import get_db
from app.db.base import Base
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


async def register_and_login(client: AsyncClient, email: str = "buyer@example.com") -> dict:
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "supersecret123", "full_name": "Buyer One"},
    )
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "supersecret123"})
    return resp.json()


async def make_admin(db_session: AsyncSession, email: str) -> None:
    from sqlalchemy import select

    from app.models.user import User, UserRole

    result = await db_session.execute(select(User).where(User.email == email))
    user = result.scalar_one()
    user.role = UserRole.admin
    db_session.add(user)
    await db_session.commit()


async def create_category_and_product(
    db_session: AsyncSession,
    slug: str = "brain-cognitive-health",
    product_slug: str = "magtein",
    price: str = "2500.00",
) -> dict:
    from app.models.category import Category
    from app.models.product import Product

    category = Category(name="Brain & Cognitive Health", slug=slug)
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)

    product = Product(
        sku="NA-MAG-30",
        slug=product_slug,
        name="Magtein",
        category_id=category.id,
        short_description="Magnesium L-Threonate for brain health.",
        description="Full description here.",
        price=price,
        currency="PKR",
        image_key=product_slug,
        tags=["brain health"],
        benefits=["Memory Support"],
    )
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(product)

    return {"category": category, "product": product}

