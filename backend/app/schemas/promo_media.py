import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class PromoMediaBase(BaseModel):
    media_type: Literal["image", "video"] = "image"
    url: str = Field(min_length=1, max_length=1024)
    poster_url: Optional[str] = Field(default=None, max_length=1024)
    alt: str = Field(min_length=1, max_length=500)
    caption: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class PromoMediaCreate(PromoMediaBase):
    pass


class PromoMediaUpdate(BaseModel):
    media_type: Optional[Literal["image", "video"]] = None
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
