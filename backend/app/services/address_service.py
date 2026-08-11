import uuid

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressUpdate


async def list_addresses(db: AsyncSession, user: User) -> list[Address]:
    result = await db.execute(
        select(Address)
        .where(Address.user_id == user.id)
        .order_by(Address.is_default.desc(), Address.created_at.desc())
    )
    return list(result.scalars().all())


async def _get_owned_address(db: AsyncSession, user: User, address_id: uuid.UUID) -> Address:
    result = await db.execute(select(Address).where(Address.id == address_id))
    address = result.scalar_one_or_none()
    if address is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Address not found")
    # Ownership check — a user can never see or modify another user's address.
    if address.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return address


async def _clear_other_defaults(db: AsyncSession, user: User, keep_id: uuid.UUID | None) -> None:
    stmt = update(Address).where(Address.user_id == user.id).values(is_default=False)
    if keep_id is not None:
        stmt = stmt.where(Address.id != keep_id)
    await db.execute(stmt)


async def _count_addresses(db: AsyncSession, user: User) -> int:
    result = await db.execute(select(Address).where(Address.user_id == user.id))
    return len(list(result.scalars().all()))


async def create_address(db: AsyncSession, user: User, payload: AddressCreate) -> Address:
    # First address is always the default; otherwise honour the requested flag.
    make_default = payload.is_default or (await _count_addresses(db, user)) == 0

    address = Address(
        user_id=user.id,
        label=payload.label,
        full_name=payload.full_name,
        phone=payload.phone,
        address=payload.address,
        city=payload.city,
        is_default=make_default,
    )
    db.add(address)
    await db.flush()  # get address.id before clearing other defaults
    if make_default:
        await _clear_other_defaults(db, user, keep_id=address.id)
    await db.commit()
    await db.refresh(address)
    return address


async def update_address(
    db: AsyncSession, user: User, address_id: uuid.UUID, payload: AddressUpdate
) -> Address:
    address = await _get_owned_address(db, user, address_id)
    data = payload.model_dump(exclude_unset=True)

    became_default = data.get("is_default") is True
    for key, value in data.items():
        setattr(address, key, value)

    if became_default:
        await _clear_other_defaults(db, user, keep_id=address.id)
        address.is_default = True

    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


async def set_default(db: AsyncSession, user: User, address_id: uuid.UUID) -> Address:
    address = await _get_owned_address(db, user, address_id)
    await _clear_other_defaults(db, user, keep_id=address.id)
    address.is_default = True
    db.add(address)
    await db.commit()
    await db.refresh(address)
    return address


async def delete_address(db: AsyncSession, user: User, address_id: uuid.UUID) -> None:
    address = await _get_owned_address(db, user, address_id)
    was_default = address.is_default
    await db.delete(address)
    await db.flush()
    # If we removed the default, promote the most recent remaining address.
    if was_default:
        result = await db.execute(
            select(Address)
            .where(Address.user_id == user.id)
            .order_by(Address.created_at.desc())
            .limit(1)
        )
        replacement = result.scalar_one_or_none()
        if replacement is not None:
            replacement.is_default = True
            db.add(replacement)
    await db.commit()
