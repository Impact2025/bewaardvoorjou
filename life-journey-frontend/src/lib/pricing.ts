/**
 * Enige bron van waarheid voor pakketprijzen, voorraadstatus en
 * Product-structured-data.
 *
 * Waarom deze module bestaat: prijzen stonden losgekoppeld in vijf pagina's,
 * in metadata én in JSON-LD. Daardoor adverteerde /pricing nog het oude
 * 89/249/399-schema terwijl de zichtbare pagina en de backend allang
 * 79/149/229 hanteerden. Structured data die afwijkt van de zichtbare pagina
 * is een overtreding van het spam-beleid van Google, dus alles wat een prijs
 * of beschikbaarheid noemt hoort hier vandaan te komen.
 *
 * PRICE_EUR moet gelijk blijven aan PACKAGE_PRICES in
 * life-journey-backend/app/schemas/orders.py — pricing.test.ts bewaakt dat.
 */

export const SITE_URL = "https://bewaardvoorjou.nl";
export const BRAND_NAME = "BewaardVoorJou.nl";

// ─── Voorraad- en fasevlaggen ────────────────────────────────────────────────
// Deze vlaggen sturen zowel de pakketkaarten als de availability in de
// structured data aan. Eén plek aanpassen volstaat.

/** Dozen zijn nog in productie; digitale toegang start wel direct. */
export const BOX_IS_PREORDER = true;
export const ERFGOED_SOLD_OUT = true;
export const NALATENSCHAP_SOLD_OUT = true;

export type PackageCode = "VERHAAL" | "ERFGOED" | "NALATENSCHAP" | "BABY_GIFT";

export interface PackageDef {
  code: PackageCode;
  /** Naam zoals gebruikt in structured data en e-mails. */
  name: string;
  /** Prijs in hele euro's — spiegel van PACKAGE_PRICES (eurocenten) in de backend. */
  priceEur: number;
  /** Korte, feitelijke omschrijving voor structured data. */
  description: string;
  /** Absolute URL naar een productafbeelding, indien beschikbaar. */
  image?: string;
  soldOut: boolean;
  preorder: boolean;
}

export const PACKAGES: Record<PackageCode, PackageDef> = {
  VERHAAL: {
    code: "VERHAAL",
    name: "Verhaal",
    priceEur: 79,
    description:
      "Het complete digitale levensverhaal: alle 58 hoofdstukken, onbeperkte gesprekssessies met de persoonlijke gespreksleider, digitaal archief, deellinks en PDF-export.",
    soldOut: false,
    preorder: false,
  },
  ERFGOED: {
    code: "ERFGOED",
    name: "Erfgoed",
    priceEur: 149,
    description:
      "Alles van Verhaal, plus de fysieke Erfgoed Box: een A5 magneetdoos, een USB-stick in walnotenhout, een grafiet potlood en een A6 notitieboekje. Tot 5 familieleden lezen mee.",
    image: `${SITE_URL}/erfgoed-box.jpg`,
    soldOut: ERFGOED_SOLD_OUT,
    preorder: BOX_IS_PREORDER,
  },
  NALATENSCHAP: {
    code: "NALATENSCHAP",
    name: "Nalatenschap",
    priceEur: 229,
    description:
      "Eenmalig betalen voor levenslange digitale toegang. Inclusief de Erfgoed Box, een certificaat in waszegel-envelop, 5 familieleden en een jaarlijkse USB-export.",
    image: `${SITE_URL}/erfgoed-box.jpg`,
    soldOut: NALATENSCHAP_SOLD_OUT,
    preorder: BOX_IS_PREORDER,
  },
  BABY_GIFT: {
    code: "BABY_GIFT",
    name: "Bewaard voor Baby",
    priceEur: 59,
    description:
      "Het digitale babyboek als kraamcadeau: een jaar lang herinneringen bewaren met AI-begeleide vragen, 28 mijlpalen, partner meeschrijven en maandelijkse updates voor opa en oma.",
    soldOut: false,
    preorder: false,
  },
};

