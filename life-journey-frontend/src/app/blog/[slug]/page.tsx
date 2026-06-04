import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ArrowLeft, ArrowRight, Clock, Share2 } from "lucide-react";
import { BlogViewTracker } from "@/components/blog/BlogViewTracker";

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

  const images = article.og_image ?? article.header_image_url ?? undefined;

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
      ...(images ? { images: [{ url: images }] } : {}),
    },
  };
}

export default async function BlogArtikelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, relatedRaw] = await Promise.all([
    getArticle(slug),
    getArticle(slug).then((a) =>
      a ? getRelatedArticles(a.tags, slug) : []
    ),
  ]);

  if (!article) notFound();

  const related = relatedRaw;
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
    ...(article.og_image || article.header_image_url
      ? { image: article.og_image ?? article.header_image_url }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <div className="mt-8 pt-6 border-t border-neutral-sand">
            <p className="text-sm text-slate-500 mb-3 inline-flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5" /> Deel dit artikel
            </p>
            <div className="flex gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " — " + "https://bewaardvoorjou.nl/blog/" + slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors border border-green-100"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://bewaardvoorjou.nl/blog/" + slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
            </div>
          </div>
        </article>

        {/* Gerelateerde artikelen */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
            <h2 className="font-serif font-semibold text-slate-900 text-xl mb-6">
              Meer lezen
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((rel) => (
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
              ))}
            </div>
          </section>
        )}

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
