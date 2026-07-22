# NutriAdd Backend

FastAPI + MySQL backend for the NutriAdd e-commerce product-showcase site. Consumed by the React SPA in `frontend/` over REST, all endpoints mounted under `/api/v1`. Production target: an Azure Ubuntu VM (Gunicorn + Uvicorn workers behind Nginx, no Docker) with Azure Database for MySQL Flexible Server and Azure Blob Storage for media.

## Stack

- FastAPI + Uvicorn (served by Gunicorn in production)
- SQLAlchemy 2.0 (async) + aiomysql (MySQL driver)
- Alembic for migrations (MySQL / InnoDB / utf8mb4)
- Azure Blob Storage (`azure-storage-blob`) for all product/promo/document media — the DB stores only URLs
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

- `DATABASE_URL` — your MySQL connection string (async `aiomysql` driver), e.g. local dev:
  `mysql+aiomysql://myuser:mypassword@localhost:3306/nutriadd`
- `JWT_SECRET_KEY` — a long random secret. Generate one with:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(64))"
  ```
- `CORS_ORIGINS` — comma-separated (or JSON array) list of allowed frontend origins (defaults to `http://localhost:5173`, the Vite dev server).
- `AZURE_STORAGE_CONNECTION_STRING` — optional locally. When empty, the seed script stores slug placeholders for images and the frontend falls back to its bundled assets, so you can develop without Azure. Set it to upload media to Blob Storage.

Make sure the database (schema) referenced by `DATABASE_URL` already exists (e.g. `CREATE DATABASE nutriadd CHARACTER SET utf8mb4;`) — Alembic creates the tables, not the database itself.

## 3. Run database migrations

With the venv active and `.env` configured:

```bash
alembic upgrade head
```

This creates all tables (`users`, `categories`, `products`, `orders`, `order_items`, `contact_messages`) against your MySQL instance.

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

Tests run against an in-memory SQLite database (via `aiosqlite`), so they do **not** require MySQL to be running. `get_db` is overridden in `tests/conftest.py` to point at the test database, and tables are created/dropped per test via `Base.metadata.create_all`/`drop_all` (Alembic is not used for tests).

## Project layout

```
app/
  main.py            FastAPI app factory, CORS, routers, global exception handlers
  core/               settings, security (JWT/password hashing), auth dependencies
  db/                 SQLAlchemy declarative base + async engine/session (aiomysql + Azure TLS)
  models/              SQLAlchemy ORM models
  schemas/              Pydantic request/response models
  routers/               API route handlers, one module per resource
  services/               business logic (auth, products, orders, storage_service = Azure Blob)
alembic/                  migrations (MySQL / InnoDB / utf8mb4)
scripts/seed_products.py   idempotent product/category seed script (+ Blob media upload)
deploy/                    Gunicorn config, systemd unit + Nginx config for the Azure VM
tests/                      pytest suite (SQLite-backed)
```

## API overview

All routes are prefixed with `/api/v1`.

- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/change-password`, `POST /auth/forgot-password`
- `GET /products`, `GET /products/{slug}`, `GET /categories` — all public
- `POST /orders`, `GET /orders`, `GET /orders/{id}` — Bearer auth required
- `POST /admin/products`, `PUT /admin/products/{id}`, `DELETE /admin/products/{id}`, `POST /admin/media/upload`, `GET /admin/orders`, `PATCH /admin/orders/{id}/status` — Bearer auth + admin role required
- `POST /contact` — public, persists a `ContactMessage` row (separate from the existing Vercel/Resend `/api/contact.ts` function used by the frontend)

Every error response has the shape `{"detail": "..."}`.

## Notes / known follow-ups

- Refresh/logout tokens are stateless JWTs — there is no revocation store yet. See the `# TODO` in `app/routers/auth.py` for adding a token-denylist table before relying on `logout` to actually invalidate a refresh token server-side.
- `forgot-password` always returns a generic 202 response and never reveals whether an email is registered. The actual email send is stubbed in `app/services/auth_service.py::send_reset_email` — see the `# TODO` there to wire up a real provider (e.g. Resend/SendGrid).
- Order totals are always computed server-side from the `Product.price` in the database; any `price` field sent by the client in an order request is ignored.

## Production deployment (Azure, no Docker)

Architecture: **Vercel** (React/Vite frontend) → **Azure Ubuntu VM** (FastAPI via Gunicorn + Uvicorn workers behind Nginx, run natively, no Docker) → **Azure Database for MySQL Flexible Server** → **Azure Blob Storage** (all media). **Resend** handles transactional email. Everything is configured through environment variables, so moving between local dev and production requires no code changes. All Azure resources fit comfortably within an **Azure for Students** subscription — pick the smallest/cheapest tier for each.

