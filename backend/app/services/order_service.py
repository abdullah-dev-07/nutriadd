import uuid
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Availability, Product
from app.models.user import User, UserRole
from app.schemas.order import OrderCreate
from app.services import email_service


def _generate_order_number() -> str:
    """Human-friendly, unique-ish order number, e.g. NA-20260811-9F3AC1.
    Uniqueness is additionally guaranteed by the DB unique constraint + retry."""
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    suffix = uuid.uuid4().hex[:6].upper()
    return f"NA-{stamp}-{suffix}"


async def create_order(db: AsyncSession, user: User, payload: OrderCreate) -> Order:
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least one item")

    # --- Idempotency: if this key was already used by this user, return that order
    # instead of creating a duplicate (guards double-clicks / retries). ---
    if payload.idempotency_key:
        existing = await db.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(
                Order.user_id == user.id,
                Order.idempotency_key == payload.idempotency_key,
            )
        )
        found = existing.scalar_one_or_none()
        if found is not None:
            return found

    # --- Collapse duplicate product lines and validate quantities ---
    quantities: dict[uuid.UUID, int] = {}
    for item in payload.items:
        if item.quantity < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be at least 1")
        if item.quantity > 99:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity per item cannot exceed 99")
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    # --- Load all referenced products in one query ---
    result = await db.execute(select(Product).where(Product.id.in_(quantities.keys())))
    products = {p.id: p for p in result.scalars().all()}

    order_items: list[OrderItem] = []
    subtotal = Decimal("0")
    for product_id, quantity in quantities.items():
        product = products.get(product_id)
        if product is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product_id} is unavailable or no longer exists",
            )
        # Server-side stock/availability check.
        if product.availability != Availability.in_stock:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"'{product.name}' is out of stock",
            )
        # Price is ALWAYS taken from the DB, never trusted from the client.
        line_total = product.price * quantity
        subtotal += line_total
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,  # snapshot
                unit_price=product.price,  # snapshot
                quantity=quantity,
            )
        )

    total = subtotal  # no tax/shipping yet; kept explicit for future logic

    # --- Create the order, retrying on the (rare) order_number collision ---
    order: Order | None = None
    for _attempt in range(5):
        candidate = Order(
            order_number=_generate_order_number(),
            idempotency_key=payload.idempotency_key,
            user_id=user.id,
            customer_name=payload.customer_name,
            customer_email=payload.customer_email,
            customer_phone=payload.customer_phone,
            shipping_address=payload.shipping_address,
            notes=payload.notes,
            subtotal=subtotal,
            total=total,
            status=OrderStatus.pending,
            items=[
                OrderItem(
                    product_id=i.product_id,
                    product_name=i.product_name,
                    unit_price=i.unit_price,
                    quantity=i.quantity,
                )
                for i in order_items
            ],
        )
        db.add(candidate)
        try:
            await db.commit()
            order = candidate
            break
        except IntegrityError:
            await db.rollback()
            # Could be a duplicate order_number (retry) or a duplicate
            # idempotency_key from a concurrent request (return the existing one).
            if payload.idempotency_key:
                dup = await db.execute(
                    select(Order)
                    .options(selectinload(Order.items))
                    .where(
                        Order.user_id == user.id,
                        Order.idempotency_key == payload.idempotency_key,
                    )
                )
                found = dup.scalar_one_or_none()
                if found is not None:
                    return found
            continue

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create order. Please try again.",
        )

    await db.refresh(order)
    await db.refresh(order, attribute_names=["items"])

    # --- Send emails (after commit; never blocks/fails the order) ---
    await _send_order_emails(order)

    return order


async def _send_order_emails(order: Order) -> None:
    lines = "\n".join(
        f"  - {i.product_name} x{i.quantity} @ {i.unit_price} = {i.unit_price * i.quantity}"
        for i in order.items
    )
    site = settings.SITE_URL.rstrip("/")
    summary = (
        f"Order: {order.order_number}\n"
        f"Name: {order.customer_name}\n"
        f"Email: {order.customer_email}\n"
        f"Phone: {order.customer_phone}\n"
        f"Ship to: {order.shipping_address}\n"
        f"Notes: {order.notes or '-'}\n\n"
        f"Items:\n{lines}\n\n"
        f"Total: {order.total}\n"
    )

    # Customer confirmation
    await email_service.send_email(
        to=[order.customer_email],
        subject=f"Your NutriAdd order {order.order_number} is confirmed",
        body=(
            f"Hi {order.customer_name},\n\n"
            f"Thank you for your order! We've received it and will process it shortly.\n\n"
            f"{summary}\n"
            f"Track it any time at {site}/account/orders\n\n"
            f"— NutriAdd (Life Care)"
        ),
    )

    # Business notification
    if settings.ORDER_NOTIFY_EMAIL:
        await email_service.send_email(
            to=[settings.ORDER_NOTIFY_EMAIL],
            subject=f"New order {order.order_number} — {order.total}",
            body=f"A new order was placed.\n\n{summary}",
        )


async def list_orders_for_user(db: AsyncSession, user: User) -> list[Order]:
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def list_all_orders(
    db: AsyncSession,
    search: str | None = None,
    order_status: OrderStatus | None = None,
    page: int = 1,
    page_size: int = 50,
) -> tuple[list[Order], int]:
    from sqlalchemy import func as sa_func

    query = select(Order).options(selectinload(Order.items))
    count_query = select(sa_func.count()).select_from(Order)

    if order_status is not None:
        query = query.where(Order.status == order_status)
        count_query = count_query.where(Order.status == order_status)

    if search:
        like = f"%{search.lower()}%"
        clause = or_(
            sa_func.lower(Order.order_number).like(like),
            sa_func.lower(Order.customer_name).like(like),
            sa_func.lower(Order.customer_email).like(like),
        )
        query = query.where(clause)
        count_query = count_query.where(clause)

    total = (await db.execute(count_query)).scalar_one()
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    return list(result.scalars().all()), total


async def get_order(db: AsyncSession, order_id: uuid.UUID, requesting_user: User) -> Order:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.user_id != requesting_user.id and requesting_user.role != UserRole.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this order")

    return order


async def update_order_status(db: AsyncSession, order_id: uuid.UUID, new_status: OrderStatus) -> Order:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = new_status
    db.add(order)
    await db.commit()
    await db.refresh(order)
    await db.refresh(order, attribute_names=["items"])
    return order
