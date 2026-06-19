"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Gift, Mail, Baby, MessageSquare, Star, Users, BookImage,
  ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";
import { BabyHeader } from "@/components/baby/BabyHeader";
import { BabyFooter } from "@/components/baby/BabyFooter";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

const STEPS = [
  {
    Icon: Gift,
    title: "Koop het cadeau",
    body: "Koop Bewaard voor Baby voor €59 eenmalig — als kraamcadeau voor iemand anders, of voor jezelf als je binnenkort bevalt. Geen abonnement, geen verborgen kosten.",
  },
  {
    Icon: Mail,
    title: "Ontvanger activeert het babyboek",
    body: "De ontvanger krijgt een digitale activatiecode. Klik, vul de naam en geboortedatum van de baby in — en het babyboek staat klaar. Duurt minder dan 5 minuten.",
  },
  {
    Icon: Baby,
    title: "Nodig de partner en grootouders uit",
    body: "Voeg het e-mailadres van de partner toe om samen te schrijven. Voeg opa's en oma's toe — zij ontvangen maandelijks automatisch een digest, zonder app of account.",
  },
  {
    Icon: MessageSquare,
    title: "Elke week een herinnering",
    body: "Iedere week verschijnt er een warme, persoonlijke vraag in de inbox. Schrijf wanneer het jou uitkomt — 's ochtends vroeg, tijdens de flesvoeding om 3 uur 's nachts, of gewoon op de bank.",
  },
  {
    Icon: Star,
    title: "Mijlpalen bijhouden op het moment zelf",
    body: "Eerste glimlach? Eerste stapje? Eerste woordje? Markeer ze direct met datum, foto en jouw verhaal erbij. Geen weken later terugzoeken — gewoon direct vastleggen.",
  },
  {
    Icon: Users,
    title: "Opa en oma ontvangen updates automatisch",
    body: "Elke maand stuurt het systeem een mooie samenvatting van nieuwe mijlpalen naar de ingestelde grootouders. Geen app, geen account, gewoon een e-mail vol mooie herinneringen.",
  },
  {
    Icon: BookImage,
    title: "Na een jaar: jouw fotoboek-voucher",
    body: "Rond alle 12 maandelijkse hoofdstukken af en claim je voucher voor een professioneel gedrukt fotoboek. Het digitale verhaal wordt een tastbaar erfstuk.",
  },
];

const FAQ = [
  {
    q: "Is het moeilijk in gebruik?",
    a: "Nee — als je een e-mail kunt lezen en sturen, kun je dit. Er zijn geen ingewikkelde menu's. Je ontvangt elke week gewoon een vraag in je inbox en schrijft je antwoord. Dat is alles.",
  },
  {
    q: "Kan ik het cadeau geven terwijl de baby er nog niet is?",
    a: "Absoluut. Je kunt het cadeau geven vóór de geboorte. De ontvanger activeert het zodra de baby geboren is. De activatiecode is een jaar geldig.",
  },
  {
    q: "Wat als ik een week een vraag oversla?",
    a: "Geen probleem. De vragen wachten op je. Je kunt ze altijd later beantwoorden, in je eigen tempo. Er is geen deadline per vraag — alleen één jaar toegang tot het platform.",
  },
  {
    q: "Schrijft de partner dan dezelfde dingen?",
    a: "Nee — de partner krijgt eigen, aangepaste vragen geschreven vanuit het perspectief van de partner. Zo ontstaan twee unieke verhalen over hetzelfde jaar, die samen één compleet beeld geven.",
  },
  {
    q: "Hoe ontvangen opa en oma de maandelijkse updates?",
    a: "Via e-mail, automatisch. Zij hoeven niets te installeren of in te loggen. Elke maand ontvangen ze een overzicht van nieuwe mijlpalen en hoogtepunten die jij hebt toegevoegd.",
  },
  {
    q: "Wanneer ontvang ik de fotoboek-voucher?",
    a: "Zodra je alle 12 maandelijkse hoofdstukken hebt afgerond, verschijnt er in het dashboard een knop om de voucher op te halen. Je kunt het fotoboek daarna via een externe drukker bestellen.",
  },
  {
    q: "Zijn mijn foto's en verhalen privé?",
    a: "Ja, volledig. Jouw babyboek is alleen zichtbaar voor de mensen die jij uitnodigt. Wij verkopen geen data en gebruiken jouw verhalen niet voor AI-training. Alles staat versleuteld opgeslagen op Europese servers.",
  },
  {
    q: "Hoelang heb ik toegang?",
    a: "Eén jaar volledige toegang na activatie — inclusief alle wekelijkse vragen en mijlpalen. Na het jaar blijft je babyboek leesbaar en deelbaar, maar worden er geen nieuwe vragen meer gestuurd.",
  },
];

