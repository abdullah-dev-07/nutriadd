import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_admin
from app.models.user import User
from app.schemas.order import OrderRead, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services import order_service, product_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)) -> ProductRead:
    return await product_service.create_product(db, payload)


@router.put("/products/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: uuid.UUID, payload: ProductUpdate, db: AsyncSession = Depends(get_db)
) -> ProductRead:
    return await product_service.update_product(db, product_id, payload)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    await product_service.delete_product(db, product_id)
    return None


@router.get("/orders", response_model=list[OrderRead])
async def list_all_orders(db: AsyncSession = Depends(get_db)) -> list[OrderRead]:
    return await order_service.list_all_orders(db)


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: uuid.UUID, payload: OrderStatusUpdate, db: AsyncSession = Depends(get_db)
) -> OrderRead:
    return await order_service.update_order_status(db, order_id, payload.status)
