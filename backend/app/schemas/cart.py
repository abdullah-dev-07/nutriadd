import uuid
from decimal import Decimal
from typing import List

from pydantic import BaseModel, Field

from app.models.product import Availability


class CartItemAdd(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(default=1, gt=0, le=99)


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0, le=99)


class CartLineRead(BaseModel):
    """A cart line enriched with live product data (price/name/availability are
    read from the product, never trusted from the client)."""

    product_id: uuid.UUID
    slug: str
    name: str
    image_url: str
    unit_price: Decimal
    currency: str
    availability: Availability
    quantity: int
    line_total: Decimal


class CartRead(BaseModel):
    items: List[CartLineRead]
    subtotal: Decimal
    total_quantity: int