Put every Azure resource in the **same region and resource group** to minimise latency and cost.

### 1. Create the Azure Linux VM

1. Azure Portal → **Create a resource → Virtual machine**.
2. Image **Ubuntu Server 22.04 LTS**, size **B1s** or **B2s** (Student-eligible burstable tier), authentication **SSH public key**, username e.g. `azureuser`.
3. Under **Networking**, allow inbound ports **SSH (22)**, **HTTP (80)**, **HTTPS (443)** only.
4. Create, then note the VM's **public IP address** (and later, a DNS name if you attach one).

### 2. Connect through SSH

```bash
ssh azureuser@<VM_PUBLIC_IP>
```

Then update the box and enable the firewall:

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install ufw
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 3. Install Python

```bash
sudo apt -y install python3 python3-venv python3-pip git
python3 --version   # expect 3.10+ (Ubuntu 22.04 ships 3.10)
```

### 4. Install the app and its dependencies

Create a dedicated non-root service user, clone the repo, and build a virtualenv:

```bash
sudo adduser --system --group --home /opt/nutriadd nutriadd
sudo mkdir -p /opt/nutriadd && sudo chown nutriadd:nutriadd /opt/nutriadd

sudo -u nutriadd git clone https://github.com/<your-username>/nutriadd.git /opt/nutriadd/repo
sudo ln -s /opt/nutriadd/repo/backend /opt/nutriadd/backend

cd /opt/nutriadd/backend
sudo -u nutriadd python3 -m venv .venv
sudo -u nutriadd .venv/bin/pip install --upgrade pip
sudo -u nutriadd .venv/bin/pip install -r requirements.txt
```

### 5. Configure the MySQL connection (Azure Database for MySQL Flexible Server)

1. Azure Portal → **Create a resource → Azure Database for MySQL → Flexible Server**. Choose the **Burstable B1ms** tier (cheapest), MySQL **8.0**, and set an admin user/password.
2. Under **Networking**, add a **firewall rule** allowing **only the VM's public IP** (do _not_ open `0.0.0.0/0`). Leave "Enforce SSL connection" **enabled** (the default).
3. Create the database (schema) and a least-privilege app user. From the VM (install the client with `sudo apt -y install mysql-client`):
   ```sql
   -- connect: mysql -h <server>.mysql.database.azure.com -u <admin> -p
   CREATE DATABASE nutriadd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'nutriadd_app'@'%' IDENTIFIED BY 'A_STRONG_PASSWORD';
   GRANT SELECT, INSERT, UPDATE, DELETE ON nutriadd.* TO 'nutriadd_app'@'%';
   FLUSH PRIVILEGES;
   ```
4. Your `DATABASE_URL` (used in step 8) is:
   `mysql+aiomysql://nutriadd_app:A_STRONG_PASSWORD@<server>.mysql.database.azure.com:3306/nutriadd`
   TLS is applied automatically for any non-localhost host (see `app/db/base.py`) — no `?ssl=` flag needed.

### 6. Configure Azure Blob Storage

1. Azure Portal → **Create a resource → Storage account**. Performance **Standard**, redundancy **LRS** (cheapest). Under **Advanced**, allow blob public access (needed for public-read marketing media).
2. After creation, go to **Containers** and create two: **`product-images`** and **`promo-media`**, each with public access level **Blob (anonymous read access for blobs only)**. (The seed script also auto-creates them if missing.)
3. Go to **Access keys → Show → Connection string** and copy it. This is your `AZURE_STORAGE_CONNECTION_STRING` (step 8).

### 7. Configure Resend

