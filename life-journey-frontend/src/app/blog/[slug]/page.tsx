import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { BlogViewTracker } from "@/components/blog/BlogViewTracker";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { PodcastPlayer } from "@/components/blog/PodcastPlayer";
import { extractFaqFromHtml, buildFaqPageJsonLd } from "@/lib/faq-schema";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string | null;
  header_type: "color" | "image";
  header_color: string | null;
  header_text_color: string | null;
  header_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  keywords: string | null;
  view_count: number;
  status: string;
  audio_url: string | null;
  audio_title: string | null;
  audio_duration: number | null;
  transcript: string | null;
  published_at: string | null;
  created_at: string;
}

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string | null;
  header_color: string | null;
  published_at: string | null;
  created_at: string;
}

async function getArticle(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/blog/public/slug/${slug}`, {
      next: { revalidate: 900 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelatedArticles(
  tags: string | null,
  excludeSlug: string
): Promise<ArticleListItem[]> {
  if (!tags) return [];
  const firstTag = tags.split(",")[0]?.trim();
  if (!firstTag) return [];
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/list?section=blog&tag=${encodeURIComponent(firstTag)}&limit=4`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return [];
    const articles: ArticleListItem[] = await res.json();
    return articles.filter((a) => a.slug !== excludeSlug).slice(0, 3);
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

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/list?section=blog&limit=200`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const articles: { slug: string }[] = await res.json();
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artikel niet gevonden" };

  const DEFAULT_OG = "https://bewaardvoorjou.nl/Header-Image-min.png";
  const ogImage = article.og_image ?? article.header_image_url ?? DEFAULT_OG;

  return {
    title: article.meta_title ?? `${article.title} | BewaardVoorJou.nl`,
    description: article.meta_description ?? article.excerpt ?? undefined,
    keywords: article.keywords ?? undefined,
    alternates: {
      canonical: `https://bewaardvoorjou.nl/blog/${slug}`,
    },
    openGraph: {
      title: article.meta_title ?? article.title,
      description: article.meta_description ?? article.excerpt ?? undefined,
      url: `https://bewaardvoorjou.nl/blog/${slug}`,
      type: "article",
      publishedTime: article.published_at ?? article.created_at,
      images: [{ url: ogImage }],
    },
  };
}

