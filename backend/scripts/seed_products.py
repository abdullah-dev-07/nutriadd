"""Idempotent seed script for NutriAdd categories and products.

Run from the `backend/` directory with the virtualenv active:

    python -m scripts.seed_products

Safe to re-run: categories and products are upserted by their unique `slug`.

Media handling:
- If AZURE_STORAGE_CONNECTION_STRING is configured, each product's local image
  (frontend/src/assets/<slug>.<ext>) and promo image (frontend/public/promo/
  promo-<slug>.jpeg) are uploaded to Azure Blob Storage and the resulting HTTPS
  URLs are stored on the product (the DB never stores binary data).
- If Azure is NOT configured (e.g. local development), the product's `slug` is
  stored as a placeholder in `image_url` and `promo_image_url` is left null; the
  frontend falls back to its bundled asset matched by slug, so the catalog still
  renders locally without Azure.

Product copy (name/description/benefits/tags/features/ingredients) is transcribed
from the promotional artwork in frontend/public/promo/. No usage instructions or
warnings are printed on that artwork, so those fields are intentionally null.
"""
import asyncio
import logging
import mimetypes
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.base import AsyncSessionLocal
from app.models.category import Category
from app.models.product import Product

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_products")

# Repo root = backend/scripts/seed_products.py -> backend -> repo root.
REPO_ROOT = Path(__file__).resolve().parents[2]
ASSETS_DIR = REPO_ROOT / "frontend" / "src" / "assets"
PROMO_DIR = REPO_ROOT / "frontend" / "public" / "promo"

CATEGORIES = [
    {"name": "Brain & Cognitive Health", "slug": "brain-cognitive-health"},
    {"name": "Sleep & Relaxation", "slug": "sleep-relaxation"},
    {"name": "Bone & Joint Health", "slug": "bone-joint-health"},
    {"name": "Women's Health & Energy", "slug": "womens-health-energy"},
    {"name": "Energy & Wellness", "slug": "energy-wellness"},
    {"name": "Energy & Immunity", "slug": "energy-immunity"},
]

