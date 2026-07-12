import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Blog — Verhalen, tips & inspiratie | BewaardVoorJou.nl" },
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

// ─── Article Card ────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: ArticleListItem }) {
  const tags = parseTags(article.tags);

  return (
    <Link href={`/blog/${article.slug}`} className="group block h-full">
      <article className="h-full bg-white rounded-xl border border-[#E6E2DD] hover:border-[#FF8C42]/40 hover:shadow-[0_4px_20px_rgba(255,140,66,0.08)] transition-all duration-200 flex flex-col overflow-hidden">
        <div className="h-1 shrink-0 bg-[#FF8C42]" />
        <div className="p-5 flex flex-col flex-1">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#FF8C42] font-medium capitalize border border-[#FF8C42]/20"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <h3 className="font-serif font-semibold text-[#333333] text-base leading-snug mb-2 group-hover:text-[#FF8C42] transition-colors line-clamp-3 flex-1">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-[#555555] line-clamp-2 mb-4 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-[#999] mt-auto pt-3 border-t border-[#E6E2DD]/60">
            <span>{formatDate(article.published_at ?? article.created_at)}</span>
            <span className="flex items-center gap-1 text-[#FF8C42] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Lees meer <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Featured Article ────────────────────────────────────────────────────────

function FeaturedArticle({ article }: { article: ArticleListItem }) {
  const tags = parseTags(article.tags);

  return (
    <Link href={`/blog/${article.slug}`} className="group block">
      <article className="bg-white rounded-xl border border-[#E6E2DD] hover:border-[#FF8C42]/40 hover:shadow-[0_8px_32px_rgba(255,140,66,0.10)] transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
        {/* Orange left accent bar */}
        <div className="w-full sm:w-1.5 h-1.5 sm:h-auto shrink-0 bg-gradient-to-b from-[#FF8C42] to-[#FFB84D]" />
        <div className="p-7 sm:p-9 flex flex-col flex-1">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-3 py-1 rounded-full bg-[#FAF7F2] text-[#FF8C42] font-semibold capitalize border border-[#FF8C42]/25"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <h2 className="font-serif font-semibold text-[#333333] text-2xl sm:text-3xl leading-tight mb-3 group-hover:text-[#FF8C42] transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-[#555555] leading-relaxed mb-6 max-w-2xl line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-[#999]">
              {formatDate(article.published_at ?? article.created_at)}
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF8C42] group-hover:gap-3 transition-all">
              Lees artikel
              <ArrowUpRight className="h-4 w-4" />
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
    <div className="bg-white rounded-xl border border-[#E6E2DD] p-6">
      <h2 className="font-semibold text-[#333333] text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
        <span className="inline-block w-3 h-0.5 bg-[#FF8C42] rounded-full" />
        Meest gelezen
      </h2>
      {articles.length === 0 ? (
        <p className="text-sm text-[#999]">Binnenkort beschikbaar</p>
      ) : (
        <ol className="space-y-4">
          {articles.map((article, i) => (
            <li key={article.id}>
              <Link
                href={`/blog/${article.slug}`}
                className="group flex items-start gap-3"
              >
                <span className="text-xs font-bold text-[#FF8C42]/50 leading-none shrink-0 mt-1 w-4 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#333333] group-hover:text-[#FF8C42] transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </p>
                  <p className="text-xs text-[#999] mt-1">
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
    <section className="bg-white border-b border-[#E6E2DD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          <Link
            href="/blog"
            className={[
              "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all shrink-0",
              !selectedTag
                ? "bg-[#FF8C42] text-white"
                : "text-[#555555] hover:text-[#FF8C42]",
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
                  ? "bg-[#FF8C42] text-white"
                  : "text-[#555555] hover:text-[#FF8C42]",
              ].join(" ")}
            >
              {tagName}
              <span className="ml-1 opacity-40 text-xs">({count})</span>
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
    <div className="bg-[#FAF7F2] rounded-xl border border-[#E6E2DD] p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-[#FF8C42]/10 flex items-center justify-center mx-auto mb-4">
        <span className="text-xl">📖</span>
      </div>
      <h3 className="font-serif font-semibold text-[#333333] mb-2 leading-tight">
        Begin jouw verhaal vandaag
      </h3>
      <p className="text-sm text-[#555555] mb-5 leading-relaxed">
        Leg jouw herinneringen vast voor toekomstige generaties.
      </p>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF8C42] text-white text-sm font-semibold hover:bg-[#F47B3B] transition-colors"
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

  const tagMap: Record<string, number> = {};
  for (const a of allArticles) {
    parseTags(a.tags).forEach((t) => {
      tagMap[t] = (tagMap[t] ?? 0) + 1;
    });
  }
  const sortedTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);

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

      <main className="min-h-screen bg-[#FAF7F2]">
        {/* Hero */}
        <section className="bg-white border-b border-[#E6E2DD] py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF8C42] mb-4">
              Blog
            </p>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-[#333333] mb-4 leading-tight">
              Verhalen die blijven
            </h1>
            <p className="text-lg text-[#555555] max-w-xl mx-auto leading-relaxed">
              Inspiratie, tips en waardevolle inzichten over het bewaren van
              herinneringen — voor elke generatie.
            </p>
            {allArticles.length > 0 && (
              <p className="text-sm text-[#999] mt-5">
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
            <div className="text-center py-24">
              <p className="text-4xl mb-4">📝</p>
              <h2 className="text-xl font-serif font-semibold text-[#333333] mb-2">
                {selectedTag
                  ? `Geen artikelen voor "${selectedTag}"`
                  : "Nog geen artikelen gepubliceerd"}
              </h2>
              <p className="text-[#555555] mb-6">
                {selectedTag
                  ? "Probeer een andere categorie."
                  : "Kom binnenkort terug voor nieuwe verhalen."}
              </p>
              {selectedTag && (
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF8C42] text-white text-sm font-semibold hover:bg-[#F47B3B] transition-colors"
                >
                  Alle verhalen bekijken
                </Link>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-8">
                {featured && <FeaturedArticle article={featured} />}

                {restArticles.length > 0 && (
                  <>
                    <h2 className="font-serif font-semibold text-[#333333] text-lg pt-1 flex items-center gap-3">
                      <span className="inline-block w-4 h-0.5 bg-[#FF8C42] rounded-full" />
                      {selectedTag ? `Meer over "${selectedTag}"` : "Alle artikelen"}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      {restArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <MostReadSidebar articles={mostRead} />
                <CtaSidebarCard />
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <section className="bg-white border-t border-[#E6E2DD] py-16 px-4 sm:px-6 mt-8">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF8C42] mb-3">
              Aan de slag
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#333333] mb-3 leading-tight">
              Begin vandaag met jouw verhaal
            </h2>
            <p className="text-[#555555] mb-8 leading-relaxed">
              Maak gratis een account aan en leg je eerste herinnering vast — het
              duurt maar 2 minuten.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF8C42] text-white font-semibold hover:bg-[#F47B3B] transition-colors shadow-sm"
              >
                Gratis starten
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kennisbank"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E6E2DD] text-[#555555] font-medium hover:border-[#FF8C42]/40 hover:text-[#FF8C42] transition-colors"
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
