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
import { ArrowRight, CalendarDays, CheckCircle, Gift, Mic, Printer, Sparkles } from "lucide-react";

const PAGE_URL = "https://bewaardvoorjou.nl/kerstcadeau-ouders";
const GIFT_CODE = giftPackage();
const TITLE = "Kerstcadeau voor ouders die alles al hebben: hun eigen verhaal";
const DESCRIPTION =
  "Een kerst- of sinterklaascadeau voor ouders of opa en oma die alles al hebben? Geef ze de kans hun levensverhaal te vertellen. Digitaal, dus nooit te laat.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | BewaardVoorJou.nl` },
  description: DESCRIPTION,
  keywords: [
    "kerstcadeau ouders",
    "kerstcadeau ouders die alles hebben",
    "kerstcadeau opa en oma",
    "sinterklaascadeau ouders",
    "persoonlijk kerstcadeau ouders",
    "last minute kerstcadeau ouders",
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
};

const faqs: Faq[] = [
  {
    question: "Wat geef je ouders met kerst die alles al hebben?",
    answer:
      "Geef iets wat ze niet kunnen kopen: aandacht voor hun eigen verhaal. Met BewaardVoorJou.nl vertellen je ouders over hun jeugd, hun liefde en hun keuzes, begeleid door een geduldige gespreksleider. Hun woorden en stem blijven bewaard voor jou en de kleinkinderen.",
  },
  {
    question: "Kan ik het cadeau op 5 of 25 december laten aankomen?",
    answer:
      "Ja. In de checkout kies je zelf de datum waarop de uitnodiging per e-mail aankomt, bijvoorbeeld pakjesavond of eerste kerstdag. Laat je het veld leeg, dan gaat de uitnodiging direct na betaling de deur uit.",
  },
  {
    question: "Heb ik iets om onder de boom of in de schoen te leggen?",
    answer:
      "Na het bestellen download je een cadeaubon om te printen, met hun naam, jouw persoonlijke bericht en een QR-code waarmee ze het cadeau openen. Die kun je in een envelop onder de kerstboom of in de schoen leggen.",
  },
  {
    question: "Is dit ook een last-minute kerstcadeau?",
    answer:
      "Ja. Omdat het cadeau digitaal is, hoef je niet op een pakketbezorger te wachten. Ook op 24 december kun je nog bestellen, de cadeaubon printen en hem de volgende dag geven.",
  },
  {
    question: "Mijn ouders zijn niet handig met computers. Werkt het dan wel?",
    answer:
      "Ze hoeven vooral te praten. De gespreksleider stelt steeds één vraag, en ze kunnen het antwoord inspreken, op video opnemen of typen. Je kunt de eerste sessie samen doen tijdens de feestdagen, zodat ze daarna op hun eigen tempo verder kunnen.",
  },
  {
    question: "Kan ik het samen met mijn broers en zussen geven?",
    answer:
      "Ja. Eén persoon rekent af en zet in het persoonlijke bericht van wie het cadeau komt. Via een deellink kunnen kinderen en kleinkinderen de verhalen daarna lezen en beluisteren.",
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
      breadcrumb: breadcrumbJsonLd("Kerstcadeau voor ouders", PAGE_URL),
    },
    buildProductJsonLd({
      name: "Levensverhaal als kerstcadeau voor ouders",
      description:
        "Een digitaal cadeau waarmee ouders of grootouders hun levensverhaal vastleggen met hulp van een geduldige gespreksleider: 58 hoofdstukken, inspreken, video of typen.",
      url: PAGE_URL,
      offers: [{ code: GIFT_CODE, gift: true }],
    }),
    faqJsonLd(faqs),
  ],
};

