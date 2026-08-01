/**
 * Gecureerde interne links van de baby-landingspagina's naar de
 * kennisbankartikelen over het eerste jaar.
 *
 * Waarom hardcoded en niet via de API opgehaald: dit is een redactionele
 * keuze, geen lijst. De volgorde, de groepering en de korte omschrijving per
 * artikel bepalen wij bewust — een `?tag=baby`-fetch zou dat overlaten aan de
 * tagging in de admin en bij elke nieuwe tag de hub laten schuiven.
 *
 * LET OP: haal je een artikel offline, verwijder de slug dan ook hier.
 * Er is geen automatische controle die dode links opvangt.
 */

export interface BabyKbLink {
  slug: string;
  title: string;
  blurb: string;
}

export interface BabyKbGroup {
  heading: string;
  links: BabyKbLink[];
}

export const BABY_KB_GROUPS: BabyKbGroup[] = [
  {
    heading: "Het eerste jaar volgen",
    links: [
      {
        slug: "mijlpalen-baby-eerste-jaar",
        title: "Mijlpalen baby eerste jaar",
        blurb: "De 28 momenten die je niet wilt missen",
      },
      {
        slug: "babyontwikkeling-per-maand-0-12",
        title: "Babyontwikkeling per maand",
        blurb: "Wat gebeurt er van 1 tot 12 maanden?",
      },
      {
        slug: "babyboek-eerste-jaar-bijhouden-tips",
        title: "Babyboek bijhouden zonder stress",
        blurb: "5 tips voor als je er nooit aan toekomt",
      },
      {
        slug: "eerste-verjaardag-baby-vieren-ideeen",
        title: "De eerste verjaardag vieren",
        blurb: "5 ideeën, en hoe je die dag bewaart",
      },
    ],
  },
  {
    heading: "Herinneringen bewaren",
    links: [
      {
        slug: "babyherinneringen-bewaren-10-manieren",
        title: "Babyherinneringen bewaren",
        blurb: "10 manieren om nooit iets te vergeten",
      },
      {
        slug: "digitaal-babyboek-waarom-digitaal",
        title: "Waarom ouders digitaal gaan",
        blurb: "Wat een digitaal babyboek anders maakt",
      },
      {
        slug: "digitaal-vs-papieren-babyboek-vergelijking",
        title: "Digitaal of papieren babyboek?",
        blurb: "De complete vergelijking",
      },
      {
        slug: "babydagboek-app-vergelijken-2026",
        title: "Babydagboek-apps vergelijken",
        blurb: "4 opties voor Nederlandse ouders",
      },
    ],
  },
  {
    heading: "Samen met je gezin",
    links: [
      {
        slug: "partner-ervaring-baby-eerste-jaar-samen",
        title: "Het eerste jaar samen vastleggen",
        blurb: "Hoe je partner meeschrijft",
      },
      {
        slug: "grootouders-op-de-hoogte-baby",
        title: "Opa en oma op de hoogte houden",
        blurb: "5 manieren die verder gaan dan appjes",
      },
    ],
  },
  {
    heading: "Als kraamcadeau",
    links: [
      {
        slug: "originele-kraamcadeau-ideeen",
        title: "15 originele kraamcadeau-ideeën",
        blurb: "Cadeautips die wél gewaardeerd worden",
      },
      {
        slug: "kraamcadeau-babyboek-digitaal",
        title: "Een babyboek als kraamcadeau",
        blurb: "Waarom dit blijft, lang na de kraamvisite",
      },
      {
        slug: "kraamcadeau-ouders-die-al-alles-hebben",
        title: "Voor ouders die al alles hebben",
        blurb: "7 ideeën voor een tweede of derde kind",
      },
    ],
  },
];

/** Alle gelinkte slugs, plat — handig voor tests en controles. */
export const BABY_KB_SLUGS: string[] = BABY_KB_GROUPS.flatMap((g) =>
  g.links.map((l) => l.slug)
);
