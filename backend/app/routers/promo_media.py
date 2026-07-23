from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.models.promo_media import PromoMedia
from app.schemas.promo_media import PromoMediaRead

router = APIRouter(prefix="/promo-media", tags=["promo-media"])


@router.get("", response_model=list[PromoMediaRead])
async def list_promo_media(db: AsyncSession = Depends(get_db)) -> list[PromoMedia]:
    """Public: active promotional media for the Home page showcase, in display order."""
    result = await db.execute(
        select(PromoMedia)
        .where(PromoMedia.is_active.is_(True))
        .order_by(PromoMedia.sort_order.asc(), PromoMedia.created_at.asc())
    )
    return list(result.scalars().all())
