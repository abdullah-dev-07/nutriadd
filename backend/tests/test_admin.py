from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_category_and_product, make_admin, register_and_login


async def _admin_headers(client: AsyncClient, db_session: AsyncSession, email: str) -> dict:
    tokens = await register_and_login(client, email=email)
    await make_admin(db_session, email)
    # Re-login so the new access token carries the updated role context.
    resp = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "supersecret123"}
    )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _product_payload(category_id: str) -> dict:
    return {
        "sku": "NA-NEW-30",
        "slug": "new-product",
        "name": "New Product",
        "category_id": category_id,
        "short_description": "A new product.",
        "description": "Full description of the new product.",
        "price": "1234.00",
        "currency": "PKR",
        "availability": "in_stock",
        "image_url": "https://acct.blob.core.windows.net/product-images/new.png",
        "promo_image_url": None,
        "tags": ["new"],
        "benefits": ["Benefit A"],
        "features": ["Feature A"],
        "ingredients": ["Ingredient A"],
        "usage_instructions": None,
        "warnings": None,
    }


async def test_admin_product_crud(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session, product_slug="existing")
    category_id = str(seed["category"].id)
    headers = await _admin_headers(client, db_session, "admin@example.com")

    # Create
    resp = await client.post("/api/v1/admin/products", json=_product_payload(category_id), headers=headers)
    assert resp.status_code == 201, resp.text
    created = resp.json()
    assert created["slug"] == "new-product"
    assert created["features"] == ["Feature A"]
    assert created["ingredients"] == ["Ingredient A"]
    product_id = created["id"]

    # Update
    resp = await client.put(
        f"/api/v1/admin/products/{product_id}",
        json={"price": "999.00", "availability": "out_of_stock"},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["price"] == "999.00"
    assert resp.json()["availability"] == "out_of_stock"

    # Public detail reflects the update
    resp = await client.get("/api/v1/products/new-product")
    assert resp.status_code == 200
    assert resp.json()["price"] == "999.00"

    # Delete
    resp = await client.delete(f"/api/v1/admin/products/{product_id}", headers=headers)
    assert resp.status_code == 204
    resp = await client.get("/api/v1/products/new-product")
    assert resp.status_code == 404


async def test_admin_endpoints_reject_non_admin(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session)
    category_id = str(seed["category"].id)
    tokens = await register_and_login(client, email="regular@example.com")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    resp = await client.post("/api/v1/admin/products", json=_product_payload(category_id), headers=headers)
    assert resp.status_code == 403


async def test_admin_media_upload_rejects_bad_target(client: AsyncClient, db_session: AsyncSession) -> None:
    headers = await _admin_headers(client, db_session, "admin2@example.com")
    resp = await client.post(
        "/api/v1/admin/media/upload?target=evil",
        headers=headers,
        files={"file": ("x.png", b"\x89PNG", "image/png")},
    )
    assert resp.status_code == 400


async def test_admin_media_upload_rejects_bad_type(client: AsyncClient, db_session: AsyncSession) -> None:
    headers = await _admin_headers(client, db_session, "admin3@example.com")
    resp = await client.post(
        "/api/v1/admin/media/upload",
        headers=headers,
        files={"file": ("x.exe", b"MZ", "application/x-msdownload")},
    )
    assert resp.status_code == 415
