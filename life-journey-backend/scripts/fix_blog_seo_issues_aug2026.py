"""
SEO-databugs op de live blog van bewaardvoorjou.nl, gevonden bij een
handmatige audit van de 10 meest recente artikelen (8 aug 2026) en
vervolgens uitgebreid naar alle 86 gepubliceerde posts via een scan op
dezelfde patronen.

Lost op:
  1. Keyword-cannibalisatie: "digitale-erfenis-meer-dan-alleen-wachtwoorden"
     (2 aug 2026) target hetzelfde zoekwoord als het 7 maanden oudere
     "digitale-erfenis-regelen-meer-dan-alleen-wachtwoorden" (12 jan 2026,
     meer views, zelfde content-lengte). De oudere blijft canoniek; de
     nieuwere wordt gearchiveerd (status="archived", verdwijnt overal uit
     publieke queries — zie app/api/v1/routes/blog.py). De 301 van de oude
     URL naar de canonieke staat in life-journey-frontend/src/middleware.ts.
  2. Kapotte title/meta_title: "1-start-met-een-digitaal-levensverhaal-..."
     had een resterend "1. " hoofdstuknummer als titel EN een meta_title die
     midden in een woord was afgekapt ("...jouw n").
  3. meta_description/excerpt die een byline was in plaats van een
     beschrijving: "levensverhaal-op-usb-..." had letterlijk "Gepubliceerd
     op 15 maart 2025 door Marieke de Vries, erfgoedspecialist...".
  4. Vier meta_titles die midden in een woord waren afgekapt door de oude
     `data.get("meta_title", "")[:70]`-slice in de AI-SEO-optimalisatie
     (zie route-fix in app/api/v1/routes/blog.py, _truncate_at_word).
  5. Eén meta_description die met 71 tekens ruim onder de 145-160 tekens
     doelbudget bleef — SERP-ruimte onbenut.

Idempotent & veilig: met --dry worden alleen de wijzigingen getoond.

    export DATABASE_URL="postgresql://user:pass@host:5432/db"
    python fix_blog_seo_issues_aug2026.py --dry
    python fix_blog_seo_issues_aug2026.py          # echt uitvoeren

Na uitvoering: POST /api/revalidate met {"section":"blog"} (admin-token)
om de 900s ISR-window te omzeilen, anders duurt het tot 15 min voordat de
wijzigingen live zichtbaar zijn.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if not os.environ.get("DATABASE_URL"):
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except Exception:
        pass

from app.db.session import SessionLocal
from app.models.blog_post import BlogPost


# slug -> {veld: nieuwe_waarde}
FIELD_FIXES: dict[str, dict[str, str]] = {
    "1-start-met-een-digitaal-levensverhaal-de-basis-van-jouw": {
        "title": "Start met een digitaal levensverhaal: de basis van jouw nalatenschap",
        "meta_title": "Digitaal levensverhaal: de basis van je nalatenschap",
    },
    "levensverhaal-op-usb-7-manieren-voor-een-tastbaar-erfstuk": {
        "meta_description": (
            "Een levensverhaal op USB is een tastbaar erfstuk. Ontdek 7 manieren "
            "om audio, foto's en verhalen samen te brengen tot een blijvend "
            "digitaal aandenken."
        ),
        "excerpt": (
            "Een USB-stick met foto's, audio en verhalen is een cadeau dat blijft "
            "— ook zonder internet of abonnement. Zo maak jij er een blijvend "
            "erfstuk van."
        ),
    },
    "levensverhaal-laten-schrijven-cadeau-een-geschenk-dat-generaties-raakt": {
        "meta_title": "Levensverhaal laten schrijven cadeau dat generaties raakt",
    },
    "herinneringen-bewaren-voor-kinderen-maak-er-een-verhaal-van-dat-blijft-plakken": {
        "meta_title": "Herinneringen bewaren voor kinderen: zo blijft het plakken",
    },
    "biografie-laten-schrijven-de-complete-gids-voor-jouw-levensv": {
        "meta_title": "Biografie laten schrijven: de complete gids",
    },
    "eenzaamheid-onder-ouderen-doorbreken-met-herinneringen-die-g": {
        "meta_title": "Eenzaamheid onder ouderen doorbreken met herinneringen",
    },
    "herinneringen-bewaard-waarom-vastleggen-essentieel-is": {
        "meta_description": (
            "Foto's en brieven bewaar je, maar de verhalen erachter vervagen snel. "
            "Ontdek waarom herinneringen vastleggen essentieel is en hoe je er "
            "vandaag mee begint."
        ),
    },
}

# Slug die wordt gearchiveerd omdat hij cannibaliseert op een oudere post.
# De 301 naar de canonieke URL staat in life-journey-frontend/src/middleware.ts.
ARCHIVE_SLUG = "digitale-erfenis-meer-dan-alleen-wachtwoorden"
CANONICAL_SLUG = "digitale-erfenis-regelen-meer-dan-alleen-wachtwoorden"


def main() -> None:
    ap = argparse.ArgumentParser(description="Blog SEO-databugs fixen (aug 2026 audit)")
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

        # 1) Veld-fixes (titles/meta_title/meta_description/excerpt)
        for slug, fields in FIELD_FIXES.items():
            post = db.query(BlogPost).filter(BlogPost.slug == slug).first()
            if not post:
                print(f"[MISSING] {slug} — niet gevonden, overgeslagen")
                continue
            diffs = []
            for field, new_value in fields.items():
                old_value = getattr(post, field)
                if old_value == new_value:
                    continue
                diffs.append(f"{field}: {old_value!r} -> {new_value!r}")
                if not args.dry:
                    setattr(post, field, new_value)
            if diffs:
                print(f"[{slug}]" + ("  (DRY)" if args.dry else ""))
                for d in diffs:
                    print("   ", d)
                changed += 1

        # 2) Cannibalisatie: archiveer de nieuwere duplicaat-post
        dup = db.query(BlogPost).filter(BlogPost.slug == ARCHIVE_SLUG).first()
        canon = db.query(BlogPost).filter(BlogPost.slug == CANONICAL_SLUG).first()
        if dup and canon:
            if dup.status != "archived":
                print(
                    f"[ARCHIVE] {ARCHIVE_SLUG}  status {dup.status!r} -> 'archived' "
                    f"(cannibaliseert op {CANONICAL_SLUG})" + ("  (DRY)" if args.dry else "")
                )
                if not args.dry:
                    dup.status = "archived"
                changed += 1
            else:
                print(f"[{ARCHIVE_SLUG}] al gearchiveerd, niets te doen")
        else:
            print(f"[WAARSCHUWING] kon dup ({bool(dup)}) of canon ({bool(canon)}) niet vinden")

        if not args.dry:
            db.commit()
        verb = "Zou wijzigen" if args.dry else "Heeft gewijzigd"
        print(f"\n{verb}: {changed} record(s).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
