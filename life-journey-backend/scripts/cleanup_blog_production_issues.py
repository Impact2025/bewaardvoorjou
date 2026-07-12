"""
Data-cleanup voor de live blog van bewaardvoorjou.nl.

Lost de productie-bugs op die zichtbaar waren op /blog:
  1. Test-artikel "Test Agent OS connectie" (excerpt "test", tag "Test")
     wordt verwijderd — het hoort niet op de publieke blog.
  2. Excerpt-lek: artikelen waarvan de excerpt raw markup bevat
     (`` `html ``, backticks, '>') krijgen een schone excerpt,
     herberekend via dezelfde _clean_excerpt als de publish-route.
  3. "prijsvergelijking": titel ge-Title-cased, de placeholder-prijs
     "€2.00" gecorrigeerd naar "€2.000" en de excerpt opgeschoond.

Idempotent & veilig: met --dry worden alleen de wijzigingen getoond.

    export DATABASE_URL="postgresql://user:pass@host:5432/db"
    python cleanup_blog_production_issues.py --dry
    python cleanup_blog_production_issues.py          # echt uitvoeren

Opmerking: er is GEEN .env in deze checkout, dus DATABASE_URL moet worden
meegegeven (of in de omgeving staan) om live te draaien. Zonder DB doet het
script niets behalve melden dat de connectie ontbreekt.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.blog_post import BlogPost
from app.api.v1.routes.publish import _clean_excerpt


# Artikelen die niet op de publieke blog horen (test/scratch).
TEST_SLUGS = {"test-agent-os-connectie"}

# Specifieke content-fixes op reeds gepubliceerde artikelen.
TITLE_FIXES = {
    "prijsvergelijking": "Prijsvergelijking",
}
PRICE_FIX_RE = re.compile(r"€\s*2\.00\b")  # duidelijke placeholder "€2.00"
PRICE_FIX_REPL = "€2.000"


def _excerpt_is_dirty(excerpt: str) -> bool:
    if not excerpt:
        return False
    return (
        excerpt.startswith("`")
        or "```" in excerpt
        or excerpt.lstrip().startswith("html")
        or excerpt.lstrip().startswith(">")
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="Blog productie-cleanup")
    ap.add_argument("--dry", action="store_true", help="alleen tonen, niets wijzigen")
    ap.add_argument(
        "--database-url",
        default=os.environ.get("DATABASE_URL"),
        help="Postgres-URL (anders uit omgeving DATABASE_URL)",
    )
    args = ap.parse_args()

    if not args.database_url:
        print("GEEN DATABASE_URL — kan niet live draaien. "
              "Exporteer DATABASE_URL of geef --database-url.")
        sys.exit(2)

    os.environ["DATABASE_URL"] = args.database_url
    db = SessionLocal()
    try:
        changed = 0

        # 1) Test-artikelen verwijderen
        for slug in TEST_SLUGS:
            post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
            if not post:
                continue
            print(f"[DELETE] {slug}  (titel: {post.title!r})" + ("  (DRY)" if args.dry else ""))
            if not args.dry:
                db.delete(post)
                changed += 1

        # 2)+3) Excerpt-lek + titel/prijs-fixes op gepubliceerde blog-posts
        posts = (
            db.query(BlogPost)
            .filter(BlogPost.section == "blog", BlogPost.status == "published")
            .all()
        )
        for post in posts:
            new_excerpt = None
            new_title = None
            new_content = None

            if _excerpt_is_dirty(post.excerpt or ""):
                new_excerpt = _clean_excerpt(post.content or "", post.meta_description or "")

            if post.slug in TITLE_FIXES and post.title != TITLE_FIXES[post.slug]:
                new_title = TITLE_FIXES[post.slug]

            if post.content and PRICE_FIX_RE.search(post.content):
                new_content = PRICE_FIX_RE.sub(PRICE_FIX_REPL, post.content)
                # excerpt opnieuw afleiden als die uit content kwam
                if new_excerpt is None and _excerpt_is_dirty(post.excerpt or ""):
                    new_excerpt = _clean_excerpt(new_content, post.meta_description or "")

            if new_excerpt is None and new_title is None and new_content is None:
                continue

            desc = []
            if new_title:
                desc.append(f"titel→{new_title!r}")
            if new_excerpt is not None:
                desc.append(f"excerpt→{new_excerpt[:60]!r}…")
            if new_content is not None:
                desc.append("content: €2.00→€2.000")
            print(f"[{post.slug}] {' '.join(desc)}" + ("  (DRY)" if args.dry else ""))

            if not args.dry:
                if new_title is not None:
                    post.title = new_title
                if new_excerpt is not None:
                    post.excerpt = new_excerpt
                if new_content is not None:
                    post.content = new_content
                changed += 1

        if not args.dry:
            db.commit()
        verb = "Zou wijzigen" if args.dry else "Heeft gewijzigd"
        print(f"\n{verb}: {changed} record(s).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
