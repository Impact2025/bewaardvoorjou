"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Target, Mail, Users, Camera, UserPlus, Check, type LucideIcon } from "lucide-react";
import { BabyHeader } from "@/components/baby/BabyHeader";
import { BabyFooter } from "@/components/baby/BabyFooter";
import { useBabyTheme, THEME_CONFIG, type BabyTheme } from "@/components/baby/BabyThemeContext";

const THEME_LOGOS: Record<BabyTheme, string> = {
  meisje:   "/images/logo-baby-meisje.png",
  jongen:   "/images/logo-baby-jongen.png",
  neutraal: "/images/logo-baby-neutraal.png",
};

const FEATURES: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: BookOpen,
    title: "14 diepgaande hoofdstukken",
    body: "Van de geboortedag tot de eerste verjaardag — met AI-begeleide vragen die jou helpen elk moment in woorden te vangen.",
  },
  {
    Icon: Target,
    title: "28 mijlpalen bijhouden",
    body: "Eerste glimlach, eerste stapje, eerste woordje — markeer ze met datum, foto en jouw verhaal erbij.",
  },
  {
    Icon: Mail,
    title: "Wekelijkse herinneringsvragen",
    body: "Elke week een warme, gerichte vraag in je inbox. Nooit meer 'ik wou dat ik dat had opgeschreven'.",
  },
  {
    Icon: Users,
    title: "Maandelijkse updates voor opa en oma",
    body: "Grootouders ontvangen automatisch een digest van de nieuwe mijlpalen — zonder app, zonder account.",
  },
  {
    Icon: Camera,
    title: "Fotoboek-voucher",
    body: "Rond alle 12 maand-hoofdstukken af en claim je voucher voor een gedrukt fotoboek. De belofte die het boek voltooit.",
  },
  {
    Icon: UserPlus,
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

const THEMES: BabyTheme[] = ["meisje", "jongen", "neutraal"];

export function VoorBabyContent() {
  const { theme, setTheme, t } = useBabyTheme();

  return (
    <div className="min-h-screen bg-white">
      <BabyHeader />

      {/* Hero */}
      <section className={`bg-gradient-to-b ${t.gradientHero} pt-16 pb-0 overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* Tekst */}
          <div className="flex-1 text-center md:text-left py-8 md:py-20">
            <div className={`inline-flex items-center gap-2 ${t.badge} text-sm font-medium px-4 py-1.5 rounded-full mb-6`}>
              Kraamcadeau van het jaar
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Het eerste jaar van{" "}
              <span className={t.heroAccent}>jullie kindje</span>{" "}
              verdient een plek.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
              Bewaard voor Baby begeleidt ouders met wekelijkse vragen, mijlpalen bijhouden
              en een digitaal babyboek dat generaties meegaat. Het mooiste kraamcadeau — voor €59.
            </p>

            {/* Thema-kiezer */}
            <div className="mb-8">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
                Kies jullie thema
              </p>
              <div className="inline-flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
                {THEMES.map((th) => {
                  const cfg = THEME_CONFIG[th];
                  const isActive = theme === th;
                  return (
                    <button
                      key={th}
                      onClick={() => setTheme(th)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? `${cfg.switcherBg} shadow-sm`
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Image
                        src={THEME_LOGOS[th]}
                        alt={cfg.label}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/checkout?package=BABY_GIFT"
                className={`inline-block ${t.primary} ${t.primaryHover} text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-sm`}
              >
                Geef als kraamcadeau — €59
              </Link>
              <Link
                href="/checkout?package=BABY_GIFT&for_self=true"
                className={`inline-block border ${t.outlineBtn} font-semibold px-8 py-4 rounded-xl text-base transition-colors`}
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
              <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-${theme === 'meisje' ? 'pink' : theme === 'jongen' ? 'blue' : 'teal'}-50/60 to-transparent md:hidden`} />
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-white">
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
                className={`flex gap-4 p-6 rounded-2xl border transition-colors ${t.featureCard}`}
              >
                <div className={`mt-0.5 shrink-0 ${t.primaryText}`}>
                  <f.Icon size={20} strokeWidth={1.75} />
                </div>
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
      <section id="tijdlijn" className={`py-20 px-4 ${t.timelineBg}`}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">
            Een jaar lang bewaren
          </h2>
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={item.week} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${t.timelineDot} text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm`}>
                    {i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className={`w-0.5 h-12 ${t.timelineLine} mt-1`} />
                  )}
                </div>
                <div className="pb-12">
                  <p className={`text-xs ${t.timelineLabel} font-semibold uppercase tracking-wider mb-0.5`}>
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
      <section id="prijs" className="py-20 px-4 bg-white">
        <div className="max-w-xl mx-auto text-center">
          <div className={`bg-gradient-to-b ${t.gradientCard} border ${t.primaryBorder} rounded-3xl p-10 shadow-sm`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bewaard voor Baby</h2>
            <div className={`text-5xl font-bold ${t.primaryText} my-4`}>€59</div>
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
                  <Check size={15} strokeWidth={2.5} className={`${t.checkColor} mt-0.5 shrink-0`} />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/checkout?package=BABY_GIFT"
              className={`block w-full ${t.primary} ${t.primaryHover} text-white font-semibold py-4 rounded-xl transition-colors shadow-sm text-center`}
            >
              Geef als kraamcadeau
            </Link>
            <Link
              href="/checkout?package=BABY_GIFT&for_self=true"
              className={`block w-full mt-3 border ${t.outlineBtn} font-semibold py-3 rounded-xl transition-colors text-center text-sm`}
            >
              Koop voor jezelf
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof / quote */}
      <section className={`py-16 px-4 ${t.quoteSection}`}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl text-white/90 italic font-medium leading-relaxed">
            &ldquo;Ik wou dat ik dit had toen mijn dochter geboren werd. Nu elke week
            een vraag krijgen die me dwingt het op te schrijven — dat is het mooiste
            cadeau dat je iemand kunt geven.&rdquo;
          </p>
          <p className="mt-4 text-white/60 text-sm">— Sara, mama van Noor (8 maanden)</p>
        </div>
      </section>

      <BabyFooter />
    </div>
  );
}
