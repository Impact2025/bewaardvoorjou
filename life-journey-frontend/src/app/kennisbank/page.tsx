import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Kennisbank — Alles over levensverhalen vastleggen | BewaardVoorJou.nl",
  description:
    "Ontdek hoe je jouw levensverhaal vastlegt, herinneringen ophaalt en je verhaal deelt met familie. Praktische gidsen en tips van BewaardVoorJou.nl.",
  alternates: { canonical: "https://bewaardvoorjou.nl/kennisbank" },
  openGraph: {
    title: "Kennisbank | BewaardVoorJou.nl",
    description:
      "Praktische gidsen over levensverhalen vastleggen, herinneringen ophalen en veilig delen met familie.",
    url: "https://bewaardvoorjou.nl/kennisbank",
  },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
}

async function getArticles(): Promise<ArticleListItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/list?section=knowledge&limit=50`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function KennisbankPage() {
  const articles = await getArticles();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kennisbank — Alles over levensverhalen vastleggen",
    description:
      "Praktische gidsen, tips en antwoorden op veelgestelde vragen over het vastleggen van je levensverhaal.",
    url: "https://bewaardvoorjou.nl/kennisbank",
    publisher: {
      "@type": "Organization",
      name: "BewaardVoorJou.nl",
      url: "https://bewaardvoorjou.nl",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <PublicHeader />

      <main className="min-h-screen bg-warm-50">
        {/* Hero */}
        <section className="bg-white border-b border-neutral-sand py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              Kennisbank
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Alles over je levensverhaal vastleggen
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Praktische gidsen, tips en antwoorden op veelgestelde vragen — zodat jij vandaag nog kunt beginnen.
            </p>
          </div>
        </section>

        {/* Artikelen */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {articles.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium">Artikelen worden geladen…</p>
              <p className="text-sm mt-1">Kom binnenkort terug.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/kennisbank/${article.slug}`}
                  className="group block bg-white rounded-2xl border border-neutral-sand p-6 hover:border-orange/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 mb-2">
                        {new Date(
                          article.published_at ?? article.created_at
                        ).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-orange transition-colors mb-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-orange flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-white border-t border-neutral-sand py-12 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-3">
              Klaar om te beginnen?
            </h2>
            <p className="text-slate-600 mb-6">
              Maak gratis een account aan en leg je eerste herinnering vast.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-medium hover:bg-orange/90 transition-colors"
            >
              Gratis starten
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
