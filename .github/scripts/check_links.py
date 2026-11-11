#!/usr/bin/env python3
"""Static link & asset checker.

Verifies that every internal href/src reference in the site's HTML resolves to
a real file, and that every sitemap URL maps to a tracked file. Catches the
classic static-site rot: renamed pages, deleted assets, dead sitemap entries.
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]

SKIP_PREFIXES = ("http://", "https://", "//", "#", "mailto:", "tel:", "data:", "javascript:")

errors = []
checked = 0


def resolve(base_dir: pathlib.Path, link: str):
    """Map a reference to a file on disk, trying the .html alias for
    extensionless URLs (GitHub Pages clean-URL style)."""
    link = link.split("#")[0].split("?")[0].strip()
    if not link:
        return None
    if link.startswith("/"):
        target = ROOT / link.lstrip("/")
        if not target.exists() and not target.suffix:
            target = ROOT / (link.lstrip("/") + ".html")
        return target
    target = base_dir / link
    if not target.exists() and not target.suffix:
        alias = pathlib.Path(str(target) + ".html")
        if alias.exists():
            return alias
    return target


SKIP_DIRS = {"node_modules", "dist", "build", ".git"}

html_files = sorted(
    p for p in ROOT.rglob("*.html")
    if not any(part in SKIP_DIRS or part.startswith(".") for part in p.relative_to(ROOT).parts[:-1])
)

for f in html_files:
    text = f.read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r'(?:href|src)="([^"]+)"', text):
        link = m.group(1).strip()
        if not link or any(link.startswith(p) for p in SKIP_PREFIXES):
            continue
        checked += 1
        target = resolve(f.parent, link)
        if target is None or not target.exists():
            errors.append(f"{f.relative_to(ROOT)}: broken reference '{link}'")

sitemap = ROOT / "sitemap.xml"
if sitemap.exists():
    for loc in re.findall(r"<loc>([^<]+)</loc>", sitemap.read_text(encoding="utf-8")):
        path = loc.replace("https://www.iceman404.com", "").lstrip("/") or "index.html"
        target = ROOT / path
        if not target.exists() and not target.suffix:
            target = ROOT / (path + ".html")
        if not target.exists():
            errors.append(f"sitemap.xml: URL '{loc}' does not map to a file")
        else:
            checked += 1

if errors:
    print(f"FAILED - {len(errors)} broken reference(s):")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)

print(f"OK - {checked} internal references checked across {len(html_files)} HTML files; all sitemap URLs resolve.")
