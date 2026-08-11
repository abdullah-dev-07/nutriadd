import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartLineRead, CartRead


async def _get_or_create_cart(db: AsyncSession, user: User) -> Cart:
    result = await db.execute(
        select(Cart).options(selectinload(Cart.items)).where(Cart.user_id == user.id)
    )
    cart = result.scalar_one_or_none()
    if cart is None:
        cart = Cart(user_id=user.id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart, attribute_names=["items"])
    return cart


async def _build_cart_read(db: AsyncSession, cart: Cart) -> CartRead:
    """Enrich the stored (product_id, quantity) lines with live product data.
    Lines whose product no longer exists are silently dropped."""
    if not cart.items:
        return CartRead(items=[], subtotal=Decimal("0"), total_quantity=0)

    product_ids = [i.product_id for i in cart.items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = {p.id: p for p in result.scalars().all()}

    lines: list[CartLineRead] = []
    subtotal = Decimal("0")
    total_quantity = 0
    stale_item_ids: list[uuid.UUID] = []

    for item in cart.items:
        product = products.get(item.product_id)
        if product is None:
            stale_item_ids.append(item.id)  # product deleted — prune it
            continue
        line_total = product.price * item.quantity
        subtotal += line_total
        total_quantity += item.quantity
        lines.append(
            CartLineRead(
                product_id=product.id,
                slug=product.slug,
                name=product.name,
                image_url=product.image_url,
                unit_price=product.price,
                currency=product.currency,
                availability=product.availability,
                quantity=item.quantity,
                line_total=line_total,
            )
        )

    if stale_item_ids:
        for item in list(cart.items):
            if item.id in stale_item_ids:
                await db.delete(item)
        await db.commit()

    return CartRead(items=lines, subtotal=subtotal, total_quantity=total_quantity)


async def get_cart(db: AsyncSession, user: User) -> CartRead:
    cart = await _get_or_create_cart(db, user)
    return await _build_cart_read(db, cart)


async def add_item(db: AsyncSession, user: User, product_id: uuid.UUID, quantity: int) -> CartRead:
    # Validate the product exists before adding.
    product = (await db.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    cart = await _get_or_create_cart(db, user)
    existing = next((i for i in cart.items if i.product_id == product_id), None)
    if existing is not None:
        existing.quantity = min(99, existing.quantity + quantity)
    else:
        db.add(CartItem(cart_id=cart.id, product_id=product_id, quantity=min(99, quantity)))
    await db.commit()
    await db.refresh(cart, attribute_names=["items"])
    return await _build_cart_read(db, cart)


async def update_item(db: AsyncSession, user: User, product_id: uuid.UUID, quantity: int) -> CartRead:
    cart = await _get_or_create_cart(db, user)
    existing = next((i for i in cart.items if i.product_id == product_id), None)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")
    existing.quantity = min(99, quantity)
    await db.commit()
    await db.refresh(cart, attribute_names=["items"])
    return await _build_cart_read(db, cart)


async def remove_item(db: AsyncSession, user: User, product_id: uuid.UUID) -> CartRead:
    cart = await _get_or_create_cart(db, user)
    existing = next((i for i in cart.items if i.product_id == product_id), None)
    if existing is not None:
        await db.delete(existing)
        await db.commit()
        await db.refresh(cart, attribute_names=["items"])
    return await _build_cart_read(db, cart)


async def clear_cart(db: AsyncSession, user: User) -> CartRead:
    cart = await _get_or_create_cart(db, user)
    for item in list(cart.items):
        await db.delete(item)
    await db.commit()
    await db.refresh(cart, attribute_names=["items"])
    return await _build_cart_read(db, cart)
