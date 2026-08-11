from httpx import AsyncClient

from app.core.security import create_access_token, create_refresh_token, create_reset_token
from tests.conftest import register_and_login


async def _register(client: AsyncClient, email: str) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "supersecret123", "full_name": "Reset User"},
    )


async def test_forgot_password_always_202(client: AsyncClient) -> None:
    # Unknown email still returns 202 (no user enumeration).
    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})
    assert resp.status_code == 202


async def test_reset_password_full_flow(client: AsyncClient, db_session) -> None:
    from sqlalchemy import select

    from app.models.user import User

    await _register(client, "reset@example.com")
    user = (await db_session.execute(select(User).where(User.email == "reset@example.com"))).scalar_one()

    token = create_reset_token(str(user.id))
    resp = await client.post(
        "/api/v1/auth/reset-password", json={"token": token, "new_password": "brandnewpass123"}
    )
    assert resp.status_code == 204

    # Old password no longer works; new one does.
    old = await client.post(
        "/api/v1/auth/login", json={"email": "reset@example.com", "password": "supersecret123"}
    )
    assert old.status_code == 401
    new = await client.post(
        "/api/v1/auth/login", json={"email": "reset@example.com", "password": "brandnewpass123"}
    )
    assert new.status_code == 200


async def test_reset_password_rejects_wrong_token_type(client: AsyncClient, db_session) -> None:
    from sqlalchemy import select

    from app.models.user import User

    await _register(client, "reset2@example.com")
    user = (await db_session.execute(select(User).where(User.email == "reset2@example.com"))).scalar_one()

    # An access/refresh token must NOT be usable as a reset token.
    for bad in (create_access_token(str(user.id)), create_refresh_token(str(user.id))):
        resp = await client.post(
            "/api/v1/auth/reset-password", json={"token": bad, "new_password": "whatever12345"}
        )
        assert resp.status_code == 400


async def test_reset_password_rejects_garbage_token(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/reset-password", json={"token": "not-a-real-token", "new_password": "whatever12345"}
    )
    assert resp.status_code == 400


async def test_reset_password_requires_min_length(client: AsyncClient, db_session) -> None:
    from sqlalchemy import select

    from app.models.user import User

    await _register(client, "reset3@example.com")
    user = (await db_session.execute(select(User).where(User.email == "reset3@example.com"))).scalar_one()
    token = create_reset_token(str(user.id))
    resp = await client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "short"})
    assert resp.status_code == 422  # pydantic min_length=8