Resend is used by the frontend's `/api/contact` serverless function (configured in Vercel — see step 15) and by the backend's stubbed password-reset hook. Create an account at [resend.com](https://resend.com), verify your sending domain, and create an API key. You only need to set `RESEND_API_KEY` on the backend once you wire up real email sending (`app/services/auth_service.py::send_reset_email`); the contact form's key lives in Vercel.

### 8. Set environment variables

Create `/opt/nutriadd/backend/.env` from the template and lock it down:

```bash
cd /opt/nutriadd/backend
sudo -u nutriadd cp .env.example .env
sudo -u nutriadd nano .env       # fill in the real values
sudo chmod 600 .env
```

Set at least:
- `DATABASE_URL` — the MySQL URL from step 5
- `JWT_SECRET_KEY` — `python -c "import secrets; print(secrets.token_urlsafe(64))"`
- `CORS_ORIGINS` — your Vercel URL(s), e.g. `https://nutriadd.vercel.app` (add a custom domain here later — no code change)
- `AZURE_STORAGE_CONNECTION_STRING` — from step 6
- `ENVIRONMENT=production`

### 9. Run database migrations

```bash
cd /opt/nutriadd/backend
sudo -u nutriadd .venv/bin/alembic upgrade head
```

This creates all tables against Azure MySQL.

### 10. Seed products

```bash
sudo -u nutriadd .venv/bin/python -m scripts.seed_products
```

With `AZURE_STORAGE_CONNECTION_STRING` set, this uploads each product/promo image to Blob Storage and stores the resulting URLs in the DB. It's idempotent — safe to re-run.

### 11. Configure Gunicorn

Gunicorn (with Uvicorn workers) is already declared in `deploy/gunicorn_conf.py` — it binds to a Unix socket at `/run/nutriadd/gunicorn.sock` and sizes workers from `WEB_CONCURRENCY` (set it to `2` on a 1-vCPU B1s). No edit needed unless you want to tune worker count; it's launched by the systemd service in step 14.

### 12. Configure Nginx

```bash
sudo apt -y install nginx
sudo cp /opt/nutriadd/backend/deploy/nginx.conf.example /etc/nginx/sites-available/nutriadd
# edit the file and replace api.example.com with your domain (or the VM IP for now)
sudo nano /etc/nginx/sites-available/nutriadd
sudo ln -s /etc/nginx/sites-available/nutriadd /etc/nginx/sites-enabled/nutriadd
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Nginx reverse-proxies `:80`/`:443` to the Gunicorn socket — the app itself is never exposed on a public TCP port.

### 13. Configure HTTPS with Let's Encrypt

Once you have a domain (e.g. `api.nutriadd.com`) with an **A record pointing at the VM's public IP**:

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d api.nutriadd.com
```

Certbot obtains the certificate, rewrites the Nginx config to serve HTTPS + redirect HTTP→HTTPS, and installs a systemd timer that auto-renews. Verify renewal with `sudo certbot renew --dry-run`.

### 14. Run the backend as a Linux service

```bash
sudo cp /opt/nutriadd/backend/deploy/nutriadd-backend.service.example /etc/systemd/system/nutriadd-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now nutriadd-backend
sudo systemctl status nutriadd-backend      # should be "active (running)"
```

`Restart=always` + `WantedBy=multi-user.target` mean the API restarts on crash and starts automatically after a VM reboot. Logs: `sudo journalctl -u nutriadd-backend -f`. After pulling new code: `cd /opt/nutriadd/repo && sudo -u nutriadd git pull`, reinstall deps if changed, run migrations, then `sudo systemctl restart nutriadd-backend`.

Verify: `https://api.nutriadd.com/health` returns `{"status": "ok"}` and `/docs` loads.

### 15. Connect the Vercel frontend to the backend

1. In Vercel → the frontend project → **Settings → Environment Variables**:
   - `VITE_API_URL` = `https://api.nutriadd.com/api/v1` (your VM's HTTPS backend URL)
   - `VITE_SITE_URL` = your Vercel URL (e.g. `https://nutriadd.vercel.app`)
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` — for the existing `/api/contact` function
2. Redeploy the frontend so `VITE_API_URL` is baked into the build.
3. Make sure the Vercel origin is present in the backend's `CORS_ORIGINS` (step 8), then restart the backend if you changed it.
4. **Custom frontend domain later:** add it in Vercel → **Settings → Domains**, update `VITE_SITE_URL`, and append it to the backend's `CORS_ORIGINS` — no code changes on either side.

### Extending this architecture

The layout (`routers/` → `services/` → `models/`, one module per resource) is intentionally set up so new features slot in without restructuring:

- **Payments** — new `app/services/payment_service.py` + a `payments` router; order status transitions already live in `order_service.py`.
- **Inventory** — add a `stock` column/service on top of the existing `Product` model; the admin router already has product CRUD to extend.
- **Admin dashboard** — the `/admin/*` endpoints already enforce Bearer auth + admin role; a dashboard frontend just consumes them.
- **Analytics** — add an async task/service reading from the existing `orders`/`products` tables; no schema changes required to start.
- **AI integrations** — add a new router + service module (e.g. product recommendations) that calls out to an LLM provider; follows the same pattern as `auth_service.py`.
- **Cloud storage / downloads** — `app/services/storage_service.py` already wraps Azure Blob Storage; add a `documents` container for PDFs and reuse `POST /admin/media/upload` (it accepts `application/pdf`).

Each of these is additive — new routers, new service modules, new Alembic migrations — rather than a rewrite of what's here.
