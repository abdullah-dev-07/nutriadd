import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AddressBase(BaseModel):
    label: Optional[str] = Field(default=None, max_length=64)
    full_name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=3, max_length=64)
    address: str = Field(min_length=5)
    city: str = Field(min_length=1, max_length=120)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    label: Optional[str] = Field(default=None, max_length=64)
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    phone: Optional[str] = Field(default=None, min_length=3, max_length=64)
    address: Optional[str] = Field(default=None, min_length=5)
    city: Optional[str] = Field(default=None, min_length=1, max_length=120)
    is_default: Optional[bool] = None


class AddressRead(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
