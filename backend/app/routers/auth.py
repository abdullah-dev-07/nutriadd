from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LogoutRequest,
    RefreshedToken,
    RefreshTokenRequest,
    Token,
)
from app.schemas.user import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    UserCreate,
    UserRead,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    return await auth_service.register_user(db, payload)


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> Token:
    user = await auth_service.authenticate_user(db, payload.email, payload.password)
    return auth_service.issue_tokens(user)


@router.post("/refresh", response_model=RefreshedToken)
async def refresh(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)) -> RefreshedToken:
    return await auth_service.refresh_tokens(db, payload.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: LogoutRequest) -> None:
    # TODO: revoke via a token-denylist table for real production use
    from app.core.security import decode_token

    try:
        decode_token(payload.refresh_token)
    except ValueError:
        pass
    return None


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await auth_service.change_password(db, current_user, payload.current_password, payload.new_password)
    return None


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)) -> dict:
    await auth_service.forgot_password(db, payload.email)
    return {"message": "If an account exists for this email, a reset link has been sent."}
