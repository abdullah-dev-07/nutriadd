import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Availability(str, enum.Enum):
    in_stock = "in_stock"
    out_of_stock = "out_of_stock"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("categories.id"), nullable=False)
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="PKR", nullable=False)
    availability: Mapped[Availability] = mapped_column(
        Enum(Availability, native_enum=False, length=20), default=Availability.in_stock, nullable=False
    )
    # Azure Blob Storage URLs — the DB never stores binary media, only these links.
    image_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    promo_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    benefits: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    features: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    ingredients: Mapped[list | None] = mapped_column(JSON, nullable=True)
    usage_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    warnings: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    category: Mapped["Category"] = relationship(back_populates="products")  # noqa: F821
