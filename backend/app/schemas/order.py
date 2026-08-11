import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(min_length=1)
    customer_name: str = Field(min_length=1, max_length=255)
    customer_email: EmailStr
    customer_phone: str = Field(min_length=3, max_length=64)
    shipping_address: str = Field(min_length=5)
    notes: Optional[str] = None
    # Optional client-generated key to make order creation idempotent (prevents
    # duplicate orders from double-clicks / retries).
    idempotency_key: Optional[str] = Field(default=None, max_length=64)


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    unit_price: Decimal
    quantity: int


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    order_number: str
    user_id: uuid.UUID
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str
    notes: Optional[str] = None
    status: OrderStatus
    subtotal: Decimal
    total: Decimal
    items: List[OrderItemRead]
    created_at: datetime
    updated_at: datetime


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderListResponse(BaseModel):
    items: List[OrderRead]
    total: int
    page: int
    page_size: int
