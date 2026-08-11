import re
import uuid

from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_db, require_admin
from app.models.order import OrderStatus
from app.models.promo_media import PromoMedia
from app.schemas.order import OrderListResponse, OrderRead, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.promo_media import PromoMediaCreate, PromoMediaRead, PromoMediaUpdate
from app.services import order_service, product_service, storage_service

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

_ALLOWED_UPLOAD_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "application/pdf",
}
_SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


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


@router.post("/media/upload", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    target: str = "product",
) -> dict:
    """Upload an image / video / PDF to VPS disk (served by Nginx) and return its
    public URL.

    `target` is a logical destination ("product" or "promo"), resolved here to the
    actual media subdirectory from settings. The server is the single source of truth
    for those directory names — the frontend never hardcodes them."""
    subdirs = {
        "product": settings.MEDIA_PRODUCT_DIR,
        "promo": settings.MEDIA_PROMO_DIR,
    }
    subdir = subdirs.get(target)
    if subdir is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid target '{target}'. Allowed: {sorted(subdirs)}",
        )
    if file.content_type not in _ALLOWED_UPLOAD_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported content type: {file.content_type}",
        )
    safe_name = _SAFE_NAME.sub("-", (file.filename or "upload").strip()).strip("-") or "upload"
    filename = f"{uuid.uuid4().hex}-{safe_name}"
    data = await file.read()
    url = storage_service.save_media(subdir, filename, data)
    return {"url": url}


@router.get("/promo-media", response_model=list[PromoMediaRead])
async def list_all_promo_media(db: AsyncSession = Depends(get_db)) -> list[PromoMedia]:
    """Admin: every showcase item, including inactive ones."""
    result = await db.execute(
        select(PromoMedia).order_by(PromoMedia.sort_order.asc(), PromoMedia.created_at.asc())
    )
    return list(result.scalars().all())


@router.post("/promo-media", response_model=PromoMediaRead, status_code=status.HTTP_201_CREATED)
async def create_promo_media(payload: PromoMediaCreate, db: AsyncSession = Depends(get_db)) -> PromoMedia:
    data = payload.model_dump()
    # Append to the end of the carousel unless an explicit order was given.
    if not data.get("sort_order"):
        result = await db.execute(select(func.max(PromoMedia.sort_order)))
        data["sort_order"] = (result.scalar() or 0) + 1
    item = PromoMedia(**data)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/promo-media/{media_id}", response_model=PromoMediaRead)
async def update_promo_media(
    media_id: uuid.UUID, payload: PromoMediaUpdate, db: AsyncSession = Depends(get_db)
) -> PromoMedia:
    result = await db.execute(select(PromoMedia).where(PromoMedia.id == media_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promo media not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/promo-media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promo_media(media_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    result = await db.execute(select(PromoMedia).where(PromoMedia.id == media_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promo media not found")
    await db.delete(item)
    await db.commit()
    return None


@router.get("/orders", response_model=OrderListResponse)
async def list_all_orders(
    search: Optional[str] = Query(default=None),
    status_filter: Optional[OrderStatus] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> OrderListResponse:
    items, total = await order_service.list_all_orders(
        db, search=search, order_status=status_filter, page=page, page_size=page_size
    )
    return OrderListResponse(items=items, total=total, page=page, page_size=page_size)


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: uuid.UUID, payload: OrderStatusUpdate, db: AsyncSession = Depends(get_db)
) -> OrderRead:
    return await order_service.update_order_status(db, order_id, payload.status)
