import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import {
  FaqSection,
  InShort,
  RelatedLinks,
  breadcrumbJsonLd,
  faqJsonLd,
  type Faq,
} from "@/components/landing/LandingBlocks";
import { priceLabel } from "@/lib/pricing";
import { ArrowRight, CheckCircle } from "lucide-react";

const PAGE_URL = "https://bewaardvoorjou.nl/astoldby-alternatief";
const TITLE = "AsToldBy alternatief: vertellen in plaats van schrijven";
const DESCRIPTION =
  "AsToldBy of BewaardVoorJou.nl? Een eerlijke vergelijking: schrijven met 52 weekvragen en een gedrukt boek, of vertellen tegen een gespreksleider met je stem bewaard.";

/**
 * Datum waarop de gegevens van AsToldBy zijn nagekeken op astoldby.nl. Prijzen
 * van anderen veranderen; staat deze datum meer dan een half jaar in het
 * verleden, controleer de tabel dan opnieuw.
 */
const CHECKED_ON = "28 september 2026";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | BewaardVoorJou.nl` },
  description: DESCRIPTION,
  keywords: [
    "astoldby alternatief",
    "astoldby",
    "astoldby ervaringen",
    "astoldby vs bewaardvoorjou",
    "levensverhaal app vergelijken",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "article",
    locale: "nl_NL",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "BewaardVoorJou.nl",
  },
};

const rows: { label: string; astoldby: string; bvj: string }[] = [
  {
    label: "Hoe je vertelt",
    astoldby: "Je schrijft je antwoorden uit in een online omgeving",
    bvj: "Inspreken, video opnemen of typen",
  },
  {
    label: "Vragen",
    astoldby: "Elke week één vraag per e-mail, 52 weken lang",
    bvj: "58 hoofdstukken; een gespreksleider stelt vragen en vraagt door op je antwoord",
  },
  {
    label: "Tempo",
    astoldby: "Vast ritme van een jaar",
    bvj: "Je eigen tempo, zo snel of langzaam als je wilt",
  },
  {
    label: "Eindresultaat",
    astoldby: "Gedrukt boek (softcover of hardcover), maximaal 400 pagina's per boek",
    bvj: "Digitaal archief met tekst, audio en video; export als PDF",
  },
  {
    label: "Stem bewaard",
    astoldby: "Niet genoemd op hun productpagina; het eindproduct is een boek",
    bvj: "Ja, audio- en video-opnames blijven bewaard",
  },
  {
    label: "Gedrukt boek",
    astoldby: "Ja, inbegrepen",
    bvj: "Nog niet; de printfunctie is in ontwikkeling",
  },
  {
    label: "Prijs",
    astoldby: "€79,95 (softcover), €99,99 (hardcover), €114,95 (hardcover met kleurenfoto's)",
    bvj: `${priceLabel("VERHAAL")} voor het pakket Verhaal; gratis starten met 3 hoofdstukken`,
  },
];

const faqs: Faq[] = [
  {
    question: "Wat is het verschil tussen AsToldBy en BewaardVoorJou.nl?",
    answer:
      "Bij AsToldBy krijg je een jaar lang elke week een vraag per e-mail en schrijf je je antwoorden uit; aan het eind wordt dat een gedrukt boek. Bij BewaardVoorJou.nl vertel je je verhaal aan een gespreksleider die doorvraagt. Je kunt inspreken, video opnemen of typen, en je stem blijft bewaard.",
  },
  {
    question: "Wanneer is AsToldBy de betere keuze?",
    answer:
      "Als je graag schrijft, een vast wekelijks ritme prettig vindt en vooral een gedrukt boek in de kast wilt. Dat laatste biedt BewaardVoorJou.nl op dit moment nog niet.",
  },
  {
    question: "Wanneer past BewaardVoorJou.nl beter?",
    answer:
      "Als schrijven een drempel is, bijvoorbeeld voor een ouder of grootouder die liever praat. Of als je naast de woorden ook de stem wilt bewaren, en je niet een heel jaar wilt wachten op het resultaat.",
  },
  {
    question: "Kan ik BewaardVoorJou.nl eerst gratis proberen?",
    answer:
      "Ja. Je kunt gratis beginnen met 3 hoofdstukken. Zo merk je vanzelf of vertellen je beter ligt dan schrijven.",
  },
  {
    question: "Waar komen de gegevens over AsToldBy vandaan?",
    answer: `Van de productpagina van astoldby.nl, nagekeken op ${CHECKED_ON}. Prijzen en voorwaarden kunnen sindsdien veranderd zijn; kijk voor de actuele situatie op hun eigen website.`,
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
      breadcrumb: breadcrumbJsonLd("AsToldBy alternatief", PAGE_URL),
    },
    faqJsonLd(faqs),
  ],
};

export default function AsToldByAlternatiefPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-neutral-sand py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-orange uppercase tracking-widest mb-4">Vergelijking</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 leading-tight mb-6">
            AsToldBy alternatief: vertellen in plaats van schrijven
          </h1>
          <p className="text-xl text-slate-700 leading-relaxed">
            AsToldBy en BewaardVoorJou.nl willen allebei dat een levensverhaal
            niet verloren gaat. De aanpak verschilt flink. Hieronder zetten we ze
            eerlijk naast elkaar, inclusief de punten waarop AsToldBy beter past.
          </p>
          <p className="text-sm text-slate-500 mt-6">
            Gegevens van AsToldBy nagekeken op {CHECKED_ON} via astoldby.nl.
          </p>
        </div>
      </section>

      {/* ── Direct antwoord ── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <InShort>
            AsToldBy stuurt een jaar lang elke week een vraag die je schriftelijk
            beantwoordt, en drukt dat aan het eind als boek. BewaardVoorJou.nl is
            het alternatief voor wie liever vertelt dan schrijft: een
            gespreksleider stelt de vragen en vraagt door, je spreekt het antwoord
            in of neemt een video op, en je stem blijft bewaard. Wil je vooral een
            gedrukt boek, dan past AsToldBy beter.
          </InShort>
        </div>
      </section>

      {/* ── Tabel ── */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-8 text-center">
            AsToldBy en BewaardVoorJou.nl naast elkaar
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-neutral-sand bg-white">
            <table className="w-full text-left text-sm md:text-base">
              <thead className="bg-cream text-slate-900">
                <tr>
                  <th scope="col" className="p-4 font-semibold w-1/5"><span className="sr-only">Onderdeel</span></th>
                  <th scope="col" className="p-4 font-semibold">AsToldBy</th>
                  <th scope="col" className="p-4 font-semibold">BewaardVoorJou.nl</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-neutral-sand align-top">
                    <th scope="row" className="p-4 font-semibold text-slate-900">{r.label}</th>
                    <td className="p-4 text-slate-700">{r.astoldby}</td>
                    <td className="p-4 text-slate-700">{r.bvj}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Wanneer wat ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-neutral-sand p-8">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-4">Kies AsToldBy als je</h2>
            <ul className="space-y-3 text-slate-700">
              {[
                "graag schrijft en de tijd neemt om antwoorden uit te werken",
                "een vast weekritme prettig vindt",
                "vooral een gedrukt boek in de kast wilt hebben",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-orange/40 p-8 bg-orange/5">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-4">Kies BewaardVoorJou.nl als je</h2>
            <ul className="space-y-3 text-slate-700">
              {[
                "liever praat dan schrijft, of het cadeau geeft aan iemand die dat liever doet",
                "de stem en het gezicht van je ouder of grootouder wilt bewaren",
                "een gespreksleider wilt die doorvraagt op wat je vertelt",
                "op je eigen tempo wilt werken, zonder jaarritme",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-orange flex-shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Uitleg ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-5 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900">
            Waarom vertellen voor veel mensen makkelijker is dan schrijven
          </h2>
          <p>
            Een witte pagina met één vraag erboven is voor veel ouderen een
            drempel. Ze hebben wel honderd verhalen, maar schrijven ze niet op.
            Hardop vertellen gaat vanzelf: je hoort het aan de details, de
            zijpaden en de manier waarop iemand lacht om een herinnering.
          </p>
          <p>
            Daarom stelt de gespreksleider van BewaardVoorJou.nl na elk antwoord
            een vervolgvraag, net als een nieuwsgierige kleinzoon of dochter zou
            doen. En omdat de opname bewaard blijft, heb je later niet alleen de
            woorden, maar ook de stem. Meer daarover lees je in{" "}
            <Link href="/kennisbank/ik-ben-geen-schrijver-kan-ik-bewaardvoorjou-toch-gebruiken" className="underline hover:text-orange">
              &ldquo;Ik ben geen schrijver, kan ik het toch gebruiken?&rdquo;
            </Link>
          </p>
          <p>
            Wil je weten wat andere manieren kosten, zoals een ghostwriter of een
            biografie laten schrijven? Bekijk dan{" "}
            <Link href="/kennisbank/levensverhaal-laten-schrijven-kosten" className="underline hover:text-orange">
              wat een levensverhaal kost
            </Link>
            .
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-orange hover:bg-orange/90 text-white text-lg px-8 py-6 rounded-xl font-semibold">
              <Link href="/register" className="inline-flex items-center">
                Probeer gratis: 3 hoofdstukken <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild className="bg-white hover:bg-cream text-slate-900 text-lg px-8 py-6 rounded-xl border-2 border-neutral-sand">
              <Link href="/pricing">Bekijk pakketten</Link>
            </Button>
          </div>
        </div>
      </section>

      <FaqSection faqs={faqs} />

      <RelatedLinks
        links={[
          { href: "/levensverhaal-vastleggen", label: "Levensverhaal vastleggen: zo werkt het" },
          { href: "/autobiografie-hulp", label: "Hulp bij je autobiografie, zonder ghostwriter" },
          { href: "/kennisbank/van-digitaal-verhaal-naar-tastbaar-levensboek-exporteren", label: "Van digitaal verhaal naar tastbaar levensboek" },
          { href: "/levensverhaal-opschrijven", label: "Toch liever zelf opschrijven?" },
        ]}
      />

      <PublicFooter />
    </div>
  );
}
