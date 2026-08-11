import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.address import AddressCreate, AddressRead, AddressUpdate
from app.services import address_service

router = APIRouter(prefix="/addresses", tags=["addresses"])


# Every endpoint operates only on the authenticated user's own addresses.
@router.get("", response_model=list[AddressRead])
async def list_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[AddressRead]:
    return await address_service.list_addresses(db, current_user)


@router.post("", response_model=AddressRead, status_code=status.HTTP_201_CREATED)
async def create_address(
    payload: AddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AddressRead:
    return await address_service.create_address(db, current_user, payload)


@router.put("/{address_id}", response_model=AddressRead)
async def update_address(
    address_id: uuid.UUID,
    payload: AddressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AddressRead:
    return await address_service.update_address(db, current_user, address_id, payload)


@router.post("/{address_id}/default", response_model=AddressRead)
async def set_default_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AddressRead:
    return await address_service.set_default(db, current_user, address_id)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await address_service.delete_address(db, current_user, address_id)
    return None
