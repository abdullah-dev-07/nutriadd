"""promo media showcase table

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-23 00:00:00.000000

Adds the `promo_media` table backing the Home page promotional showcase, so
admin-uploaded images/videos (stored in Azure Blob Storage) can be displayed on
the site. Only URLs are stored here — never binary data.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "promo_media",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("media_type", sa.String(length=20), nullable=False, server_default="image"),
        sa.CheckConstraint("media_type IN ('image', 'video')", name="ck_promo_media_type"),
        sa.Column("url", sa.String(length=1024), nullable=False),
        sa.Column("poster_url", sa.String(length=1024), nullable=True),
        sa.Column("alt", sa.String(length=500), nullable=False),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_promo_media_sort_order", "promo_media", ["sort_order"])


def downgrade() -> None:
    op.drop_index("ix_promo_media_sort_order", table_name="promo_media")
    op.drop_table("promo_media")
