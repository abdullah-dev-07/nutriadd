import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.product import Availability
from app.schemas.category import CategoryRead


class ProductBase(BaseModel):
    sku: str
    slug: str
    name: str
    short_description: str
    description: str
    price: Decimal
    currency: str = "PKR"
    availability: Availability = Availability.in_stock
    image_url: str
    promo_image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    benefits: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    ingredients: Optional[List[str]] = None
    usage_instructions: Optional[str] = None
    warnings: Optional[str] = None


class ProductCreate(ProductBase):
    category_id: uuid.UUID


class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    slug: Optional[str] = None
    name: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    availability: Optional[Availability] = None
    image_url: Optional[str] = None
    promo_image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    features: Optional[List[str]] = None
    ingredients: Optional[List[str]] = None
    usage_instructions: Optional[str] = None
    warnings: Optional[str] = None


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    sku: str
    slug: str
    name: str
    category: CategoryRead
    short_description: str
    description: str
    price: Decimal
    currency: str
    availability: Availability
    image_url: str
    promo_image_url: Optional[str] = None
    tags: List[str]
    benefits: List[str]
    features: List[str]
    ingredients: Optional[List[str]] = None
    usage_instructions: Optional[str] = None
    warnings: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: List[ProductRead]
    total: int
    page: int
    page_size: int
