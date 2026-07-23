"""Regression test: 500 responses must carry CORS headers.

Starlette's ServerErrorMiddleware runs OUTSIDE CORSMiddleware, so an unhandled
exception would otherwise produce a response with no Access-Control-Allow-Origin
header. The browser blocks that and the frontend sees an opaque "Load failed"
instead of the real error, which makes every server-side bug undebuggable.
"""
from httpx import ASGITransport, AsyncClient

from app.main import app

ORIGIN = "http://localhost:5173"


async def test_unhandled_error_response_has_cors_headers() -> None:
    @app.get("/_boom_test")
    async def boom() -> dict:
        raise RuntimeError("boom")

    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp = await client.get("/_boom_test", headers={"Origin": ORIGIN})

    assert resp.status_code == 500
    assert resp.json() == {"detail": "Internal server error"}
    # The critical assertion: without the fix this header is absent.
    assert resp.headers.get("access-control-allow-origin") == ORIGIN


async def test_successful_response_has_cors_headers() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        resp = await client.get("/health", headers={"Origin": ORIGIN})

    assert resp.status_code == 200
    assert resp.headers.get("access-control-allow-origin") == ORIGIN
