"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  X,
  MessageCircleQuestion,
  BookOpen,
  Shield,
  CreditCard,
  User,
  PlayCircle,
  Smartphone,
  Users,
  HelpCircle,
} from "lucide-react";
import {
  FAQ_CATEGORIES,
  getFaqByCategory,
  searchFaq,
  getCategory,
  type FaqItem,
} from "@/lib/faq-data";

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

function AccordionItem({
  item,
  isOpen,
  onToggle,
  showCategory = false,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  showCategory?: boolean;
}) {
  const cat = showCategory ? getCategory(item.category) : undefined;
  return (
    <div className="bg-white rounded-2xl border border-neutral-sand overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-warm-amber/5 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="min-w-0">
          {cat && (
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-orange/80 mb-1">
              {cat.title}
            </span>
          )}
          <span className="text-lg font-semibold text-slate-900 leading-snug">
            {item.question}
          </span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-orange flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 text-slate-700 leading-relaxed">{item.answer}</div>
      )}
    </div>
  );
}

export default function FAQContent() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const toggle = (id: string) =>
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const trimmed = query.trim();
  const isSearching = trimmed.length >= 2;
  const results = useMemo(
    () => (isSearching ? searchFaq(trimmed, 20) : []),
    [trimmed, isSearching]
  );

  return (
    <>
      {/* Hero met zoekbalk */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6">
            Veelgestelde vragen
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
            Alles over BewaardVoorJou.nl — van privacy en techniek tot delen en
            nalatenschap.
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek een vraag..."
              className="w-full rounded-full border border-neutral-sand bg-white pl-14 pr-12 py-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
              aria-label="Zoek in veelgestelde vragen"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Zoekopdracht wissen"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {isSearching ? (
            /* Zoekresultaten */
            <div>
              <p className="text-sm text-slate-500 mb-6" aria-live="polite">
                {results.length > 0
                  ? `${results.length} ${
                      results.length === 1 ? "antwoord" : "antwoorden"
                    } gevonden voor "${trimmed}"`
                  : `Geen antwoord gevonden voor "${trimmed}"`}
              </p>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((item) => (
                    <AccordionItem
                      key={item.id}
                      item={item}
                      isOpen={openItems.includes(item.id)}
                      onToggle={() => toggle(item.id)}
                      showCategory
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-neutral-sand p-8 text-center shadow-sm max-w-xl mx-auto">
                  <MessageCircleQuestion className="w-10 h-10 text-orange mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                    Niet gevonden wat je zocht?
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Stel je vraag via ons helpcentrum — we helpen je persoonlijk
                    verder.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md hover:shadow-lg"
                  >
                    Naar het helpcentrum
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Per categorie */
            FAQ_CATEGORIES.map((category) => {
              const Icon = ICONS[category.icon] ?? HelpCircle;
              const items = getFaqByCategory(category.id);
              if (items.length === 0) return null;
              return (
                <div key={category.id} className="mb-16 last:mb-0">
                  <div className="flex items-center gap-3 mb-8">
                    <Icon className="w-6 h-6 text-orange" />
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                      {category.title}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openItems.includes(item.id)}
                        onToggle={() => toggle(item.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-orange via-warm-amber to-orange/90">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
            Veelgestelde vragen? Klaar om je verhaal vast te leggen
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Je eerste hoofdstuk duurt maar 10 minuten. Begin vandaag en maak iets
            onvervangbaars voor toekomstige generaties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white hover:bg-cream text-orange px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start gratis — Geen creditcard nodig
            </Link>
            <Link
              href="/contact"
              className="bg-orange/20 hover:bg-orange/30 text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg transition-colors"
            >
              Naar het helpcentrum
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
