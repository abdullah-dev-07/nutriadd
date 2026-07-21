from httpx import AsyncClient


async def test_register_login_me_refresh_change_password_flow(client: AsyncClient) -> None:
    register_payload = {
        "email": "jane@example.com",
        "password": "supersecret123",
        "full_name": "Jane Doe",
    }
    register_resp = await client.post("/api/v1/auth/register", json=register_payload)
    assert register_resp.status_code == 201
    body = register_resp.json()
    assert body["email"] == "jane@example.com"
    assert body["full_name"] == "Jane Doe"
    assert body["role"] == "user"

    # Duplicate registration should conflict
    dup_resp = await client.post("/api/v1/auth/register", json=register_payload)
    assert dup_resp.status_code == 409

    # Login
    login_resp = await client.post(
        "/api/v1/auth/login", json={"email": "jane@example.com", "password": "supersecret123"}
    )
    assert login_resp.status_code == 200
    tokens = login_resp.json()
    assert tokens["token_type"] == "bearer"
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # Bad login
    bad_login_resp = await client.post(
        "/api/v1/auth/login", json={"email": "jane@example.com", "password": "wrongpassword"}
    )
    assert bad_login_resp.status_code == 401

    # /me
    me_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "jane@example.com"

    # No auth on /me
    unauth_resp = await client.get("/api/v1/auth/me")
    assert unauth_resp.status_code == 401

    # Refresh
    refresh_resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_resp.status_code == 200
    new_tokens = refresh_resp.json()
    assert new_tokens["access_token"]
    assert new_tokens["refresh_token"]

    # Change password - wrong current password
    bad_change_resp = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "wrongpassword", "new_password": "newpassword123"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert bad_change_resp.status_code == 400

    # Change password - success
    change_resp = await client.post(
        "/api/v1/auth/change-password",
        json={"current_password": "supersecret123", "new_password": "newpassword123"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert change_resp.status_code == 204

    # Login with new password
    relogin_resp = await client.post(
        "/api/v1/auth/login", json={"email": "jane@example.com", "password": "newpassword123"}
    )
    assert relogin_resp.status_code == 200


async def test_forgot_password_always_202(client: AsyncClient) -> None:
    resp = await client.post("/api/v1/auth/forgot-password", json={"email": "doesnotexist@example.com"})
    assert resp.status_code == 202
    assert "message" in resp.json()


async def test_register_password_too_short(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "short@example.com", "password": "short", "full_name": "Short Pass"},
    )
    assert resp.status_code == 422
