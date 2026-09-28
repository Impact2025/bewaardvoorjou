import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

export interface Faq {
  question: string;
  answer: string;
}

/**
 * FAQPage-node uit dezelfde array die de pagina toont. Zo kan de structured
 * data nooit afwijken van de zichtbare tekst (Google's spambeleid).
 */
export function faqJsonLd(faqs: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(name: string, url: string) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  };
}

export function FaqSection({ faqs, intro }: { faqs: Faq[]; intro?: string }) {
  return (
    <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
            Veelgestelde vragen
          </h2>
          {intro && <p className="text-slate-700">{intro}</p>}
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-white rounded-2xl border border-neutral-sand shadow-sm overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-6 font-serif text-lg font-semibold text-slate-900">
                {faq.question}
                <ChevronDown className="h-5 w-5 text-orange flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="px-6 pb-6 -mt-1 text-slate-700 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface RelatedLink {
  href: string;
  label: string;
}

/** Contextuele interne links: voorkomt dat een nieuwe pagina een weespagina is. */
export function RelatedLinks({ title = "Lees ook", links }: { title?: string; links: RelatedLink[] }) {
  return (
    <section className="py-16 px-4 sm:px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-6">{title}</h2>
        <ul className="space-y-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="inline-flex items-center gap-2 text-slate-800 hover:text-orange transition-colors font-medium"
              >
                <ArrowRight className="h-4 w-4 text-orange flex-shrink-0" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** "In het kort"-blok: het directe antwoord dat AI Overviews en snippets oppikken. */
export function InShort({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border-l-4 border-orange bg-white shadow-sm p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-orange mb-2">In het kort</p>
      <div className="text-lg text-slate-800 leading-relaxed">{children}</div>
    </div>
  );
}
