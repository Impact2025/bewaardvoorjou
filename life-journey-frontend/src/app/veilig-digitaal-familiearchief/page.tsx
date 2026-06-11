import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  Fingerprint,
  Eye,
  Download,
  Trash2,
  FileCheck,
  Sparkles,
  Star,
  ChevronDown,
} from "lucide-react";

const PAGE_URL = "https://bewaardvoorjou.nl/veilig-digitaal-familiearchief";

export const metadata: Metadata = {
  title:
    "Veilig digitaal familiearchief — AVG-compliant & Nederlandse servers | BewaardVoorJou.nl",
  description:
    "Bewaar je familieverhalen in een veilig digitaal familiearchief. Nederlandse servers, AES-256-encryptie, privacy-by-design en volledig AVG/GDPR-compliant. Jij bepaalt wie toegang krijgt — niemand anders.",
  keywords: [
    "veilig digitaal familiearchief",
    "digitaal familiearchief AVG",
    "AVG compliant familiearchief",
    "veilig herinneringen bewaren",
    "privacy familieverhalen",
    "Nederlandse servers familiearchief",
    "GDPR familiearchief",
    "versleuteld familiearchief",
    "privacy by design",
    "digitaal erfgoed veilig opslaan",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: PAGE_URL,
    title:
      "Veilig digitaal familiearchief — AVG-compliant & Nederlandse servers",
    description:
      "Nederlandse servers, AES-256-encryptie en privacy-by-design. Jouw familieverhalen veilig bewaard, volledig AVG/GDPR-compliant.",
    siteName: "BewaardVoorJou.nl",
    images: [
      {
        url: "/Logo_Bewaardvoorjou.png",
        width: 1200,
        height: 630,
        alt: "Veilig digitaal familiearchief — BewaardVoorJou.nl",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Veilig digitaal familiearchief — AVG-compliant",
      description:
        "Een veilig, AVG-compliant digitaal familiearchief op Nederlandse servers, met encryptie en privacy-by-design.",
      url: PAGE_URL,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Veilig digitaal familiearchief",
            item: PAGE_URL,
          },
        ],
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is BewaardVoorJou.nl AVG/GDPR-compliant?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ja. BewaardVoorJou.nl is volledig opgebouwd volgens de AVG (GDPR). Dat betekent onder meer: een heldere privacyverklaring volgens Art. 13/14, expliciete toestemming voor het verwerken van bijzondere categorieën, het recht op inzage, export (Art. 20) en wissing (Art. 17), en privacy-by-design als uitgangspunt van de architectuur.",
          },
        },
        {
          "@type": "Question",
          name: "Waar worden mijn familieverhalen opgeslagen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Je verhalen worden versleuteld opgeslagen op beveiligde servers binnen de EU/Nederland. Verbindingen verlopen via TLS 1.3 en data wordt at rest versleuteld met AES-256. Alleen jij en de mensen die jij uitnodigt hebben toegang.",
          },
        },
        {
          "@type": "Question",
          name: "Wie kan mijn familiearchief inzien?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Alleen de mensen die jij daarvoor uitnodigt. Met rolgebaseerde toegang (eigenaar, vertrouwde persoon, lezer) bepaal jij per persoon wat zij mogen zien. Elke deel- en exportactie wordt vastgelegd in een audit-log.",
          },
        },
        {
          "@type": "Question",
          name: "Kan ik mijn gegevens weer verwijderen of meenemen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Altijd. Je hebt op elk moment recht op een volledige export van je archief (Art. 20 AVG) en op verwijdering van je gegevens (Art. 17 AVG). Je zit nergens aan vast en blijft eigenaar van je eigen verhaal.",
          },
        },
        {
          "@type": "Question",
          name: "Wat betekent privacy-by-design?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Het betekent dat privacy geen toevoeging achteraf is, maar het uitgangspunt van hoe we bouwen: minimale dataverzameling, versleuteling als standaard, strikte toegangscontrole en bewuste keuzes over welke gegevens we wél en niet bewaren.",
          },
        },
      ],
    },
  ],
};

