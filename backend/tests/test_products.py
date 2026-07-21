from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


async def _seed_two_products(db_session: AsyncSession) -> None:
    from app.models.category import Category
    from app.models.product import Product

    cat1 = Category(name="Brain & Cognitive Health", slug="brain-cognitive-health")
    cat2 = Category(name="Sleep & Relaxation", slug="sleep-relaxation")
    db_session.add_all([cat1, cat2])
    await db_session.commit()
    await db_session.refresh(cat1)
    await db_session.refresh(cat2)

    p1 = Product(
        sku="NA-MAG-30",
        slug="magtein",
        name="Magtein — Magnesium L-Threonate",
        category_id=cat1.id,
        short_description="Magnesium L-Threonate for brain health, calmness and better sleep.",
        description="Full description",
        price="2500.00",
        image_key="magtein",
        tags=["brain health", "magnesium"],
        benefits=["Memory & Mood Support"],
    )
    p2 = Product(
        sku="NA-CLI-30",
        slug="climag",
        name="Climag — Magnesium & Omega3 Glycinate",
        category_id=cat2.id,
        short_description="Magnesium & Omega3 for a balanced you.",
        description="Full description",
        price="2200.00",
        image_key="climag",
        tags=["magnesium", "omega3"],
        benefits=["Promotes Deep Sleep"],
    )
    db_session.add_all([p1, p2])
    await db_session.commit()


async def test_list_products(client: AsyncClient, db_session: AsyncSession) -> None:
    await _seed_two_products(db_session)

    resp = await client.get("/api/v1/products")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 2
    assert len(body["items"]) == 2
    assert body["page"] == 1
    assert body["page_size"] == 12


async def test_search_products(client: AsyncClient, db_session: AsyncSession) -> None:
    await _seed_two_products(db_session)

    resp = await client.get("/api/v1/products", params={"search": "brain health"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["slug"] == "magtein"


async def test_filter_by_category(client: AsyncClient, db_session: AsyncSession) -> None:
    await _seed_two_products(db_session)

    resp = await client.get("/api/v1/products", params={"category": "sleep-relaxation"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["slug"] == "climag"


async def test_filter_by_tag(client: AsyncClient, db_session: AsyncSession) -> None:
    await _seed_two_products(db_session)

    resp = await client.get("/api/v1/products", params={"tag": "omega3"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["items"][0]["slug"] == "climag"


async def test_get_product_detail(client: AsyncClient, db_session: AsyncSession) -> None:
    await _seed_two_products(db_session)

    resp = await client.get("/api/v1/products/magtein")
    assert resp.status_code == 200
    body = resp.json()
    assert body["slug"] == "magtein"
    assert body["category"]["slug"] == "brain-cognitive-health"
    assert body["price"] == "2500.00"


async def test_get_product_detail_not_found(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/products/does-not-exist")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Product not found"


async def test_list_categories(client: AsyncClient, db_session: AsyncSession) -> None:
    await _seed_two_products(db_session)

    resp = await client.get("/api/v1/categories")
    assert resp.status_code == 200
    slugs = {c["slug"] for c in resp.json()}
    assert slugs == {"brain-cognitive-health", "sleep-relaxation"}
