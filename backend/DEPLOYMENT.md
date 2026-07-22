# NutriAdd Backend — Operations Runbook (Azure VM)

Day-2 operational commands for the FastAPI backend running natively (no Docker) on
an Azure Ubuntu VM, with Azure Database for MySQL Flexible Server and Azure Blob
Storage. First-time VM provisioning is in [README.md](README.md#production-deployment-azure-no-docker);
this file is the reference for running, updating, and recovering the deployed service.

Assumed layout on the VM (adjust paths if yours differ):

| Thing | Path |
| --- | --- |
| Repo clone | `/opt/nutriadd/repo` |
| Backend dir (symlink) | `/opt/nutriadd/backend` → `repo/backend` |
| Virtualenv | `/opt/nutriadd/backend/.venv` |
| Env file | `/opt/nutriadd/backend/.env` (chmod 600) |
| Service user | `nutriadd` |
| systemd unit | `/etc/systemd/system/nutriadd-backend.service` |
| Nginx site | `/etc/nginx/sites-available/nutriadd` |
| Gunicorn socket | `/run/nutriadd/gunicorn.sock` |

---

## 1. Environment variables

Live in `/opt/nutriadd/backend/.env` (never committed). Full template: [.env.example](.env.example).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | `mysql+aiomysql://user:pass@<server>.mysql.database.azure.com:3306/nutriadd` (TLS auto-applied for non-localhost) |
| `JWT_SECRET_KEY` | `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `CORS_ORIGINS` | Vercel URL(s), comma-separated, e.g. `https://nutriadd.vercel.app` |
| `AZURE_STORAGE_CONNECTION_STRING` | Storage account → Access keys → Connection string |
| `AZURE_STORAGE_PRODUCT_CONTAINER` | `product-images` |
| `AZURE_STORAGE_PROMO_CONTAINER` | `promo-media` |
| `ENVIRONMENT` | `production` |

After editing `.env`: `sudo systemctl restart nutriadd-backend`.

## 2. Alembic (database migrations)

Run as the service user from the backend dir so it picks up `.env`:

```bash
cd /opt/nutriadd/backend
sudo -u nutriadd .venv/bin/alembic upgrade head      # apply all migrations
sudo -u nutriadd .venv/bin/alembic current            # show current revision
sudo -u nutriadd .venv/bin/alembic history            # list revisions
sudo -u nutriadd .venv/bin/alembic downgrade -1       # roll back one revision
```

## 3. Seed products (idempotent)

Uploads each product/promo image to Blob Storage and stores the URLs. Safe to re-run.

```bash
cd /opt/nutriadd/backend
sudo -u nutriadd .venv/bin/python -m scripts.seed_products
```

## 4. Create the first admin user

`register` always creates a normal user. Promote one to admin directly in MySQL
(there is intentionally no public endpoint that grants admin):

```bash
# 1. Register the account through the app (or the API):
curl -X POST https://<your-domain>/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"a-strong-password","full_name":"Owner"}'

# 2. Promote it to admin in MySQL:
mysql -h <server>.mysql.database.azure.com -u <admin_user> -p nutriadd \
  -e "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

Log out and back in on the site — the admin dashboard link (top nav) and `/admin`
now work: manage products (create/edit/delete) and upload promo images/videos to
Blob Storage.

## 5. Gunicorn (process manager)

Gunicorn runs under systemd (below), not by hand. Config: [deploy/gunicorn_conf.py](deploy/gunicorn_conf.py)
(Unix socket, `uvicorn.workers.UvicornWorker`, `WEB_CONCURRENCY` workers). To run it
manually for debugging:

```bash
cd /opt/nutriadd/backend
sudo -u nutriadd WEB_CONCURRENCY=2 GUNICORN_BIND=127.0.0.1:8000 \
  .venv/bin/gunicorn app.main:app -c deploy/gunicorn_conf.py
```

## 6. systemd service (auto-start, restart, logs)

Unit template: [deploy/nutriadd-backend.service.example](deploy/nutriadd-backend.service.example).
Installed once, it auto-starts on boot (`WantedBy=multi-user.target`) and restarts on
crash (`Restart=always`).

```bash
sudo systemctl status nutriadd-backend        # health
sudo systemctl restart nutriadd-backend        # restart (after code/env change)
sudo systemctl stop nutriadd-backend
sudo systemctl start nutriadd-backend
sudo systemctl enable nutriadd-backend         # ensure start-on-boot
sudo journalctl -u nutriadd-backend -f         # live logs
sudo journalctl -u nutriadd-backend --since "1 hour ago"
```

## 7. Nginx (reverse proxy + TLS)

Config: [deploy/nginx.conf.example](deploy/nginx.conf.example). TLS via certbot.

```bash
sudo nginx -t                       # validate config
sudo systemctl reload nginx         # apply config changes
sudo certbot renew --dry-run        # test Let's Encrypt auto-renewal
```

## 8. Health checks

```bash
curl -s https://<your-domain>/health         # liveness -> {"status":"ok"}
curl -s https://<your-domain>/health/ready    # readiness -> DB + Blob status, 503 if DB down
```

Interactive API docs: `https://<your-domain>/docs`.

---

## Update procedure (deploy new code)

```bash
cd /opt/nutriadd/repo
sudo -u nutriadd git pull                                   # 1. fetch new code
cd /opt/nutriadd/backend
sudo -u nutriadd .venv/bin/pip install -r requirements.txt  # 2. deps (if changed)
sudo -u nutriadd .venv/bin/alembic upgrade head             # 3. migrations (if any)
sudo systemctl restart nutriadd-backend                     # 4. restart
sudo systemctl status nutriadd-backend                      # 5. verify
curl -s https://<your-domain>/health/ready                  # 6. verify connectivity
```

The frontend deploys separately on Vercel (auto-builds on git push; set
`VITE_API_URL=https://<your-domain>/api/v1` in Vercel env vars).

## Rollback procedure

```bash
cd /opt/nutriadd/repo
sudo -u nutriadd git log --oneline -n 10                    # find the last-good commit
sudo -u nutriadd git checkout <good-commit-sha>             # or: git reset --hard <sha>
cd /opt/nutriadd/backend
sudo -u nutriadd .venv/bin/pip install -r requirements.txt
# If the bad deploy applied a migration, undo it BEFORE restarting:
sudo -u nutriadd .venv/bin/alembic downgrade -1
sudo systemctl restart nutriadd-backend
sudo systemctl status nutriadd-backend
```

Rule of thumb: roll code back to the matching migration revision. If unsure what a
release changed, `alembic history` shows the revision order.

## Backup strategy

**Database (authoritative data):**
- Azure MySQL Flexible Server takes **automated daily backups** with point-in-time
  restore (retention configurable in the portal under *Backup and restore* — set 7–35
  days). Verify retention is enabled; this is your primary recovery path.
- Manual logical dump before risky changes:
  ```bash
  mysqldump -h <server>.mysql.database.azure.com -u <admin> -p \
    --single-transaction --set-gtid-purged=OFF nutriadd > nutriadd_$(date +%F).sql
  ```
- Restore a dump:
  ```bash
  mysql -h <server>.mysql.database.azure.com -u <admin> -p nutriadd < nutriadd_YYYY-MM-DD.sql
  ```

**Blob Storage (media):** enable **soft delete** for blobs/containers on the storage
account (portal → Data protection) so deleted media can be recovered. Media is also
re-uploadable by re-running the seed script from the repo's bundled assets.

**Config:** keep a copy of `.env` somewhere secure (a password manager / Azure Key
Vault). It's the only unversioned, unrecoverable piece.

**VM:** optionally enable Azure Backup on the VM for full-disk restore, but the VM is
largely disposable — the repo + `.env` + this runbook fully reconstruct it.

## Common issues

| Symptom | Check |
| --- | --- |
| 502 from Nginx | `systemctl status nutriadd-backend`; socket exists at `/run/nutriadd/`? |
| `/health/ready` → 503 | DB unreachable — check `DATABASE_URL`, Azure MySQL firewall allows VM IP |
| Media upload → 503 | `AZURE_STORAGE_CONNECTION_STRING` empty/wrong in `.env` |
| CORS error in browser | Vercel origin missing from `CORS_ORIGINS`; restart after editing |
| 401 everywhere after deploy | `JWT_SECRET_KEY` changed — all existing tokens invalidated (expected) |
