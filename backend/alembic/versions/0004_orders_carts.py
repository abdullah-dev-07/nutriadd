"""order_number, idempotency_key on orders + server-side carts

Revision ID: 0004
Revises: 0003
Create Date: 2026-08-11 00:00:00.000000

- Adds `order_number` (unique, human-friendly) and `idempotency_key` to orders.
  Existing rows are backfilled with a unique legacy order number.
- Adds `carts` and `cart_items` tables for per-user server-side carts.
"""
import uuid
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- orders: new columns ---
    # Add order_number as nullable first so existing rows don't violate NOT NULL.
    op.add_column("orders", sa.Column("order_number", sa.String(length=32), nullable=True))
    op.add_column("orders", sa.Column("idempotency_key", sa.String(length=64), nullable=True))

    # Backfill existing orders with a unique legacy order number.
    conn = op.get_bind()
    orders = conn.execute(sa.text("SELECT id FROM orders WHERE order_number IS NULL")).fetchall()
    for row in orders:
        legacy = f"NA-LEGACY-{uuid.uuid4().hex[:8].upper()}"
        conn.execute(
            sa.text("UPDATE orders SET order_number = :num WHERE id = :id"),
            {"num": legacy, "id": row[0]},
        )

    # Now enforce NOT NULL + unique + indexes. batch_alter_table keeps this working
    # on SQLite (used in tests), which can't ALTER a column's nullability in place;
    # on MySQL (production) it emits a normal ALTER.
    with op.batch_alter_table("orders") as batch:
        batch.alter_column("order_number", existing_type=sa.String(length=32), nullable=False)
        batch.create_index("ix_orders_order_number", ["order_number"], unique=True)
        batch.create_index("ix_orders_idempotency_key", ["idempotency_key"])

    # --- carts ---
    op.create_table(
        "carts",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_carts_user_id", ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", name="uq_carts_user_id"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_carts_user_id", "carts", ["user_id"])

    # --- cart_items ---
    op.create_table(
        "cart_items",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("cart_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("product_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.ForeignKeyConstraint(["cart_id"], ["carts.id"], name="fk_cart_items_cart_id", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["product_id"], ["products.id"], name="fk_cart_items_product_id", ondelete="CASCADE"
        ),
        sa.UniqueConstraint("cart_id", "product_id", name="uq_cart_items_cart_product"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
        mysql_collate="utf8mb4_unicode_ci",
    )
    op.create_index("ix_cart_items_cart_id", "cart_items", ["cart_id"])


def downgrade() -> None:
    op.drop_index("ix_cart_items_cart_id", table_name="cart_items")
    op.drop_table("cart_items")
    op.drop_index("ix_carts_user_id", table_name="carts")
    op.drop_table("carts")
    op.drop_index("ix_orders_idempotency_key", table_name="orders")
    op.drop_index("ix_orders_order_number", table_name="orders")
    op.drop_column("orders", "idempotency_key")
    op.drop_column("orders", "order_number")
