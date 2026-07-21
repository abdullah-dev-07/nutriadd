from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import create_category_and_product, make_admin, register_and_login


async def test_create_order_requires_auth(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session)
    product = seed["product"]

    resp = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": str(product.id), "quantity": 2}],
            "customer_name": "Anon",
            "customer_email": "anon@example.com",
            "customer_phone": "0300-0000000",
            "shipping_address": "123 Street",
        },
    )
    assert resp.status_code == 401


async def test_create_order_uses_db_price_not_client_price(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session, price="2500.00")
    product = seed["product"]

    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    resp = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": str(product.id), "quantity": 3, "price": "1.00"}],
            "customer_name": "Buyer One",
            "customer_email": "buyer@example.com",
            "customer_phone": "0300-1111111",
            "shipping_address": "456 Avenue",
        },
        headers=headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["subtotal"] == "7500.00"
    assert body["total"] == "7500.00"
    assert body["items"][0]["unit_price"] == "2500.00"
    assert body["items"][0]["quantity"] == 3
    assert body["items"][0]["product_name"] == "Magtein"


async def test_create_order_invalid_product(client: AsyncClient, db_session: AsyncSession) -> None:
    await create_category_and_product(db_session)
    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    fake_id = "00000000-0000-0000-0000-000000000000"
    resp = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": fake_id, "quantity": 1}],
            "customer_name": "Buyer One",
            "customer_email": "buyer@example.com",
            "customer_phone": "0300-1111111",
            "shipping_address": "456 Avenue",
        },
        headers=headers,
    )
    assert resp.status_code == 400


async def test_create_order_empty_items(client: AsyncClient, db_session: AsyncSession) -> None:
    await create_category_and_product(db_session)
    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    resp = await client.post(
        "/api/v1/orders",
        json={
            "items": [],
            "customer_name": "Buyer One",
            "customer_email": "buyer@example.com",
            "customer_phone": "0300-1111111",
            "shipping_address": "456 Avenue",
        },
        headers=headers,
    )
    assert resp.status_code == 422  # pydantic min_length=1 catches this before service layer


async def test_list_my_orders_and_get_order(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session)
    product = seed["product"]
    tokens = await register_and_login(client)
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    create_resp = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": str(product.id), "quantity": 1}],
            "customer_name": "Buyer One",
            "customer_email": "buyer@example.com",
            "customer_phone": "0300-1111111",
            "shipping_address": "456 Avenue",
        },
        headers=headers,
    )
    order_id = create_resp.json()["id"]

    list_resp = await client.get("/api/v1/orders", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1

    get_resp = await client.get(f"/api/v1/orders/{order_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == order_id


async def test_get_order_forbidden_for_other_user(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session)
    product = seed["product"]

    owner_tokens = await register_and_login(client, email="owner@example.com")
    owner_headers = {"Authorization": f"Bearer {owner_tokens['access_token']}"}
    create_resp = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": str(product.id), "quantity": 1}],
            "customer_name": "Owner",
            "customer_email": "owner@example.com",
            "customer_phone": "0300-2222222",
            "shipping_address": "789 Road",
        },
        headers=owner_headers,
    )
    order_id = create_resp.json()["id"]

    other_tokens = await register_and_login(client, email="other@example.com")
    other_headers = {"Authorization": f"Bearer {other_tokens['access_token']}"}
    forbidden_resp = await client.get(f"/api/v1/orders/{order_id}", headers=other_headers)
    assert forbidden_resp.status_code == 403


async def test_admin_can_view_any_order_and_update_status(client: AsyncClient, db_session: AsyncSession) -> None:
    seed = await create_category_and_product(db_session)
    product = seed["product"]

    owner_tokens = await register_and_login(client, email="owner2@example.com")
    owner_headers = {"Authorization": f"Bearer {owner_tokens['access_token']}"}
    create_resp = await client.post(
        "/api/v1/orders",
        json={
            "items": [{"product_id": str(product.id), "quantity": 1}],
            "customer_name": "Owner2",
            "customer_email": "owner2@example.com",
            "customer_phone": "0300-3333333",
            "shipping_address": "321 Lane",
        },
        headers=owner_headers,
    )
    order_id = create_resp.json()["id"]

    admin_tokens = await register_and_login(client, email="admin@example.com")
    await make_admin(db_session, "admin@example.com")
    # re-login to ensure fresh token (role is read from DB per-request, so not strictly needed)
    admin_login = await client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "supersecret123"}
    )
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    admin_get_resp = await client.get(f"/api/v1/orders/{order_id}", headers=admin_headers)
    assert admin_get_resp.status_code == 200

    admin_list_resp = await client.get("/api/v1/admin/orders", headers=admin_headers)
    assert admin_list_resp.status_code == 200
    assert len(admin_list_resp.json()) == 1

    status_resp = await client.patch(
        f"/api/v1/admin/orders/{order_id}/status", json={"status": "confirmed"}, headers=admin_headers
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "confirmed"

    # Non-admin cannot access admin endpoints
    forbidden_resp = await client.get("/api/v1/admin/orders", headers=owner_headers)
    assert forbidden_resp.status_code == 403
