from httpx import AsyncClient

from tests.conftest import register_and_login


def _addr(**over) -> dict:
    return {
        "full_name": "Buyer One",
        "phone": "0300-1111111",
        "address": "456 Avenue, Block A",
        "city": "Lahore",
        **over,
    }


async def test_addresses_require_auth(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/addresses")).status_code == 401


async def test_address_crud_and_default(client: AsyncClient) -> None:
    tokens = await register_and_login(client)
    h = {"Authorization": f"Bearer {tokens['access_token']}"}

    # empty
    assert (await client.get("/api/v1/addresses", headers=h)).json() == []

    # first address becomes default automatically
    r1 = await client.post("/api/v1/addresses", json=_addr(label="Home"), headers=h)
    assert r1.status_code == 201
    a1 = r1.json()
    assert a1["is_default"] is True

    # second address, not default
    r2 = await client.post("/api/v1/addresses", json=_addr(label="Office"), headers=h)
    a2 = r2.json()
    assert a2["is_default"] is False

    # set second as default → first loses default
    setd = await client.post(f"/api/v1/addresses/{a2['id']}/default", headers=h)
    assert setd.status_code == 200
    listing = (await client.get("/api/v1/addresses", headers=h)).json()
    defaults = [a for a in listing if a["is_default"]]
    assert len(defaults) == 1 and defaults[0]["id"] == a2["id"]

    # update first
    upd = await client.put(f"/api/v1/addresses/{a1['id']}", json={"city": "Karachi"}, headers=h)
    assert upd.status_code == 200 and upd.json()["city"] == "Karachi"

    # delete default (a2) → a1 promoted to default
    dele = await client.delete(f"/api/v1/addresses/{a2['id']}", headers=h)
    assert dele.status_code == 204
    remaining = (await client.get("/api/v1/addresses", headers=h)).json()
    assert len(remaining) == 1 and remaining[0]["is_default"] is True


async def test_address_is_per_user(client: AsyncClient) -> None:
    a = await register_and_login(client, email="a@example.com")
    b = await register_and_login(client, email="b@example.com")
    ah = {"Authorization": f"Bearer {a['access_token']}"}
    bh = {"Authorization": f"Bearer {b['access_token']}"}

    created = (await client.post("/api/v1/addresses", json=_addr(), headers=ah)).json()

    # B can't see A's address
    assert (await client.get("/api/v1/addresses", headers=bh)).json() == []
    # B can't modify or delete A's address
    assert (
        await client.put(f"/api/v1/addresses/{created['id']}", json={"city": "X"}, headers=bh)
    ).status_code == 403
    assert (
        await client.delete(f"/api/v1/addresses/{created['id']}", headers=bh)
    ).status_code == 403


async def test_update_profile_name(client: AsyncClient) -> None:
    tokens = await register_and_login(client)
    h = {"Authorization": f"Bearer {tokens['access_token']}"}

    resp = await client.patch("/api/v1/auth/me", json={"full_name": "New Name"}, headers=h)
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "New Name"

    me = await client.get("/api/v1/auth/me", headers=h)
    assert me.json()["full_name"] == "New Name"
