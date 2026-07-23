"""Standalone Azure Blob Storage diagnostic.

Run from the backend directory (venv active) to find out exactly why uploads fail:

    python -m scripts.check_blob

Reads .env directly (not through app.core.config) so it works regardless of which
code version is deployed. Prints the detected auth method, the containers that
actually exist in the storage account, and the result of a real test upload to each
configured container — with the full exception if anything fails. Secrets are masked.
"""
import os
import sys
import traceback
from pathlib import Path


def load_env(path: str = ".env") -> dict:
    env: dict[str, str] = {}
    p = Path(path)
    if not p.exists():
        print(f"WARNING: {p.resolve()} not found — reading process environment only.\n")
        return env
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def main() -> int:
    file_env = load_env()

    def get(name: str, default: str = "") -> str:
        return os.environ.get(name) or file_env.get(name, default)

    conn = get("AZURE_STORAGE_CONNECTION_STRING")
    account = get("AZURE_STORAGE_ACCOUNT")
    key = get("AZURE_STORAGE_KEY")
    product_container = get("AZURE_STORAGE_PRODUCT_CONTAINER")
    promo_container = get("AZURE_STORAGE_PROMO_CONTAINER")

    print("=== configuration ===")
    print(f"AZURE_STORAGE_CONNECTION_STRING set : {bool(conn)}")
    print(f"AZURE_STORAGE_ACCOUNT               : {account or '(unset)'}")
    print(f"AZURE_STORAGE_KEY set               : {bool(key)} (length {len(key)})")
    print(f"AZURE_STORAGE_PRODUCT_CONTAINER     : {product_container or '(unset)'}")
    print(f"AZURE_STORAGE_PROMO_CONTAINER       : {promo_container or '(unset)'}")
    print()

    try:
        from azure.storage.blob import BlobServiceClient, ContentSettings
    except ImportError:
        print("FAIL: azure-storage-blob is not installed in this venv.")
        print("Fix: pip install -r requirements.txt")
        return 1

    print("=== authenticating ===")
    try:
        if conn:
            service = BlobServiceClient.from_connection_string(conn)
            print("auth method: connection string")
        elif account and key:
            service = BlobServiceClient(
                account_url=f"https://{account}.blob.core.windows.net", credential=key
            )
            print("auth method: account + key")
        else:
            print("FAIL: no credentials. Set AZURE_STORAGE_CONNECTION_STRING, "
                  "or AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_KEY in .env")
            return 1
    except Exception:
        print("FAIL: could not build the client:")
        traceback.print_exc()
        return 1

    print("\n=== containers that actually exist in this storage account ===")
    try:
        names = [c.name for c in service.list_containers()]
        if names:
            for name in names:
                print(f"  - {name}")
        else:
            print("  (none)")
    except Exception:
        print("FAIL: could not list containers (usually a bad key, wrong account "
              "name, or a storage-account firewall blocking this VM):")
        traceback.print_exc()
        return 1

    configured = [c for c in (product_container, promo_container) if c]
    if not configured:
        print("\nFAIL: no container names configured in .env.")
        return 1

    exit_code = 0
    for container in configured:
        print(f"\n=== testing container {container!r} ===")
        if container not in names:
            print(f"  MISMATCH: {container!r} is not in the account. "
                  f"Set the .env value to one of: {names}")
            exit_code = 1
            continue
        try:
            blob = service.get_blob_client(container=container, blob="_diag_test.txt")
            blob.upload_blob(
                b"nutriadd diagnostic",
                overwrite=True,
                content_settings=ContentSettings(content_type="text/plain"),
            )
            print(f"  UPLOAD OK -> {blob.url}")
            blob.delete_blob()
            print("  cleanup OK")
        except Exception:
            print("  UPLOAD FAILED:")
            traceback.print_exc()
            exit_code = 1

    print("\n=== done ===" if exit_code == 0 else "\n=== finished with errors ===")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
