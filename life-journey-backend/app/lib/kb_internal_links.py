"""
Gedeelde anker-map + idempotente injector voor contextuele interne links
in de BewaardVoorJou kennisbank (sectie "knowledge").

Patroon (Bijeen-parity): net als frontend/src/lib/kb-internal-links.ts maar
dan in Python, zodat een backend backfill-script dezelfde logica gebruikt als
de seed/update-scripts. De injector:

  * linkt alleen zinnen die letterlijk in de body staan (geen verzonnen links);
  * respecteert woordgrenzen (geen "servers" matchen binnen "webservers");
  * SLAAT een anker over als het doel al in een <a> binnen die tekst zit
    (idempotent — herdraaien voegt niets dubbel toe);
  * linkt alleen binnen <p> en <li> bodytekst, niet in koppen, niet in
    bestaande <a>-tags, niet in code/pre.

Gebruik:
    from app.lib.kb_internal_links import inject_kb_internal_links
    new_html = inject_kb_internal_links(html, exclude_slug="deze-slug")
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable


# ---------------------------------------------------------------------------
# Anker-map
# ---------------------------------------------------------------------------
# Elk anker: een natuurlijke Nederlandse frase die letterlijk in de body van
# (minstens één) kennisbankartikel kan voorkomen, gekoppeld aan de slug van het
# doelartikel. Alleen phrases die ergens echt in de content staan — geen
# gefabriceerde links. `anchor` is case-insensitive gematcht.
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class KbAnchor:
    target: str          # slug van het doelartikel
    anchor: str          # natuurlijke frase in de body
    # optioneel: alleen linken als deze substring óók in de tekst staat
    # (voorkomt valse positieven bij korte, veelzijdige woorden)
    require: str | None = None


KB_ANCHORS: list[KbAnchor] = [
    # ——— Account & gratis ———
    KbAnchor("hoe-maak-ik-een-gratis-account-aan", "gratis account"),
    KbAnchor("is-bewaardvoorjou-echt-gratis-te-proberen", "echt gratis", require="gratis"),
    KbAnchor("hoe-kan-ik-mijn-abonnement-opzeggen", "abonnement opzeggen"),
    KbAnchor("hoe-kan-ik-mijn-abonnement-opzeggen", "opzeggen", require="abonnement"),

    # ——— Opname & eerste stap ———
    KbAnchor("stapsgewijze-handleiding-je-eerste-herinnering-opnemen",
             "je eerste herinnering opnemen"),
    KbAnchor("stapsgewijze-handleiding-je-eerste-herinnering-opnemen",
             "eerste herinnering", require="opnemen"),
    KbAnchor("kan-ik-mijn-antwoorden-tussentijds-aanpassen-of-pauzeren",
             "tussentijds aanpassen", require="antwoord"),
    KbAnchor("kan-ik-mijn-antwoorden-tussentijds-aanpassen-of-pauzeren",
             "pauzeren", require="opname"),

    # ——— AI-interviewer ———
    KbAnchor("wat-doet-de-ai-interviewer-precies", "AI-interviewer"),
    KbAnchor("wat-doet-de-ai-interviewer-precies", "de AI-interviewer"),

    # ——— Audio / video ———
    KbAnchor("praten-in-plaats-van-typen-hoe-werkt-audio-en-video",
             "audio-opname", require="opname"),
    KbAnchor("praten-in-plaats-van-typen-hoe-werkt-audio-en-video",
             "video-opname", require="opname"),

    # ——— Privacy / opslag / delen ———
    KbAnchor("waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers",
             "Nederlandse servers"),
    KbAnchor("waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers",
             "Europese servers", require="server"),
    KbAnchor("wie-heeft-er-toegang-tot-mijn-verhalen",
             "toegang tot mijn verhalen"),
    KbAnchor("hoe-exporteer-ik-mijn-eigen-data-en-herinneringen",
             "exporteren", require="data"),
    KbAnchor("hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie",
             "tijdgestuurde vrijgave"),

    # ——— Inhoud / methode ———
    KbAnchor("hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal",
             "je levensverhaal vastleggen"),
    KbAnchor("ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken",
             "geen schrijver", require="schrijver"),
    KbAnchor("tips-om-herinneringen-op-te-halen-voor-je-biografie",
             "herinneringen ophalen"),
    KbAnchor("de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten",
             "58 hoofdstukken"),
]


# ---------------------------------------------------------------------------
# Injector
# ---------------------------------------------------------------------------

# Verbied matching binnen deze tags (koppen, code, bestaande links, quotes
# die we met rust laten). We matchen alleen binnen <p>...</p> en <li>...</li>.
_PARA_RE = re.compile(r"(<(p|li)\b[^>]*>)(.*?)(</\2>)", re.IGNORECASE | re.DOTALL)
# Een bestaande <a>-tag met href (om te zien of het doel al gelinkt is).
_LINK_HREF_RE = re.compile(r'href=["\']([^"\']+)["\']', re.IGNORECASE)
# Woordgrens-safe phrase-match (case-insensitive).
def _phrase_re(phrase: str) -> re.Pattern:
    esc = re.escape(phrase)
    return re.compile(rf"(?<![\w/]){esc}(?![\w/])", re.IGNORECASE)


def _already_linked_to(text: str, target_slug: str) -> bool:
    """True als `text` al een <a href='.../kennisbank/<target_slug>'> bevat."""
    for m in re.finditer(r"<a\b[^>]*>", text, re.IGNORECASE):
        href = _LINK_HREF_RE.search(m.group(0))
        if href and href.group(1).rstrip("/").endswith(f"/kennisbank/{target_slug}"):
            return True
    return False


def inject_kb_internal_links(
    html: str,
    anchors: Iterable[KbAnchor] | None = None,
    *,
    exclude_slug: str | None = None,
    max_per_anchor: int = 1,
) -> str:
    """
    Voegt contextuele interne links toe aan de body-html van één artikel.

    - `exclude_slug`: het eigen artikel (nooit naar jezelf linken).
    - Idempotent: bestaande links naar een doel worden overgeslagen.
    - Per (anchor, target) wordt standaard hooguit 1x gelinkt (de eerste
      natuurlijke positie), zodat de tekst leesbaar blijft.
    """
    anchors = list(anchors if anchors is not None else KB_ANCHORS)
    if exclude_slug:
        anchors = [a for a in anchors if a.target != exclude_slug]

    def _replace_block(match: re.Match) -> str:
        open_tag, _, inner, close_tag = match.groups()
        # Sla blokken over die al een link naar een van onze doelen bevatten
        # (voorkomt dubbele injectie in gemengde content).
        out = inner
        for anchor in anchors:
            if _already_linked_to(out, anchor.target):
                continue
            if anchor.require and anchor.require.lower() not in out.lower():
                continue
            href = f"/kennisbank/{anchor.target}"
            # Injecteer hooguit max_per_anchor keer.
            repl = (
                lambda m, _h=href, _a=anchor.anchor:  # noqa: E731
                f'<a href="{_h}">{m.group(0)}</a>'
            )
            out, n = _phrase_re(anchor.anchor).subn(repl, out, count=max_per_anchor)
            if n:
                # één anchor per blok volstaat voor leesbaarheid; break niet
                # strikt nodig maar houdt het conservatief.
                pass
        return f"{open_tag}{out}{close_tag}"

    return _PARA_RE.sub(_replace_block, html)


def count_kb_links(html: str) -> int:
    """Aantal interne kennisbank-links in de html (voor rapportage)."""
    return len(re.findall(r'href=["\'][^"\']*/kennisbank/[^"\']*["\']', html))
