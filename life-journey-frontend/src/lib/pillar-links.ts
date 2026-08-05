/**
 * Kiest de contextuele "pijlerlinks" onder aan een blog- of kennisbankartikel.
 *
 * Waarom dit bestaat: de kennisbank- en blogartikelen linkten uitsluitend naar
 * elkaar (zie related-articles.ts) en naar /register. De commerciële
 * landingspagina's — precies de pagina's die op koopintentie moeten ranken —
 * kregen daardoor geen enkele inkomende link uit de ~70 artikelen. Ze hingen
 * volledig aan de footer, en /levensverhaal-vastleggen ontbrak daar zelfs
 * helemaal (weespagina, nul interne links sitewide).
 *
 * De aanpak is bewust simpel en deterministisch:
 *
 *  1. RELEVANTIE. Elke pijler heeft trefwoordpatronen. We matchen die tegen
 *     slug + tags + keywords van het artikel en nemen de pijler met de meeste
 *     treffers. Zo krijgt een dementie-artikel de vastleggen-pijler en een
 *     jubileum-artikel de cadeau-pijler.
 *
 *  2. DE DEFAULT ALS VANGNET. /levensverhaal-vastleggen is de hoofdpijler en
 *     staat er altijd bij — als tweede link wanneer een andere pijler wint, en
 *     als enige link wanneer niets matcht. Daarmee heeft elk artikel er een
 *     link naartoe, wat de bestaande topical autoriteit van die pagina
 *     eindelijk ondersteunt.
 *
 * Maximaal twee links: genoeg om linkwaarde door te geven, weinig genoeg om
 * niet als linkfarm te lezen en de lezer niet te overladen.
 */

export interface Pillar {
  href: string;
  /** Ankertekst. Bevat de zoekterm waarop de doelpagina moet ranken. */
  label: string;
  /** Eén regel context, zodat de link redactioneel oogt en niet als banner. */
  teaser: string;
  /** Trefwoorden waarop dit onderwerp herkend wordt. Lowercase. */
  patterns: string[];
}

/** De hoofdpijler: staat altijd in de selectie. */
export const DEFAULT_PILLAR_HREF = "/levensverhaal-vastleggen";

export const PILLARS: Pillar[] = [
  {
    href: "/levensverhaal-vastleggen",
    label: "Levensverhaal vastleggen",
    teaser:
      "Hoe je je eigen verhaal stap voor stap vastlegt, met AI die de vragen stelt.",
    patterns: [
      "levensverhaal",
      "vastleggen",
      "interviewer",
      "vertellen",
      "herinnering",
      "dementie",
      "alzheimer",
      "mantelzorg",
      "ouder",
      "reminiscentie",
    ],
  },
  {
    href: "/levensverhaal-opschrijven",
    label: "Je levensverhaal opschrijven",
    teaser: "Liever zelf schrijven? Zo pak je het aan zonder schrijfervaring.",
    patterns: ["opschrijven", "schrijven", "schrijftips", "pen", "dagboek"],
  },
  {
    href: "/autobiografie-hulp",
    label: "Hulp bij je autobiografie",
    teaser:
      "Wat een autobiografie kost, oplevert en hoe het zonder ghostwriter kan.",
    patterns: [
      "autobiografie",
      "biografie",
      "ghostwriter",
      "memoires",
      "kosten",
      "laten schrijven",
    ],
  },
  {
    href: "/veilig-digitaal-familiearchief",
    label: "Een veilig digitaal familiearchief",
    teaser: "Waar je verhalen staan, wie erbij kan en hoe ze bewaard blijven.",
    patterns: [
      "archief",
      "familiearchief",
      "privacy",
      "veilig",
      "opslag",
      "servers",
      "beveiliging",
      "genealogie",
      "familiegeschiedenis",
    ],
  },
  {
    href: "/levensverhaal-bewaren-usb",
    label: "Je levensverhaal bewaren op USB",
    teaser: "Een tastbare kopie voor wie niets online wil laten staan.",
    patterns: ["usb", "export", "pdf", "download", "tastbaar", "boek", "print"],
  },
  {
    href: "/cadeau-opa-80-jaar",
    label: "Cadeau voor opa & oma",
    teaser: "Een verjaardagscadeau dat over vijftig jaar nog bestaat.",
    patterns: ["opa", "oma", "grootouder", "verjaardag", "80 jaar", "kleinkind"],
  },
  {
    href: "/mijlpaal-cadeau",
    label: "Cadeau voor een mijlpaal",
    teaser: "Voor 50, 60 of 65 jaar — of een jubileum dat telt.",
    patterns: [
      "mijlpaal",
      "jubileum",
      "getrouwd",
      "huwelijk",
      "cadeau",
      "moederdag",
      "abraham",
      "sarah",
    ],
  },
  {
    href: "/pensioen-afscheidscadeau",
    label: "Een pensioen-afscheid dat blijft",
    teaser: "Voor het afscheid van een collega die meer was dan een functie.",
    patterns: ["pensioen", "afscheid", "collega", "loopbaan", "werk", "carrière"],
  },
  {
    href: "/baby-herinneringen-vastleggen",
    label: "Baby-herinneringen vastleggen",
    teaser: "Het eerste jaar gaat snel. Zo houd je het vast.",
    patterns: ["baby", "zwanger", "geboorte", "kraam", "peuter", "eerste jaar"],
  },
];

/**
 * Bouwt de doorzoekbare tekst van een artikel. Slug telt mee omdat die bij
 * dit CMS het onderwerp het betrouwbaarst beschrijft: tags zijn versnipperd
 * en keywords ontbreken bij oudere artikelen.
 */
function haystack(article: PillarLinkInput): string {
  return [article.slug, article.tags ?? "", article.keywords ?? ""]
    .join(" ")
    .toLowerCase();
}

export interface PillarLinkInput {
  slug: string;
  tags?: string | null;
  keywords?: string | null;
}

/**
 * @param article Het artikel waar de lezer nu is.
 * @param count   Hoeveel pijlerlinks we tonen (standaard 2).
 */
export function pickPillarLinks(
  article: PillarLinkInput,
  count = 2
): Pillar[] {
  if (count <= 0) return [];

  const text = haystack(article);
  const fallback = PILLARS.find((p) => p.href === DEFAULT_PILLAR_HREF)!;

  const scored = PILLARS.map((pillar) => ({
    pillar,
    score: pillar.patterns.filter((p) => text.includes(p)).length,
  }))
    .filter((s) => s.score > 0)
    // Strikt aflopend op score; bij gelijkspel wint de eerste in PILLARS-
    // volgorde, zodat de uitkomst deterministisch is tussen builds.
    .sort((a, b) => b.score - a.score);

  const picked: Pillar[] = [];
  for (const { pillar } of scored) {
    if (picked.length >= count) break;
    if (!picked.some((p) => p.href === pillar.href)) picked.push(pillar);
  }

  // Het vangnet: de hoofdpijler hoort er altijd bij. Past hij niet meer,
  // dan verdringt hij de zwakste match — één link naar de hoofdpijler is
  // meer waard dan een tweede thematische link.
  if (!picked.some((p) => p.href === DEFAULT_PILLAR_HREF)) {
    if (picked.length >= count) picked.pop();
    picked.push(fallback);
  }

  return picked.slice(0, count);
}
