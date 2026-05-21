import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Mail, MessageCircle, Clock, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Neem contact op met BewaardVoorJou.nl. We helpen je graag verder met vragen over het platform, je account of het bewaren van je levensverhaal.",
  openGraph: {
    title: "Contact | BewaardVoorJou.nl",
    description:
      "Neem contact op met BewaardVoorJou.nl. We helpen je graag verder met vragen over het platform, je account of het bewaren van je levensverhaal.",
    url: "https://bewaardvoorjou.nl/contact",
  },
  alternates: { canonical: "https://bewaardvoorjou.nl/contact" },
};

const contactOptions = [
  {
    icon: Mail,
    title: "E-mail",
    description: "Voor algemene vragen en ondersteuning",
    value: "info@bewaardvoorjou.nl",
    href: "mailto:info@bewaardvoorjou.nl",
    cta: "Stuur een e-mail",
  },
  {
    icon: MessageCircle,
    title: "Privacy & gegevensvragen",
    description: "Specifiek voor AVG / GDPR vragen",
    value: "privacy@bewaardvoorjou.nl",
    href: "mailto:privacy@bewaardvoorjou.nl",
    cta: "Stuur een privacy-e-mail",
  },
  {
    icon: Clock,
    title: "Reactietijd",
    description: "We streven naar een reactie binnen",
    value: "1–2 werkdagen",
    href: null,
    cta: null,
  },
];

const faqSnippets = [
  {
    q: "Is BewaardVoorJou.nl gratis?",
    a: "Ja, je kunt gratis starten en alle basisfuncties gebruiken. Premium pakketten zijn beschikbaar voor uitgebreide opslag en functies.",
    href: "/pricing",
  },
  {
    q: "Hoe veilig zijn mijn verhalen?",
    a: "Alle data is versleuteld met AES-256 en opgeslagen in EU-datacenters. Wij voldoen volledig aan de GDPR.",
    href: "/security",
  },
  {
    q: "Kan ik mijn data verwijderen?",
    a: "Ja, je kunt op elk moment alle opnames en je account permanent verwijderen vanuit de instellingen.",
    href: "/privacy",
  },
  {
    q: "Werkt het op mijn tablet of telefoon?",
    a: "BewaardVoorJou.nl werkt op elke moderne browser — Chrome, Safari, Firefox, Edge. Geen app-installatie nodig.",
    href: "/faq",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6">
            Hoe kunnen we<br className="hidden sm:block" /> je helpen?
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto">
            We helpen je graag verder — of je nu een vraag hebt over het platform,
            je account, of gewoon wil weten hoe het werkt.
          </p>
        </div>
      </section>

      {/* Contact opties */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.title}
                  className="bg-white rounded-2xl border border-neutral-sand p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="w-11 h-11 bg-orange/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-orange" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{opt.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{opt.description}</p>
                  <p className="text-sm font-medium text-slate-800 mb-4 flex-1">{opt.value}</p>
                  {opt.href && opt.cta && (
                    <a
                      href={opt.href}
                      className="inline-flex items-center justify-center gap-2 bg-orange/10 hover:bg-orange/20 text-orange text-sm font-medium px-4 py-2 rounded-full transition-colors"
                    >
                      {opt.cta}
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contactformulier */}
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">
            {/* FAQ snippets */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-orange" />
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Veelgestelde vragen
                </h2>
              </div>
              <div className="space-y-4">
                {faqSnippets.map((item) => (
                  <div
                    key={item.q}
                    className="bg-white rounded-xl border border-neutral-sand p-5 shadow-sm"
                  >
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{item.q}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.a}</p>
                    <Link
                      href={item.href}
                      className="text-xs font-medium text-orange hover:text-orange/80 transition-colors"
                    >
                      Lees meer →
                    </Link>
                  </div>
                ))}
              </div>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Bekijk alle veelgestelde vragen →
              </Link>
            </div>

            {/* Formulier */}
            <div className="bg-white rounded-2xl border border-neutral-sand p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">
                Stuur ons een bericht
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                We reageren doorgaans binnen 1–2 werkdagen.
              </p>
              <form className="space-y-5" action="mailto:info@bewaardvoorjou.nl" method="GET">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="naam" className="block text-sm font-medium text-slate-700 mb-1.5">
                      Naam <span className="text-orange">*</span>
                    </label>
                    <input
                      id="naam"
                      name="naam"
                      required
                      placeholder="Je naam"
                      className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                      E-mailadres <span className="text-orange">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="jouw@email.nl"
                      className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="onderwerp" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Onderwerp <span className="text-orange">*</span>
                  </label>
                  <select
                    id="onderwerp"
                    name="onderwerp"
                    required
                    className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
                  >
                    <option value="">Kies een onderwerp...</option>
                    <option value="algemeen">Algemene vraag</option>
                    <option value="account">Vraag over mijn account</option>
                    <option value="technisch">Technisch probleem</option>
                    <option value="privacy">Privacy of gegevensvraag</option>
                    <option value="abonnement">Abonnement of betaling</option>
                    <option value="anders">Anders</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bericht" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Bericht <span className="text-orange">*</span>
                  </label>
                  <textarea
                    id="bericht"
                    name="bericht"
                    required
                    rows={5}
                    placeholder="Vertel ons hoe we je kunnen helpen..."
                    className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-full transition-colors shadow-md hover:shadow-lg"
                >
                  Verstuur bericht
                </button>

                <p className="text-xs text-slate-400 text-center">
                  Door te versturen ga je akkoord met ons{" "}
                  <Link href="/privacy" className="underline hover:text-slate-600">
                    privacybeleid
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
