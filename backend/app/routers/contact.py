from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.models.contact_message import ContactMessage
from app.schemas.contact import ContactCreate, ContactRead

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
async def create_contact_message(payload: ContactCreate, db: AsyncSession = Depends(get_db)) -> ContactMessage:
    message = ContactMessage(**payload.model_dump())
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