const comparison = [
  { gift: "Dinerbon of wijn", lasts: "Eén avond", personal: "Weinig", late: "Ja" },
  { gift: "Fotoboek", lasts: "Jaren", personal: "Veel werk voor jou", late: "Nee, drukken kost tijd" },
  { gift: "Weekendje weg", lasts: "Een herinnering", personal: "Gemiddeld", late: "Afhankelijk van boeking" },
  { gift: "Hun levensverhaal", lasts: "Generaties", personal: "Hun eigen woorden en stem", late: "Ja, digitaal" },
];

const steps = [
  {
    icon: <Gift className="h-6 w-6 text-orange" />,
    title: "Bestel het cadeau",
    desc: `Kies het pakket (${priceLabel(GIFT_CODE)}) en vul de naam en het e-mailadres van je ouders in.`,
  },
  {
    icon: <CalendarDays className="h-6 w-6 text-orange" />,
    title: "Kies de datum",
    desc: "Laat de uitnodiging aankomen op pakjesavond, eerste kerstdag of meteen.",
  },
  {
    icon: <Printer className="h-6 w-6 text-orange" />,
    title: "Print de cadeaubon",
    desc: "Met hun naam, jouw bericht en een QR-code. In de schoen of onder de boom.",
  },
  {
    icon: <Mic className="h-6 w-6 text-orange" />,
    title: "Zij vertellen",
    desc: "Een geduldige gespreksleider stelt de vragen. Jullie lezen en luisteren mee.",
  },
];