/** Prijs als weergavetekst, bijvoorbeeld "€149". */
export function formatEuro(amount: number): string {
  return `€${amount}`;
}

/** Prijs van een pakket als weergavetekst voor de zichtbare pagina. */
export function priceLabel(code: PackageCode): string {
  return formatEuro(PACKAGES[code].priceEur);
}

/** Prijs als schema.org-string: altijd punt-decimaal, nooit een valutateken. */
export function schemaPrice(code: PackageCode): string {
  return PACKAGES[code].priceEur.toFixed(2);
}

/**
 * schema.org availability die overeenkomt met wat de bezoeker op de pagina ziet.
 * Uitverkocht wint van pre-order: de kaart toont dan "TIJDELIJK UITVERKOCHT"
 * en er is geen koopknop.
 */
export function availabilityFor(code: PackageCode): string {
  const pkg = PACKAGES[code];
  if (pkg.soldOut) return "https://schema.org/SoldOut";
  if (pkg.preorder) return "https://schema.org/PreOrder";
  return "https://schema.org/InStock";
}

/**
 * priceValidUntil op één jaar na het moment van bouwen. Een vaste datum in de
 * code verloopt ongemerkt en maakt de offer dan niet-toonbaar in Google; deze
 * variant schuift bij elke deploy vanzelf mee.
 */
export function priceValidUntil(from: Date = new Date()): string {
  const until = new Date(from);
  until.setFullYear(until.getFullYear() + 1);
  return until.toISOString().slice(0, 10);
}

export function checkoutUrl(code: PackageCode, opts: { gift?: boolean } = {}): string {
  const gift = opts.gift ? "&gift=true" : "";
  return `${SITE_URL}/checkout?package=${code}${gift}`;
}

export interface OfferSpec {
  code: PackageCode;
  /** Afwijkende offer-naam, bijvoorbeeld "Erfgoed Box (Pakket 1)". */
  name?: string;
  gift?: boolean;
}

interface OfferJsonLd {
  "@type": "Offer";
  name: string;
  price: string;
  priceCurrency: "EUR";
  priceValidUntil: string;
  availability: string;
  url: string;
}

export function buildOffer(spec: OfferSpec, now: Date = new Date()): OfferJsonLd {
  const pkg = PACKAGES[spec.code];
  return {
    "@type": "Offer",
    name: spec.name ?? pkg.name,
    price: schemaPrice(spec.code),
    priceCurrency: "EUR",
    priceValidUntil: priceValidUntil(now),
    availability: availabilityFor(spec.code),
    url: checkoutUrl(spec.code, { gift: spec.gift }),
  };
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  /** Absolute URL; valt terug op de afbeelding van het eerste pakket met er een. */
  image?: string;
  /** Canonieke URL van de pagina waarop dit product staat. */
  url?: string;
  offers: OfferSpec[];
  now?: Date;
}

/**
 * Bouwt een Product-node voor in een @graph. Bewust geen aggregateRating of
 * review: die velden mogen alleen mee zodra er echte, op de site verzamelde
 * beoordelingen zijn. Google waarschuwt over het ontbreken ervan, maar
 * verzonnen beoordelingen leveren een handmatige actie op.
 */
export function buildProductJsonLd(input: ProductJsonLdInput): Record<string, unknown> {
  const { name, description, url, offers, now = new Date() } = input;
  const image = input.image ?? offers.map((o) => PACKAGES[o.code].image).find(Boolean);
  const built = offers.map((spec) => buildOffer(spec, now));

  return {
    "@type": "Product",
    name,
    description,
    ...(image ? { image } : {}),
    ...(url ? { url } : {}),
    brand: { "@type": "Brand", name: BRAND_NAME },
    offers: built.length === 1 ? built[0] : built,
  };
}
