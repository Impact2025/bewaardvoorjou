import os
from PIL import Image, ImageDraw, ImageFont
import textwrap

# ── Configuratie ─────────────────────────────────────────────────────────────
OUTPUT_DIR = "public/images/covers"
BASE_URL = "https://bewaardvoorjou.nl"
BG_COLOR = (18, 16, 14)  # Donker
WIDTH, HEIGHT = 1200, 630  # OG image ratio
ACCENT_COLORS = {
    "levensverhaal": (232, 119, 60),      # Oranje
    "baby": (255, 152, 162),              # Roze
    "cadeau": (102, 178, 102),            # Groen
    "familie": (70, 130, 180),            # Staalblauw
    "kennisbank": (100, 100, 200),        # Paarsig
    "default": (200, 160, 120),           # Warm beige
}

# ── Functies ─────────────────────────────────────────────────────────────────

def get_accent(slug: str, title: str) -> tuple:
    """Bepaal accentkleur op basis van slug/titel."""
    slug_lower = slug.lower() + " " + title.lower()
    for keyword, color in ACCENT_COLORS.items():
        if keyword in slug_lower:
            return color
    return ACCENT_COLORS["default"]

def generate_cover(slug: str, title: str, subtitle: str = "", output_dir: str = OUTPUT_DIR):
    """Genereer een 1200×630 OG cover image."""
    os.makedirs(output_dir, exist_ok=True)

    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    accent = get_accent(slug, title)

    # ── Gradient overlay (licht accent rechtsonder) ──
    for y in range(HEIGHT):
        factor = y / HEIGHT
        r = int(BG_COLOR[0] * (1 - factor * 0.3) + accent[0] * factor * 0.3)
        g = int(BG_COLOR[1] * (1 - factor * 0.3) + accent[1] * factor * 0.3)
        b = int(BG_COLOR[2] * (1 - factor * 0.3) + accent[2] * factor * 0.3)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # ── Accent strik bovenaan ──
    for w in range(WIDTH):
        alpha = max(0, 1 - abs(w - WIDTH/2) / (WIDTH/2))
        r2 = int(accent[0] + (255 - accent[0]) * 0.5)
        g2 = int(accent[1] + (255 - accent[1]) * 0.5)
        b2 = int(accent[2] + (255 - accent[2]) * 0.5)
        line_alpha = int(alpha * 150)
        draw.point((w, 0), fill=(r2, g2, b2, line_alpha))
        draw.point((w, 1), fill=(r2, g2, b2, line_alpha // 2))

    # ── Accent lijn in accentkleur ──
    draw.rectangle([(60, HEIGHT - 80), (180, HEIGHT - 75)], fill=accent)

    # ── Titel ──
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    except:
        try:
            font_large = ImageFont.truetype("DejaVuSans-Bold.ttf", 48)
            font_medium = ImageFont.truetype("DejaVuSans.ttf", 28)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()

    # Word-wrap titel — max 4 regels
    wrapped = textwrap.wrap(title, width=35)
    if len(wrapped) > 4:
        wrapped = wrapped[:4]
    
    y_pos = HEIGHT // 2 - 60
    for line in wrapped:
        bbox = draw.textbbox((0, 0), line, font=font_large)
        x = (WIDTH - bbox[2]) // 2
        # Schaduw
        draw.text((x + 2, y_pos + 2), line, fill=(0, 0, 0, 80), font=font_large)
        draw.text((x, y_pos), line, fill=(255, 255, 255), font=font_large)
        y_pos += bbox[3] + 8

    # ── Subtitel / domein ──
    domain_text = "BewaardVoorJou.nl"
    bbox2 = draw.textbbox((0, 0), domain_text, font=font_medium)
    dx = (WIDTH - bbox2[2]) // 2
    dy = HEIGHT - 50
    draw.text((dx + 1, dy + 1), domain_text, fill=(0, 0, 0, 60), font=font_medium)
    draw.text((dx, dy), domain_text, fill=(180, 180, 180), font=font_medium)

    # ── Opslaan ──
    safe_slug = slug.replace("/", "_")
    out_path = os.path.join(output_dir, f"{safe_slug}.jpg")
    img.save(out_path, "JPEG", quality=85)
    return f"{BASE_URL}/{output_dir.replace('public/', '')}/{safe_slug}.jpg"


# ── Artikelen (uit sitemap) ──────────────────────────────────────────────────

ARTICLES = [
    # Blog
    ("blog/5-vragen-ouders-stellen-voordat-te-laat", "5 vragen aan je ouders voordat het te laat is"),
    ("blog/bewaard-voor-baby-live-digitale-babyboek", "Bewaard voor Baby: het digitale babyboek is live"),
    ("blog/digitaal-vs-fysiek-herinneringen-bewaren", "Digitaal of fysiek: hoe bewaar je herinneringen?"),
    ("blog/interview-ouder-starten-praktische-gids", "Interview met je ouder starten: praktische gids"),
    ("blog/levensverhaal-bewaren-geschenk-kinderen", "Levensverhaal bewaren: het grootste geschenk aan je kinderen"),
    ("blog/levensverhaal-opschrijven-hoe-u-herinneringen-bewaart-voor-d", "Levensverhaal opschrijven: hoe bewaart u herinneringen voor altijd?"),
    ("blog/vaderdag-cadeau-2026-voor-de-vader-die-alles-heeft", "Vaderdag cadeau 2026 voor de vader die alles al heeft"),
    ("blog/van-losse-verhalen-naar-een-blijvend-familieboek-zo-bundel-j", "Van losse verhalen naar blijvend familieboek"),
    # Kennisbank
    ("kennisbank/autobiografie-schrijven-stappenplan", "Autobiografie schrijven: stappenplan voor beginners"),
    ("kennisbank/babyboek-eerste-jaar-bijhouden-tips", "Babyboek eerste jaar bijhouden zonder stress: 5 tips"),
    ("kennisbank/babydagboek-app-vergelijken-2026", "Babydagboek app vergelijken: 4 opties voor Nederlandse ouders"),
    ("kennisbank/babyherinneringen-bewaren-10-manieren", "Babyherinneringen bewaren: 10 manieren om nooit iets te vergeten"),
    ("kennisbank/babyontwikkeling-per-maand-0-12", "Babyontwikkeling per maand: van 1 tot 12 maanden"),
    ("kennisbank/cadeau-70-jaar-originele-ideeen", "Cadeau 70 jaar: originele ideeën voor een bijzondere mijlpaal"),
    ("kennisbank/complete-gids-levensverhaal-vastleggen", "Complete gids: je levensverhaal vastleggen van A tot Z"),
    ("kennisbank/de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten", "De 58 hoofdstukken van je leven: wat kun je verwachten?"),
    ("kennisbank/digitaal-babyboek-waarom-digitaal", "Waarom een digitaal babyboek de beste keuze is"),
    ("kennisbank/digitaal-vs-papieren-babyboek-vergelijking", "Digitaal of papieren babyboek? De complete vergelijking"),
    ("kennisbank/digitale-nalatenschap-regelen-gids", "Digitale nalatenschap regelen: complete gids 2026"),
    ("kennisbank/eerste-verjaardag-baby-vieren-ideeen", "Baby's eerste verjaardag vieren: 5 ideeën"),
    ("kennisbank/familieverhalen-bundelen-boek", "Familieverhalen bundelen in een boek: zo doe je dat"),
    ("kennisbank/grootouders-op-de-hoogte-baby", "Grootouders op de hoogte houden van je baby: 5 manieren"),
    ("kennisbank/herinneringen-bewaren-kleinkinderen", "Herinneringen bewaren voor je kleinkinderen: waarom het belangrijk is"),
    ("kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal", "Hoe begin ik met het vastleggen van mijn levensverhaal?"),
    ("kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen", "Hoe exporteer ik mijn eigen data en herinneringen?"),
    ("kennisbank/hoe-kan-ik-mijn-abonnement-opzeggen", "Hoe kan ik mijn abonnement opzeggen?"),
    ("kennisbank/hoe-maak-ik-een-gratis-account-aan", "Hoe maak ik een gratis account aan?"),
    ("kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie", "Hoe werkt de tijdgestuurde vrijgave voor familie?"),
    ("kennisbank/hoe-werkt-praten-tegen-de-ai-interviewer", "Hoe werkt praten tegen de AI-interviewer?"),
    ("kennisbank/ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken", "Ik ben geen schrijver, kan ik BewaardVoorJou.nl toch gebruiken?"),
    ("kennisbank/interview-ouders-25-vragen", "25 vragen voor een interview met je ouders"),
    ("kennisbank/is-bewaardvoorjou-echt-gratis-te-proberen", "Is BewaardVoorJou.nl echt gratis te proberen?"),
    ("kennisbank/kan-ik-mijn-antwoorden-tussentijds-aanpassen-of-pauzeren", "Kan ik mijn antwoorden tussentijds aanpassen?"),
    ("kennisbank/kraamcadeau-babyboek-digitaal", "Kraamcadeau babyboek: waarom dit het perfecte cadeau is"),
    ("kennisbank/kraamcadeau-ouders-die-al-alles-hebben", "Kraamcadeau voor ouders die al alles hebben"),
    ("kennisbank/levensverhaal-bewaren-belang-familie", "Waarom je levensverhaal bewaren het mooiste is voor je familie"),
    ("kennisbank/levensverhaal-cadeau-geven", "Levensverhaal cadeau geven: het mooiste geschenk"),
    ("kennisbank/levensverhaal-laten-schrijven-kosten", "Levensverhaal laten schrijven: kosten en mogelijkheden"),
    ("kennisbank/memoires-schrijven-voorbeelden-en-tips", "Memoires schrijven: voorbeelden en tips"),
    ("kennisbank/mijlpalen-baby-eerste-jaar", "Mijlpalen baby eerste jaar: een complete gids"),
    ("kennisbank/originele-kraamcadeau-ideeen", "Originele kraamcadeau ideeën"),
    ("kennisbank/partner-ervaring-baby-eerste-jaar-samen", "Partner-ervaring: het eerste jaar samen vastleggen"),
    ("kennisbank/praten-in-plaats-van-typen-hoe-werkt-audio-en-video", "Praten in plaats van typen: audio- en video-ondersteuning"),
    ("kennisbank/stapsgewijze-handleiding-je-eerste-herinnering-opnemen", "Stapsgewijze handleiding: je eerste herinnering opnemen"),
    ("kennisbank/tips-om-herinneringen-op-te-halen-voor-je-biografie", "Tips om herinneringen op te halen voor je biografie"),
    ("kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers", "Waar worden mijn levensverhalen opgeslagen? 🇳🇱"),
    ("kennisbank/wat-doet-de-ai-interviewer-precies", "Wat doet de AI-interviewer precies?"),
    ("kennisbank/wie-heeft-er-toegang-tot-mijn-verhalen", "Wie heeft er toegang tot mijn verhalen?"),
]


if __name__ == "__main__":
    print(f"Genereren van {len(ARTICLES)} cover images...")
    for slug, title in ARTICLES:
        url = generate_cover(slug, title)
        print(f"  {slug} -> {url}")
    print(f"\n✅ Klaar! {len(ARTICLES)} covers gegenereerd in {OUTPUT_DIR}")
    print(f"\n📌 Volgende stap: in de API/DB de og_image updaten naar deze URLs")
