from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_db
from app.core.rate_limit import SlidingWindowRateLimiter, client_ip
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])

# Per-IP limiter shared across requests in this worker process. Protects the
# free-tier chat API quota from spam; returns 429 (which the widget surfaces as a
# graceful "please slow down" bubble) rather than forwarding abuse to DeepSeek.
_limiter = SlidingWindowRateLimiter(
    max_requests=settings.CHAT_RATE_LIMIT_PER_MINUTE,
    window_seconds=60,
)


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    _limiter.check(client_ip(request))
    reply = await chat_service.generate_reply(
        db,
        message=payload.message,
        history=payload.history,
        page_context=payload.page_context,
    )
    return ChatResponse(reply=reply)
