#!/usr/bin/env python3
"""
Hertarget het bestaande levensboek-artikel op de zoekterm "levensboek maken".

AANLEIDING (GSC-weekrapport 2026-W32): `levensboek maken` staat op positie
55,9 met 24 impressies en +31,3 plaatsen week-op-week. Er is dus vraag en
beweging, maar geen zichtbaarheid.

WAAROM GEEN NIEUW ARTIKEL: het onderwerp is al gedekt door
`van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren` (gepubliceerd
12 dec 2025). Een tweede artikel zou daarmee kannibaliseren — precies de
fout die bij seed_seo_contentplan_2026.py voor zes onderwerpen is
voorkomen. Bovendien bestaat er al een derde pagina in dezelfde cluster
(`familieverhalen-bundelen-boek`), dus de cluster is eerder te vol dan te
leeg.

WAT ER DAN MIS IS: de pagina is geschreven vanuit retentie-perspectief.
Titel, meta_title en meta_description leiden allemaal met "exporteren" —
een woord dat alleen betekenis heeft als je al klant bent. De exacte
zoekterm "levensboek maken" komt in geen van de drie voor. Wie op
"levensboek maken" zoekt heeft nog geen account en wil weten hóé je er
een maakt; de pagina beantwoordt een vraag die die bezoeker nog niet
heeft bereikt.

WAT DIT SCRIPT DOET:
  1. Titel, meta_title, meta_description, keywords en excerpt hertargeten
     op "levensboek maken", met behoud van de bestaande invalshoek.
  2. De "In het kort"-opening vervangen en twee secties vooraan zetten die
     de zoekvraag direct beantwoorden ("wat is een levensboek", "in drie
     stappen"), vóór het bestaande exportverhaal.

WAT DIT SCRIPT BEWUST NIET DOET: de slug wijzigen. De URL staat in de
sitemap, is geïndexeerd, en er lopen interne links van minstens vier
andere artikelen naartoe. Die weggooien voor een mooiere slug kost meer
dan het oplevert.

Gebruik (productie):
  python scripts/retarget_levensboek_artikel.py --email admin@... --password ... \
      --url https://bewaardvoorjou-production.up.railway.app/api/v1

Eerst kijken wat er verandert, zonder te schrijven:
  python scripts/retarget_levensboek_artikel.py --dry-run \
      --url https://bewaardvoorjou-production.up.railway.app/api/v1
"""

import argparse
import re
import sys

import requests

SLUG = "van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren"

# Sentence case, zoekterm vooraan, invalshoek B (gebruiksgemak) — redactiegids v2.0.
NIEUWE_TITEL = "Levensboek maken: van digitaal verhaal naar een tastbaar boek"
NIEUWE_META_TITLE = "Levensboek maken: van verhaal naar tastbaar boek"
NIEUWE_META_DESCRIPTION = (
    "Een levensboek maken zonder schrijfervaring: verzamel de verhalen, orden "
    "ze, en laat er een gedrukt boek van maken dat generaties meegaat."
)
NIEUWE_KEYWORDS = (
    "levensboek maken, levensboek samenstellen, gedrukt levensboek, "
    "levensverhaal exporteren, biografie boek laten maken, levensverhaal op usb"
)
NIEUWE_EXCERPT = (
    "Een levensboek maken begint niet bij het boek, maar bij het verhaal. Ik leg "
    "uit hoe je van losse herinneringen een tastbare uitgave maakt."
)

