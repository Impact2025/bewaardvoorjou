import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ArrowRight,
  Building2,
  Heart,
  Mic,
  BookOpen,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Pensioen afscheidscadeau — een afscheid dat blijft | BewaardVoorJou.nl" },
  description:
    "Het einde bepaalt de herinnering aan een hele loopbaan. Zo maak je van een pensioen of afscheid een betekenisvol eerbetoon — voor collega's, familie en werkgeversmerk.",
  keywords: [
    "pensioen afscheidscadeau",
    "afscheidscadeau collega pensioen",
    "afscheid collega betekenisvol",
    "offboarding cadeau",
    "pensioen cadeau man vrouw",
    "eerbetoon loopbaan",
    "afscheidsboek collega",
  ],
  alternates: { canonical: "https://bewaardvoorjou.nl/pensioen-afscheidscadeau" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://bewaardvoorjou.nl/pensioen-afscheidscadeau",
    title: "Pensioen afscheidscadeau — een afscheid dat blijft",
    description:
      "Het einde bepaalt hoe iemand een hele loopbaan onthoudt. Zo maak je een afscheid dat écht binnenkomt.",
    siteName: "BewaardVoorJou.nl",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pensioen afscheidscadeau",
  description:
    "Een betekenisvol afscheid bij pensioen of vertrek: het levensverhaal en de loopbaan van een collega vastgelegd voor altijd.",
  url: "https://bewaardvoorjou.nl/pensioen-afscheidscadeau",
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wat is een goed afscheidscadeau voor een collega die met pensioen gaat?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Het mooiste afscheidscadeau is geen ding, maar een verhaal. Verzamel de herinneringen en anekdotes van collega's tot één persoonlijk eerbetoon en laat er een gedrukt levensboek van maken. Dat raakt dieper dan een cadeaubon en blijft een leven lang.",
        },
      },
      {
        "@type": "Question",
        name: "Waarom voelt een standaard afscheid met een cadeaubon vaak koud?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Omdat het einde van een loopbaan onevenredig zwaar weegt in hoe iemand er zijn leven lang op terugkijkt (de Peak-End Rule van Kahneman). Een generiek gebaar reduceert decennia loyaliteit tot een transactie. Een persoonlijk eerbetoon doet het tegenovergestelde.",
        },
      },
      {
        "@type": "Question",
        name: "Hoeveel tijd kost het om een persoonlijk afscheid samen te stellen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Traditioneel kost dat een secretariaat al snel 15 tot 20 uur. Met BewaardVoorJou.nl dragen collega's asynchroon hun herinneringen bij en helpt de AI-interviewer bij het formuleren, waardoor het in een fractie van die tijd klaar is.",
        },
      },
    ],
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl/" },
    { "@type": "ListItem", position: 2, name: "Pensioen afscheidscadeau", item: "https://bewaardvoorjou.nl/pensioen-afscheidscadeau" },
  ],
};

const pijlers = [
  {
    icon: <Building2 className="h-6 w-6 text-orange" />,
    title: "Rol en plek",
    text: "Werk geeft je een plek in een hiërarchie. De box bewaart het bewijs van expertise en betekenis.",
  },
  {
    icon: <Clock className="h-6 w-6 text-orange" />,
    title: "Dagelijkse structuur",
    text: "Het ordenen van een loopbaan geeft een nieuwe, zinvolle tijdsbesteding op een kwetsbaar moment.",
  },
  {
    icon: <Users className="h-6 w-6 text-orange" />,
    title: "Verbondenheid",
    text: "De bijdragen van collega's bewijzen dat de band met de gemeenschap blijft, ook na de laatste werkdag.",
  },
  {
    icon: <Heart className="h-6 w-6 text-orange" />,
    title: "Prestatie en trots",
    text: "Decennia aan vakmanschap worden zichtbaar gemaakt in één tastbaar resultaat om trots op te zijn.",
  },
];

const stats = [
  { value: "36%", label: "grijze druk in 2026, op weg naar 50%" },
  { value: "40%", label: "vertrekt eerder dan de AOW-leeftijd" },
  { value: "8% vs 7×", label: "voelt zich gerespecteerd bij een transactioneel afscheid — tegenover zeven keer zo vaak bij een persoonlijk eerbetoon" },
];

export default function PensioenAfscheidscadeauPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PublicHeader />

      <main className="min-h-screen bg-warm-50">
        {/* Hero */}
        <section className="bg-white border-b border-neutral-sand py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange mb-4">
              Pensioen &amp; afscheid
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-slate-900 mb-5 leading-tight">
              Het afscheid bepaalt de herinnering aan een heel werkzaam leven
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              In mijn tijd in de welzijnssector heb ik veel afscheiden gezien. Weinig zegt
              zoveel over een organisatie als de manier waarop ze iemand laat gaan. Zo maak
              je van een pensioen of vertrek een eerbetoon dat blijft — in plaats van een
              fruitmand die niemand onthoudt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-semibold hover:bg-orange/90 transition-colors shadow-md"
              >
                Begin een eerbetoon
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://www.weareimpact.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                <Building2 className="h-4 w-4" />
                Voor HR &amp; directie
              </a>
            </div>
          </div>
        </section>

        {/* Demografische realiteit */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-3 text-center">
            De achterdeur van 2026 is een verwaarloosd risico
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-center mb-10 leading-relaxed">
            Organisaties investeren decennia in onboarding, de voordeur. De achterdeur blijft
            onderbelicht. Terwijl de cijfers een acuut verhaal vertellen.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {stats.map((s) => (
              <div
                key={s.value}
                className="bg-white rounded-2xl border border-neutral-sand p-6 text-center"
              >
                <p className="text-3xl font-serif font-semibold text-orange mb-2">{s.value}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Peak-End formule-kaart */}
        <section className="bg-white border-y border-neutral-sand py-14 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-4">
              Waarom het einde onevenredig zwaar weegt
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              De psycholoog Daniel Kahneman ontdekte dat we een ervaring niet onthouden als een
              gemiddelde van alle jaren, maar vooral via twee momenten: het hoogtepunt en het
              einde. Voor een loopbaan betekent dat: het afscheid kleurt de hele terugblik.
            </p>
            <div className="rounded-2xl bg-warm-50 border border-orange/20 p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange mb-3">
                De Peak-End Rule
              </p>
              <p className="text-2xl sm:text-3xl font-serif text-slate-900 mb-4 tracking-tight">
                V<sub>herinnering</sub> ≈ (E<sub>piek</sub> + E<sub>eind</sub>) / 2
              </p>
              <p className="text-slate-600 leading-relaxed">
                In gewone taal: het slot van een loopbaan telt onevenredig zwaar. Een sterk, warm
                einde kan jaren van gedoe overschrijven. Een koud einde kan jaren van waardering
                wissen. Het afscheid is dus niet het laatste detail — het is het hoofdstuk dat
                blijft.
              </p>
            </div>
          </div>
        </section>

        {/* 4 pijlers */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-3 text-center">
            Het voorkomen van het &lsquo;zwarte gat&rsquo;
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-center mb-10 leading-relaxed">
            Werk draagt vier pijlers van iemands identiteit. Vallen die abrupt weg, dan ontstaat
            een identiteitsvacuüm. Een tastbaar loopbaannarratief herstelt ze actief.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {pijlers.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl border border-neutral-sand p-6 flex gap-4"
              >
                <div className="shrink-0 w-11 h-11 rounded-full bg-orange/10 flex items-center justify-center">
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Havenmeester-case */}
        <section className="bg-white border-y border-neutral-sand py-14 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange shrink-0 mt-1" />
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900">
                De prijs van een zielloos afscheid
              </h2>
            </div>
            <blockquote className="border-l-4 border-orange bg-warm-50 rounded-r-xl p-6 text-slate-700 leading-relaxed">
              Een havenmeester nam afscheid na 42 jaar trouwe dienst. Vanwege &lsquo;operationele
              drukte&rsquo; werd het 48 uur van tevoren geregeld: een supermarkt-fruitmand in een
              kille kantine. Gekwetst plaatste hij zijn ervaring op LinkedIn. De post werd 45.000
              keer bekeken — en twee topkandidaten trokken hun sollicitatie voor zijn opvolging in.
            </blockquote>
            <p className="text-slate-600 leading-relaxed mt-6">
              Dat is de tastbare prijs. Achterblijvers — je high-potentials — zien hoe een mentor
              wordt &lsquo;afgekocht&rsquo; en projecteren die inwisselbaarheid op hun eigen
              toekomst. Een warm afscheid is daarmee de goedkoopste wervingsstrategie die er is.
            </p>
          </div>
        </section>

        {/* Zo werkt het */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-3 text-center">
            Zonder dat het secretariaat er twintig uur in steekt
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-center mb-10 leading-relaxed">
            Een betekenisvol afscheid strandt vaak op tijdgebrek. Ons platform neemt dat werk uit
            handen.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-neutral-sand p-6">
              <Mic className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Iedereen draagt bij</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Collega&rsquo;s voegen in hun eigen tempo een herinnering toe: in tekst, audio of
                video. De multimodale invoer maakt meedoen moeiteloos.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-sand p-6">
              <BookOpen className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">De interviewer helpt</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Wie niet weet wat te zeggen, krijgt van de empathische AI-interviewer een concrete
                vraag in plaats van een leeg vak.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-sand p-6">
              <Heart className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Tastbaar eerbetoon</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Met de eenvoudige export maak je er een gedrukt levensboek van om op de dag zelf te
                overhandigen.
              </p>
            </div>
          </div>
        </section>

        {/* Duale CTA */}
        <section className="bg-white border-t border-neutral-sand py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-sand p-8 bg-warm-50">
              <Heart className="h-8 w-8 text-orange mb-4" />
              <h3 className="text-xl font-serif font-semibold text-slate-900 mb-2">
                Voor familie, vrienden en collega&rsquo;s
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Begin vandaag met verzamelen, dan is het eerbetoon op tijd klaar. Gratis, geen
                creditcard nodig.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-semibold hover:bg-orange/90 transition-colors"
              >
                Start gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-900 text-white">
              <Building2 className="h-8 w-8 text-orange mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">Voor HR &amp; directie</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Offboarding is de lakmoesproef voor je werkgeversmerk. Ik help organisaties er een
                sterk punt van te maken. Plan een strategische verkenning.
              </p>
              <a
                href="https://www.weareimpact.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
              >
                Naar WeAreImpact.nl
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
