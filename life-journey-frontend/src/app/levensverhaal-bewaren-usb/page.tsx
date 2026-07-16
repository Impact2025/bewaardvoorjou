import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildProductJsonLd } from "@/lib/pricing";
import {
  ArrowRight,
  CheckCircle,
  Heart,
  Shield,
  Sparkles,
  Star,
  Cloud,
  HardDrive,
  Download,
  RefreshCw,
  KeyRound,
  Server,
  ChevronDown,
} from "lucide-react";

const PAGE_URL = "https://bewaardvoorjou.nl/levensverhaal-bewaren-usb";

export const metadata: Metadata = {
  title:
    "Levensverhaal bewaren op USB én in de cloud — nooit vendor lock-in | BewaardVoorJou.nl",
  description:
    "Levensverhaal bewaren op USB-stick én in de cloud. Fysiek in eigen handen, geen lock-in. Dubbel bewaard. Vanaf €149 eenmalig.",
  keywords: [
    "levensverhaal bewaren op usb",
    "levensverhaal op usb stick",
    "herinneringen bewaren usb",
    "digitale nalatenschap usb",
    "levensverhaal opslaan",
    "data exporteren levensverhaal",
    "geen vendor lock-in",
    "levensverhaal cloud en usb",
    "herinneringen veilig opslaan",
    "usb box levensverhaal",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: PAGE_URL,
    title:
      "Levensverhaal bewaren op USB én in de cloud — nooit vendor lock-in",
    description:
      "Levensverhaal bewaren op USB-stick én in de cloud. Fysiek in eigen handen, geen lock-in. Dubbel bewaard. Vanaf €149 eenmalig.",
    siteName: "BewaardVoorJou.nl",
    images: [
      {
        url: "/erfgoed-box.jpg",
        width: 1200,
        height: 630,
        alt: "Levensverhaal bewaren op USB én in de cloud — de Erfgoed Box",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Levensverhaal bewaren op USB én in de cloud",
      description:
        "Bewaar jouw levensverhaal met een hybride aanpak: veilig in de cloud én op een fysieke USB-stick. Geen vendor lock-in, altijd exporteerbaar.",
      url: PAGE_URL,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Levensverhaal bewaren op USB",
            item: PAGE_URL,
          },
        ],
      },
    },
    buildProductJsonLd({
      name: "Erfgoed Box — Levensverhaal bewaren op USB",
      description:
        "Een hybride aanpak: bewaar je levensverhaal veilig in de cloud én op een fysieke USB-stick in walnotenhout. Geen vendor lock-in, altijd exporteerbaar in open bestandsformaten.",
      url: PAGE_URL,
      offers: [{ code: "ERFGOED", name: "Erfgoed Box" }, { code: "NALATENSCHAP" }],
    }),
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Wat gebeurt er met mijn levensverhaal als het platform ooit stopt?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Niets — jouw verhaal blijft van jou. Naast de cloudopslag krijg je een fysieke USB-stick met al je verhalen, foto's, audio en video in standaard, open bestandsformaten. Die werkt op elke computer, ook zonder internet en zonder ons platform. Je bent dus nooit afhankelijk van het voortbestaan van BewaardVoorJou.nl.",
          },
        },
        {
          "@type": "Question",
          name: "Wat is het verschil tussen cloud en USB?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "De cloud zorgt dat je altijd en overal bij je verhaal kunt, het veilig is geback-upt en je het eenvoudig met familie kunt delen. De USB-stick geeft je een tastbare kopie in je eigen handen die voor altijd werkt — ook offline. Samen vormen ze een hybride aanpak: het gemak van de cloud met de zekerheid van fysiek bezit.",
          },
        },
        {
          "@type": "Question",
          name: "Kan ik mijn data altijd exporteren?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ja, op elk moment. Je kunt je volledige levensverhaal met één klik downloaden in open bestandsformaten. Bij het Nalatenschap-pakket sturen we je bovendien jaarlijks een verse USB-export als backup. Vendor lock-in bestaat bij ons niet.",
          },
        },
        {
          "@type": "Question",
          name: "In welk formaat staan mijn verhalen op de USB?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "In standaard open formaten: tekst als PDF en platte tekst, audio als MP3, video als MP4 en foto's als JPG. Geen propriëtaire formaten die je nergens anders kunt openen — gewoon bestanden die over tien, twintig of vijftig jaar nog werken.",
          },
        },
        {
          "@type": "Question",
          name: "Waar staat mijn data in de cloud?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Op beveiligde Nederlandse servers, volledig AVG/GDPR-compliant. Je verhalen zijn versleuteld opgeslagen en alleen de mensen die jij uitnodigt kunnen meelezen.",
          },
        },
      ],
    },
  ],
};

