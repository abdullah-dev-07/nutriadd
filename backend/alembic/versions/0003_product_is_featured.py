"""add is_featured to products

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-11 00:00:00.000000

Adds an admin-controlled `is_featured` flag to products so the home page can
highlight selected products. Defaults to false for all existing rows.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "is_featured",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("products", "is_featured")
