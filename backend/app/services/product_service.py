import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.category import Category
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def list_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.name))
    return list(result.scalars().all())


async def get_category_by_slug(db: AsyncSession, slug: str) -> Category | None:
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def list_products(
    db: AsyncSession,
    search: Optional[str] = None,
    category_slug: Optional[str] = None,
    tag: Optional[str] = None,
    page: int = 1,
    page_size: int = 12,
) -> tuple[list[Product], int]:
    query = select(Product).options(selectinload(Product.category))
    count_query = select(func.count()).select_from(Product)

    if category_slug:
        query = query.join(Category, Product.category_id == Category.id).where(Category.slug == category_slug)
        count_query = count_query.join(Category, Product.category_id == Category.id).where(
            Category.slug == category_slug
        )

    if search:
        like_pattern = f"%{search.lower()}%"
        search_clause = or_(
            func.lower(Product.name).like(like_pattern),
            func.lower(Product.short_description).like(like_pattern),
        )
        query = query.where(search_clause)
        count_query = count_query.where(search_clause)

    if tag:
        # JSON list containment check done in Python-friendly, cross-db way.
        # Fetch candidates then filter by tag membership.
        pass

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    query = query.order_by(Product.created_at.desc())

    if tag:
        result = await db.execute(query)
        all_items = [p for p in result.scalars().all() if tag in (p.tags or [])]
        total = len(all_items)
        start = (page - 1) * page_size
        end = start + page_size
        return all_items[start:end], total

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_product_by_slug(db: AsyncSession, slug: str) -> Product:
    result = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.slug == slug)
    )
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


async def get_product_by_id(db: AsyncSession, product_id: uuid.UUID) -> Product | None:
    result = await db.execute(
        select(Product).options(selectinload(Product.category)).where(Product.id == product_id)
    )
    return result.scalar_one_or_none()


async def create_product(db: AsyncSession, payload: ProductCreate) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    await db.refresh(product, attribute_names=["category"])
    return product


async def update_product(db: AsyncSession, product_id: uuid.UUID, payload: ProductUpdate) -> Product:
    product = await get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.add(product)
    await db.commit()
    await db.refresh(product)
    await db.refresh(product, attribute_names=["category"])
    return product


async def delete_product(db: AsyncSession, product_id: uuid.UUID) -> None:
    product = await get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    await db.delete(product)
    await db.commit()
