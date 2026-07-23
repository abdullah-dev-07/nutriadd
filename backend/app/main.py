import logging

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_db
from app.routers import admin, auth, categories, contact, orders, products, promo_media

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)

    # NOTE ON MIDDLEWARE ORDER: middleware registered LAST ends up OUTERMOST.
    # This catch-all is registered BEFORE CORSMiddleware so it sits *inside* it —
    # otherwise unhandled errors are turned into 500s by Starlette's
    # ServerErrorMiddleware, which runs outside CORSMiddleware and therefore
    # returns a response with no Access-Control-Allow-Origin header. The browser
    # then blocks it and the frontend sees an opaque "Load failed"/"Failed to fetch"
    # instead of the real error. Catching here keeps CORS headers on 500s.
    @app.middleware("http")
    async def catch_unhandled_errors(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception:
            logger.exception(
                "Unhandled error while processing request %s %s", request.method, request.url
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Internal server error"},
            )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error while processing request %s %s", request.method, request.url)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )

    api_prefix = settings.API_V1_PREFIX
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(products.router, prefix=api_prefix)
    app.include_router(categories.router, prefix=api_prefix)
    app.include_router(orders.router, prefix=api_prefix)
    app.include_router(admin.router, prefix=api_prefix)
    app.include_router(contact.router, prefix=api_prefix)
    app.include_router(promo_media.router, prefix=api_prefix)

    @app.get("/health", tags=["health"])
    async def health() -> dict:
        """Liveness probe — confirms the process is up. Used by systemd/Nginx/uptime
        monitors; intentionally does no I/O so it stays fast and never flaps on a
        transient DB blip."""
        return {"status": "ok"}

    @app.get("/health/ready", tags=["health"])
    async def readiness(db: AsyncSession = Depends(get_db)) -> JSONResponse:
        """Readiness probe — verifies the app can actually reach its dependencies.
        Returns 200 when the database is reachable, 503 otherwise, plus the Blob
        Storage configuration status. Use this to validate production connectivity."""
        checks: dict[str, str] = {}
        try:
            await db.execute(text("SELECT 1"))
            checks["database"] = "ok"
            db_ok = True
        except Exception:
            logger.exception("Readiness check: database is unreachable")
            checks["database"] = "error"
            db_ok = False

        checks["blob_storage"] = (
            "configured" if settings.AZURE_STORAGE_CONNECTION_STRING else "not_configured"
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK if db_ok else status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "ready" if db_ok else "not_ready", "checks": checks},
        )

    return app


app = create_app()
