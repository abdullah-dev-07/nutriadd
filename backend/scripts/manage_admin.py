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

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import AsyncSessionLocal
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


if __name__ == "__main__":
    main()
