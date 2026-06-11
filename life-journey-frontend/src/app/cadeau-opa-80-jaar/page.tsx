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
  Heart,
  Mic,
  Shield,
  Gift,
  Sparkles,
  Star,
  Package,
  Coffee,
  Hourglass,
  ChevronDown,
} from "lucide-react";

const PAGE_URL = "https://bewaardvoorjou.nl/cadeau-opa-80-jaar";

export const metadata: Metadata = {
  title:
    "Origineel cadeau opa 80 jaar — De Erfgoed Box met zijn herinneringen | BewaardVoorJou.nl",
  description:
    "Op zoek naar een origineel cadeau voor opa van 80? De Erfgoed Box legt zijn levensverhaal vast voor altijd. Een luxe magneetdoos, een rustgevende thee en een zandloper — zodat hij de tijd neemt om te vertellen.",
  keywords: [
    "origineel cadeau opa 80 jaar",
    "cadeau opa 80 jaar",
    "verjaardagscadeau opa 80",
    "cadeau opa die alles al heeft",
    "herinneringen opa vastleggen",
    "levensverhaal opa cadeau",
    "bijzonder cadeau opa",
    "cadeau grootvader 80 jaar",
    "erfgoed box cadeau",
    "betekenisvol cadeau ouderen",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: PAGE_URL,
    title:
      "Origineel cadeau opa 80 jaar — De Erfgoed Box met zijn herinneringen",
    description:
      "Geen gadget dat stof verzamelt. De Erfgoed Box legt opa's levensverhaal vast voor altijd — luxe magneetdoos, thee en een zandloper om de tijd te nemen.",
    siteName: "BewaardVoorJou.nl",
    images: [
      {
        url: "/erfgoed-box.jpg",
        width: 1200,
        height: 630,
        alt: "De Erfgoed Box — origineel cadeau voor opa van 80 jaar",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Origineel cadeau opa 80 jaar — De Erfgoed Box",
      description:
        "De Erfgoed Box legt het levensverhaal van opa vast voor altijd. Een origineel en betekenisvol cadeau voor een 80e verjaardag.",
      url: PAGE_URL,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Cadeau opa 80 jaar",
            item: PAGE_URL,
          },
        ],
      },
    },
    {
      "@type": "Product",
      name: "De Erfgoed Box — cadeau voor opa van 80 jaar",
      image: "https://bewaardvoorjou.nl/erfgoed-box.jpg",
      description:
        "Een luxe cadeaubox waarmee opa zijn complete levensverhaal vastlegt: 58 hoofdstukken, een persoonlijke gespreksleider, een magneetdoos met goudfolie, een rustgevende thee, een zandloper en een USB-stick in walnotenhout.",
      brand: { "@type": "Brand", name: "BewaardVoorJou.nl" },
      offers: [
        {
          "@type": "Offer",
          name: "Erfgoed Box (Pakket 1)",
          price: "149.00",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: "https://bewaardvoorjou.nl/checkout?package=ERFGOED&gift=true",
        },
        {
          "@type": "Offer",
          name: "Nalatenschap (Pakket 2)",
          price: "229.00",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: "https://bewaardvoorjou.nl/checkout?package=NALATENSCHAP&gift=true",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Wat is een origineel cadeau voor opa van 80 jaar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "De Erfgoed Box is een bijzonder cadeau voor een 80e verjaardag: opa legt zijn complete levensverhaal vast met hulp van een geduldige gespreksleider. Geen zoveelste fles wijn of gadget, maar zijn stem, zijn herinneringen en zijn wijsheid — voor altijd bewaard voor kinderen en kleinkinderen.",
          },
        },
        {
          "@type": "Question",
          name: "Moet opa goed met computers overweg kunnen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Nee. De gespreksleider stelt warme, open vragen en opa hoeft alleen maar te vertellen. Hij kan inspreken, een video opnemen of typen — wat hij het prettigst vindt. Familie kan hem ook helpen tijdens de gesprekken.",
          },
        },
        {
          "@type": "Question",
          name: "Wat zit er in de Erfgoed Box?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Een luxe magneetdoos met goudfolie-logo, een rustgevende thee om bij te vertellen, een zandloper om rustig de tijd te nemen, een USB-stick in walnotenhout, een grafietpotlood en een A6-notitieboekje. Plus digitale toegang tot alle 58 hoofdstukken van zijn leven.",
          },
        },
        {
          "@type": "Question",
          name: "Hoe snel wordt het cadeau geleverd?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "De digitale toegang start direct na betaling, zodat je hem desgewenst meteen op zijn verjaardag kunt verrassen. De fysieke Erfgoed Box bezorgen we daarna binnen 2 weken op het opgegeven adres.",
          },
        },
        {
          "@type": "Question",
          name: "Kunnen meerdere familieleden meelezen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ja. Tot 5 familieleden kunnen de verhalen van opa lezen, beluisteren en bekijken. Zo wordt zijn levensverhaal een gezamenlijk familiearchief dat generaties lang bewaard blijft.",
          },
        },
      ],
    },
  ],
};

