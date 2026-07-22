"""Gunicorn configuration for the NutriAdd FastAPI backend on the Azure VM.

Referenced by the systemd unit (nutriadd-backend.service) via:
    gunicorn app.main:app -c deploy/gunicorn_conf.py

Gunicorn manages a pool of Uvicorn (ASGI) workers and binds to a Unix socket that
Nginx reverse-proxies to. Tunables are read from the environment so the same file
works across VM sizes without edits.
"""
import multiprocessing
import os

# Bind to a Unix socket (created by systemd's RuntimeDirectory=nutriadd) rather than
# a TCP port, so the app is never directly reachable from the network — only Nginx is.
bind = os.getenv("GUNICORN_BIND", "unix:/run/nutriadd/gunicorn.sock")

# 2 x CPU + 1 is the standard starting point; override with WEB_CONCURRENCY on
# small Student-tier VMs (e.g. WEB_CONCURRENCY=2 on a 1-vCPU B1s).
workers = int(os.getenv("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"

timeout = int(os.getenv("GUNICORN_TIMEOUT", "60"))
graceful_timeout = 30
keepalive = 5

# Recycle workers periodically to bound memory growth.
max_requests = 1000
max_requests_jitter = 100

accesslog = "-"  # stdout -> captured by journald
errorlog = "-"
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")
