"""Tests for the server-side cart and the hardened order flow
(order number, idempotency, out-of-stock, per-user cart isolation)."""
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_category_and_product, register_and_login


def _order_body(product_id: str, qty: int = 1, **extra) -> dict:
    return {
        "items": [{"product_id": product_id, "quantity": qty}],
        "customer_name": "Buyer",
        "customer_email": "buyer@example.com",
        "customer_phone": "0300-1111111",
        "shipping_address": "456 Avenue, City",
        **extra,
    }


async def test_order_has_order_number(client: AsyncClient, db_session: AsyncSession) -> None:
    product = (await create_category_and_product(db_session))["product"]
    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    resp = await client.post("/api/v1/orders", json=_order_body(str(product.id)), headers=headers)
    assert resp.status_code == 201
    assert resp.json()["order_number"].startswith("NA-")


async def test_order_idempotency_prevents_duplicates(client: AsyncClient, db_session: AsyncSession) -> None:
    product = (await create_category_and_product(db_session))["product"]
    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    body = _order_body(str(product.id), idempotency_key="abc-123")
    r1 = await client.post("/api/v1/orders", json=body, headers=headers)
    r2 = await client.post("/api/v1/orders", json=body, headers=headers)
    assert r1.status_code == 201 and r2.status_code == 201
    # Same order returned, not a duplicate.
    assert r1.json()["id"] == r2.json()["id"]

    my_orders = await client.get("/api/v1/orders", headers=headers)
    assert len(my_orders.json()) == 1


async def test_order_rejects_out_of_stock(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session)
    product = seed["product"]
    product.availability = "out_of_stock"
    db_session.add(product)
    await db_session.commit()

    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    resp = await client.post("/api/v1/orders", json=_order_body(str(product.id)), headers=headers)
    assert resp.status_code == 409


async def test_cart_requires_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/cart")).status_code == 401


async def test_cart_add_update_remove_flow(client: AsyncClient, db_session: AsyncSession) -> None:
    product = (await create_category_and_product(db_session, price="2500.00"))["product"]
    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    # empty
    resp = await client.get("/api/v1/cart", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["items"] == []

    # add
    resp = await client.post(
        "/api/v1/cart/items", json={"product_id": str(product.id), "quantity": 2}, headers=headers
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["total_quantity"] == 2
    assert body["subtotal"] == "5000.00"
    assert body["items"][0]["unit_price"] == "2500.00"  # live price, not client-supplied

    # update
    resp = await client.put(
        f"/api/v1/cart/items/{product.id}", json={"quantity": 3}, headers=headers
    )
    assert resp.json()["total_quantity"] == 3

    # remove
    resp = await client.delete(f"/api/v1/cart/items/{product.id}", headers=headers)
    assert resp.json()["items"] == []


async def test_cart_is_per_user(client: AsyncClient, db_session: AsyncSession) -> None:
    product = (await create_category_and_product(db_session))["product"]

    a = await register_and_login(client, email="a@example.com")
    b = await register_and_login(client, email="b@example.com")
    a_headers = {"Authorization": f"Bearer {a['access_token']}"}
    b_headers = {"Authorization": f"Bearer {b['access_token']}"}

    await client.post(
        "/api/v1/cart/items", json={"product_id": str(product.id), "quantity": 1}, headers=a_headers
    )
    # User B's cart is unaffected.
    b_cart = await client.get("/api/v1/cart", headers=b_headers)
    assert b_cart.json()["items"] == []
