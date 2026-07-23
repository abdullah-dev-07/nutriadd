import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.promo_media import MediaType


class PromoMediaBase(BaseModel):
    # Use the ORM enum (not a Literal): Pydantic v2 will not validate a str-Enum
    # member against Literal["image", "video"], because Enum.__hash__ hashes the
    # member name rather than its value, so the literal lookup misses and
    # serializing an ORM row raises ResponseValidationError. This mirrors how
    # schemas/product.py handles Availability.
    media_type: MediaType = MediaType.image
    url: str = Field(min_length=1, max_length=1024)
    poster_url: Optional[str] = Field(default=None, max_length=1024)
    alt: str = Field(min_length=1, max_length=500)
    caption: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class PromoMediaCreate(PromoMediaBase):
    pass


class PromoMediaUpdate(BaseModel):
    media_type: Optional[MediaType] = None
    url: Optional[str] = Field(default=None, min_length=1, max_length=1024)
    poster_url: Optional[str] = Field(default=None, max_length=1024)
    alt: Optional[str] = Field(default=None, min_length=1, max_length=500)
    caption: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class PromoMediaRead(PromoMediaBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
