"""Transactional email via SMTP.

Credentials are read from settings (env vars) — never hardcoded. If SMTP_HOST is
not configured, emails are logged instead of sent so that order creation never
fails because email isn't set up (local dev, or before the mailbox is wired).

Sending is done with the stdlib smtplib inside a threadpool (via asyncio.to_thread)
so the blocking SMTP call doesn't stall the async event loop.
"""
import asyncio
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_sync(to: list[str], subject: str, body: str) -> None:
    if not settings.SMTP_HOST or not settings.EMAIL_FROM:
        logger.info(
            "SMTP not configured — email NOT sent. subject=%r to=%r\n%s",
            subject,
            to,
            body,
        )
        return

    msg = EmailMessage()
    from_display = (
        f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        if settings.EMAIL_FROM_NAME
        else settings.EMAIL_FROM
    )
    msg["From"] = from_display
    msg["To"] = ", ".join(to)
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        if settings.SMTP_USE_SSL:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
                _login_and_send(server, msg)
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                _login_and_send(server, msg)
        logger.info("Email sent: subject=%r to=%r", subject, to)
    except Exception:
        # Email must never break the request that triggered it (e.g. placing an
        # order). Log and move on.
        logger.exception("Failed to send email: subject=%r to=%r", subject, to)


def _login_and_send(server: smtplib.SMTP, msg: EmailMessage) -> None:
    if settings.SMTP_USER:
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
    server.send_message(msg)


async def send_email(to: list[str], subject: str, body: str) -> None:
    """Send an email without blocking the event loop. Safe to call and forget."""
    await asyncio.to_thread(_send_sync, to, subject, body)
