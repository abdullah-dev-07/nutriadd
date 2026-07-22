import re
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_db, require_admin
from app.schemas.order import OrderRead, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
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
    container: str = settings.AZURE_STORAGE_PRODUCT_CONTAINER,
) -> dict:
    """Upload an image / video / PDF to Azure Blob Storage and return its public URL.
    Generic enough to cover product images, promo media and future downloadable assets."""
    if file.content_type not in _ALLOWED_UPLOAD_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported content type: {file.content_type}",
        )
    safe_name = _SAFE_NAME.sub("-", (file.filename or "upload").strip()).strip("-") or "upload"
    blob_name = f"{uuid.uuid4().hex}-{safe_name}"
    data = await file.read()
    url = storage_service.upload_file(container, blob_name, data, file.content_type)
    return {"url": url}


@router.get("/orders", response_model=list[OrderRead])
async def list_all_orders(db: AsyncSession = Depends(get_db)) -> list[OrderRead]:
    return await order_service.list_all_orders(db)


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: uuid.UUID, payload: OrderStatusUpdate, db: AsyncSession = Depends(get_db)
) -> OrderRead:
    return await order_service.update_order_status(db, order_id, payload.status)
