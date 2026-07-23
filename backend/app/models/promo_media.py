import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MediaType(str, enum.Enum):
    image = "image"
    video = "video"


class PromoMedia(Base):
    """A promotional image or video shown in the Home page showcase carousel.

    Only the Blob Storage URL is stored here — never binary data.
    """

    __tablename__ = "promo_media"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    media_type: Mapped[MediaType] = mapped_column(
        Enum(MediaType, native_enum=False, length=20), default=MediaType.image, nullable=False
    )
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    # Optional still frame shown before a video plays.
    poster_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    alt: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Ascending display order in the carousel.
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
