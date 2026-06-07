"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Mail, MessageCircle, Clock, HelpCircle, CheckCircle, Loader2 } from "lucide-react";
import { createTicket, type TicketCategory } from "@/lib/api/support";
import { FaqPrescreen } from "@/components/support/FaqPrescreen";

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

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "overig", label: "Kies een onderwerp..." },
  { value: "overig", label: "Algemene vraag" },
  { value: "account", label: "Vraag over mijn account" },
  { value: "technisch", label: "Technisch probleem" },
  { value: "privacy", label: "Privacy of gegevensvraag" },
  { value: "abonnement", label: "Abonnement of betaling" },
];

export default function ContactPage() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<TicketCategory>("overig");
  const [bericht, setBericht] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ticketNumber: number } | null>(null);
  const [prescreenDismissed, setPrescreenDismissed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const ticket = await createTicket({
        guest_name: naam,
        guest_email: email,
        category,
        subject: `Vraag van ${naam}`,
        message: bericht,
      });
      setSuccess({ ticketNumber: ticket.ticket_number });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6">
            Hoe kunnen we<br className="hidden sm:block" /> je helpen?
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto mb-8">
            We helpen je graag verder — of je nu een vraag hebt over het platform,
            je account, of gewoon wil weten hoe het werkt.
          </p>
          {/* Widget call-to-action */}
          <div className="inline-flex items-center gap-3 bg-white border-2 border-orange/30 rounded-2xl px-6 py-4 shadow-md">
            <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900 text-sm">Probeer onze slimme helpdesk</p>
              <p className="text-xs text-slate-500">Klik op de oranje knop rechts onderaan — direct antwoord via AI</p>
            </div>
          </div>
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

          {/* Formulier + FAQ */}
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
              {success ? (
                /* Bevestiging */
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">
                    We hebben je vraag ontvangen!
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Je vraag is geregistreerd onder nummer{" "}
                    <strong className="text-orange">BVJ-{String(success.ticketNumber).padStart(4, "0")}</strong>.
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    Je ontvangt een bevestiging per e-mail. We reageren binnen 1–2 werkdagen.
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(null);
                      setNaam("");
                      setEmail("");
                      setBericht("");
                      setCategory("overig");
                    }}
                    className="text-sm text-orange hover:underline"
                  >
                    Nog een vraag stellen
                  </button>
                </div>
              ) : (
                /* Formulier */
                <>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">
                    Stel een vraag
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    We reageren doorgaans binnen 1–2 werkdagen.
                  </p>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="naam" className="block text-sm font-medium text-slate-700 mb-1.5">
                          Naam <span className="text-orange">*</span>
                        </label>
                        <input
                          id="naam"
                          required
                          value={naam}
                          onChange={(e) => setNaam(e.target.value)}
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
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jouw@email.nl"
                          className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="onderwerp" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Waar gaat je vraag over? <span className="text-orange">*</span>
                      </label>
                      <select
                        id="onderwerp"
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                        className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
                      >
                        <option value="overig">Kies een onderwerp...</option>
                        <option value="overig">Algemene vraag</option>
                        <option value="account">Vraag over mijn account</option>
                        <option value="technisch">Technisch probleem</option>
                        <option value="privacy">Privacy of gegevensvraag</option>
                        <option value="abonnement">Abonnement of betaling</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="bericht" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Jouw vraag of bericht <span className="text-orange">*</span>
                      </label>
                      <textarea
                        id="bericht"
                        required
                        rows={5}
                        value={bericht}
                        onChange={(e) => { setBericht(e.target.value); setPrescreenDismissed(false); }}
                        placeholder="Vertel ons hoe we je kunnen helpen..."
                        className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition resize-none"
                      />
                    </div>

                    {!prescreenDismissed && (
                      <FaqPrescreen
                        query={bericht}
                        onDismiss={() => setPrescreenDismissed(true)}
                      />
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange hover:bg-orange/90 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Versturen...
                        </>
                      ) : (
                        "Verstuur mijn vraag"
                      )}
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                      Door te versturen ga je akkoord met ons{" "}
                      <Link href="/privacy" className="underline hover:text-slate-600">
                        privacybeleid
                      </Link>
                      .
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
