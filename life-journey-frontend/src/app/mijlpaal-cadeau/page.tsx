import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ArrowRight,
  Hand,
  Users,
  Gift,
  Mic,
  BookOpen,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mijlpaal cadeau 50, 60 of 65 jaar — geef betekenis | BewaardVoorJou.nl",
  description:
    "Wat geef je iemand van 50, 60 of 65 die alles al heeft? Geen ding, maar een tastbaar eerbetoon dat neurologisch dieper raakt dan een envelop met geld. Samen te maken.",
  keywords: [
    "mijlpaal cadeau",
    "cadeau 50 jaar",
    "cadeau 60 jaar",
    "cadeau 65 jaar",
    "cadeau iemand die alles heeft",
    "betekenisvol verjaardagscadeau",
    "groepscadeau collega",
  ],
  alternates: { canonical: "https://bewaardvoorjou.nl/mijlpaal-cadeau" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://bewaardvoorjou.nl/mijlpaal-cadeau",
    title: "Mijlpaal cadeau 50, 60 of 65 jaar — geef betekenis",
    description:
      "Geen ding, maar een tastbaar eerbetoon dat dieper raakt dan een envelop met geld.",
    siteName: "BewaardVoorJou.nl",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mijlpaal cadeau 50, 60 of 65 jaar",
  description:
    "Een betekenisvol mijlpaalcadeau: een gezamenlijk, tastbaar eerbetoon in plaats van een anonieme envelop met geld.",
  url: "https://bewaardvoorjou.nl/mijlpaal-cadeau",
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wat geef je iemand van 60 die alles al heeft?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Geen ding, maar betekenis. Verzamel de herinneringen van familie, vrienden en oud-collega's tot één persoonlijk eerbetoon en maak er een tastbaar levensboek van. Dat raakt op de dag zelf en blijft daarna jaren.",
        },
      },
      {
        "@type": "Question",
        name: "Waarom voelt een gezamenlijke envelop met geld zo onpersoonlijk?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bij groepscadeaus wacht iedereen op elkaar — het omstander-effect. Niemand neemt het persoonlijke deel op zich, en het wordt een anonieme envelop. Een gezamenlijk verhaal doorbreekt dat door iedereen een concrete bijdrage te vragen.",
        },
      },
      {
        "@type": "Question",
        name: "Werkt dit ook voor een 50e of 65e verjaardag of een pensioen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Of het nu gaat om een vijftigste, zestigste of een pensioen rond de vijfenzestig: het idee is hetzelfde. Vier de mens en wat die heeft betekend, niet de spullen.",
        },
      },
    ],
  },
};

const receptoren = [
  {
    title: "Fijne vormen en blinddruk",
    text: "Merkel-schijven in de huid detecteren fijne vormen — precies wat personalisatie en reliëf voelbaar maakt.",
  },
  {
    title: "Grip en textuur",
    text: "Meissner-lichaampjes nemen de textuur van hout, linnen en papier waar. Materiaal spreekt.",
  },
  {
    title: "Het beloningssysteem",
    text: "Aanraken activeert direct het ventrale striatum — het dopaminerge beloningssysteem van het brein.",
  },
];

export default function MijlpaalCadeauPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="min-h-screen bg-warm-50">
        {/* Hero */}
        <section className="bg-white border-b border-neutral-sand py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange mb-4">
              Mijlpaal 50 · 60 · 65 jaar
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-slate-900 mb-5 leading-tight">
              &lsquo;Ik heb alles al&rsquo; is geen grap, maar een eerlijke constatering
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              In mijn tijd in de welzijnssector zag ik hoe mensen op latere leeftijd steeds minder
              waarde hechten aan spullen en steeds meer aan betekenis. Juist daarom is het mooiste
              mijlpaalcadeau geen ding, maar een tastbaar eerbetoon dat viert wie iemand is.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-semibold hover:bg-orange/90 transition-colors shadow-md"
              >
                Maak een gezamenlijk eerbetoon
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kennisbank/de-psychologie-van-bewaren-waarom-je-niets-wilt-weggooien"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                De wetenschap erachter
              </Link>
            </div>
          </div>
        </section>

        {/* Bystander */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-start gap-3 mb-4">
            <Users className="h-6 w-6 text-orange shrink-0 mt-1" />
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900">
              Waarom een groepscadeau zo vaak strandt in een envelop
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            Bij een gezamenlijk cadeau gebeurt er vaak iets vervelends: iedereen wacht op elkaar.
            Niemand voelt zich verantwoordelijk voor het persoonlijke deel, en voor je het weet
            wordt het een anonieme envelop met geld. Handig, maar vergeetbaar. Psychologen noemen
            dat het omstander-effect: hoe meer mensen erbij betrokken zijn, hoe minder iemand het
            initiatief neemt.
          </p>
          <blockquote className="border-l-4 border-orange bg-white rounded-r-xl p-6 text-slate-700 leading-relaxed">
            Een envelop zegt: we wisten het even niet. Een gezamenlijk verhaal zegt: jij hebt ertoe
            gedaan, en hier is het bewijs.
          </blockquote>
        </section>

        {/* Neurowetenschap kaart */}
        <section className="bg-white border-y border-neutral-sand py-14 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-3 mb-4">
              <Hand className="h-6 w-6 text-orange shrink-0 mt-1" />
              <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900">
                Waarom iets tastbaars dieper raakt dan een scherm
              </h2>
            </div>
            <p className="text-slate-600 leading-relaxed mb-8">
              Aanraken is voor je brein geen bijzaak. Je vingertoppen nemen een onevenredig groot
              deel van je hersenschors in beslag. Een tastbaar eerbetoon spreekt dus letterlijk een
              groter deel van iemand aan dan een felicitatie op een scherm.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {receptoren.map((r) => (
                <div key={r.title} className="rounded-2xl bg-warm-50 border border-neutral-sand p-5">
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">{r.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-warm-50 border border-orange/20 p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange mb-3">
                De haptische shortcut
              </p>
              <p className="text-slate-700 leading-relaxed">
                Het aanraken van een dierbaar voorwerp is een korte weg naar een gevoel van waarde
                die een scherm niet kan nemen. Waar een appje wegschuift onder het volgende bericht,
                blijft een boek zichtbaar op tafel liggen — uitnodigend, keer op keer.
              </p>
            </div>
          </div>
        </section>

        {/* Zo maak je het */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-3 text-center">
            Zo maak je het samen, zonder gedoe
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-center mb-10 leading-relaxed">
            Vroeger kostte zoiets iemand dagen knip- en plakwerk. Nu niet meer.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-neutral-sand p-6">
              <Mic className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Iedereen draagt bij</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Kinderen, kleinkinderen, vrienden en oud-collega&rsquo;s voegen elk een herinnering
                toe, in tekst, audio of video.
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
              <Gift className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Tastbaar cadeau</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Met de eenvoudige export maak je er een gedrukt levensboek van om cadeau te geven op
                de dag zelf.
              </p>
            </div>
          </div>
        </section>

        {/* Duale CTA */}
        <section className="bg-white border-t border-neutral-sand py-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles className="h-8 w-8 text-orange mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-3">
              Vier de mens, niet de spullen
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Of het nu gaat om een vijftigste, zestigste of vijfenzestigste: begin op tijd met
              verzamelen, dan is het eerbetoon klaar als het telt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-semibold hover:bg-orange/90 transition-colors shadow-md"
              >
                Start gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://www.weareimpact.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Voor organisaties &amp; jubilea
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
