"""initial schema (MySQL / InnoDB / utf8mb4)

Revision ID: 0001
Revises:
Create Date: 2026-07-22 00:00:00.000000

Targets Azure Database for MySQL Flexible Server (MySQL 8.0). UUID primary/foreign
keys use SQLAlchemy's portable ``sa.Uuid`` type, which is stored as CHAR(32) on MySQL.
Media is stored in Azure Blob Storage; only the resulting URLs live in the DB.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Applied to every table so the whole schema is InnoDB (FKs, transactions) + utf8mb4.
_TABLE_KW = {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"}


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False, server_default="user"),
        sa.CheckConstraint("role IN ('user', 'admin')", name="ck_users_role"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
        **_TABLE_KW,
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "categories",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.UniqueConstraint("slug", name="uq_categories_slug"),
        **_TABLE_KW,
    )
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)

    op.create_table(
        "products",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("sku", sa.String(length=64), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("category_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("short_description", sa.String(length=500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False, server_default="PKR"),
        sa.Column("availability", sa.String(length=20), nullable=False, server_default="in_stock"),
        sa.CheckConstraint("availability IN ('in_stock', 'out_of_stock')", name="ck_products_availability"),
        # Azure Blob Storage URLs (never binary data).
        sa.Column("image_url", sa.String(length=1024), nullable=False),
        sa.Column("promo_image_url", sa.String(length=1024), nullable=True),
        # JSON list columns — no server_default (MySQL rejects literal defaults on JSON);
        # the ORM/seed always supplies a value.
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("benefits", sa.JSON(), nullable=False),
        sa.Column("features", sa.JSON(), nullable=False),
        sa.Column("ingredients", sa.JSON(), nullable=True),
        sa.Column("usage_instructions", sa.Text(), nullable=True),
        sa.Column("warnings", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(
            ["category_id"], ["categories.id"], name="fk_products_category_id", ondelete="RESTRICT"
        ),
        sa.UniqueConstraint("sku", name="uq_products_sku"),
        sa.UniqueConstraint("slug", name="uq_products_slug"),
        **_TABLE_KW,
    )
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)
    op.create_index("ix_products_slug", "products", ["slug"], unique=True)
    op.create_index("ix_products_category_id", "products", ["category_id"])

    op.create_table(
        "orders",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("customer_name", sa.String(length=255), nullable=False),
        sa.Column("customer_email", sa.String(length=255), nullable=False),
        sa.Column("customer_phone", sa.String(length=64), nullable=False),
        sa.Column("shipping_address", sa.Text(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.CheckConstraint(
            "status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')",
            name="ck_orders_status",
        ),
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=False),
        sa.Column("total", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_orders_user_id", ondelete="RESTRICT"),
        **_TABLE_KW,
    )
    op.create_index("ix_orders_user_id", "orders", ["user_id"])

    op.create_table(
        "order_items",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("order_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("product_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], name="fk_order_items_order_id", ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["product_id"], ["products.id"], name="fk_order_items_product_id", ondelete="RESTRICT"
        ),
        **_TABLE_KW,
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"])

    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=64), nullable=True),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        **_TABLE_KW,
    )


def downgrade() -> None:
    op.drop_table("contact_messages")
    op.drop_index("ix_order_items_product_id", table_name="order_items")
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_table("order_items")
    op.drop_index("ix_orders_user_id", table_name="orders")
    op.drop_table("orders")
    op.drop_index("ix_products_category_id", table_name="products")
    op.drop_index("ix_products_slug", table_name="products")
    op.drop_index("ix_products_sku", table_name="products")
    op.drop_table("products")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_table("categories")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
