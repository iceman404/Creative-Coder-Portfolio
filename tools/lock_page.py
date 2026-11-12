#!/usr/bin/env python3
"""Re-encrypt the GPU Playground locked content.

The plaintext lives in `private/gpu-playground-content.html`, which is
git-ignored and never leaves this machine. This tool derives an AES-256-GCM
key from a passphrase (PBKDF2-HMAC-SHA256, 310k iterations) and embeds the
resulting blob into gpu-playground.html between VAULT markers. The browser
side decrypts with Web Crypto; the passphrase itself is never stored.

Usage:
    python3 tools/lock_page.py                 # prompts for a passphrase
    python3 tools/lock_page.py "new password"  # passes it inline

Workflow to change the page or the password:
    1. Edit private/gpu-playground-content.html
    2. Run this tool with the (new) passphrase
    3. Commit gpu-playground.html — only ciphertext is committed
"""
import base64
import getpass
import os
import pathlib
import re
import sys

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
except ImportError:
    sys.exit("Missing dependency: pip install cryptography")

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT_FILE = ROOT / "private" / "gpu-playground-content.html"
PAGE_FILE = ROOT / "gpu-playground.html"
ITERATIONS = 310_000  # must match the browser-side PBKDF2 count


def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS)
    return kdf.derive(password.encode("utf-8"))


def main() -> None:
    if len(sys.argv) > 2:
        sys.exit("Usage: python3 tools/lock_page.py [passphrase]")

    password = sys.argv[1] if len(sys.argv) == 2 else getpass.getpass("Passphrase: ")
    if len(password) < 8:
        sys.exit("Refusing a passphrase shorter than 8 characters.")

    plaintext = CONTENT_FILE.read_text(encoding="utf-8")
    if not plaintext.strip():
        sys.exit(f"{CONTENT_FILE} is empty — nothing to encrypt.")

    salt = os.urandom(16)
    iv = os.urandom(12)
    aes = AESGCM(derive_key(password, salt))
    blob = base64.b64encode(salt + iv + aes.encrypt(iv, plaintext.encode("utf-8"), None)).decode()

    # wrap at 100 chars so the committed source stays readable
    lines = []
    for i in range(0, len(blob), 100):
        line = '    "' + blob[i : i + 100] + '"'
        lines.append(line)
    joined = " +\n".join(lines)
    block = "  var VAULT_BLOB =\n" + joined + ";\n"

    page = PAGE_FILE.read_text(encoding="utf-8")
    new_block = "// VAULT:BEGIN ( ciphertext of private/gpu-playground-content.html )\n" + block + "  // VAULT:END"
    if "// VAULT:BEGIN" in page:
        page = re.sub(r"// VAULT:BEGIN[\s\S]*?// VAULT:END", new_block, page, count=1)
    else:
        sys.exit("VAULT markers not found in gpu-playground.html")

    PAGE_FILE.write_text(page, encoding="utf-8")
    print(f"Encrypted {len(plaintext)} chars -> {len(blob)} b64 chars written to {PAGE_FILE.name}")


if __name__ == "__main__":
    main()