const pillars = [
  {
    icon: <Server className="h-8 w-8 text-orange" />,
    title: "Nederlandse & EU-servers",
    desc: "Je familiearchief staat op beveiligde servers binnen de EU. Geen Big Tech-cloud aan de andere kant van de wereld — gewoon dichtbij, onder Europese wetgeving.",
  },
  {
    icon: <Lock className="h-8 w-8 text-orange" />,
    title: "Sterke encryptie",
    desc: "Alle verbindingen via TLS 1.3, opslag at rest versleuteld met AES-256. Je verhalen zijn onleesbaar voor iedereen zonder de juiste sleutel.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-orange" />,
    title: "Privacy-by-design",
    desc: "Privacy is geen vinkje achteraf, maar het fundament. Minimale dataverzameling, versleuteling als standaard en bewuste keuzes over wat we bewaren.",
  },
];

const rights = [
  {
    icon: <Eye className="h-7 w-7 text-orange" />,
    title: "Recht op inzage",
    desc: "Bekijk altijd welke gegevens we van je hebben. Volledig transparant, conform Art. 15 AVG.",
  },
  {
    icon: <Download className="h-7 w-7 text-orange" />,
    title: "Recht op export",
    desc: "Download je complete familiearchief met één klik (Art. 20 AVG). Het is en blijft jouw data.",
  },
  {
    icon: <Trash2 className="h-7 w-7 text-orange" />,
    title: "Recht op vergetelheid",
    desc: "Wil je stoppen? Verwijder je gegevens definitief, wanneer je maar wilt (Art. 17 AVG).",
  },
  {
    icon: <FileCheck className="h-7 w-7 text-orange" />,
    title: "Expliciete toestemming",
    desc: "Voor audio, video en gevoelige verhalen vragen we vooraf om jouw heldere toestemming.",
  },
];

const safeguards = [
  {
    title: "Encryptie & sleutelbeheer",
    items: [
      "TLS 1.3 voor alle verbindingen",
      "AES-256-encryptie voor opslag at rest",
      "Beveiligd sleutelbeheer & rotatie",
    ],
  },
  {
    title: "Toegangscontrole",
    items: [
      "Rolgebaseerde toegang: eigenaar, vertrouwde, lezer",
      "Veilig inloggen, koppelbaar aan je apparaat",
      "Audit-log van elke login, export en deelactie",
    ],
  },
  {
    title: "Processen & waarborgen",
    items: [
      "Verwerkersregister volgens Art. 30 AVG",
      "Meldplicht datalekken binnen 72 uur",
      "Rate limiting tegen misbruik en brute-force",
    ],
  },
];

const faqs = [
  {
    question: "Is BewaardVoorJou.nl AVG/GDPR-compliant?",
    answer:
      "Ja. Het platform is opgebouwd volgens de AVG (GDPR): een heldere privacyverklaring volgens Art. 13/14, expliciete toestemming voor bijzondere categorieën, en de rechten op inzage, export (Art. 20) en wissing (Art. 17). Privacy-by-design is het uitgangspunt van de architectuur.",
  },
  {
    question: "Waar worden mijn familieverhalen opgeslagen?",
    answer:
      "Je verhalen worden versleuteld opgeslagen op beveiligde servers binnen de EU/Nederland. Verbindingen verlopen via TLS 1.3 en data wordt at rest versleuteld met AES-256. Alleen jij en de mensen die jij uitnodigt hebben toegang.",
  },
  {
    question: "Wie kan mijn familiearchief inzien?",
    answer:
      "Alleen de mensen die jij daarvoor uitnodigt. Met rolgebaseerde toegang (eigenaar, vertrouwde persoon, lezer) bepaal jij per persoon wat zij mogen zien. Elke deel- en exportactie wordt vastgelegd in een audit-log.",
  },
  {
    question: "Kan ik mijn gegevens weer verwijderen of meenemen?",
    answer:
      "Altijd. Je hebt op elk moment recht op een volledige export van je archief (Art. 20 AVG) en op verwijdering van je gegevens (Art. 17 AVG). Je zit nergens aan vast en blijft eigenaar van je eigen verhaal.",
  },
  {
    question: "Worden mijn gegevens gebruikt om AI te trainen?",
    answer:
      "Nee. Je verhalen worden gebruikt om jou te helpen je familiearchief op te bouwen — niet om modellen van derden te trainen. We verwerken alleen wat nodig is voor de dienst en zijn daar transparant over in onze privacyverklaring.",
  },
  {
    question: "Wat betekent privacy-by-design precies?",
    answer:
      "Dat privacy geen toevoeging achteraf is, maar het uitgangspunt van hoe we bouwen: minimale dataverzameling, versleuteling als standaard, strikte toegangscontrole en bewuste keuzes over welke gegevens we wél en niet bewaren.",
  },
];

export default function VeiligDigitaalFamiliearchiefPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      {/* ── Hero ── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Header-Image-min.png"
            alt="Veilig digitaal familiearchief — jouw familieverhalen beschermd"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/92 via-slate-900/80 to-slate-900/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8 shadow-xl">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span>AVG-compliant · Nederlandse servers · Versleuteld</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Een veilig digitaal
              <span className="text-orange block mt-2">familiearchief</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Je dierbaarste herinneringen verdienen meer dan zomaar een cloud.
              Ze verdienen serieuze beveiliging.
            </p>

            <p className="text-lg text-white/85 leading-relaxed mb-10 drop-shadow-lg">
              BewaardVoorJou.nl bewaart de verhalen van je familie op Nederlandse
              servers, versleuteld met AES-256, volgens privacy-by-design en
              volledig AVG/GDPR-compliant. Jij bepaalt wie toegang krijgt — niemand anders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                asChild
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Link href="/register" className="inline-flex items-center">
                  Start gratis & veilig <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
              >
                <Link href="#beveiliging">Bekijk de beveiliging</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Geen doorverkoop van data</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Altijd exporteerbaar</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Gemaakt in Nederland</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-6 leading-snug">
            Een familiearchief is geen gewone data
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Het zijn de stemmen, gezichten en geheimen van de mensen van wie je
            houdt. Verhalen die je nooit meer terugkrijgt als ze in verkeerde
            handen vallen — of zomaar verdwijnen.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Daarom behandelen we jouw familiearchief niet als &lsquo;content&rsquo;,
            maar als het erfgoed dat het is. Geen advertenties, geen dataverkoop,
            geen verborgen kleine lettertjes.
          </p>
          <p className="text-xl text-slate-900 font-serif font-medium leading-relaxed">
            Beveiliging en privacy zijn hier geen feature. Het is de basis.
          </p>
        </div>
      </section>

      {/* ── Drie pijlers ── */}
      <section id="beveiliging" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange/10 border border-orange/30 text-orange text-xs font-bold mb-4 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Drie fundamenten
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Waarop jouw vertrouwen rust
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Nederlandse servers, sterke encryptie en privacy-by-design — samen
              vormen ze een veilig thuis voor jouw familieverhalen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <Card
                key={p.title}
                className="bg-white border-2 border-neutral-sand hover:border-orange/30 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 mb-5">
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">{p.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jouw AVG-rechten ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Jouw rechten, in steen gebeiteld
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              De AVG geeft je sterke rechten. Bij ons zijn ze geen formaliteit,
              maar gewoon knoppen die werken.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rights.map((r, i) => (
              <Card
                key={i}
                className="bg-gradient-to-br from-cream via-white to-warm-sand/10 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-7 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 mb-5 group-hover:bg-orange/20 group-hover:scale-110 transition-all duration-300">
                    {r.icon}
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">{r.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technische waarborgen ── */}
      <section className="py-20 px-4 sm:px-6 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold mb-4 uppercase tracking-widest">
              <Lock className="h-3.5 w-3.5 text-green-400" />
              Onder de motorkap
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">
              Beveiliging op meerdere lagen
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Geen losse maatregel, maar beveiliging die in elke laag is verweven.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {safeguards.map((s) => (
              <div
                key={s.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-colors"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange/20 mb-5">
                  <Shield className="h-6 w-6 text-orange-light" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white mb-4">{s.title}</h3>
                <ul className="space-y-2.5">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/security"
              className="inline-flex items-center gap-2 text-orange-light hover:text-white text-sm font-medium transition-colors"
            >
              Lees de volledige beveiligingsuitleg <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Jij houdt de regie ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-5 leading-snug">
                Jij bepaalt wie meeleest
              </h2>
              <p className="text-slate-700 leading-relaxed mb-6">
                Een familiearchief is om te delen — maar op jouw voorwaarden. Met
                rolgebaseerde toegang nodig je precies de juiste mensen uit en
                bepaal je per persoon wat zij mogen zien.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: <KeyRound className="h-5 w-5 text-orange" />, t: "Rollen: eigenaar, vertrouwde persoon, lezer" },
                  { icon: <Fingerprint className="h-5 w-5 text-orange" />, t: "Veilig inloggen, gekoppeld aan je apparaat" },
                  { icon: <Eye className="h-5 w-5 text-orange" />, t: "Audit-log van elke deel- en exportactie" },
                  { icon: <Shield className="h-5 w-5 text-orange" />, t: "Niemand kan ongevraagd meekijken — wij ook niet" },
                ].map((row) => (
                  <li key={row.t} className="flex items-start gap-3 text-slate-700">
                    <span className="flex-shrink-0 mt-0.5">{row.icon}</span>
                    <span className="text-sm leading-relaxed">{row.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border-2 border-neutral-sand shadow-lg p-8 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-5">
                <ShieldCheck className="h-10 w-10 text-green-600" />
              </div>
              <p className="font-serif text-xl font-semibold text-slate-900 mb-2">
                Gemaakt in Nederland, met zorg
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Geen grote tech-bedrijven, geen verrassingen. Een veilige
                Nederlandse plek voor het verhaal van jouw familie — onder
                Europese privacywetgeving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="bg-[#1a1a1a] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-[#d4af37] fill-[#d4af37]" />
            ))}
          </div>
          <blockquote className="font-serif text-xl md:text-2xl text-white leading-relaxed mb-6">
            &ldquo;Ik wilde de verhalen van mijn ouders niet bij een Amerikaanse
            techgigant onderbrengen. Dat dit op Nederlandse servers staat en AVG-proof
            is, gaf de doorslag.&rdquo;
          </blockquote>
          <p className="text-[#d4af37] font-medium text-sm">— Karin, 52 jaar · bouwt het familiearchief</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-slate-700">Alles over veiligheid, privacy en de AVG.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-cream rounded-2xl border border-neutral-sand shadow-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-6 font-serif text-lg font-semibold text-slate-900">
                  {faq.question}
                  <ChevronDown className="h-5 w-5 text-orange flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 -mt-1 text-slate-700 leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-orange via-orange-dark to-gold text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Begin een familiearchief<br className="hidden md:block" /> dat je kunt vertrouwen
          </h2>
          <p className="text-xl mb-10 opacity-95">
            Veilig op Nederlandse servers. Versleuteld. AVG-compliant. En altijd van jou.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-orange hover:bg-neutral-light text-lg px-10 py-7 shadow-2xl font-semibold"
            >
              <Link href="/register">
                Start gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/15 backdrop-blur-md hover:bg-white/25 text-white text-lg px-10 py-7 border-2 border-white/40 transition-all"
            >
              <Link href="/privacy">Lees de privacyverklaring</Link>
            </Button>
          </div>
          <p className="text-sm opacity-80 mt-6">
            Geen creditcard nodig · Altijd exporteerbaar · 100% AVG-compliant
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
