#!/usr/bin/env python3
"""Build the encrypted GPU Lab bundle from private/metal-playground.

Every file under private/metal-playground is encrypted with AES-256-GCM
(key = PBKDF2-HMAC-SHA256 of the passphrase, 310k iterations, fixed salt)
and written to gpu-lab/<relative-path>.enc as raw binary [iv 12][ciphertext].

gpu-lab/sw.js (plaintext) decrypts these at runtime for unlocked sessions;
the passphrase never touches the repository.

Usage:
    python3 tools/build_gpu_lab.py "passphrase"
"""
import base64
import os
import pathlib
import sys

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
except ImportError:
    sys.exit("Missing dependency: pip install cryptography")

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "private" / "metal-playground"
OUT = ROOT / "gpu-lab"
SALT = bytes.fromhex("0fea94853381145f903d14110e1ddddd")
PBKDF2_ITERATIONS = 310_000  # must match gpu-lab/sw.js


def derive_key(password: str) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=SALT, iterations=PBKDF2_ITERATIONS)
    return kdf.derive(password.encode("utf-8"))


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('Usage: python3 tools/build_gpu_lab.py "passphrase"')
    password = sys.argv[1]
    if len(password) < 8:
        sys.exit("Refusing a passphrase shorter than 8 characters.")
    if not SRC.is_dir():
        sys.exit(f"Missing source directory: {SRC}")

    key = derive_key(password)
    aes = AESGCM(key)

    # clear stale ciphertexts so removed files disappear from the bundle
    for old in OUT.rglob("*.enc"):
        old.unlink()

    count = 0
    total = 0
    for src in sorted(SRC.rglob("*")):
        if not src.is_file():
            continue
        rel = src.relative_to(SRC).as_posix()
        data = src.read_bytes()
        iv = os.urandom(12)
        blob = iv + aes.encrypt(iv, data, None)
        dest = OUT / (rel + ".enc")
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(blob)
        count += 1
        total += len(blob)

    # the app's own index.html ships as the decrypted-into-iframe document
    index_src = SRC / "index.html"
    iv = os.urandom(12)
    blob = iv + aes.encrypt(iv, index_src.read_bytes(), None)
    (OUT / "app-inner.html.enc").write_bytes(blob)
    count += 1
    total += len(blob)

    print(f"Encrypted {count} files ({total / 1024:.0f} KiB of ciphertext) -> {OUT}/")


if __name__ == "__main__":
    main()