PRODUCTS = [
    {
        "slug": "magtein",
        "sku": "NA-MAG-30",
        "name": "Magtein — Magnesium L-Threonate",
        "category_slug": "brain-cognitive-health",
        "price": "2500.00",
        "image_file": "magtein.jpeg",
        "promo_file": "promo-magtein.jpeg",
        "short_description": "Magnesium L-Threonate for brain health, calmness and better sleep.",
        "description": (
            "Magtein is a Gold Standard nutritional supplement featuring Magnesium L-Threonate — "
            "an advanced, high-bioavailability form of magnesium that easily crosses the blood-brain "
            "barrier for maximum brain benefits. Each bottle contains 30 tablets (500mg) formulated to "
            "support memory and learning, promote calmness and relaxation, enhance sleep quality, relieve "
            "stress and anxiety, and support cognitive performance and overall brain health."
        ),
        "tags": ["brain health", "magnesium", "sleep", "cognitive", "stress relief"],
        "benefits": [
            "Memory & Mood Support",
            "Promotes Deep Sleep",
            "Relieves Stress & Anxiety",
            "Supports Cognitive Function",
            "Overall Brain Wellness",
        ],
        "features": [
            "Gold Standard Nutritional Supplement",
            "High Bioavailability",
            "Crosses the blood-brain barrier",
            "500mg · 30 Tablets",
        ],
        "ingredients": ["Magnesium L-Threonate (500mg)"],
        "usage_instructions": None,
        "warnings": None,
    },
    {
        "slug": "climag",
        "sku": "NA-CLI-30",
        "name": "Climag — Magnesium & Omega3 Glycinate",
        "category_slug": "sleep-relaxation",
        "price": "2200.00",
        "image_file": "climag.jpeg",
        "promo_file": "promo-climag.jpeg",
        "short_description": "Magnesium & Omega3 for a balanced you — improved sleep and relaxation.",
        "description": (
            "Climag combines Magnesium Glycinate with Omega-3 — the perfect combination for relaxation, "
            "heart health and overall wellness. Formulated to support stress relief, muscle health, heart "
            "health, nerve health, deep sleep and bone health in a single daily tablet."
        ),
        "tags": ["magnesium", "omega3", "sleep", "heart health", "relaxation"],
        "benefits": [
            "Promotes Deep & Restful Sleep",
            "Relaxes Muscles & Reduces Cramps",
            "Supports Heart & Brain Health",
            "Helps Reduce Stress & Anxiety",
            "Supports Bone Health & Strength",
            "Supports Overall Wellbeing",
        ],
        "features": [
            "Magnesium Glycinate + Omega-3 combination",
            "Improved Sleep & Relaxation",
            "30 Tablets",
        ],
        "ingredients": ["Magnesium Glycinate", "Omega-3"],
        "usage_instructions": None,
        "warnings": None,
    },
    {
        "slug": "kal-3",
        "sku": "NA-KAL-30",
        "name": "Kal-3 Plus — K2 & Calcium",
        "category_slug": "bone-joint-health",
        "price": "1800.00",
        "image_file": "kal-3.jpeg",
        "promo_file": "promo-kal-3.jpeg",
        "short_description": "K2 + Calcium for stronger bones and an active life.",
        "description": (
            "Kal-3 Plus brings together Vitamin K2 (100mcg) and Calcium (1000mg) — the perfect combination "
            "for stronger bones, better calcium utilization and an active lifestyle. Reduces muscle cramps "
            "and stiffness while supporting heart health, immune function and daily energy."
        ),
        "tags": ["calcium", "vitamin k2", "bone health", "joint health"],
        "benefits": [
            "Supports Bone Density",
            "Improves Calcium Absorption",
            "Supports Muscle Function",
            "Helps Reduce Muscle Cramps & Stiffness",
            "Supports Heart Health",
            "Supports Immune System",
            "Promotes Daily Energy & Vitality",
        ],
        "features": [
            "Vitamin K2 (100mcg) + Calcium (1000mg)",
            "Reduces muscle cramps & stiffness",
        ],
        "ingredients": ["Vitamin K2 (100mcg)", "Calcium (1000mg)"],
        "usage_instructions": None,
        "warnings": None,
    },
    {
        "slug": "nisavit",
        "sku": "NA-NIS-60",
        "name": "Nisavit — L-Methyl Folate & Vitamin B6, B12",
        "category_slug": "womens-health-energy",
        "price": "1600.00",
        "image_file": "nisavit.jpeg",
        "promo_file": "promo-nisavit.jpeg",
        "short_description": "The power of active folate for a healthier you.",
        "description": (
            "Nisavit delivers the active form of Folate along with Vitamin B6 and B12 for better absorption "
            "and faster results. Formulated for folate deficiency and anemia, it supports red blood cell "
            "formation, nerve health, mood regulation, brain function and healthy pregnancy."
        ),
        "tags": ["folate", "vitamin b12", "vitamin b6", "women's health", "energy", "anemia"],
        "benefits": [
            "Helps in Red Blood Cell Formation",
            "Reduces Tiredness & Fatigue",
            "Supports Nerve Health & Mood",
            "Improves Brain Function & Focus",
            "Promotes Heart & Homocysteine Health",
            "Supports Healthy Pregnancy & Foetal Development",
        ],
        "features": [
            "Active form of Folate (L-Methyl Folate)",
            "With Vitamin B6 & B12 for better absorption",
            "60 Tablets",
        ],
        "ingredients": ["L-Methyl Folate", "Vitamin B6", "Vitamin B12"],
        "usage_instructions": None,
        "warnings": None,
    },
    {
        "slug": "trig",
        "sku": "NA-TRI-30",
        "name": "Trig — Magnesium Glycinate & Vitamin B12, E, K2",
        "category_slug": "energy-wellness",
        "price": "2000.00",
        "image_file": "trig.jpeg",
        "promo_file": "promo-trig.jpeg",
        "short_description": "Magnesium + Vitamins for energy, brain & overall wellness.",
        "description": (
            "Trig is a stronger combination of Magnesium Glycinate with Vitamins B12, E and K2 — formulated "
            "for energy, brain support and overall wellness. Supports heart health, strong bones, immunity, "
            "memory and healthy skin, hair and eyes."
        ),
        "tags": ["magnesium", "vitamin b12", "vitamin e", "vitamin k2", "energy", "immunity"],
        "benefits": [
            "Supports Energy Production",
            "Supports Cognitive Function & Memory",
            "Supports Heart Health",
            "Supports Bone Strength",
            "Supports Immune System",
            "Supports Healthy Skin, Hair & Eyes",
        ],
        "features": [
            "Magnesium Glycinate + Vitamin B12, E & K2",
            "Stronger combination for energy & cognitive function",
            "30 Tablets",
        ],
        "ingredients": ["Magnesium Glycinate", "Vitamin B12", "Vitamin E", "Vitamin K2"],
        "usage_instructions": None,
        "warnings": None,
    },
    {
        "slug": "vikin-d",
        "sku": "NA-VIK-30",
        "name": "Vikin-D — D3 + K2",
        "category_slug": "bone-joint-health",
        "price": "1900.00",
        "image_file": "vikin-d.jpeg",
        "promo_file": "promo-vikin-d.jpeg",
        "short_description": "Essential D3 + K2 for daily wellness.",
        "description": (
            "Vikin-D combines high-strength Vitamin D3 (10,000 IU) with Vitamin K2 (100mcg) for better "
            "absorption and stronger results. This double-strength formula supports bone density, calcium "
            "regulation, cardiovascular and brain health, and overall immune system health."
        ),
        "tags": ["vitamin d3", "vitamin k2", "bone health", "immunity"],
        "benefits": [
            "Helps Calcium Absorption",
            "Maintains Strong Bones & Teeth",
            "Supports Muscle Function",
            "Provides Overall Wellbeing",
            "Supports Bone Density & Calcium Regulation",
            "Supports Cardiovascular & Brain Health",
            "Supports Immune System Health",
        ],
        "features": [
            "Vitamin D3 (10,000 IU) + Vitamin K2 (100mcg)",
            "Double Strength & Extra Support",
            "30 Tablets",
        ],
        "ingredients": ["Vitamin D3 (10,000 IU)", "Vitamin K2 (100mcg)"],
        "usage_instructions": None,
        "warnings": None,
    },
    {
        "slug": "qazplus",
        "sku": "NA-QAZ-30",
        "name": "Qaz Plus — Multivitamins & Minerals",
        "category_slug": "energy-immunity",
        "price": "1700.00",
        "image_file": "qazplus.png",
        "promo_file": "promo-qazplus.jpeg",
        "short_description": "Your daily dose of essential vitamins, minerals & energy support nutrients.",
        "description": (
            "Qaz Plus is a complete multivitamin and mineral formula with Ginseng Extract, Vitamin A, Zinc, "
            "L-Carnitine, L-Arginine and Co-Q10 — a true energy booster supporting heart health, muscle and "
            "bone health, metabolism and immune enhancement."
        ),
        "tags": ["multivitamin", "energy", "immunity", "ginseng", "zinc"],
        "benefits": [
            "Supports Daily Energy & Stamina",
            "Supports Immune Function",
            "Supports Muscle Health & Recovery",
            "Supports Heart Health",
            "Supports Metabolism & Vitality",
            "Supports Overall Wellbeing",
        ],
        "features": [
            "Multivitamins & Minerals with Ginseng Extract, L-Carnitine, L-Arginine & Co-Q10",
            "A True Energy Booster",
        ],
        "ingredients": [
            "Ginseng Extract",
            "Vitamin A",
            "Zinc",
            "L-Carnitine",
            "L-Arginine",
            "Co-Q10",
        ],
        "usage_instructions": None,
        "warnings": None,
    },
]

