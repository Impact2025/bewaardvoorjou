"""
Discovery / dry-run van de KB-interne-link injector tegen de ECHTE
kennisbank-content (de ARTICLES-lijst uit update_kennisbank.py).

Bewijst — zonder database — hoeveel natuurlijke, niet-gelinkte ankerparen
de injector zou toevoegen, en toont per artikel de voorgestelde links.
Dit is de "offline verificatie" (Bijeen-parity): we fabriceren niets, we
matchen alleen phrases die letterlijk in de body staan.

    cd life-journey-backend && ./.venv/Scripts/python.exe scripts/discover_kb_link_gaps.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.lib.kb_internal_links import (
    count_kb_links,
    inject_kb_internal_links,
)

# Importeer de echte content (ARTICLES) uit het bestaande update-script.
from scripts.update_kennisbank import ARTICLES


def main() -> None:
    total_before = 0
    total_after = 0
    print(f"Scan van {len(ARTICLES)} kennisbank-artikelen\n")
    for art in ARTICLES:
        slug = art["slug"]
        html = art["content"]
        before = count_kb_links(html)
        # exclude_slug = eigen artikel (nooit naar jezelf linken)
        new_html = inject_kb_internal_links(html, exclude_slug=slug)
        after = count_kb_links(new_html)
        added = after - before
        total_before += before
        total_after += after
        flag = f"+{added}" if added else "  0"
        print(f"  [{flag:>3}] {slug}  ({before}→{after} links)")
    print(f"\nTotaal interne links: {total_before} → {total_after}  "
          f"(+{total_after - total_before} nieuw, idempotent)")


if __name__ == "__main__":
    main()