function FaqItem({ q, a, t }: { q: string; a: string; t: ReturnType<typeof useBabyTheme>["t"] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-semibold text-gray-900 text-sm md:text-base">{q}</span>
        {open
          ? <ChevronUp className={`w-5 h-5 ${t.primaryText} shrink-0`} />
          : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <p className="pb-5 text-sm md:text-base text-gray-600 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export function HoeHetWerktContent() {
  const { t } = useBabyTheme();

  return (
    <div className="min-h-screen bg-white">
      <BabyHeader />

      {/* Hero */}
      <section className={`bg-gradient-to-b ${t.gradientHero} py-16 px-4 text-center`}>
        <div className="max-w-2xl mx-auto">
          <div className={`inline-flex items-center gap-2 ${t.badge} text-sm font-medium px-4 py-1.5 rounded-full mb-6`}>
            Zo simpel als het klinkt
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Hoe werkt{" "}
            <span className={t.heroAccent}>Bewaard voor Baby?</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto">
            Geen app downloaden. Geen ingewikkelde menu's. Gewoon elke week een
            warme vraag in je inbox — en een jaar later een compleet babyboek.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-6 md:gap-8">
                {/* Lijn + dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl ${t.primary} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                    <step.Icon className="w-5 h-5" />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[3rem] ${t.timelineLine} mt-2`} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-12 flex-1">
                  <p className={`text-xs ${t.primaryTextLight} font-bold uppercase tracking-widest mb-1`}>
                    Stap {i + 1}
                  </p>
                  <h2 className="font-bold text-gray-900 text-xl mb-2">{step.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* As a gift vs for yourself */}
      <section className={`py-16 px-4 ${t.primaryBg}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Als kraamcadeau of voor jezelf?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">🎁</div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Als kraamcadeau</h3>
              <ul className={`space-y-2 text-sm text-gray-600`}>
                {[
                  "Koop voor een stel dat net bevallen is of binnenkort bevalt",
                  "Zij ontvangen een digitale cadeaubon",
                  "Activatiecode is 1 jaar geldig — geen haast",
                  "Het origineelste, nuttigste kraamcadeau",
                ].map((line) => (
                  <li key={line} className="flex gap-2 items-start">
                    <span className={`${t.checkColor} shrink-0 mt-0.5`}>✓</span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/checkout?package=BABY_GIFT"
                className={`mt-6 inline-block ${t.primary} ${t.primaryHover} text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors`}
              >
                Geef als cadeau — €59
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">👶</div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">Voor jezelf</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  "Je bent zwanger of net bevallen",
                  "Je wilt het eerste jaar goed vastleggen",
                  "Partner schrijft ook mee",
                  "Grootouders betrekken zonder gedoe",
                ].map((line) => (
                  <li key={line} className="flex gap-2 items-start">
                    <span className={`${t.checkColor} shrink-0 mt-0.5`}>✓</span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/checkout?package=BABY_GIFT&for_self=true"
                className={`mt-6 inline-block border ${t.outlineBtn} font-semibold px-6 py-3 rounded-xl text-sm transition-colors`}
              >
                Koop voor jezelf — €59
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Veelgestelde vragen
          </h2>
          <div className="rounded-2xl border border-gray-100 px-6">
            {FAQ.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 px-4 ${t.quoteSection}`}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Klaar om te starten?
          </h2>
          <p className="text-white/80 mb-8 text-sm">
            Eenmalig €59 · Geen abonnement · 1 jaar toegang + fotoboek-voucher
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/checkout?package=BABY_GIFT"
              className="bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm"
            >
              Geef als kraamcadeau
            </Link>
            <Link
              href="/checkout?package=BABY_GIFT&for_self=true"
              className="border border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Koop voor jezelf
            </Link>
          </div>
        </div>
      </section>

      <BabyFooter />
    </div>
  );
}
