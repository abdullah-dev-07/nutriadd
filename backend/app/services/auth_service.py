import logging
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    TOKEN_TYPE_REFRESH,
    TOKEN_TYPE_RESET,
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import RefreshedToken, Token
from app.schemas.user import UserCreate
from app.services import email_service

logger = logging.getLogger(__name__)


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def register_user(db: AsyncSession, payload: UserCreate) -> User:
    existing = await get_user_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    return user


def issue_tokens(user: User) -> Token:
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user,
    )


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> RefreshedToken:
    try:
        payload = decode_token(refresh_token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    if payload.get("type") != TOKEN_TYPE_REFRESH:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    try:
        user_uuid = uuid.UUID(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    # Rotate the refresh token
    new_access_token = create_access_token(str(user.id))
    new_refresh_token = create_refresh_token(str(user.id))
    return RefreshedToken(access_token=new_access_token, refresh_token=new_refresh_token)


async def change_password(db: AsyncSession, user: User, current_password: str, new_password: str) -> None:
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    user.hashed_password = hash_password(new_password)
    db.add(user)
    await db.commit()


async def send_reset_email(email: str, name: str, token: str) -> None:
    reset_url = f"{settings.SITE_URL.rstrip('/')}/reset-password?token={token}"
    await email_service.send_email(
        to=[email],
        subject="Reset your NutriAdd password",
        body=(
            f"Hi {name or 'there'},\n\n"
            f"We received a request to reset your NutriAdd password. "
            f"Click the link below to choose a new one — it expires in "
            f"{settings.RESET_TOKEN_EXPIRE_MINUTES} minutes:\n\n"
            f"{reset_url}\n\n"
            f"If you didn't request this, you can safely ignore this email; "
            f"your password won't change.\n\n"
            f"— NutriAdd (Life Care)"
        ),
    )


async def forgot_password(db: AsyncSession, email: str) -> None:
    user = await get_user_by_email(db, email)
    if user is not None:
        reset_token = create_reset_token(str(user.id))
        await send_reset_email(user.email, user.full_name, reset_token)
    # Always behave the same way regardless of whether the user exists,
    # to avoid leaking which emails are registered (no user enumeration).


async def reset_password(db: AsyncSession, token: str, new_password: str) -> None:
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link")

    if payload.get("type") != TOKEN_TYPE_RESET:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    user_id = payload.get("sub")
    try:
        user_uuid = uuid.UUID(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link")

    user.hashed_password = hash_password(new_password)
    db.add(user)
    await db.commit()