_azure_enabled = bool(settings.AZURE_STORAGE_CONNECTION_STRING)


def _resolve_media_urls(data: dict) -> tuple[str, str | None]:
    """Return (image_url, promo_image_url). Uploads to Azure Blob Storage when
    configured; otherwise returns a slug placeholder so local dev still works."""
    if not _azure_enabled:
        return data["slug"], None

    # Imported lazily so the script doesn't require azure-storage-blob for the
    # local, no-Azure path.
    from app.services import storage_service

    storage_service.ensure_container(settings.AZURE_STORAGE_PRODUCT_CONTAINER)
    storage_service.ensure_container(settings.AZURE_STORAGE_PROMO_CONTAINER)

    image_path = ASSETS_DIR / data["image_file"]
    promo_path = PROMO_DIR / data["promo_file"]

    image_url = storage_service.upload_file(
        settings.AZURE_STORAGE_PRODUCT_CONTAINER,
        data["image_file"],
        image_path.read_bytes(),
        mimetypes.guess_type(image_path.name)[0] or "application/octet-stream",
    )
    promo_url = storage_service.upload_file(
        settings.AZURE_STORAGE_PROMO_CONTAINER,
        data["promo_file"],
        promo_path.read_bytes(),
        mimetypes.guess_type(promo_path.name)[0] or "application/octet-stream",
    )
    return image_url, promo_url


