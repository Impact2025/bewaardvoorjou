import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { GiftOffer } from "@/components/gift/GiftOffer";
import {
  FaqSection,
  InShort,
  RelatedLinks,
  breadcrumbJsonLd,
  faqJsonLd,
  type Faq,
} from "@/components/landing/LandingBlocks";
import {
  buildProductJsonLd,
  giftCheckoutPath,
  giftPackage,
  priceLabel,
} from "@/lib/pricing";
import { ArrowRight, BookHeart, CheckCircle, Heart, Mic, Users } from "lucide-react";

const PAGE_URL = "https://bewaardvoorjou.nl/cadeau-oma";
const GIFT_CODE = giftPackage();
const TITLE = "Origineel cadeau voor oma: haar verhaal, voor altijd bewaard";
const OG_IMAGE = `${PAGE_URL}/opengraph-image`;
const DESCRIPTION =
  "Op zoek naar een origineel cadeau voor oma, voor haar 70e, 80e of 90e verjaardag? Laat haar vertellen over vroeger. Haar stem en verhalen blijven bewaard.";

export const metadata: Metadata = {
  // Korter dan de H1, zodat Google de titel niet afkapt.
  title: { absolute: "Origineel cadeau voor oma: haar verhaal bewaard | BewaardVoorJou.nl" },
  description: DESCRIPTION,
  keywords: [
    "cadeau oma",
    "origineel cadeau oma",
    "cadeau oma 80 jaar",
    "cadeau oma 90 jaar",
    "persoonlijk cadeau oma",
    "cadeau oma die alles heeft",
    "cadeau van kleinkinderen voor oma",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "BewaardVoorJou.nl",
  },
  // Eigen twitter-blok: anders erft de pagina titel en tekst van de homepage.
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@bewaardvoorjou",
  },
};

const faqs: Faq[] = [
  {
    question: "Wat is een origineel cadeau voor oma?",
    answer:
      "Een cadeau dat over haar gaat in plaats van over spullen. Met BewaardVoorJou.nl vertelt oma haar levensverhaal aan een geduldige gespreksleider: over haar jeugd, haar huwelijk, de kinderen en de dingen die ze heeft meegemaakt. Haar woorden en stem blijven bewaard voor de familie.",
  },
  {
    question: "Welk cadeau geef je oma voor haar 80e of 90e verjaardag?",
    answer:
      "Op die leeftijd heeft oma meestal alles al. Wat de familie vaak mist, zijn haar verhalen van vroeger. Een levensverhaal-cadeau geeft haar de aandacht en de ruimte om die te vertellen, en jullie iets wat blijft.",
  },
  {
    question: "Oma kan niet goed typen. Kan ze toch meedoen?",
    answer:
      "Ja. Ze kan haar antwoorden gewoon inspreken of op video opnemen. Typen mag, maar hoeft niet. Een kleinkind of kind kan ook naast haar zitten en helpen met de telefoon of laptop.",
  },
  {
    question: "Kunnen de kleinkinderen meelezen en meeluisteren?",
    answer:
      "Ja. Oma deelt haar verhalen via een persoonlijke deellink met wie zij wil. Zo kunnen kleinkinderen haar verhalen lezen en haar stem terugluisteren.",
  },
  {
    question: "Kan ik het cadeau op haar verjaardag laten aankomen?",
    answer:
      "Ja. In de checkout kies je de datum waarop oma de uitnodiging per e-mail ontvangt. Je krijgt ook een cadeaubon om te printen, met haar naam, jouw bericht en een QR-code, zodat je het persoonlijk kunt overhandigen.",
  },
  {
    question: "Wat als oma liever niet over alles praat?",
    answer:
      "Dat hoeft ook niet. Wat ze vertelt en hoe uitgebreid, bepaalt ze zelf. Ook met wie ze haar verhalen deelt, kiest ze zelf.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      breadcrumb: breadcrumbJsonLd("Cadeau voor oma", PAGE_URL),
    },
    buildProductJsonLd({
      name: "Levensverhaal als cadeau voor oma",
      description:
        "Een digitaal cadeau waarmee oma haar levensverhaal vastlegt met hulp van een geduldige gespreksleider: 58 hoofdstukken, inspreken, video of typen.",
      url: PAGE_URL,
      image: OG_IMAGE,
      offers: [{ code: GIFT_CODE, gift: true }],
    }),
    faqJsonLd(faqs),
  ],
};

const reasons = [
  {
    icon: <Mic className="h-7 w-7 text-orange" />,
    title: "Haar stem blijft",
    desc: "Audio en video bewaren meer dan woorden: haar lach, haar manier van vertellen, de uitdrukkingen die alleen zij gebruikt.",
  },
  {
    icon: <Heart className="h-7 w-7 text-orange" />,
    title: "Aandacht in plaats van spullen",
    desc: "Oma krijgt iets wat ze zelden krijgt: iemand die vraagt naar háár leven, en de tijd neemt om te luisteren.",
  },
  {
    icon: <Users className="h-7 w-7 text-orange" />,
    title: "Voor de hele familie",
    desc: "Via een deellink lezen en luisteren kinderen en kleinkinderen mee. Haar verhalen worden het begin van een familiearchief.",
  },
  {
    icon: <BookHeart className="h-7 w-7 text-orange" />,
    title: "Op haar eigen tempo",
    desc: "Eén vraag per keer, wanneer het haar uitkomt. Geen deadline, geen haast.",
  },
];

