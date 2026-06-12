"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Shield,
  CreditCard,
  User,
  PlayCircle,
  Smartphone,
  Users,
  HelpCircle,
  MessageCircleQuestion,
  X,
  Clock,
} from "lucide-react";
import { createTicket, type TicketCategory } from "@/lib/api/support";
import {
  FAQ_CATEGORIES,
  searchFaq,
  getPopularFaq,
  getFaqByCategory,
  getCategory,
  type FaqItem,
  type FaqCategoryId,
} from "@/lib/faq-data";

/* ── Icoon-mapping voor categorieën ── */
const ICONS: Record<string, React.ElementType> = {
  BookOpen,
  Shield,
  CreditCard,
  User,
  PlayCircle,
  Smartphone,
  Users,
  HelpCircle,
};

const POPULAR_SEARCHES = [
  "Is het gratis?",
  "Wachtwoord vergeten",
  "Hoe veilig is het?",
  "Microfoon werkt niet",
  "Data verwijderen",
];

/* ── Tekst-highlighting van zoektermen ── */
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-warm-amber/40 text-slate-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ── Uitklapbaar antwoord ── */
function AnswerItem({
  item,
  terms = [],
  showCategory = false,
  defaultOpen = false,
}: {
  item: FaqItem;
  terms?: string[];
  showCategory?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cat = showCategory ? getCategory(item.category) : undefined;

  return (
    <div className="bg-white rounded-2xl border border-neutral-sand overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-warm-amber/5 transition-colors"
        aria-expanded={open}
      >
        <span className="min-w-0">
          {cat && (
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-orange/80 mb-1">
              {cat.title}
            </span>
          )}
          <span className="block font-semibold text-slate-900 leading-snug">
            <Highlight text={item.question} terms={terms} />
          </span>
        </span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-orange flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-700 leading-relaxed">
          <Highlight text={item.answer} terms={terms} />
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId | null>(null);
  const [showForm, setShowForm] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Formulier-state
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<TicketCategory>("overig");
  const [bericht, setBericht] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ticketNumber: number } | null>(null);

  // Sneltoets: "/" focust de zoekbalk, Esc maakt leeg
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && el === searchRef.current) {
        setQuery("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const trimmed = query.trim();
  const isSearching = trimmed.length >= 2;
  const isBrowsingCategory = !isSearching && activeCategory !== null;

  const searchResults = useMemo(
    () => (isSearching ? searchFaq(trimmed, 12) : []),
    [trimmed, isSearching]
  );
  const searchTerms = useMemo(
    () => (isSearching ? trimmed.split(/\s+/).filter((w) => w.length > 2) : []),
    [trimmed, isSearching]
  );
  const categoryItems = useMemo(
    () => (activeCategory ? getFaqByCategory(activeCategory) : []),
    [activeCategory]
  );
  const popularItems = useMemo(() => getPopularFaq(6), []);

  function openForm(prefill?: TicketCategory) {
    if (prefill) setCategory(prefill);
    setShowForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  }

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
      setError(
        err instanceof Error ? err.message : "Er ging iets mis. Probeer het opnieuw."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* ── Hero met zoekbalk ── */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-5">
            Waarmee kunnen we
            <br className="hidden sm:block" /> je helpen?
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
            Typ je vraag hieronder — grote kans dat je het antwoord meteen vindt.
          </p>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveCategory(null);
              }}
              placeholder="Bijv. 'wachtwoord vergeten' of 'is het veilig?'"
              className="w-full rounded-full border border-neutral-sand bg-white pl-14 pr-12 py-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
              aria-label="Zoek in veelgestelde vragen"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  searchRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Zoekopdracht wissen"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Populaire zoekopdrachten */}
          {!isSearching && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className="text-sm text-slate-400">Populair:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    setActiveCategory(null);
                  }}
                  className="text-sm bg-white border border-neutral-sand text-slate-600 hover:text-orange hover:border-orange/40 px-3 py-1.5 rounded-full transition-colors shadow-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* ── Zoekresultaten ── */}
          {isSearching && (
            <div>
              <p className="text-sm text-slate-500 mb-5" aria-live="polite">
                {searchResults.length > 0
                  ? `${searchResults.length} ${
                      searchResults.length === 1 ? "antwoord" : "antwoorden"
                    } gevonden voor "${trimmed}"`
                  : `Geen antwoord gevonden voor "${trimmed}"`}
              </p>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((item, i) => (
                    <AnswerItem
                      key={item.id}
                      item={item}
                      terms={searchTerms}
                      showCategory
                      defaultOpen={i === 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-sand p-8 text-center shadow-sm">
                  <MessageCircleQuestion className="w-10 h-10 text-orange mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                    Niet gevonden wat je zocht?
                  </h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Geen probleem. Stel je vraag rechtstreeks aan ons team — we
                    helpen je persoonlijk verder.
                  </p>
                  <button
                    onClick={() => openForm()}
                    className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md hover:shadow-lg"
                  >
                    Stel je vraag aan ons
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Categorie-overzicht ── */}
          {isBrowsingCategory && activeCategory && (
            <div>
              <button
                onClick={() => setActiveCategory(null)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Alle onderwerpen
              </button>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">
                {getCategory(activeCategory)?.title}
              </h2>
              <div className="space-y-3">
                {categoryItems.map((item) => (
                  <AnswerItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ── Bladeren: tegels + populaire vragen ── */}
          {!isSearching && !isBrowsingCategory && (
            <div className="space-y-14">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">
                  Blader door onderwerpen
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {FAQ_CATEGORIES.map((cat) => {
                    const Icon = ICONS[cat.icon] ?? HelpCircle;
                    const count = getFaqByCategory(cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group bg-white rounded-2xl border border-neutral-sand p-5 text-left shadow-sm hover:shadow-md hover:border-orange/30 transition-all"
                      >
                        <div className="w-11 h-11 bg-orange/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange/15 transition-colors">
                          <Icon className="w-5 h-5 text-orange" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                          {cat.title}
                          <ArrowRight className="w-4 h-4 text-orange opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-sm text-slate-500">{cat.blurb}</p>
                        <p className="text-xs text-slate-400 mt-2">{count} vragen</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 mb-6">
                  Veelgestelde vragen
                </h2>
                <div className="space-y-3">
                  {popularItems.map((item) => (
                    <AnswerItem key={item.id} item={item} />
                  ))}
                </div>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-orange hover:text-orange/80 transition-colors"
                >
                  Bekijk alle veelgestelde vragen
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* ── Laatste redmiddel: contact ── */}
          <div ref={formRef} className="mt-16 scroll-mt-8">
            {success ? (
              <div className="bg-white rounded-3xl border border-neutral-sand p-8 md:p-10 shadow-sm text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                  We hebben je vraag ontvangen!
                </h2>
                <p className="text-slate-600 mb-4">
                  Je vraag is geregistreerd onder nummer{" "}
                  <strong className="text-orange">
                    BVJ-{String(success.ticketNumber).padStart(4, "0")}
                  </strong>
                  .
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Je ontvangt een bevestiging per e-mail. We reageren binnen 1–2
                  werkdagen.
                </p>
                <button
                  onClick={() => {
                    setSuccess(null);
                    setShowForm(false);
                    setNaam("");
                    setEmail("");
                    setBericht("");
                    setCategory("overig");
                  }}
                  className="text-sm text-orange hover:underline"
                >
                  Terug naar het helpcentrum
                </button>
              </div>
            ) : !showForm ? (
              /* Uitnodiging — formulier nog verborgen */
              <div className="bg-gradient-to-br from-warm-amber/10 to-orange/5 rounded-3xl border border-orange/15 p-8 md:p-10 text-center max-w-2xl mx-auto">
                <MessageCircleQuestion className="w-10 h-10 text-orange mx-auto mb-4" />
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                  Kom je er niet uit?
                </h2>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Vind je het antwoord niet hierboven? Stel je vraag dan
                  rechtstreeks aan ons team. We reageren persoonlijk.
                </p>
                <button
                  onClick={() => openForm()}
                  className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md hover:shadow-lg"
                >
                  Stel je vraag aan ons
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="inline-flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                  <Clock className="w-3.5 h-3.5" />
                  Gemiddelde reactietijd: 1–2 werkdagen
                </p>
              </div>
            ) : (
              /* Formulier */
              <div className="bg-white rounded-3xl border border-neutral-sand p-8 md:p-10 shadow-sm max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">
                  Stel je vraag aan ons
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  We reageren persoonlijk binnen 1–2 werkdagen.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="naam"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
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
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
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
                    <label
                      htmlFor="onderwerp"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Waar gaat je vraag over? <span className="text-orange">*</span>
                    </label>
                    <select
                      id="onderwerp"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TicketCategory)}
                      className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
                    >
                      <option value="overig">Algemene vraag</option>
                      <option value="account">Vraag over mijn account</option>
                      <option value="technisch">Technisch probleem</option>
                      <option value="privacy">Privacy of gegevensvraag</option>
                      <option value="abonnement">Abonnement of betaling</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="bericht"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      Jouw vraag of bericht <span className="text-orange">*</span>
                    </label>
                    <textarea
                      id="bericht"
                      required
                      rows={5}
                      value={bericht}
                      onChange={(e) => setBericht(e.target.value)}
                      placeholder="Vertel ons hoe we je kunnen helpen..."
                      className="w-full rounded-xl border border-neutral-sand bg-cream px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row-reverse gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-orange hover:bg-orange/90 disabled:opacity-60 text-white font-semibold py-3 rounded-full transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors px-4 py-3"
                    >
                      Terug
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    Door te versturen ga je akkoord met ons{" "}
                    <Link href="/privacy" className="underline hover:text-slate-600">
                      privacybeleid
                    </Link>
                    .
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