const boxItems = [
  {
    icon: <Package className="h-7 w-7 text-orange" />,
    title: "De luxe magneetdoos",
    desc: "Een stevige A5-doos met magneetsluiting en goudfolie-logo. Hij voelt het gewicht in zijn handen — dit is geen wegwerpcadeau, dit is een erfstuk.",
  },
  {
    icon: <Coffee className="h-7 w-7 text-orange" />,
    title: "De thee om bij te vertellen",
    desc: "Een rustgevende thee zit in de doos. Schenk een kop in, ga er samen voor zitten, en laat de herinneringen vanzelf bovenkomen. Vertellen mag een ritueel zijn.",
  },
  {
    icon: <Hourglass className="h-7 w-7 text-orange" />,
    title: "De zandloper",
    desc: "Draai de zandloper om en neem rustig de tijd. Geen haast, geen druk. De zandloper herinnert eraan: het gaat niet om snelheid, het gaat om dít moment samen.",
  },
];

const reasons = [
  {
    icon: <Mic className="h-7 w-7 text-orange" />,
    title: "Zijn stem, voor altijd bewaard",
    desc: "Audio- en video-opnames zodat kleinkinderen opa later nog kunnen horen vertellen — ook als hij er niet meer is.",
  },
  {
    icon: <Heart className="h-7 w-7 text-orange" />,
    title: "Een cadeau voor wie alles al heeft",
    desc: "Op zijn 80e heeft opa geen spullen meer nodig. Wél de kans om zijn verhaal door te geven. Dát is onbetaalbaar.",
  },
  {
    icon: <Gift className="h-7 w-7 text-orange" />,
    title: "Een cadeau dat blijft",
    desc: "Geen gadget dat in de la verdwijnt. Een levensverhaal dat generaties lang in de familie bewaard blijft.",
  },
  {
    icon: <Shield className="h-7 w-7 text-orange" />,
    title: "100% veilig & privé",
    desc: "Nederlandse servers, AVG-compliant. Alleen de familieleden die opa uitnodigt kunnen meelezen.",
  },
];

const steps = [
  {
    step: "1",
    title: "Kies het pakket",
    description:
      "Erfgoed Box (€149) of Nalatenschap (€229). Digitale toegang start direct na betaling.",
  },
  {
    step: "2",
    title: "Voer opa's naam & e-mail in",
    description:
      "Vul zijn naam en e-mailadres in en voeg een persoonlijk bericht toe voor zijn verjaardag.",
  },
  {
    step: "3",
    title: "Opa ontvangt zijn uitnodiging",
    description:
      "Een warme welkomstmail nodigt hem uit. De luxe doos bezorgen we daarna binnen 2 weken.",
  },
];