export default function KerstcadeauOudersPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 border border-orange/30 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 text-orange-light" />
            Sinterklaas en kerst 2026
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
            Kerstcadeau voor ouders die alles al hebben:{" "}
            <span className="text-orange">hun eigen verhaal</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-2xl">
            Geen trui, geen fles wijn, geen bon die in de la verdwijnt. Geef je
            ouders, of opa en oma, de kans om te vertellen hoe het allemaal begon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl font-semibold"
            >
              <Link href={giftCheckoutPath(GIFT_CODE)} className="inline-flex items-center">
                Geef hun verhaal — {priceLabel(GIFT_CODE)} <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/10 hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40"
            >
              <Link href="#zo-werkt-het">Zo werkt het</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 mt-10 text-sm text-white/90">
            {["Ook op 24 december nog te bestellen", "Cadeaubon om te printen", "14 dagen bedenktijd"].map((t) => (
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
            Een goed kerstcadeau voor ouders die alles al hebben is iets wat ze
            niet kunnen kopen: aandacht voor hun eigen leven. Met{" "}
            <Link href="/levensverhaal-vastleggen" className="underline hover:text-orange">
              een levensverhaal vastleggen
            </Link>{" "}
            geef je ze een gespreksleider die de vragen stelt, terwijl zij
            vertellen. Het cadeau is digitaal, dus je kunt het tot en met 24
            december bestellen en zelf kiezen wanneer de uitnodiging aankomt.
          </InShort>
        </div>
      </section>

      {/* ── Waarom ── */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-5 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900">
            Waarom een verhaal beter werkt dan nog een spullencadeau
          </h2>
          <p>
            Wie de zestig voorbij is, heeft meestal alles wat hij nodig heeft. De
            vraag &ldquo;wat wil je hebben?&rdquo; levert dan steevast
            &ldquo;niks, doe maar gezellig&rdquo; op. Dat is geen beleefdheid. Het
            is waar.
          </p>
          <p>
            Wat ouders wél waarderen, is interesse. Iemand die vraagt hoe het was
            in de straat waar ze opgroeiden, hoe ze elkaar hebben leren kennen,
            waarom ze die ene baan hebben aangenomen. Die gesprekken komen aan de
            kersttafel zelden van de grond. Er is altijd een pan die aanbrandt of
            een kleinkind dat aandacht vraagt.
          </p>
          <p>
            Daarom werkt een levensverhaal als cadeau: het maakt ruimte voor die
            gesprekken, ook na de feestdagen. De gespreksleider stelt steeds één
            open vraag, verdeeld over 58 hoofdstukken van een leven. Je ouders
            spreken het antwoord in, nemen een video op of typen. Jij en de
            kleinkinderen kunnen alles later teruglezen en terugluisteren.
          </p>
        </div>
      </section>

      {/* ── Vergelijking ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4 text-center">
            Veelgegeven kerstcadeaus voor ouders, naast elkaar
          </h2>
          <p className="text-slate-600 text-center mb-10">
            Elk cadeau heeft zijn plek. Dit is wat ze op de lange termijn opleveren.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-neutral-sand">
            <table className="w-full text-left text-sm md:text-base">
              <thead className="bg-cream text-slate-900">
                <tr>
                  <th scope="col" className="p-4 font-semibold">Cadeau</th>
                  <th scope="col" className="p-4 font-semibold">Hoe lang blijft het?</th>
                  <th scope="col" className="p-4 font-semibold">Hoe persoonlijk?</th>
                  <th scope="col" className="p-4 font-semibold">Last-minute?</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.gift}
                    className={`border-t border-neutral-sand ${row.gift === "Hun levensverhaal" ? "bg-orange/5 font-medium" : ""}`}
                  >
                    <th scope="row" className="p-4 font-semibold text-slate-900">{row.gift}</th>
                    <td className="p-4 text-slate-700">{row.lasts}</td>
                    <td className="p-4 text-slate-700">{row.personal}</td>
                    <td className="p-4 text-slate-700">{row.late}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Zo werkt het ── */}
      <section id="zo-werkt-het" className="py-20 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-12 text-center">
            Zo regel je het voor 5 of 25 december
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-sand">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange/10 mb-4">
                  {s.icon}
                </div>
                <p className="text-xs font-bold text-orange mb-1">Stap {i + 1}</p>
                <h3 className="font-serif text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-600 mt-8">
            Benieuwd hoe de cadeaubon eruitziet?{" "}
            <Link href="/cadeaubon/voorbeeld" className="underline hover:text-orange">
              Bekijk een voorbeeld
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Tip voor de feestdagen ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-5 text-lg text-slate-700 leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900">
            Tip: doe de eerste vraag samen, tijdens de feestdagen
          </h2>
          <p>
            De kerstvakantie is het moment waarop de familie bij elkaar is. Zet
            na het eten de laptop of telefoon op tafel en laat opa of oma de
            eerste vraag beantwoorden, met iedereen erbij. Het eerste hoofdstuk
            gaat meestal over de jeugd: het huis, de straat, de school. Juist die
            verhalen kennen kleinkinderen vaak nog niet.
          </p>
          <p>
            Weet je niet goed hoe je zo&apos;n gesprek begint? In onze kennisbank
            staan{" "}
            <Link href="/kennisbank/interview-ouders-25-vragen" className="underline hover:text-orange">
              25 vragen voor een interview met je ouders
            </Link>{" "}
            die je kunt gebruiken als opwarmer.
          </p>
        </div>
      </section>

      {/* ── Aanbod ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-10 text-center">
            Geef het cadeau
          </h2>
          <GiftOffer recipient="je ouders" />
        </div>
      </section>

      <FaqSection faqs={faqs} intro="Over kerst- en sinterklaascadeaus voor ouders en grootouders." />

      <RelatedLinks
        links={[
          { href: "/cadeau-oma", label: "Een cadeau voor oma dat blijft" },
          { href: "/cadeau-opa-80-jaar", label: "Origineel cadeau voor opa van 80 jaar" },
          { href: "/blog/7-persoonlijke-cadeaus-voor-ouders-die-alles-al-hebben", label: "7 persoonlijke cadeaus voor ouders die alles al hebben" },
          { href: "/blog/familiearchief-onder-de-kerstboom", label: "Een familiearchief onder de kerstboom" },
          { href: "/levensverhaal-vastleggen", label: "Zo leg je een levensverhaal vast" },
        ]}
      />

      <PublicFooter />
    </div>
  );
}
