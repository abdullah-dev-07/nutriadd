"""Manage the NutriAdd admin account(s).

Run from the `backend/` directory with the virtualenv active, ON THE SERVER
(it talks to whatever DATABASE_URL points at — i.e. production MySQL on the VPS):

    # 1) See who is currently an admin:
    python -m scripts.manage_admin list

    # 2) Create a NEW admin (password is prompted, never passed on the CLI so it
    #    won't land in shell history):
    python -m scripts.manage_admin create-admin --email new-admin@example.com \
        --name "New Admin"

    # 3) Demote an OLD admin back to a regular user (keeps the account + history):
    python -m scripts.manage_admin demote --email old-admin@example.com

You can also do the full swap in one go — create the new admin and demote the
old one:

    python -m scripts.manage_admin swap \
        --new-email new-admin@example.com --new-name "New Admin" \
        --old-email old-admin@example.com

Guard an existing admin, and fully remove an old one safely:

    # Confirm an account exists, is active, and is an admin (exits non-zero if not):
    python -m scripts.manage_admin verify-admin --email keep-admin@example.com

    # Remove an old account. It is HARD-DELETED only if it owns no orders;
    # if it owns orders, it is instead deactivated + demoted so order history
    # is preserved (see the FK-safety note in `remove`).
    python -m scripts.manage_admin remove --email old-admin@example.com

Notes:
- Idempotent: re-running `create-admin` on an existing email promotes that user
  to admin (and updates the password only if you pass --set-password).
- Passwords are hashed with the same bcrypt path the app's auth uses.
- Nothing here deletes accounts; demote is reversible.
"""
import argparse
import asyncio
import getpass
import logging
import sys

from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.base import AsyncSessionLocal
from app.models.order import Order
from app.models.user import User, UserRole

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("manage_admin")

MIN_PASSWORD_LEN = 8


def _prompt_password() -> str:
    while True:
        pw = getpass.getpass("New admin password: ")
        if len(pw) < MIN_PASSWORD_LEN:
            print(f"  Password must be at least {MIN_PASSWORD_LEN} characters.")
            continue
        confirm = getpass.getpass("Confirm password: ")
        if pw != confirm:
            print("  Passwords do not match, try again.")
            continue
        return pw


async def _get_by_email(db, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def list_admins() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == UserRole.admin).order_by(User.created_at)
        )
        admins = result.scalars().all()
        if not admins:
            logger.info("No admin accounts found.")
            return
        logger.info("Current admin account(s):")
        for a in admins:
            status = "active" if a.is_active else "INACTIVE"
            logger.info("  - %s  (%s)  [%s]", a.email, a.full_name, status)


async def create_admin(email: str, name: str, password: str | None) -> None:
    async with AsyncSessionLocal() as db:
        user = await _get_by_email(db, email)
        if user is not None:
            # Promote an existing account.
            user.role = UserRole.admin
            user.is_active = True
            if password:
                user.hashed_password = hash_password(password)
                logger.info("Existing user %s promoted to admin and password reset.", email)
            else:
                logger.info("Existing user %s promoted to admin (password unchanged).", email)
        else:
            if not password:
                logger.error("No existing user for %s — a password is required to create one.", email)
                sys.exit(1)
            user = User(
                email=email,
                full_name=name,
                hashed_password=hash_password(password),
                role=UserRole.admin,
                is_active=True,
            )
            db.add(user)
            logger.info("Created new admin account: %s (%s)", email, name)
        await db.commit()


async def demote(email: str) -> None:
    async with AsyncSessionLocal() as db:
        user = await _get_by_email(db, email)
        if user is None:
            logger.error("No user found with email %s — nothing to demote.", email)
            sys.exit(1)
        if user.role != UserRole.admin:
            logger.info("%s is already a regular user; no change.", email)
            return
        user.role = UserRole.user
        await db.commit()
        logger.info("Demoted %s from admin to regular user.", email)


async def _order_count(db, user_id) -> int:
    result = await db.execute(
        select(func.count()).select_from(Order).where(Order.user_id == user_id)
    )
    return int(result.scalar_one())


