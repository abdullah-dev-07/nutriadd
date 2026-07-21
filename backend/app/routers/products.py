from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.schemas.product import ProductListResponse, ProductRead
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> ProductListResponse:
    items, total = await product_service.list_products(
        db, search=search, category_slug=category, tag=tag, page=page, page_size=page_size
    )
    return ProductListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=ProductRead)
async def get_product(slug: str, db: AsyncSession = Depends(get_db)) -> ProductRead:
    return await product_service.get_product_by_slug(db, slug)
