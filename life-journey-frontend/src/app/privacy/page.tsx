import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description:
    "Hoe BewaardVoorJou.nl omgaat met jouw persoonlijke gegevens. Dataminimalisatie, EU-opslag, encryptie by design en volledige eigen regie over je verhalen.",
  openGraph: {
    title: "Privacybeleid | BewaardVoorJou.nl",
    description:
      "Hoe BewaardVoorJou.nl omgaat met jouw persoonlijke gegevens. Dataminimalisatie, EU-opslag, encryptie by design en volledige eigen regie over je verhalen.",
    url: "https://bewaardvoorjou.nl/privacy",
  },
  alternates: { canonical: "https://bewaardvoorjou.nl/privacy" },
  robots: { index: true, follow: true },
};

const principles = [
  {
    icon: "🔒",
    title: "Dataminimalisatie",
    description:
      "We vragen enkel voornaam of alias, e-mailadres, land en geboortejaar. Verdere gegevens zijn optioneel en staan standaard uit.",
  },
  {
    icon: "🇪🇺",
    title: "Opslag binnen de EU",
    description:
      "Alle media, transcripties en metadata blijven in EU-datacenters. Elke verwerker heeft een getekend verwerkersovereenkomst (DPA).",
  },
  {
    icon: "🛡️",
    title: "Encryptie by design",
    description:
      "TLS 1.3 onderweg en AES-256 in rust. Per gebruiker een eigen encryptiesleutel via KMS — jouw verhaal is van jou.",
  },
  {
    icon: "⚙️",
    title: "Volledige eigen regie",
    description:
      "Download, corrigeer of verwijder al je gegevens inclusief key-shred. Jij bepaalt wie toegang krijgt en wanneer.",
  },
];

const rights = [
  { right: "Inzage & export", detail: "Download alles als JSON, MP4 of PDF" },
  { right: "Correctie", detail: "Pas metadata en samenvattingen aan" },
  { right: "Verwijdering", detail: "Sleutelvernietiging binnen 30 dagen" },
  { right: "Dataportabiliteit", detail: "Overstappen naar een andere dienst" },
  { right: "Bezwaar", detail: "Stop verwerking voor specifieke doeleinden" },
  { right: "Klacht", detail: "Dien een klacht in bij de Autoriteit Persoonsgegevens" },
];

const scopes = [
  { scope: "Opname & opslag van audio/video", basis: "Toestemming" },
  { scope: "AI-transcriptie en highlight-analyse", basis: "Toestemming" },
  { scope: "Delen met vertrouwde personen", basis: "Toestemming" },
  { scope: "Legacy-vrijgave bij overlijden", basis: "Toestemming (optioneel)" },
  { scope: "Anonieme gebruiksstatistieken", basis: "Gerechtvaardigd belang" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange/10 text-orange rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            GDPR-conform · EU-opslag · Encryptie by design
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6">
            Privacy & jouw rechten
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
            Je levensverhaal is intiem. Wij behandelen het als zodanig. Hier lees je
            precies hoe wij met jouw gegevens omgaan — transparant en volledig.
          </p>
        </div>
      </section>

      {/* Principes */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-3 text-center">
            Onze vier kernprincipes
          </h2>
          <p className="text-slate-600 text-center mb-10 max-w-xl mx-auto">
            Elke beslissing rondom data en AI volgt deze kaders.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {principles.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl border border-neutral-sand p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gegevensverwerkingen & rechten */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10">
          {/* Wat we verwerken */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
              Wat wij verwerken
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Elke verwerking is gebaseerd op een rechtsgeldige grondslag en per
              doel afzonderlijk toestembaar.
            </p>
            <div className="space-y-3">
              {scopes.map((s) => (
                <div
                  key={s.scope}
                  className="flex items-center justify-between rounded-xl border border-neutral-sand bg-cream px-4 py-3"
                >
                  <span className="text-sm text-slate-700">{s.scope}</span>
                  <span className="text-xs font-medium text-orange whitespace-nowrap ml-3">
                    {s.basis}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Jouw rechten */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
              Jouw rechten
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Je kunt al deze rechten uitoefenen vanuit jouw account of via{" "}
              <a
                href="mailto:privacy@bewaardvoorjou.nl"
                className="text-orange underline hover:text-orange/80"
              >
                privacy@bewaardvoorjou.nl
              </a>
              .
            </p>
            <div className="space-y-3">
              {rights.map((r) => (
                <div
                  key={r.right}
                  className="flex items-start gap-3 rounded-xl border border-neutral-sand bg-cream px-4 py-3"
                >
                  <span className="text-orange mt-0.5">✓</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-800">{r.right}</span>
                    <span className="text-sm text-slate-500 ml-2">— {r.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cookies & Contactgegevens */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-neutral-sand p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Cookies</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We gebruiken alleen functionele cookies die nodig zijn voor de werking
              van het platform (sessie, taalvoorkeur). Er zijn geen tracking- of
              advertentiecookies. Analytics gebeurt anoniem en aggregaat.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-sand p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Vragen of klachten
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Voor privacyvragen kun je terecht bij onze Functionaris Gegevensbescherming:
            </p>
            <a
              href="mailto:privacy@bewaardvoorjou.nl"
              className="text-sm font-medium text-orange hover:text-orange/80 underline"
            >
              privacy@bewaardvoorjou.nl
            </a>
            <p className="text-sm text-slate-500 mt-3">
              Je kunt ook een klacht indienen bij de{" "}
              <a
                href="https://autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-700"
              >
                Autoriteit Persoonsgegevens
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-orange via-warm-amber to-orange/90">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Vragen over jouw privacy?
          </h2>
          <p className="text-white/90 mb-8">
            Ons team staat klaar om je te helpen. Geen vraag is te klein.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white hover:bg-cream text-orange px-8 py-3.5 rounded-full font-semibold transition-colors shadow-md"
            >
              Neem contact op
            </Link>
            <Link
              href="/security"
              className="bg-orange/20 hover:bg-orange/30 text-white border-2 border-white px-8 py-3.5 rounded-full font-semibold transition-colors"
            >
              Bekijk beveiliging
            </Link>
          </div>
          <p className="text-white/70 text-sm mt-6">
            Laatste update: mei 2025 · Versie 2.0
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