export default async function BlogArtikelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const related = await getRelatedArticles(article.tags, slug);
  const tags = parseTags(article.tags);
  const readTime = estimateReadingTime(article.content);
  const headerBg = article.header_color ?? "#F5E6D3";
  const headerTextColor = article.header_text_color ?? "#5C3D2E";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt ?? undefined,
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.published_at ?? article.created_at,
    author: {
      "@type": "Organization",
      name: "BewaardVoorJou.nl",
    },
    publisher: {
      "@type": "Organization",
      name: "BewaardVoorJou.nl",
      url: "https://bewaardvoorjou.nl",
    },
    mainEntityOfPage: `https://bewaardvoorjou.nl/blog/${slug}`,
    keywords: article.keywords ?? undefined,
    image: article.og_image ?? article.header_image_url ?? "https://bewaardvoorjou.nl/Header-Image-min.png",
    timeRequired: `PT${readTime}M`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://bewaardvoorjou.nl/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://bewaardvoorjou.nl/blog/${slug}` },
    ],
  };

  const faqLd = buildFaqPageJsonLd(extractFaqFromHtml(article.content));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {/* Track view silently on load */}
      <BlogViewTracker slug={slug} />
      <PublicHeader />

      <main className="min-h-screen bg-warm-50">
        {/* Artikel header */}
        <div
          className="py-14 px-4 sm:px-6"
          style={{ backgroundColor: headerBg, color: headerTextColor }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm mb-6 opacity-70">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-medium hover:opacity-100 transition-opacity"
                style={{ color: headerTextColor }}
              >
                <ArrowLeft className="h-4 w-4" />
                Blog
              </Link>
            </nav>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    className="text-xs px-3 py-1 rounded-full font-medium capitalize transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: `${headerTextColor}22`,
                      color: headerTextColor,
                    }}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            )}

            {/* Meta: datum + leestijd */}
            <p className="text-sm opacity-60 mb-4">
              {formatDate(article.published_at ?? article.created_at)}
              {" · "}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readTime} min lezen
              </span>
            </p>

            {/* Titel */}
            <h1
              className="text-3xl sm:text-4xl font-serif font-semibold leading-tight"
              style={{ color: headerTextColor }}
            >
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p
                className="mt-4 text-lg opacity-80 max-w-2xl leading-relaxed"
                style={{ color: headerTextColor }}
              >
                {article.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Podcast player (NotebookLM audio) */}
        <PodcastPlayer
          audioUrl={article.audio_url ?? ""}
          title={article.audio_title}
          durationSeconds={article.audio_duration}
          transcript={article.transcript}
          articleUrl={`https://bewaardvoorjou.nl/blog/${slug}`}
        />

        {/* Artikel inhoud */}
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-slate-900
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-700 prose-p:leading-relaxed
              prose-li:text-slate-700
              prose-strong:text-slate-900
              prose-a:text-orange prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-orange prose-blockquote:bg-orange/5 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
              prose-hr:border-neutral-sand"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags onderaan */}
          {tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-neutral-sand">
              <p className="text-sm text-slate-400 mb-3">Categorieën</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link
                    key={t}
                    href={`/blog?tag=${encodeURIComponent(t)}`}
                    className="text-sm px-3 py-1.5 rounded-full bg-orange/10 text-orange font-medium capitalize hover:bg-orange/20 transition-colors"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Delen */}
          <ShareButtons
            url={`https://bewaardvoorjou.nl/blog/${slug}`}
            title={article.title}
          />
        </article>

        {/* Gerelateerde artikelen — API of fallback */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-serif font-semibold text-slate-900 text-xl mb-6">
            {related.length > 0 ? "Meer lezen" : "Lees ook"}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.length > 0 ? related.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="group block bg-white rounded-xl border border-neutral-sand overflow-hidden hover:shadow-sm hover:border-orange/30 transition-all"
              >
                <div
                  className="h-1"
                  style={{ backgroundColor: rel.header_color ?? "#E8773C" }}
                />
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-orange transition-colors line-clamp-3 leading-snug">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDate(rel.published_at ?? rel.created_at)}
                  </p>
                </div>
              </Link>
            )) : (
              <>
                <Link href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal" className="group block bg-white rounded-xl border border-neutral-sand overflow-hidden hover:shadow-sm hover:border-orange/30 transition-all">
                  <div className="h-1" style={{ backgroundColor: "#3B82F6" }} />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-orange transition-colors line-clamp-3 leading-snug">Hoe begin ik met mijn levensverhaal? (stap-voor-stap)</h3>
                  </div>
                </Link>
                <Link href="/kennisbank/wat-doet-de-ai-interviewer-precies" className="group block bg-white rounded-xl border border-neutral-sand overflow-hidden hover:shadow-sm hover:border-orange/30 transition-all">
                  <div className="h-1" style={{ backgroundColor: "#3B82F6" }} />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-orange transition-colors line-clamp-3 leading-snug">Wat doet de AI-interviewer precies?</h3>
                  </div>
                </Link>
                <Link href="/autobiografie-hulp" className="group block bg-white rounded-xl border border-neutral-sand overflow-hidden hover:shadow-sm hover:border-orange/30 transition-all">
                  <div className="h-1" style={{ backgroundColor: "#3B82F6" }} />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-orange transition-colors line-clamp-3 leading-snug">Autobiografie schrijven — hulp & AI-begeleiding</h3>
                  </div>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white border-t border-neutral-sand py-14 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-3">
              Klaar om jouw verhaal vast te leggen?
            </h2>
            <p className="text-slate-600 mb-8">
              Maak gratis een account aan en bewaar jouw herinneringen voor
              toekomstige generaties.
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
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Meer artikelen lezen
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
