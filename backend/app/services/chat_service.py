"""Chatbot service — answers visitor questions about NutriAdd.

Uses DeepSeek's OpenAI-compatible chat API. The API key comes from settings
(env only). A NutriAdd knowledge base + the live product catalog (pulled from the
DB) are injected into the system prompt so the assistant answers from real,
current company data and stays scoped to NutriAdd.
"""
import logging

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.product import Availability, Product
from app.schemas.chat import ChatMessage

logger = logging.getLogger(__name__)

# Static company knowledge base. Mirrors frontend/src/lib/site-config.ts — kept
# here so the bot knows the company without the frontend having to send it.
COMPANY_PROFILE = """\
NutriAdd (Life Care) is a Lahore-based pharmaceutical, nutraceutical, \
cosmeceutical and food-supplement company serving customers across Pakistan for \
over 15 years. Its tagline is "Caring for Healthy Life". The company offers \
marketing, franchising, trading and consultancy, and distributes trusted \
healthcare and nutrition products nationwide (including through its sister \
concern, FAMS Pharma Care).

Contact:
- Email: info@nutriadd.store
- Phone: +92-42-35414433, +92-300-8480844
- Address: 118 Abbas Block, Mustafa Town, Opp. UMT Hostel, Lahore, Pakistan
- Website: https://nutriadd.store

The website has: Home, About, Products (browsable catalog with product detail \
pages), a Blog with educational nutrition articles (magnesium, vitamin D, \
omega-3, zinc, creatine, and building a supplement routine), Contact, and \
customer accounts with a cart, checkout, saved addresses and order history."""

SYSTEM_INSTRUCTIONS = """\
You are the NutriAdd assistant, a helpful guide on the NutriAdd (Life Care) \
website (nutriadd.store). Your job is to help visitors with questions about \
NutriAdd, its products, the company, and general nutrition/supplement education.

Guidelines:
- Be concise, friendly and professional. Keep answers short unless asked for detail.
- Answer using the company profile and product list provided below. When a \
visitor asks which product suits a need, you may recommend relevant NutriAdd \
products from the list, factually and without being pushy.
- If you don't know something or it isn't in the provided information, say so and \
point them to the Contact page or info@nutriadd.store rather than inventing facts. \
Never make up products, prices, ingredients, or medical claims.
- For medical/health questions, give general educational information and remind \
users to consult a healthcare provider for personal medical advice. Do not \
diagnose or prescribe.
- Stay on topics related to NutriAdd, its products, health/nutrition, and using \
the website. Politely decline unrelated requests.
- Prices are in the currency shown (PKR). Only state prices/availability that \
appear in the product list."""

# Bounds to keep prompts and cost predictable.
MAX_HISTORY_TURNS = 12
MAX_PRODUCTS_IN_CONTEXT = 40
REQUEST_TIMEOUT_SECONDS = 30.0

FALLBACK_UNAVAILABLE = (
    "Sorry, the assistant is temporarily unavailable. Please reach us at "
    "info@nutriadd.store or through the Contact page and we'll be glad to help."
)


async def _build_product_context(db: AsyncSession) -> str:
    result = await db.execute(
        select(Product).order_by(Product.is_featured.desc(), Product.name)
    )
    products = result.scalars().all()[:MAX_PRODUCTS_IN_CONTEXT]
    if not products:
        return "No products are currently listed in the catalog."

    lines: list[str] = []
    for p in products:
        stock = (
            "in stock" if p.availability == Availability.in_stock else "out of stock"
        )
        benefits = ", ".join(p.benefits) if p.benefits else ""
        parts = [
            f"- {p.name} ({p.price} {p.currency}, {stock}): {p.short_description}"
        ]
        if benefits:
            parts.append(f"Benefits: {benefits}.")
        lines.append(" ".join(parts))
    return "\n".join(lines)


def _build_system_prompt(product_context: str, page_context: str | None) -> str:
    sections = [
        SYSTEM_INSTRUCTIONS,
        "=== COMPANY PROFILE ===\n" + COMPANY_PROFILE,
        "=== CURRENT PRODUCTS ===\n" + product_context,
    ]
    if page_context:
        sections.append(
            "=== WHERE THE USER IS ===\nThe user is currently viewing: "
            + page_context.strip()
        )
    return "\n\n".join(sections)


async def generate_reply(
    db: AsyncSession,
    message: str,
    history: list[ChatMessage],
    page_context: str | None,
) -> str:
    if not settings.DEEPSEEK_API_KEY:
        logger.warning("Chat requested but DEEPSEEK_API_KEY is not configured.")
        return FALLBACK_UNAVAILABLE

    product_context = await _build_product_context(db)
    system_prompt = _build_system_prompt(product_context, page_context)

    messages = [{"role": "system", "content": system_prompt}]
    for turn in history[-MAX_HISTORY_TURNS:]:
        messages.append({"role": turn.role, "content": turn.content})
    messages.append({"role": "user", "content": message})

    payload = {
        "model": settings.DEEPSEEK_MODEL,
        "messages": messages,
        "temperature": 0.4,
        "max_tokens": 700,
        "stream": False,
    }
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    url = settings.DEEPSEEK_BASE_URL.rstrip("/") + "/chat/completions"
    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
        reply = data["choices"][0]["message"]["content"].strip()
        return reply or FALLBACK_UNAVAILABLE
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        logger.exception("DeepSeek chat request failed")
        return FALLBACK_UNAVAILABLE