const faqs = [
  {
    question: "Wat is een origineel cadeau voor opa van 80 jaar?",
    answer:
      "De Erfgoed Box is een van de meest betekenisvolle cadeaus die je voor een 80e verjaardag kunt geven. Opa legt zijn complete levensverhaal vast met hulp van een geduldige gespreksleider — zijn stem, zijn herinneringen en zijn wijsheid, voor altijd bewaard voor kinderen en kleinkinderen.",
  },
  {
    question: "Moet opa goed met computers overweg kunnen?",
    answer:
      "Nee, absoluut niet. De gespreksleider stelt warme, open vragen en opa hoeft alleen maar te vertellen. Hij kan inspreken, een video opnemen of typen — wat hij het prettigst vindt. En familie kan hem natuurlijk helpen tijdens de gesprekken.",
  },
  {
    question: "Wat zit er precies in de Erfgoed Box?",
    answer:
      "Een luxe magneetdoos met goudfolie-logo, een rustgevende thee om bij te vertellen, een zandloper om rustig de tijd te nemen, een USB-stick in walnotenhout, een grafietpotlood en een A6-notitieboekje. Plus digitale toegang tot alle 58 hoofdstukken van zijn leven.",
  },
  {
    question: "Hoe snel wordt het cadeau geleverd?",
    answer:
      "De digitale toegang start direct na betaling, zodat je opa desgewenst meteen op zijn verjaardag kunt verrassen met de uitnodiging. De fysieke Erfgoed Box bezorgen we daarna binnen 2 weken op het opgegeven adres.",
  },
  {
    question: "Kunnen meerdere familieleden meelezen?",
    answer:
      "Ja. Tot 5 familieleden kunnen de verhalen van opa lezen, beluisteren en bekijken. Zo wordt zijn levensverhaal een gezamenlijk familiearchief dat generaties lang bewaard blijft.",
  },
  {
    question: "En als het cadeau toch niet bevalt?",
    answer:
      "Je hebt 14 dagen bedenktijd. Bevalt het niet? Dan krijg je je geld terug, zonder gedoe en zonder vragen.",
  },
];