# Vervangt de bestaande "In het kort"-alinea en zet twee secties vooraan die
# de zoekvraag beantwoorden voordat het bestaande exportverhaal begint.
NIEUWE_OPENING = """<p><strong>In het kort:</strong> een levensboek maken doe je in drie stappen — verhalen verzamelen, ze ordenen tot een leesbaar geheel, en er een tastbare uitgave van maken. Het schrijven is daarbij de kleinste stap. Het verzamelen is het echte werk, en precies daar haken de meeste mensen af.</p>

<h2>Wat een levensboek precies is</h2>
<p>Een levensboek is de verzamelde levensgeschiedenis van één persoon, verteld of opgeschreven in eigen woorden en meestal aangevuld met foto's. Het verschilt van een fotoalbum doordat de verhalen leidend zijn in plaats van de beelden. En het verschilt van een autobiografie doordat het niet bedoeld is om uit te geven: een levensboek maak je voor je eigen familie, niet voor de boekhandel. Dat verlaagt de lat aanzienlijk — het hoeft niet literair te zijn, het moet kloppen.</p>

<h2>Een levensboek maken in drie stappen</h2>
<ol>
<li><strong>Verzamelen.</strong> Begin bij de verhalen, niet bij de indeling. Vertellen gaat vrijwel iedereen makkelijker af dan schrijven, dus neem gesprekken op in plaats van te proberen meteen mooie zinnen te formuleren. Een <strong>empathische AI-interviewer</strong> stelt de vragen en vraagt door, zodat je niet voor een leeg scherm zit te bedenken waar je moet beginnen.</li>
<li><strong>Ordenen.</strong> Breng de verhalen in een volgorde die klopt. Chronologisch is de veiligste keuze, maar thematisch werkt vaak beter: werk, liefde, verlies, de plekken waar iemand woonde. Wat je hier doet is redigeren, niet herschrijven — de eigen woorden zijn juist het waardevolle.</li>
<li><strong>Tastbaar maken.</strong> Exporteer het geheel naar een verzorgd document en laat er een gedrukt boek van maken. Hoe dat werkt lees je hieronder.</li>
</ol>

<p>Mijn eigen vader liep vast bij stap één. Niet omdat hij niets te vertellen had, maar omdat hij achter de computer bleef hangen op de vraag hoe je begint. Toen iemand hem simpelweg vragen ging stellen, kwam alles los. Dat is de reden dat dit platform bestaat: de drempel zit zelden in het verhaal, bijna altijd in het formaat.</p>
"""


def login(base_url: str, email: str, password: str) -> str:
    resp = requests.post(
        f"{base_url}/auth/login",
        json={"email": email, "password": password},
    )
    if resp.status_code != 200:
        print(f"Inloggen mislukt: {resp.text}")
        sys.exit(1)
    return resp.json()["access_token"]


def haal_artikel(base_url: str) -> dict:
    resp = requests.get(f"{base_url}/blog/public/slug/{SLUG}")
    if resp.status_code != 200:
        print(f"Artikel niet gevonden ({resp.status_code}): {SLUG}")
        sys.exit(1)
    return resp.json()


def bouw_nieuwe_content(huidige: str) -> str:
    """Vervang de 'In het kort'-alinea door de nieuwe opening, laat de rest staan."""
    patroon = re.compile(
        r"^\s*<p><strong>In het kort:</strong>.*?</p>\s*", re.DOTALL
    )
    if not patroon.match(huidige):
        print(
            "  LET OP: de verwachte 'In het kort'-opening is niet gevonden. "
            "De nieuwe opening wordt vooraan geplakt zonder iets te vervangen."
        )
        return NIEUWE_OPENING + "\n" + huidige
    rest = patroon.sub("", huidige, count=1)
    return NIEUWE_OPENING + "\n" + rest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--email")
    parser.add_argument("--password")
    parser.add_argument("--url", default="http://localhost:8001/api/v1")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Toon wat er zou veranderen, zonder te schrijven (geen login nodig).",
    )
    args = parser.parse_args()

    artikel = haal_artikel(args.url)
    nieuwe_content = bouw_nieuwe_content(artikel["content"])

    print(f"\nArtikel: {SLUG}\n")
    for veld, nieuw in (
        ("title", NIEUWE_TITEL),
        ("meta_title", NIEUWE_META_TITLE),
        ("meta_description", NIEUWE_META_DESCRIPTION),
        ("keywords", NIEUWE_KEYWORDS),
        ("excerpt", NIEUWE_EXCERPT),
    ):
        print(f"  {veld}")
        print(f"    was : {artikel.get(veld)}")
        print(f"    wordt: {nieuw}")
    print(
        f"  content\n    was : {len(artikel['content'])} tekens"
        f"\n    wordt: {len(nieuwe_content)} tekens"
    )

    if args.dry_run:
        print("\nDry run — er is niets geschreven.")
        return

    if not (args.email and args.password):
        print("\n--email en --password zijn verplicht zonder --dry-run.")
        sys.exit(1)

    token = login(args.url, args.email, args.password)
    resp = requests.patch(
        f"{args.url}/blog/{artikel['id']}",
        json={
            "title": NIEUWE_TITEL,
            "meta_title": NIEUWE_META_TITLE,
            "meta_description": NIEUWE_META_DESCRIPTION,
            "keywords": NIEUWE_KEYWORDS,
            "excerpt": NIEUWE_EXCERPT,
            "content": nieuwe_content,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    if resp.status_code != 200:
        print(f"\nBijwerken mislukt: {resp.status_code} {resp.text}")
        sys.exit(1)
    print("\nBijgewerkt. De slug is ongewijzigd, dus alle bestaande links blijven werken.")


if __name__ == "__main__":
    main()
