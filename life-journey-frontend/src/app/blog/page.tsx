import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ArrowRight, BookOpen, TrendingUp, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Verhalen, tips & inspiratie | BewaardVoorJou.nl",
  description:
    "Lees onze blog over het vastleggen van levensverhalen, cadeautips voor bijzondere momenten, en inspiratie om herinneringen te bewaren voor toekomstige generaties.",
  alternates: { canonical: "https://bewaardvoorjou.nl/blog" },
  openGraph: {
    title: "Blog | BewaardVoorJou.nl",
    description:
      "Inspiratie, tips en verhalen over het bewaren van herinneringen voor toekomstige generaties.",
    url: "https://bewaardvoorjou.nl/blog",
  },
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string | null;
  header_color: string | null;
  header_text_color: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

async function getBlogArticles(): Promise<ArticleListItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/list?section=blog&limit=50`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getMostRead(): Promise<ArticleListItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/most-read?section=blog&limit=6`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function parseTags(tagStr: string | null): string[] {
  if (!tagStr) return [];
  return tagStr
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function tagColor(tagStr: string | null): string {
  return tagStr ?? "#E8773C";
}

// ─── Article Card (grid) ────────────────────────────────────────────────────

function ArticleCard({ article }: { article: ArticleListItem }) {
  const tags = parseTags(article.tags);
  const accentColor = article.header_color ?? "#E8773C";

  return (
    <Link href={`/blog/${article.slug}`} className="group block h-full">
      <article className="h-full bg-white rounded-2xl border border-neutral-sand overflow-hidden hover:shadow-md hover:border-orange/30 transition-all duration-200 flex flex-col">
        <div className="h-1.5 shrink-0" style={{ backgroundColor: accentColor }} />
        <div className="p-5 flex flex-col flex-1">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full bg-orange/10 text-orange font-medium capitalize"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <h3 className="font-serif font-semibold text-slate-900 text-base leading-snug mb-2 group-hover:text-orange transition-colors line-clamp-3 flex-1">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-neutral-sand/60">
            <span>{formatDate(article.published_at ?? article.created_at)}</span>
            <ArrowRight className="h-3.5 w-3.5 text-orange opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Featured Article ────────────────────────────────────────────────────────

function FeaturedArticle({ article }: { article: ArticleListItem }) {
  const tags = parseTags(article.tags);
  const bg = article.header_color ?? "#F5E6D3";
  const textColor = article.header_text_color ?? "#5C3D2E";

  return (
    <Link href={`/blog/${article.slug}`} className="group block">
      <article
        className="rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-transparent hover:border-orange/20"
        style={{ backgroundColor: bg }}
      >
        <div className="p-8 sm:p-10" style={{ color: textColor }}>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full font-medium capitalize"
                  style={{ backgroundColor: `${textColor}22`, color: textColor }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <h2
            className="font-serif font-semibold text-2xl sm:text-3xl leading-tight mb-4 group-hover:opacity-80 transition-opacity"
            style={{ color: textColor }}
          >
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-base leading-relaxed mb-6 opacity-80 max-w-2xl line-clamp-3">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-60">
              {formatDate(article.published_at ?? article.created_at)}
            </span>
            <span
              className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
              style={{ color: textColor }}
            >
              Lees artikel
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Most Read Sidebar ───────────────────────────────────────────────────────

function MostReadSidebar({ articles }: { articles: ArticleListItem[] }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-sand p-6">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4 text-orange" />
        <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
          Meest gelezen
        </h2>
      </div>
      {articles.length === 0 ? (
        <p className="text-sm text-slate-400">Binnenkort beschikbaar</p>
      ) : (
        <ol className="space-y-4">
          {articles.map((article, i) => (
            <li key={article.id}>
              <Link
                href={`/blog/${article.slug}`}
                className="group flex items-start gap-3"
              >
                <span className="text-2xl font-serif font-bold text-slate-100 leading-none shrink-0 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800 group-hover:text-orange transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(article.published_at ?? article.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Tag Filter Bar ──────────────────────────────────────────────────────────

function TagFilterBar({
  tags,
  selectedTag,
}: {
  tags: [string, number][];
  selectedTag: string | null;
}) {
  return (
    <section className="bg-white border-b border-neutral-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3 overflow-x-auto">
          <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <Link
            href="/blog"
            className={[
              "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0",
              !selectedTag
                ? "bg-orange text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-orange/10 hover:text-orange",
            ].join(" ")}
          >
            Alle verhalen
          </Link>
          {tags.map(([tagName, count]) => (
            <Link
              key={tagName}
              href={`/blog?tag=${encodeURIComponent(tagName)}`}
              className={[
                "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0 capitalize",
                selectedTag === tagName
                  ? "bg-orange text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-orange/10 hover:text-orange",
              ].join(" ")}
            >
              {tagName}
              <span className="ml-1 opacity-50 text-xs">({count})</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Sidebar Card ────────────────────────────────────────────────────────

function CtaSidebarCard() {
  return (
    <div className="bg-gradient-to-br from-orange/10 to-orange/5 rounded-2xl border border-orange/20 p-6 text-center">
      <div className="text-3xl mb-3">📖</div>
      <h3 className="font-serif font-semibold text-slate-900 mb-2 leading-tight">
        Begin jouw verhaal vandaag
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        Leg jouw herinneringen vast voor toekomstige generaties.
      </p>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange text-white text-sm font-semibold hover:bg-orange/90 transition-colors"
      >
        Gratis starten
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const selectedTag = tag ?? null;

  const [allArticles, mostRead] = await Promise.all([
    getBlogArticles(),
    getMostRead(),
  ]);

  // Collect unique tags with counts
  const tagMap: Record<string, number> = {};
  for (const a of allArticles) {
    parseTags(a.tags).forEach((t) => {
      tagMap[t] = (tagMap[t] ?? 0) + 1;
    });
  }
  const sortedTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);

  // Filter articles
  const displayArticles =
    selectedTag !== null
      ? allArticles.filter((a) => parseTags(a.tags).includes(selectedTag))
      : allArticles;

  const [featured, ...restArticles] = displayArticles;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "BewaardVoorJou Blog",
    description:
      "Verhalen, tips en inspiratie over het vastleggen van levensverhalen.",
    url: "https://bewaardvoorjou.nl/blog",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="min-h-screen bg-warm-50">
        {/* Hero */}
        <section className="bg-white border-b border-neutral-sand py-14 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange/10 text-orange text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              Blog
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-slate-900 mb-4 leading-tight">
              Verhalen die blijven
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Inspiratie, cadeautips en waardevolle inzichten over het bewaren
              van herinneringen — voor elke generatie.
            </p>
            {allArticles.length > 0 && (
              <p className="text-sm text-slate-400 mt-4">
                {allArticles.length} artikel{allArticles.length !== 1 ? "en" : ""}
              </p>
            )}
          </div>
        </section>

        {/* Tag filter */}
        {sortedTags.length > 0 && (
          <TagFilterBar tags={sortedTags} selectedTag={selectedTag} />
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {displayArticles.length === 0 ? (
            /* Empty state */
            <div className="text-center py-24">
              <BookOpen className="h-12 w-12 mx-auto text-slate-200 mb-4" />
              <h2 className="text-xl font-serif font-semibold text-slate-700 mb-2">
                {selectedTag
                  ? `Geen artikelen gevonden voor "${selectedTag}"`
                  : "Nog geen artikelen gepubliceerd"}
              </h2>
              <p className="text-slate-500 mb-6">
                {selectedTag
                  ? "Probeer een andere categorie."
                  : "Kom binnenkort terug voor nieuwe verhalen."}
              </p>
              {selectedTag && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange text-white text-sm font-semibold hover:bg-orange/90 transition-colors"
                >
                  Alle verhalen bekijken
                </Link>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Featured */}
                {featured && <FeaturedArticle article={featured} />}

                {/* Grid */}
                {restArticles.length > 0 && (
                  <>
                    {restArticles.length > 0 && (
                      <h2 className="font-serif font-semibold text-slate-900 text-xl pt-2">
                        {selectedTag ? `Meer over "${selectedTag}"` : "Alle artikelen"}
                      </h2>
                    )}
                    <div className="grid sm:grid-cols-2 gap-5">
                      {restArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6 lg:pt-0">
                <MostReadSidebar articles={mostRead} />
                <CtaSidebarCard />
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-neutral-sand py-14 px-4 sm:px-6 mt-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-3">
              Begin vandaag met jouw verhaal
            </h2>
            <p className="text-slate-600 mb-8">
              Maak gratis een account aan en leg je eerste herinnering vast — het
              duurt maar 2 minuten.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-semibold hover:bg-orange/90 transition-colors shadow-md"
              >
                Gratis starten
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kennisbank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Kennisbank bekijken
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