async def verify_admin(email: str) -> None:
    """Confirm a user exists, is active, and is an admin. Exits non-zero if not,
    so it can be used as a precondition/guard before making other changes."""
    async with AsyncSessionLocal() as db:
        user = await _get_by_email(db, email)
        if user is None:
            logger.error("VERIFY FAILED: no account for %s.", email)
            sys.exit(1)
        problems = []
        if not user.is_active:
            problems.append("account is INACTIVE")
        if user.role != UserRole.admin:
            problems.append(f"role is '{user.role.value}', not admin")
        if problems:
            logger.error("VERIFY FAILED for %s: %s.", email, "; ".join(problems))
            sys.exit(1)
        logger.info(
            "VERIFY OK: %s (%s) exists, is active, and is an admin.",
            email,
            user.full_name,
        )


async def remove(email: str) -> None:
    """Safely remove an account.

    Idempotent: if the account is already gone, reports that and exits cleanly.

    Foreign-key safety: `orders.user_id` is ON DELETE RESTRICT and carries no ORM
    cascade, so an account that owns orders CANNOT and MUST NOT be hard-deleted —
    doing so would either fail the constraint or (if the schema changed) destroy
    business/order history. In that case we refuse the delete and instead
    deactivate + demote the account, preserving all order records while removing
    its access. Accounts with zero orders are hard-deleted; their addresses and
    cart rows fall away automatically via ON DELETE CASCADE.
    """
    async with AsyncSessionLocal() as db:
        user = await _get_by_email(db, email)
        if user is None:
            logger.info("%s does not exist — nothing to remove (already gone).", email)
            return

        orders = await _order_count(db, user.id)
        if orders > 0:
            # Preserve order history — deactivate + demote instead of deleting.
            changed = user.is_active or user.role == UserRole.admin
            user.is_active = False
            user.role = UserRole.user
            await db.commit()
            logger.warning(
                "%s owns %d order(s), so it was NOT deleted (that would destroy "
                "order history). Instead it was deactivated and demoted to a "
                "regular user — it can no longer log in or access admin. %s",
                email,
                orders,
                "Applied changes." if changed else "Already deactivated/demoted.",
            )
            logger.warning(
                "If you truly need it fully gone, reassign or archive its %d "
                "order(s) first, then re-run this command.",
                orders,
            )
            return

        # No orders → safe hard delete (addresses/cart cascade away).
        await db.delete(user)
        await db.commit()
        logger.info("Removed %s completely from the system (owned no orders).", email)


def main() -> None:
    parser = argparse.ArgumentParser(description="Manage NutriAdd admin accounts.")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="List current admin accounts.")

    p_create = sub.add_parser("create-admin", help="Create or promote an admin.")
    p_create.add_argument("--email", required=True)
    p_create.add_argument("--name", default="Administrator")
    p_create.add_argument(
        "--set-password",
        action="store_true",
        help="Prompt for and set/reset the password (required when creating a new user).",
    )

    p_demote = sub.add_parser("demote", help="Demote an admin back to a regular user.")
    p_demote.add_argument("--email", required=True)

    p_swap = sub.add_parser("swap", help="Create/promote a new admin AND demote an old one.")
    p_swap.add_argument("--new-email", required=True)
    p_swap.add_argument("--new-name", default="Administrator")
    p_swap.add_argument("--old-email", required=True)

    p_verify = sub.add_parser(
        "verify-admin", help="Confirm a user exists, is active, and is an admin."
    )
    p_verify.add_argument("--email", required=True)

    p_remove = sub.add_parser(
        "remove",
        help="Safely remove an account (hard-delete if it owns no orders; "
        "otherwise deactivate + demote to preserve order history).",
    )
    p_remove.add_argument("--email", required=True)

    args = parser.parse_args()

    if args.command == "list":
        asyncio.run(list_admins())

    elif args.command == "create-admin":
        password = _prompt_password() if args.set_password else None
        asyncio.run(create_admin(args.email, args.name, password))
        asyncio.run(list_admins())

    elif args.command == "demote":
        asyncio.run(demote(args.email))
        asyncio.run(list_admins())

    elif args.command == "swap":
        # New admin is always created fresh here → always needs a password.
        password = _prompt_password()
        asyncio.run(create_admin(args.new_email, args.new_name, password))
        asyncio.run(demote(args.old_email))
        asyncio.run(list_admins())

    elif args.command == "verify-admin":
        asyncio.run(verify_admin(args.email))

    elif args.command == "remove":
        asyncio.run(remove(args.email))
        asyncio.run(list_admins())


if __name__ == "__main__":
    main()
