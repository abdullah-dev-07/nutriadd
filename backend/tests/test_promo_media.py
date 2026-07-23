"""Promo media showcase endpoints.

These exercise real response serialization (create -> read back), which is what
catches schema/ORM mismatches such as a str-Enum failing to validate against a
Literal — the bug that made every promo-media response 500 in production.
"""
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.conftest import make_admin, register_and_login


async def _admin_headers(client: AsyncClient, db_session: AsyncSession, email: str) -> dict:
    await register_and_login(client, email=email)
    await make_admin(db_session, email)
    resp = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "supersecret123"}
    )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


async def test_create_and_list_promo_media(client: AsyncClient, db_session: AsyncSession) -> None:
    headers = await _admin_headers(client, db_session, "promoadmin@example.com")

    resp = await client.post(
        "/api/v1/admin/promo-media",
        json={
            "media_type": "image",
            "url": "https://acct.blob.core.windows.net/promo/a.jpeg",
            "alt": "A promo image",
            "caption": "Hello",
        },
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    created = resp.json()
    # The enum must serialize to its plain string value.
    assert created["media_type"] == "image"
    assert created["alt"] == "A promo image"
    assert created["sort_order"] == 1

    # A video, to cover the other enum member.
    resp = await client.post(
        "/api/v1/admin/promo-media",
        json={
            "media_type": "video",
            "url": "https://acct.blob.core.windows.net/promo/b.mp4",
            "alt": "A promo video",
        },
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["media_type"] == "video"
    assert resp.json()["sort_order"] == 2

    # Admin listing (this is the exact call that was 500ing).
    resp = await client.get("/api/v1/admin/promo-media", headers=headers)
    assert resp.status_code == 200, resp.text
    assert [i["media_type"] for i in resp.json()] == ["image", "video"]

    # Public listing requires no auth and returns active items in order.
    resp = await client.get("/api/v1/promo-media")
    assert resp.status_code == 200, resp.text
    assert len(resp.json()) == 2


async def test_delete_and_inactive_promo_media(client: AsyncClient, db_session: AsyncSession) -> None:
    headers = await _admin_headers(client, db_session, "promoadmin2@example.com")

    created = (
        await client.post(
            "/api/v1/admin/promo-media",
            json={
                "media_type": "image",
                "url": "https://acct.blob.core.windows.net/promo/c.jpeg",
                "alt": "Hidden",
            },
            headers=headers,
        )
    ).json()

    # Deactivating hides it from the public endpoint but not from admin.
    resp = await client.put(
        f"/api/v1/admin/promo-media/{created['id']}",
        json={"is_active": False},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["is_active"] is False

    assert (await client.get("/api/v1/promo-media")).json() == []
    assert len((await client.get("/api/v1/admin/promo-media", headers=headers)).json()) == 1

    resp = await client.delete(f"/api/v1/admin/promo-media/{created['id']}", headers=headers)
    assert resp.status_code == 204
    assert len((await client.get("/api/v1/admin/promo-media", headers=headers)).json()) == 0


async def test_promo_media_requires_admin(client: AsyncClient) -> None:
    await register_and_login(client, email="plainuser@example.com")
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "plainuser@example.com", "password": "supersecret123"},
    )
    headers = {"Authorization": f"Bearer {resp.json()['access_token']}"}

    resp = await client.post(
        "/api/v1/admin/promo-media",
        json={
            "media_type": "image",
            "url": "https://acct.blob.core.windows.net/promo/x.jpeg",
            "alt": "Nope",
        },
        headers=headers,
    )
    assert resp.status_code == 403