async def upsert_category(db: AsyncSession, data: dict) -> Category:
    result = await db.execute(select(Category).where(Category.slug == data["slug"]))
    category = result.scalar_one_or_none()
    if category is None:
        category = Category(name=data["name"], slug=data["slug"])
        db.add(category)
        logger.info("Creating category: %s", data["slug"])
    else:
        category.name = data["name"]
        logger.info("Updating category: %s", data["slug"])
    await db.flush()
    return category


async def upsert_product(db: AsyncSession, data: dict, category_id) -> None:
    result = await db.execute(select(Product).where(Product.slug == data["slug"]))
    product = result.scalar_one_or_none()

    image_url, promo_image_url = _resolve_media_urls(data)

    fields = dict(
        sku=data["sku"],
        name=data["name"],
        category_id=category_id,
        short_description=data["short_description"],
        description=data["description"],
        price=data["price"],
        currency="PKR",
        image_url=image_url,
        promo_image_url=promo_image_url,
        tags=data["tags"],
        benefits=data["benefits"],
        features=data["features"],
        ingredients=data["ingredients"],
        usage_instructions=data["usage_instructions"],
        warnings=data["warnings"],
    )

    if product is None:
        product = Product(slug=data["slug"], **fields)
        db.add(product)
        logger.info("Creating product: %s", data["slug"])
    else:
        for key, value in fields.items():
            setattr(product, key, value)
        logger.info("Updating product: %s", data["slug"])


async def seed() -> None:
    if not _azure_enabled:
        logger.warning(
            "AZURE_STORAGE_CONNECTION_STRING not set — seeding with slug placeholders "
            "for images (frontend uses bundled assets as a fallback). Set it to upload "
            "media to Azure Blob Storage."
        )

    async with AsyncSessionLocal() as db:
        categories_by_slug = {}
        for cat_data in CATEGORIES:
            category = await upsert_category(db, cat_data)
            categories_by_slug[cat_data["slug"]] = category

        for product_data in PRODUCTS:
            category = categories_by_slug[product_data["category_slug"]]
            await upsert_product(db, product_data, category.id)

        await db.commit()
        logger.info("Seed complete: %d categories, %d products", len(CATEGORIES), len(PRODUCTS))


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
