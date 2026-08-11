import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartRead
from app.services import cart_service

router = APIRouter(prefix="/cart", tags=["cart"])


# Every endpoint is scoped to the authenticated user's own cart — a user can
# never see or modify another user's cart.
@router.get("", response_model=CartRead)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.get_cart(db, current_user)


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
async def add_item(
    payload: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.add_item(db, current_user, payload.product_id, payload.quantity)


@router.put("/items/{product_id}", response_model=CartRead)
async def update_item(
    product_id: uuid.UUID,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.update_item(db, current_user, product_id, payload.quantity)


@router.delete("/items/{product_id}", response_model=CartRead)
async def remove_item(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.remove_item(db, current_user, product_id)


@router.delete("", response_model=CartRead)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartRead:
    return await cart_service.clear_cart(db, current_user)