const themes = [
  "Het huis waar ze opgroeide, en wie er aan tafel zat",
  "Hoe ze opa, of haar grote liefde, leerde kennen",
  "Haar eerste baan en wat ze verdiende",
  "Hoe het was om moeder te worden",
  "De recepten, liedjes en gewoontes die ze heeft doorgegeven",
  "Wat ze haar kleinkinderen wil meegeven",
];

export default function CadeauOmaPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 md:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
            Origineel cadeau voor oma:{" "}
            <span className="text-orange">haar verhaal, voor altijd bewaard</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-2xl">
            Oma heeft een leven vol verhalen die de familie maar half kent. Geef
            haar de ruimte om ze te vertellen, en geef de kleinkinderen haar stem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl font-semibold"
            >
              <Link href={giftCheckoutPath(GIFT_CODE)} className="inline-flex items-center">
                Geef oma haar verhaal — {priceLabel(GIFT_CODE)} <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/10 hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40"
            >
              <Link href="/register">Eerst gratis proberen</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-white/90">
            {["Inspreken, video of typen", "Datum van de uitnodiging kies je zelf", "14 dagen bedenktijd"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Direct antwoord ── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <InShort>
            Een origineel cadeau voor oma is iets wat over haar gaat: de kans om
            haar levensverhaal te vertellen. Een geduldige gespreksleider stelt de
            vragen, oma spreekt de antwoorden in of neemt ze op video op. Haar
            verhalen en stem blijven bewaard voor kinderen en kleinkinderen. Het
            werkt voor elke leeftijd, van haar 70e tot haar 90e verjaardag.
          </InShort>
        </div>
      </section>

      {/* ── Waarom ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-12 text-center">
            Waarom oma dit cadeau niet in de kast zet
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((r) => (
              <div key={r.title} className="bg-cream rounded-2xl p-7 text-center border border-neutral-sand">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 mb-5">
                  {r.icon}
                </div>
                <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">{r.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waar ze over vertelt ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-6">
            Waar oma over gaat vertellen
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-8">
            De gespreksleider loopt met haar door 58 hoofdstukken van een leven.
            Een paar onderwerpen die vaak de mooiste verhalen opleveren:
          </p>
          <ul className="space-y-3">
            {themes.map((t) => (
              <li key={t} className="flex items-start gap-3 text-lg text-slate-800">
                <CheckCircle className="h-5 w-5 text-orange flex-shrink-0 mt-1" />
                {t}
              </li>
            ))}
          </ul>
          <p className="text-lg text-slate-700 leading-relaxed mt-8">
            Wil je zelf eerst een gesprek met haar voeren? Gebruik dan onze{" "}
            <Link href="/kennisbank/interview-ouders-25-vragen" className="underline hover:text-orange">
              25 vragen voor een interview met je ouders
            </Link>
            . Ze werken net zo goed bij een grootouder.
          </p>
        </div>
      </section>

      {/* ── Per leeftijd ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-5 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900">
            Een cadeau voor oma van 70, 80 of 90 jaar
          </h2>
          <p>
            <strong className="text-slate-900">Op haar 70e</strong> staat oma vaak nog
            midden in het leven. Ze vertelt makkelijk en heeft er zin in. Dit is
            een mooi moment om te beginnen, zonder haast.
          </p>
          <p>
            <strong className="text-slate-900">Op haar 80e</strong> komen de verhalen van
            vroeger vaak vanzelf. Het huis waar ze opgroeide, de oorlog of de
            wederopbouw, de eerste jaren van het gezin. Wat nu verteld wordt, gaat
            niet meer verloren.
          </p>
          <p>
            <strong className="text-slate-900">Op haar 90e</strong> helpt het als iemand
            meedoet. Zet samen de telefoon op tafel en laat haar inspreken. De
            gespreksleider stelt korte, duidelijke vragen, en elk antwoord wordt
            bewaard, hoe kort ook.
          </p>
        </div>
      </section>

      {/* ── Aanbod ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-10 text-center">
            Geef oma haar verhaal
          </h2>
          <GiftOffer recipient="oma" />
        </div>
      </section>

      <FaqSection faqs={faqs} intro="Over het levensverhaal als cadeau voor oma." />

      <RelatedLinks
        links={[
          { href: "/cadeau-opa-80-jaar", label: "Origineel cadeau voor opa van 80 jaar" },
          { href: "/kerstcadeau-ouders", label: "Kerstcadeau voor ouders en grootouders" },
          { href: "/cadeau-moeder-verjaardag", label: "Persoonlijk cadeau voor je moeder" },
          { href: "/kennisbank/herinneringen-bewaren-kleinkinderen", label: "Herinneringen bewaren voor kleinkinderen: 7 manieren" },
          { href: "/kennisbank/een-ouder-op-afstand-interviewen-levensverhaal-vastleggen", label: "Een ouder op afstand interviewen" },
          { href: "/levensverhaal-vastleggen", label: "Zo leg je een levensverhaal vast" },
        ]}
      />

      <PublicFooter />
    </div>
  );
}
