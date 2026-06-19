import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Bewaard voor Baby — Het digitale babyboek als kraamcadeau",
  description:
    "Het mooiste kraamcadeau: een jaar lang herinneringen bewaren met AI-begeleide vragen, mijlpalen bijhouden en maandelijkse updates voor opa en oma. €59 eenmalig.",
  openGraph: {
    title: "Bewaard voor Baby | BewaardVoorJou.nl",
    description:
      "14 diepgaande hoofdstukken. 28 mijlpalen. Wekelijkse herinneringsvragen. Grootouder-updates. Fotoboek-voucher na een jaar. €59 eenmalig.",
    url: "https://bewaardvoorjou.nl/voor-baby",
  },
  alternates: {
    canonical: "https://bewaardvoorjou.nl/voor-baby",
  },
};

const FEATURES = [
  {
    icon: "📖",
    title: "14 diepgaande hoofdstukken",
    body: "Van de geboortedag tot de eerste verjaardag — met AI-begeleide vragen die jou helpen elk moment in woorden te vangen.",
  },
  {
    icon: "🎯",
    title: "28 mijlpalen bijhouden",
    body: "Eerste glimlach, eerste stapje, eerste woordje — markeer ze met datum, foto en jouw verhaal erbij.",
  },
  {
    icon: "✉️",
    title: "Wekelijkse herinneringsvragen",
    body: "Elke week een warme, gerichte vraag in je inbox. Nooit meer 'ik wou dat ik dat had opgeschreven'.",
  },
  {
    icon: "👴",
    title: "Maandelijkse updates voor opa en oma",
    body: "Grootouders ontvangen automatisch een digest van de nieuwe mijlpalen — zonder app, zonder account.",
  },
  {
    icon: "📸",
    title: "Fotoboek-voucher",
    body: "Rond alle 12 maand-hoofdstukken af en claim je voucher voor een gedrukt fotoboek. De belofte die het boek voltooit.",
  },
  {
    icon: "👫",
    title: "Partner schrijft mee",
    body: "Nodig de andere ouder uit. Twee perspectieven — moeder en partner — voor een compleet verhaal.",
  },
];

const TIMELINE = [
  { week: "Geboorte", label: "De geboortedag", sub: "Rol-bewuste vragen voor moeder én partner" },
  { week: "Week 1", label: "Eerste week thuis", sub: "Het echte begin van jullie gezin" },
  { week: "Maand 1–12", label: "Maandelijkse interviews", sub: "12 hoofdstukken, 12 unieke levensfasen" },
  { week: "Tussendoor", label: "Mijlpalen", sub: "28 momenten — markeer ze wanneer ze gebeuren" },
  { week: "Jaar 1", label: "Eerste verjaardag", sub: "Terugblik + claim je fotoboek-voucher" },
];

export default function VoorBabyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-pink-50 to-white pt-16 pb-0 md:pb-0 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Tekst */}
          <div className="flex-1 text-center md:text-left py-8 md:py-20">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              Kraamcadeau van het jaar
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Het eerste jaar van{" "}
              <span className="text-pink-600">jullie kindje</span>{" "}
              verdient een plek.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
              Bewaard voor Baby begeleidt ouders met wekelijkse vragen, mijlpalen bijhouden
              en een digitaal babyboek dat generaties meegaat. Het mooiste kraamcadeau — voor €59.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/checkout?package=BABY_GIFT"
                className="inline-block bg-pink-600 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-pink-700 transition-colors shadow-sm"
              >
                Geef als kraamcadeau — €59
              </Link>
              <Link
                href="/checkout?package=BABY_GIFT&for_self=true"
                className="inline-block border border-pink-200 text-pink-700 font-semibold px-8 py-4 rounded-xl text-base hover:bg-pink-50 transition-colors"
              >
                Koop voor jezelf
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-400">
              Eenmalig €59 · Geen abonnement · Jaar toegang + fotoboek-voucher
            </p>
          </div>

          {/* Afbeelding */}
          <div className="flex-1 w-full md:max-w-[520px] relative">
            <div className="relative w-full aspect-[4/3] md:aspect-[3/4] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/images/baby-hero.png"
                alt="Lachende baby op een zachte crème deken"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 520px"
              />
              {/* Zachte roze tint-overlay aan de onderkant voor naadloze overgang */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-pink-50/60 to-transparent md:hidden" />
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Alles in één babyboek
          </h2>
          <p className="text-center text-gray-500 mb-14 text-lg">
            Geen losse apps, geen Instagram-stories die verdwijnen. Eén plek voor alles.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 p-6 rounded-2xl border border-pink-100 bg-pink-50/40 hover:bg-pink-50 transition-colors"
              >
                <span className="text-2xl mt-0.5 shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tijdlijn */}
      <section className="py-20 px-4 bg-pink-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            Een jaar lang bewaren
          </h2>
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={item.week} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-0.5 h-12 bg-pink-200 mt-1" />
                  )}
                </div>
                <div className="pb-12">
                  <p className="text-xs text-pink-500 font-semibold uppercase tracking-wider mb-0.5">
                    {item.week}
                  </p>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-gradient-to-b from-pink-50 to-white border border-pink-100 rounded-3xl p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bewaard voor Baby</h2>
            <div className="text-5xl font-bold text-pink-600 my-4">€59</div>
            <p className="text-gray-500 mb-6 text-sm">Eenmalig · Geen abonnement · 1 jaar toegang</p>
            <ul className="text-left space-y-2 mb-8 text-sm text-gray-700">
              {[
                "14 diepgaande hoofdstukken (geboorte t/m 1e verjaardag)",
                "28 mijlpalen bijhouden met foto en verhaal",
                "Wekelijkse herinneringsvragen per e-mail",
                "Maandelijkse updates voor opa en oma (geen app nodig)",
                "Partner schrijft mee vanuit eigen perspectief",
                "Fotoboek-voucher na een volledig jaar",
              ].map((line) => (
                <li key={line} className="flex gap-2 items-start">
                  <span className="text-pink-500 mt-0.5 shrink-0">✓</span>
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/checkout?package=BABY_GIFT"
              className="block w-full bg-pink-600 text-white font-semibold py-4 rounded-xl hover:bg-pink-700 transition-colors shadow-sm text-center"
            >
              Geef als kraamcadeau
            </Link>
            <Link
              href="/checkout?package=BABY_GIFT&for_self=true"
              className="block w-full mt-3 border border-pink-200 text-pink-700 font-semibold py-3 rounded-xl hover:bg-pink-50 transition-colors text-center text-sm"
            >
              Koop voor jezelf
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof / quote */}
      <section className="py-16 px-4 bg-pink-600">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl text-white/90 italic font-medium leading-relaxed">
            &ldquo;Ik wou dat ik dit had toen mijn dochter geboren werd. Nu elke week
            een vraag krijgen die me dwingt het op te schrijven — dat is het mooiste
            cadeau dat je iemand kunt geven.&rdquo;
          </p>
          <p className="mt-4 text-pink-200 text-sm">— Sara, mama van Noor (8 maanden)</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
