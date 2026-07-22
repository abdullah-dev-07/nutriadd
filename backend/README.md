# NutriAdd Backend

FastAPI + PostgreSQL backend for the NutriAdd e-commerce product-showcase site. Consumed by the React SPA in `frontend/` over REST, all endpoints mounted under `/api/v1`.

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
- `CORS_ORIGINS` — comma-separated (or JSON array) list of allowed frontend origins (defaults to `http://localhost:5173`, the Vite dev server).

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

## Production deployment

Architecture: **Vercel** (React/Vite frontend) → **Render** (FastAPI backend, no Docker — Render's native Python runtime builds it straight from `requirements.txt`) → **Neon** (managed serverless Postgres). Frontend and backend talk over plain HTTPS/REST, configured entirely through environment variables, so nothing above needs code changes to move from local dev to production.

### 1. Database — Neon

1. Create a project at [neon.tech](https://neon.tech) (free tier is enough to start).
2. In the Neon dashboard's **Connection Details** widget, toggle **"Pooled connection"** ON, then copy the string. It looks like:
   `postgresql://neondb_owner:xxxx@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
   (note the `-pooler` in the hostname — that's Neon's PgBouncer endpoint. Use the pooled string for the deployed app; it copes far better with a web service that opens/closes many short-lived connections and with Neon's autosuspend/resume than a direct connection would.)
3. Adapt it for this app's async driver — change the scheme to `postgresql+asyncpg` and swap `sslmode=require` for `ssl=require` (asyncpg's query-param spelling):
   `postgresql+asyncpg://neondb_owner:xxxx@ep-xxxx-pooler.region.aws.neon.tech/neondb?ssl=require`
4. This becomes the `DATABASE_URL` env var in Render (step 2). `app/db/base.py` already disables asyncpg's server-side prepared-statement cache automatically whenever it sees `postgresql+asyncpg` — this is required for the pooled/PgBouncer connection to work; you don't need to do anything extra for it.
5. Neon's free tier auto-suspends the compute when idle and wakes on the next request — the first request after idle takes a bit longer, which is normal.
6. For one-off tasks from your own machine (running Alembic migrations, the seed script), you can use either the pooled or the direct (non-`-pooler`) string — both work fine for short-lived local sessions.

### 2. Backend — Render

1. Go to [render.com](https://render.com) → **New → Web Service** → connect this GitHub repo.
2. This repo includes `backend/render.yaml`, so Render should offer to use it as a **Blueprint** — accept that, or otherwise configure manually:
   - **Root Directory:** `backend` (this is a monorepo — the frontend lives in `frontend/`)
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
3. Under **Environment**, set:
   - `DATABASE_URL` — the pooled Neon URL from step 1
   - `JWT_SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"`
   - `CORS_ORIGINS` — your Vercel URL(s), comma-separated, e.g. `https://nutriadd.vercel.app` (add your custom domain here later — no redeploy of code needed, just update this variable)
   - `ENVIRONMENT=production`
   - (`JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` are optional — sane defaults are baked in)
   - Render injects `PORT` automatically; the start command already binds to it.
4. Deploy. Render gives you a `*.onrender.com` URL — copy it.
5. Run the migrations and seed once against the new database:
   ```bash
   alembic upgrade head
   python -m scripts.seed_products
   ```
   Run this either from your own machine (venv active, `DATABASE_URL` pointed at Neon — direct or pooled, either works for a short-lived local session), or from Render's **Shell** tab on the service, which drops you into the deployed environment with its env vars already set. Render doesn't auto-run migrations on deploy — triggering them manually gives you control over when schema changes actually land. Note Render's free tier spins the service down after inactivity and takes ~30–60s to wake on the next request; that's expected.
6. Verify: `https://<your-service>.onrender.com/health` should return `{"status": "ok"}`, and `/docs` should load the interactive API docs.

### 3. Frontend — Vercel

1. Import this repo into Vercel and set **Settings → Root Directory** to `frontend` (this is a monorepo; `backend/` is irrelevant to the Vite build).
2. Under **Settings → Environment Variables**, set:
   - `VITE_API_URL` = `https://<your-render-service>.onrender.com/api/v1`
   - `VITE_SITE_URL` = your Vercel URL (e.g. `https://nutriadd.vercel.app`)
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — for the existing `/api/contact` serverless function
3. Deploy. Continue using the free `*.vercel.app` domain during development.
4. **Custom domain later:** add it under **Settings → Domains** in Vercel, then update `VITE_SITE_URL` and add the new domain to Render's `CORS_ORIGINS` — no code changes either side.

### Extending this architecture

The layout (`routers/` → `services/` → `models/`, one module per resource) is intentionally set up so new features slot in without restructuring:

- **Payments** — new `app/services/payment_service.py` + a `payments` router; order status transitions already live in `order_service.py`.
- **Inventory** — add a `stock` column/service on top of the existing `Product` model; the admin router already has product CRUD to extend.
- **Admin dashboard** — the `/admin/*` endpoints already enforce Bearer auth + admin role; a dashboard frontend just consumes them.
- **Analytics** — add an async task/service reading from the existing `orders`/`products` tables; no schema changes required to start.
- **AI integrations** — add a new router + service module (e.g. product recommendations) that calls out to an LLM provider; follows the same pattern as `auth_service.py`.
- **Cloud storage** (product images, uploads) — swap the current static `image_key` convention for a service wrapping S3/R2/Cloudinary; only `product_service.py` and the relevant schema need to change.

Each of these is additive — new routers, new service modules, new Alembic migrations — rather than a rewrite of what's here.
