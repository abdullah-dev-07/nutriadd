# NutriAdd Backend

FastAPI + PostgreSQL backend for the NutriAdd e-commerce product-showcase site. Consumed by the React SPA in the repo root over REST, all endpoints mounted under `/api/v1`.

## Stack

- FastAPI + Uvicorn
- SQLAlchemy 2.0 (async) + asyncpg (PostgreSQL driver)
- Alembic for migrations
- Pydantic v2 / pydantic-settings for config
- python-jose for JWT, passlib[bcrypt] for password hashing
- pytest + httpx + aiosqlite for tests (SQLite in-memory, no real DB needed to test)

## 1. Create a virtual environment and install dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` — your real Postgres connection string, e.g.
  `postgresql+asyncpg://myuser:mypassword@localhost:5432/nutriadd`
- `JWT_SECRET_KEY` — a long random secret. Generate one with:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(64))"
  ```
- `CORS_ORIGINS` — JSON list of allowed frontend origins (defaults to `["http://localhost:5173"]`, the Vite dev server).

Make sure the database referenced by `DATABASE_URL` already exists (e.g. `createdb nutriadd`) — Alembic creates the tables, not the database itself.

## 3. Run database migrations

With the venv active and `.env` configured:

```bash
alembic upgrade head
```

This creates all tables (`users`, `categories`, `products`, `orders`, `order_items`, `contact_messages`) against your real Postgres instance.

## 4. Seed initial product/category data

```bash
python -m scripts.seed_products
```

This is idempotent — it upserts categories and products by slug, so it's safe to re-run any time (e.g. after editing the seed data).

## 5. Run the API server

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now available at `http://localhost:8000/api/v1`. Interactive docs at `http://localhost:8000/docs`. Health check at `http://localhost:8000/health`.

## 6. Run the test suite

```bash
pytest
```

Tests run against an in-memory SQLite database (via `aiosqlite`), so they do **not** require Postgres to be running. `get_db` is overridden in `tests/conftest.py` to point at the test database, and tables are created/dropped per test via `Base.metadata.create_all`/`drop_all` (Alembic is not used for tests).

## Project layout

```
app/
  main.py            FastAPI app factory, CORS, routers, global exception handlers
  core/               settings, security (JWT/password hashing), auth dependencies
  db/                 SQLAlchemy declarative base + async engine/session
  models/              SQLAlchemy ORM models
  schemas/              Pydantic request/response models
  routers/               API route handlers, one module per resource
  services/               business logic (auth, products, orders)
alembic/                  migrations (Postgres-targeted)
scripts/seed_products.py   idempotent product/category seed script
tests/                      pytest suite (SQLite-backed)
```

## API overview

All routes are prefixed with `/api/v1`.

- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`, `POST /auth/forgot-password`
- `GET /products`, `GET /products/{slug}`, `GET /categories` — all public
- `POST /orders`, `GET /orders`, `GET /orders/{id}` — Bearer auth required
- `POST /admin/products`, `PUT /admin/products/{id}`, `DELETE /admin/products/{id}`, `GET /admin/orders`, `PATCH /admin/orders/{id}/status` — Bearer auth + admin role required
- `POST /contact` — public, persists a `ContactMessage` row (separate from the existing Vercel/Resend `/api/contact.ts` function used by the frontend)

Every error response has the shape `{"detail": "..."}`.

## Notes / known follow-ups

- Refresh/logout tokens are stateless JWTs — there is no revocation store yet. See the `# TODO` in `app/routers/auth.py` for adding a token-denylist table before relying on `logout` to actually invalidate a refresh token server-side.
- `forgot-password` always returns a generic 202 response and never reveals whether an email is registered. The actual email send is stubbed in `app/services/auth_service.py::send_reset_email` — see the `# TODO` there to wire up a real provider (e.g. Resend/SendGrid).
- Order totals are always computed server-side from the `Product.price` in the database; any `price` field sent by the client in an order request is ignored.
