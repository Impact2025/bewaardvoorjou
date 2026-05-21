import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Beveiliging",
  description:
    "Hoe BewaardVoorJou.nl je verhalen beschermt: TLS 1.3, AES-256 encryptie, role-based toegangscontrole, WebAuthn en GDPR-conforme opslag in EU-datacenters.",
  openGraph: {
    title: "Beveiliging | BewaardVoorJou.nl",
    description:
      "Hoe BewaardVoorJou.nl je verhalen beschermt: TLS 1.3, AES-256 encryptie, role-based toegangscontrole, WebAuthn en GDPR-conforme opslag in EU-datacenters.",
    url: "https://bewaardvoorjou.nl/security",
  },
  alternates: { canonical: "https://bewaardvoorjou.nl/security" },
  robots: { index: true, follow: true },
};

const safeguards = [
  {
    icon: "🔐",
    title: "Encryptie & sleutelbeheer",
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-100",
    items: [
      { label: "TLS 1.3", detail: "Alle verbindingen zijn versleuteld in transit" },
      { label: "AES-256", detail: "Per-gebruiker sleutel voor opslag at rest" },
      { label: "KMS + HSM", detail: "Hardware-beveiligde sleutelrotatie" },
      { label: "Optionele E2EE", detail: "Client-side versleuteling voor gevoelige hoofdstukken" },
    ],
  },
  {
    icon: "🎭",
    title: "Toegangscontrole",
    color: "from-emerald-50 to-teal-50",
    border: "border-emerald-100",
    items: [
      { label: "RBAC", detail: "Rollen: eigenaar, vertrouwde persoon, lezer" },
      { label: "Passkey / WebAuthn", detail: "Wachtwoordloos inloggen via vingerafdruk of gezicht" },
      { label: "Device binding", detail: "Kortlopende tokens gekoppeld aan vertrouwde apparaten" },
      { label: "Audit-log", detail: "Elke login, export en deelactie wordt geregistreerd" },
    ],
  },
  {
    icon: "🔍",
    title: "Beveiligingsprocessen",
    color: "from-purple-50 to-violet-50",
    border: "border-purple-100",
    items: [
      { label: "Threat modelling", detail: "Verplicht bij elke release" },
      { label: "Pen-tests", detail: "Jaarlijkse onafhankelijke penetratietests" },
      { label: "Rate limiting", detail: "Bescherming tegen brute-force en misbruik" },
      { label: "Incident response", detail: "24u meldplicht bij datalekken conform GDPR" },
    ],
  },
];

const certifications = [
  { label: "GDPR-conform", detail: "Volledig compliant met AVG / GDPR" },
  { label: "EU-datacenters", detail: "Geen doorgifte buiten de EER" },
  { label: "Verwerkersovereenkomsten", detail: "Getekend met alle sub-verwerkers" },
  { label: "Privacy by design", detail: "Ingebakken in architectuur en processen" },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-28 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
            Bank-level beveiliging · GDPR-conform · EU-opslag
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Jouw verhaal verdient<br className="hidden sm:block" /> de beste beveiliging
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Wij behandelen je levensverhaal met dezelfde zorg als een bank je spaargeld.
            Hier is precies hoe we dat doen.
          </p>
        </div>
      </section>

      {/* Certificeringen balk */}
      <section className="bg-white border-b border-neutral-sand py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certifications.map((c) => (
              <div key={c.label} className="text-center">
                <div className="text-sm font-semibold text-slate-900">{c.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{c.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beveiligingslagen */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-3 text-center">
            Drie lagen van bescherming
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">
            Van datacenters tot je apparaat — elke laag is onafhankelijk beveiligd.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {safeguards.map((section) => (
              <div
                key={section.title}
                className={`bg-gradient-to-br ${section.color} rounded-2xl border ${section.border} p-6 shadow-sm`}
              >
                <div className="text-3xl mb-3">{section.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.label} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                      <div>
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{item.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible disclosure */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">
            Responsible Disclosure
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Heb je een beveiligingsprobleem gevonden? We waarderen dat enorm.
            Meld het verantwoord via onze beveiligde melding — wij reageren binnen 48 uur
            en lossen het op in overleg met jou.
          </p>
          <a
            href="mailto:security@bewaardvoorjou.nl"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            security@bewaardvoorjou.nl
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange via-warm-amber to-orange/90">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Vragen over onze beveiliging?
          </h2>
          <p className="text-white/90 mb-8">
            Geen technische kennis nodig — ons team legt het graag uit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white hover:bg-cream text-orange px-8 py-3.5 rounded-full font-semibold transition-colors shadow-md"
            >
              Stel een vraag
            </Link>
            <Link
              href="/privacy"
              className="bg-orange/20 hover:bg-orange/30 text-white border-2 border-white px-8 py-3.5 rounded-full font-semibold transition-colors"
            >
              Bekijk privacybeleid
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
