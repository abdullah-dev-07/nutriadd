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

Architecture: **Vercel** (React/Vite frontend) → **Railway** (FastAPI backend, no Docker — Nixpacks builds it natively from `requirements.txt`) → **Neon** (managed serverless Postgres). Frontend and backend talk over plain HTTPS/REST, configured entirely through environment variables, so nothing above needs code changes to move from local dev to production.

### 1. Database — Neon

1. Create a project at [neon.tech](https://neon.tech) (free tier is enough to start).
2. Copy the connection string from the Neon dashboard. It looks like:
   `postgresql://neondb_owner:xxxx@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`
3. Adapt it for this app's async driver — change the scheme to `postgresql+asyncpg` and swap `sslmode=require` for `ssl=require` (asyncpg's query-param spelling):
   `postgresql+asyncpg://neondb_owner:xxxx@ep-xxxx.region.aws.neon.tech/neondb?ssl=require`
4. This becomes `DATABASE_URL` in Railway (step 2). Neon's free tier auto-suspends when idle and wakes on the next request — the first request after idle takes a bit longer, which is normal.

### 2. Backend — Railway

1. Create a new Railway project → **Deploy from GitHub repo**, pick this repo.
2. In the service's **Settings → Root Directory**, set it to `backend` (this is a monorepo — the frontend lives at the repo root). Railway's Nixpacks builder then auto-detects Python from `requirements.txt` and `.python-version`, and uses the `Procfile`'s `web:` line as the start command — no Dockerfile involved.
3. Under **Variables**, set:
   - `DATABASE_URL` — the Neon URL from step 1
   - `JWT_SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"`
   - `CORS_ORIGINS` — your Vercel URL(s), comma-separated, e.g. `https://nutriadd.vercel.app` (add your custom domain here later — no redeploy of code needed, just update this variable)
   - `ENVIRONMENT=production`
   - (`JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` are optional — sane defaults are baked in)
   - Railway injects `PORT` automatically; the `Procfile` already binds to it.
4. Deploy. Railway gives you a `*.up.railway.app` URL — copy it.
5. Run the migrations and seed once against the new database, from your machine (with the venv active and `DATABASE_URL` pointed at Neon) or via `railway run`:
   ```bash
   railway run alembic upgrade head
   railway run python -m scripts.seed_products
   ```
   (Railway doesn't auto-run `release`-style processes — migrations must be triggered manually, which also gives you control over when schema changes actually land.)
6. Verify: `https://<your-service>.up.railway.app/health` should return `{"status": "ok"}`, and `/docs` should load the interactive API docs.

### 3. Frontend — Vercel

1. Import this repo into Vercel (root directory stays the repo root — Vercel only sees the frontend files; `backend/` is irrelevant to the Vite build).
2. Under **Settings → Environment Variables**, set:
   - `VITE_API_URL` = `https://<your-railway-service>.up.railway.app/api/v1`
   - `VITE_SITE_URL` = your Vercel URL (e.g. `https://nutriadd.vercel.app`)
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — for the existing `/api/contact` serverless function
3. Deploy. Continue using the free `*.vercel.app` domain during development.
4. **Custom domain later:** add it under **Settings → Domains** in Vercel, then update `VITE_SITE_URL` and add the new domain to Railway's `CORS_ORIGINS` — no code changes either side.

### Extending this architecture

The layout (`routers/` → `services/` → `models/`, one module per resource) is intentionally set up so new features slot in without restructuring:

- **Payments** — new `app/services/payment_service.py` + a `payments` router; order status transitions already live in `order_service.py`.
- **Inventory** — add a `stock` column/service on top of the existing `Product` model; the admin router already has product CRUD to extend.
- **Admin dashboard** — the `/admin/*` endpoints already enforce Bearer auth + admin role; a dashboard frontend just consumes them.
- **Analytics** — add an async task/service reading from the existing `orders`/`products` tables; no schema changes required to start.
- **AI integrations** — add a new router + service module (e.g. product recommendations) that calls out to an LLM provider; follows the same pattern as `auth_service.py`.
- **Cloud storage** (product images, uploads) — swap the current static `image_key` convention for a service wrapping S3/R2/Cloudinary; only `product_service.py` and the relevant schema need to change.

Each of these is additive — new routers, new service modules, new Alembic migrations — rather than a rewrite of what's here.