const pillars = [
  {
    icon: <Cloud className="h-8 w-8 text-orange" />,
    title: "In de cloud — altijd bij de hand",
    points: [
      "Overal toegankelijk, op elk apparaat",
      "Automatisch geback-upt en versleuteld",
      "Eenvoudig delen met familie",
      "Nederlandse servers, AVG-compliant",
    ],
  },
  {
    icon: <HardDrive className="h-8 w-8 text-orange" />,
    title: "Op USB — tastbaar in je eigen handen",
    points: [
      "Fysieke USB-stick in walnotenhout",
      "Werkt offline, op elke computer",
      "Open bestandsformaten, voor altijd",
      "Geen platform of internet nodig",
    ],
  },
];

const guarantees = [
  {
    icon: <KeyRound className="h-7 w-7 text-orange" />,
    title: "Nooit vendor lock-in",
    desc: "Stopt het platform ooit? Jouw USB met alle verhalen werkt gewoon door. Je bent nergens aan vastgeketend.",
  },
  {
    icon: <Download className="h-7 w-7 text-orange" />,
    title: "Altijd exporteerbaar",
    desc: "Download je complete levensverhaal met één klik, wanneer je maar wilt. Het is en blijft jouw data.",
  },
  {
    icon: <RefreshCw className="h-7 w-7 text-orange" />,
    title: "Jaarlijkse USB-backup",
    desc: "Bij Nalatenschap ontvang je elk jaar een verse USB-export, zodat je nieuwste verhalen ook fysiek veilig staan.",
  },
  {
    icon: <Server className="h-7 w-7 text-orange" />,
    title: "Open formaten",
    desc: "PDF, MP3, MP4, JPG — standaardbestanden die over tientallen jaren nog te openen zijn. Geen vendor-trucjes.",
  },
];

const steps = [
  {
    step: "1",
    title: "Leg je verhaal vast",
    description:
      "Een geduldige gespreksleider begeleidt je door 58 hoofdstukken. Vertel via tekst, audio of video — alles wordt veilig in de cloud bewaard.",
  },
  {
    step: "2",
    title: "Krijg het op USB",
    description:
      "Je ontvangt de Erfgoed Box met een USB-stick in walnotenhout. Al je verhalen staan er in open formaten op — fysiek, in je eigen handen.",
  },
  {
    step: "3",
    title: "Bewaar dubbel veilig",
    description:
      "Cloud voor toegang en delen, USB voor zekerheid en bezit. Exporteer wanneer je wilt. Jouw levensverhaal blijft altijd van jou.",
  },
];

const faqs = [
  {
    question: "Wat gebeurt er met mijn levensverhaal als het platform ooit stopt?",
    answer:
      "Niets — jouw verhaal blijft van jou. Naast de cloudopslag krijg je een fysieke USB-stick met al je verhalen, foto's, audio en video in standaard, open bestandsformaten. Die werkt op elke computer, ook zonder internet en zonder ons platform. Je bent dus nooit afhankelijk van het voortbestaan van BewaardVoorJou.nl.",
  },
  {
    question: "Wat is het verschil tussen cloud en USB?",
    answer:
      "De cloud zorgt dat je altijd en overal bij je verhaal kunt, dat het veilig is geback-upt en dat je het eenvoudig met familie kunt delen. De USB-stick geeft je een tastbare kopie in je eigen handen die voor altijd werkt — ook offline. Samen vormen ze een hybride aanpak: het gemak van de cloud met de zekerheid van fysiek bezit.",
  },
  {
    question: "Kan ik mijn data altijd exporteren?",
    answer:
      "Ja, op elk moment. Je kunt je volledige levensverhaal met één klik downloaden in open bestandsformaten. Bij het Nalatenschap-pakket sturen we je bovendien jaarlijks een verse USB-export als backup. Vendor lock-in bestaat bij ons niet.",
  },
  {
    question: "In welk formaat staan mijn verhalen op de USB?",
    answer:
      "In standaard open formaten: tekst als PDF en platte tekst, audio als MP3, video als MP4 en foto's als JPG. Geen propriëtaire formaten die je nergens anders kunt openen — gewoon bestanden die over tien, twintig of vijftig jaar nog werken.",
  },
  {
    question: "Waar staat mijn data in de cloud?",
    answer:
      "Op beveiligde Nederlandse servers, volledig AVG/GDPR-compliant. Je verhalen zijn versleuteld opgeslagen en alleen de mensen die jij uitnodigt kunnen meelezen.",
  },
  {
    question: "Krijg ik de USB-stick ook bij het instappakket?",
    answer:
      "De fysieke USB-stick in walnotenhout zit in de Erfgoed Box en het Nalatenschap-pakket. Bij Nalatenschap krijg je daarnaast elk jaar een nieuwe USB-export, zodat ook je laatste verhalen fysiek bewaard blijven.",
  },
];

export default function LevensverhaalBewarenUsbPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/erfgoed-box.jpg"
            alt="Levensverhaal bewaren op USB-stick én in de cloud"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/88 via-slate-900/72 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 backdrop-blur-md border border-orange/30 text-white text-sm font-medium mb-8 shadow-xl">
              <Sparkles className="h-4 w-4 text-orange-light" />
              <span>Cloud + USB — het beste van twee werelden</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Jouw levensverhaal
              <span className="text-orange block mt-2">blijft van jou</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Bewaar je verhaal niet alleen in de cloud, maar óók op een USB-stick
              die je in je eigen handen houdt. Geen vendor lock-in, ooit.
            </p>

            <p className="text-lg text-white/85 leading-relaxed mb-10 drop-shadow-lg">
              De cloud zorgt voor gemak, toegang en delen met familie. De USB geeft
              je zekerheid en bezit — voor altijd, ook zonder internet of platform.
              Het beste van twee werelden, in één Erfgoed Box.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                asChild
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Link href="/checkout?package=ERFGOED" className="inline-flex items-center">
                  Bekijk de Erfgoed Box — €149 <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
              >
                <Link href="#hybride">Hoe werkt de hybride aanpak?</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Altijd exporteerbaar</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Open bestandsformaten</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Nederlandse servers · AVG</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── De angst wegnemen ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-6 leading-snug">
            &ldquo;Maar wat als jullie platform ooit verdwijnt?&rdquo;
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Het is de belangrijkste vraag die je zou moeten stellen voordat je je
            kostbaarste herinneringen aan een dienst toevertrouwt. Te veel platforms
            sluiten je op: stoppen ze, dan ben je álles kwijt.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Bij BewaardVoorJou.nl draaien we dat om. Jouw levensverhaal is geen
            gijzelaar van ons platform. Je krijgt het óók fysiek mee, op een USB-stick,
            in open formaten die elke computer kan lezen.
          </p>
          <p className="text-xl text-slate-900 font-serif font-medium leading-relaxed">
            Wij verdienen jouw vertrouwen door je vrij te laten — niet door je vast te zetten.
          </p>
        </div>
      </section>

      {/* ── De hybride aanpak ── */}
      <section id="hybride" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange/10 border border-orange/30 text-orange text-xs font-bold mb-4 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              De hybride aanpak
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Cloud én USB. Niet óf.
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Cloud-only diensten zijn handig maar maken je afhankelijk. USB-only is
              veilig maar onhandig om te delen. Daarom combineren wij beide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((p) => (
              <Card
                key={p.title}
                className="bg-white border-2 border-neutral-sand hover:border-orange/30 hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 mb-5">
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900 mb-4">{p.title}</h3>
                  <ul className="space-y-2.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 bg-[#1a1a1a] rounded-2xl p-8 md:p-12 text-center">
            <p className="font-serif text-xl md:text-2xl text-white leading-relaxed max-w-3xl mx-auto">
              Het gemak van de cloud. De zekerheid van fysiek bezit. Samen zorgen
              ze dat jouw verhaal nooit verloren gaat — en nooit van jou wordt afgepakt.
            </p>
          </div>
        </div>
      </section>

      {/* ── Garanties tegen lock-in ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Onze belofte: jij houdt de controle
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Vier harde garanties die ervoor zorgen dat jouw levensverhaal voor
              altijd binnen handbereik blijft.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guarantees.map((g, i) => (
              <Card
                key={i}
                className="bg-gradient-to-br from-cream via-white to-warm-sand/10 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-7 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 mb-5 group-hover:bg-orange/20 group-hover:scale-110 transition-all duration-300">
                    {g.icon}
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">{g.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{g.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hoe werkt het ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              In drie stappen dubbel veilig bewaard
            </h2>
            <p className="text-slate-700">Van eerste herinnering tot fysieke USB in je hand.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange to-orange/20" />
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-neutral-sand">
                  <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-gradient-to-br from-orange to-gold flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-700 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-6">
              <Link href="/checkout?package=ERFGOED">
                Start met de Erfgoed Box <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Pakketten ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Kies hoe je jouw verhaal bewaart
            </h2>
            <p className="text-slate-700">
              Beide pakketten bevatten de USB-stick in walnotenhout én volledige
              cloudtoegang. Digitale toegang start direct.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Erfgoed */}
            <div className="relative bg-white rounded-2xl border-2 border-[#d4af37] shadow-2xl overflow-hidden">
              <div className="bg-[#d4af37] text-[#1a1a1a] text-xs font-bold text-center py-2 tracking-widest">
                ⭐ MEEST GEKOZEN ⭐
              </div>
              <div className="p-8">
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">Erfgoed Box</h3>
                <p className="text-slate-500 text-sm mb-4">Cloud + USB, compleet</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900">€149</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">5 jaar inbegrepen · doos inbegrepen</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "Volledige cloudtoegang tot je verhaal",
                    "USB-stick in walnotenhout",
                    "Alle 58 hoofdstukken van je leven",
                    "Persoonlijke gespreksleider",
                    "Export in open formaten, altijd",
                    "5 familieleden kunnen meelezen",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold py-6 text-base"
                >
                  <Link href="/checkout?package=ERFGOED">
                    Kies de Erfgoed Box <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Nalatenschap */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-[#1a1a1a] text-white text-xs font-bold text-center py-2 tracking-widest">
                EENMALIG · NOOIT MEER BETALEN
              </div>
              <div className="p-8">
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">Nalatenschap</h3>
                <p className="text-slate-500 text-sm mb-5">Levenslang + jaarlijkse USB-backup</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900">€229</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">eenmalig — geen verdere kosten ooit</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "Alles van de Erfgoed Box",
                    "Levenslange digitale toegang",
                    "Jaarlijkse USB-export backup",
                    "Certificaat in waszegel-envelop",
                    "2 gedrukt boek-credits*",
                    "Prioriteit support",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-6 text-base"
                >
                  <Link href="/checkout?package=NALATENSCHAP">
                    Kies Nalatenschap <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-slate-400 mt-3 text-center">
                  * gedrukt boek beschikbaar zodra printfunctie live is
                </p>
              </div>
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
            &ldquo;Ik wilde mijn herinneringen niet kwijtraken aan zomaar een app
            die over vijf jaar verdwijnt. Dat ik de USB fysiek in handen heb, geeft
            me echt rust.&rdquo;
          </blockquote>
          <p className="text-[#d4af37] font-medium text-sm">— Henk, 68 jaar · legde zijn levensverhaal vast</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-slate-700">Alles over cloud, USB en het bewaren van jouw verhaal.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-neutral-sand shadow-sm overflow-hidden"
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
            Bewaar je verhaal<br className="hidden md:block" /> zonder zorgen
          </h2>
          <p className="text-xl mb-10 opacity-95">
            In de cloud voor gemak, op USB voor zekerheid. Altijd van jou.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-orange hover:bg-neutral-light text-lg px-10 py-7 shadow-2xl font-semibold"
            >
              <Link href="/checkout?package=ERFGOED">
                Kies de Erfgoed Box — €149 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/15 backdrop-blur-md hover:bg-white/25 text-white text-lg px-10 py-7 border-2 border-white/40 transition-all"
            >
              <Link href="/checkout?package=NALATENSCHAP">
                Nalatenschap — €229 eenmalig
              </Link>
            </Button>
          </div>
          <p className="text-sm opacity-80 mt-6">
            Digitale toegang start direct · USB & doos bezorging binnen 2 weken · 14 dagen bedenktijd
          </p>
        </div>
      </section>

      {/* Interne links: verdiepende KB-artikelen */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-8 text-center">
            Verdiep je in digitale nalatenschap
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Waar worden mijn verhalen opgeslagen?
              </h3>
              <p className="text-sm text-slate-600">Nederlandse servers & privacy</p>
            </Link>
            <Link
              href="/kennisbank/hoe-werkt-de-tijdgestuurde-vrijgave-voor-familie"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Tijdsgestuurde vrijgave voor familie
              </h3>
              <p className="text-sm text-slate-600">Jouw verhalen op het juiste moment</p>
            </Link>
            <Link
              href="/kennisbank/hoe-exporteer-ik-mijn-eigen-data-en-herinneringen"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Data exporteren: hoe werkt dat?
              </h3>
              <p className="text-sm text-slate-600">Jouw data blijft altijd van jou</p>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
