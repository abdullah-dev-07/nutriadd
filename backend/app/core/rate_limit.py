"""Lightweight in-memory per-IP rate limiter.

Dependency-free (no Redis): a per-process sliding window keyed by client IP.
Because the app runs multiple Gunicorn workers, the effective limit is roughly
(per_minute × worker_count) — that's intentional and fine for the goal here,
which is to stop casual spam/abuse from burning a free-tier API quota, not to
enforce a hard global quota. For a strict global cap, back this with Redis.

Client IP is taken from X-Forwarded-For (set by Nginx) and falls back to the
direct socket peer for local/direct requests.
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # First entry is the original client; the rest are proxies.
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        """Record a hit for `key`; raise 429 if it exceeds the window budget."""
        now = time.monotonic()
        window_start = now - self.window_seconds
        hits = self._hits[key]

        # Drop timestamps outside the window.
        while hits and hits[0] < window_start:
            hits.popleft()

        if len(hits) >= self.max_requests:
            retry_after = int(hits[0] + self.window_seconds - now) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again shortly.",
                headers={"Retry-After": str(max(retry_after, 1))},
            )

        hits.append(now)

        # Opportunistic cleanup so idle keys don't accumulate forever.
        if len(self._hits) > 10_000:
            self._evict_stale(window_start)

    def _evict_stale(self, window_start: float) -> None:
        stale = [k for k, dq in self._hits.items() if not dq or dq[-1] < window_start]
        for k in stale:
            del self._hits[k]