export default function CadeauOpa80JaarPage() {
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
            src="/vaderdag-cadeau.jpg"
            alt="Opa ontvangt zijn Erfgoed Box als verjaardagscadeau"
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
              <span>Origineel cadeau voor opa van 80 jaar</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Geef opa het mooiste cadeau:
              <span className="text-orange block mt-2">zijn eigen verhaal</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Op zijn 80e heeft opa alles al. Behalve de kans om zijn
              levensverhaal door te geven aan wie na hem komt.
            </p>

            <p className="text-lg text-white/85 leading-relaxed mb-10 drop-shadow-lg">
              De Erfgoed Box begeleidt hem door zijn mooiste herinneringen. Een
              geduldige gespreksleider stelt de vragen — hij hoeft alleen maar te
              vertellen. Zijn stem, zijn lach, zijn wijsheid: voor altijd bewaard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                asChild
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Link href="/checkout?package=ERFGOED&gift=true" className="inline-flex items-center">
                  Bestel de Erfgoed Box — €149 <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
              >
                <Link href="#de-beleving">Bekijk de beleving</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Digitale toegang direct na betaling</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Doos bezorgd binnen 2 weken</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">14 dagen bedenktijd</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Emotionele intro ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-6 leading-snug">
            Wat geef je iemand die 80 wordt en alles al heeft?
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Nog een trui. Nog een fles wijn. Nog een bon. Na 80 jaar hoeft opa
            geen spullen meer — die heeft hij allemaal gehad.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed mb-4">
            Wat hij wél nog heeft, is een heel leven aan verhalen. Over hoe het
            vroeger was. Over oma. Over de keuzes die hem maakten tot wie hij is.
            Verhalen die verloren gaan als niemand ernaar vraagt.
          </p>
          <p className="text-xl text-slate-900 font-serif font-medium leading-relaxed">
            De Erfgoed Box vraagt het hem. En bewaart zijn antwoorden voor altijd.
          </p>
        </div>
      </section>

      {/* ── De beleving: magneetdoos, thee, zandloper ── */}
      <section id="de-beleving" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange/10 border border-orange/30 text-orange text-xs font-bold mb-4 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              De Erfgoed Box-beleving
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Een ritueel, geen klusje
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Vertellen mag iets bijzonders zijn. Daarom is de Erfgoed Box geen
              kale doos, maar een complete ervaring die opa uitnodigt om de tijd
              te nemen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/erfgoed-box.jpg"
                alt="De luxe Erfgoed Box met magneetdoos, thee en zandloper"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
            <div className="space-y-6">
              {boxItems.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-slate-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-8 md:p-12 text-center">
            <p className="font-serif text-xl md:text-2xl text-white leading-relaxed max-w-3xl mx-auto">
              Schenk de thee in. Draai de zandloper om. En luister naar 80 jaar
              leven — terwijl een geduldige gespreksleider precies de juiste
              vragen stelt.
            </p>
          </div>
        </div>
      </section>

      {/* ── Waarom ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Waarom dit het mooiste cadeau is voor opa
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Niet nog iets voor in de kast. Iets dat echt telt — voor hem, voor
              jou, en voor de kleinkinderen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((r, i) => (
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

      {/* ── Pakketten ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Kies het perfecte verjaardagscadeau
            </h2>
            <p className="text-slate-700">
              Beide pakketten bevatten de luxe Erfgoed Box. Digitale toegang start
              direct, de doos bezorgen we binnen 2 weken.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Erfgoed — Pakket 1 */}
            <div className="relative bg-white rounded-2xl border-2 border-[#d4af37] shadow-2xl overflow-hidden">
              <div className="bg-[#d4af37] text-[#1a1a1a] text-xs font-bold text-center py-2 tracking-widest">
                ⭐ MEEST GEKOZEN ⭐
              </div>
              <div className="p-8">
                <p className="text-orange text-xs font-bold uppercase tracking-widest mb-1">Pakket 1</p>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">Erfgoed Box</h3>
                <p className="text-slate-500 text-sm mb-4">De complete beleving</p>
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-5">
                  <Image
                    src="/erfgoed-box.jpg"
                    alt="Inhoud van de Erfgoed Box"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900">€149</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">5 jaar inbegrepen · doos inbegrepen</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "Alle 58 hoofdstukken van zijn leven",
                    "Persoonlijke gespreksleider in het Nederlands",
                    "Luxe A5 magneetdoos met goudfolie-logo",
                    "Rustgevende thee & zandloper",
                    "USB-stick in walnotenhout",
                    "Grafietpotlood & A6 notitieboekje",
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
                  <Link href="/checkout?package=ERFGOED&gift=true">
                    Geef de Erfgoed Box <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Nalatenschap — Pakket 2 */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-[#1a1a1a] text-white text-xs font-bold text-center py-2 tracking-widest">
                EENMALIG · NOOIT MEER BETALEN
              </div>
              <div className="p-8">
                <p className="text-orange text-xs font-bold uppercase tracking-widest mb-1">Pakket 2</p>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">Nalatenschap</h3>
                <p className="text-slate-500 text-sm mb-5">Het ultieme erfstuk — levenslang</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900">€229</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">eenmalig — geen verdere kosten ooit</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "Alles van de Erfgoed Box",
                    "Levenslange digitale toegang",
                    "Certificaat in waszegel-envelop",
                    "Jaarlijkse USB-export backup",
                    "2 gedrukt boek-credits*",
                    "5 familieleden kunnen meelezen",
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
                  <Link href="/checkout?package=NALATENSCHAP&gift=true">
                    Geef Nalatenschap <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* ── Hoe werkt het ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              In drie stappen geregeld
            </h2>
            <p className="text-slate-700">Bestellen duurt minder dan 5 minuten.</p>
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
              <Link href="/checkout?package=ERFGOED&gift=true">
                Bestel nu — bezorging binnen 2 weken <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
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
            &ldquo;Voor zijn 80e gaven we opa de Erfgoed Box. Hij vertelde dingen
            die we nog nooit hadden gehoord. Nu hebben de kleinkinderen zijn stem
            voor altijd.&rdquo;
          </blockquote>
          <p className="text-[#d4af37] font-medium text-sm">— Sanne, 39 jaar · gaf dit aan haar opa van 80</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-slate-700">Alles wat je wilt weten over dit cadeau voor opa.</p>
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
            80 jaar leven verdient<br className="hidden md:block" /> een thuis
          </h2>
          <p className="text-xl mb-10 opacity-95">
            Geef opa geen spullen, maar de kans om zijn verhaal door te geven.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-orange hover:bg-neutral-light text-lg px-10 py-7 shadow-2xl font-semibold"
            >
              <Link href="/checkout?package=ERFGOED&gift=true">
                Geef de Erfgoed Box — €149 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/15 backdrop-blur-md hover:bg-white/25 text-white text-lg px-10 py-7 border-2 border-white/40 transition-all"
            >
              <Link href="/checkout?package=NALATENSCHAP&gift=true">
                Nalatenschap — €229 eenmalig
              </Link>
            </Button>
          </div>
          <p className="text-sm opacity-80 mt-6">
            Digitale toegang start direct · Doos bezorging binnen 2 weken · 14 dagen bedenktijd
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
