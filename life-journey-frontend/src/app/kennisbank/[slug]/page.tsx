import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { BlogViewTracker } from "@/components/blog/BlogViewTracker";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { extractFaqFromHtml, buildFaqPageJsonLd } from "@/lib/faq-schema";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  header_type: "color" | "image";
  header_color: string | null;
  header_text_color: string | null;
  header_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  published_at: string | null;
  created_at: string;
}

interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  header_color: string | null;
  published_at: string | null;
  created_at: string;
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
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
  excludeSlug: string
): Promise<ArticleListItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/list?section=knowledge&limit=12`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) return [];
    const articles: ArticleListItem[] = await res.json();
    return articles.filter((a) => a.slug !== excludeSlug).slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/list?section=knowledge&limit=200`,
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

  return {
    title: article.meta_title ?? article.title,
    description: article.meta_description ?? article.excerpt ?? undefined,
    keywords: article.keywords ?? undefined,
    alternates: {
      canonical: `https://bewaardvoorjou.nl/kennisbank/${slug}`,
    },
    openGraph: {
      title: article.meta_title ?? article.title,
      description: article.meta_description ?? article.excerpt ?? undefined,
      url: `https://bewaardvoorjou.nl/kennisbank/${slug}`,
    },
  };
}

export default async function KennisbankArtikelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getArticle(slug),
    getRelatedArticles(slug),
  ]);

  if (!article) notFound();

  const headerBg = article.header_color ?? "#F5E6D3";
  const headerTextColor = article.header_text_color ?? "#5C3D2E";
  const readTime = estimateReadingTime(article.content);
  const articleUrl = `https://bewaardvoorjou.nl/kennisbank/${slug}`;
  const articleImage = article.header_image_url || "https://bewaardvoorjou.nl/Logo_Bewaardvoorjou.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
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
    mainEntityOfPage: `https://bewaardvoorjou.nl/kennisbank/${slug}`,
    image: articleImage,
    timeRequired: `PT${readTime}M`,
    keywords: article.keywords ?? undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl/" },
      { "@type": "ListItem", position: 2, name: "Kennisbank", item: "https://bewaardvoorjou.nl/kennisbank" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://bewaardvoorjou.nl/kennisbank/${slug}` },
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
      <BlogViewTracker slug={slug} />
      <PublicHeader />

      <main className="min-h-screen bg-warm-50">
        {/* Header banner */}
        <div
          className="py-14 px-4 sm:px-6"
          style={{ backgroundColor: headerBg, color: headerTextColor }}
        >
          <div className="max-w-3xl mx-auto">
            <Link
              href="/kennisbank"
              className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: headerTextColor }}
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar kennisbank
            </Link>
            <p className="text-sm opacity-60 mb-3">
              {new Date(
                article.published_at ?? article.created_at
              ).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" · "}
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readTime} min lezen
              </span>
            </p>
            <h1
              className="text-3xl sm:text-4xl font-serif font-semibold leading-tight"
              style={{ color: headerTextColor }}
            >
              {article.title}
            </h1>
            {article.excerpt && (
              <p
                className="mt-4 text-lg opacity-80 max-w-2xl"
                style={{ color: headerTextColor }}
              >
                {article.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Artikel content */}
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
              prose-hr:border-neutral-sand"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <ShareButtons url={articleUrl} title={article.title} />
        </article>

        {/* Gerelateerde artikelen — API of fallback */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-serif font-semibold text-slate-900 text-xl mb-6">
            {related.length > 0 ? "Meer uit de kennisbank" : "Lees ook"}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.length > 0 ? related.map((rel) => (
              <Link
                key={rel.id}
                href={`/kennisbank/${rel.slug}`}
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
                </div>
              </Link>
            )) : (
              <>
                <Link href="/blog/levensverhaal-bewaren-geschenk-kinderen" className="group block bg-white rounded-xl border border-neutral-sand overflow-hidden hover:shadow-sm hover:border-orange/30 transition-all">
                  <div className="h-1" style={{ backgroundColor: "#E8773C" }} />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-orange transition-colors line-clamp-3 leading-snug">Levensverhaal bewaren: het grootste geschenk aan je kinderen</h3>
                  </div>
                </Link>
                <Link href="/blog/interview-ouder-starten-praktische-gids" className="group block bg-white rounded-xl border border-neutral-sand overflow-hidden hover:shadow-sm hover:border-orange/30 transition-all">
                  <div className="h-1" style={{ backgroundColor: "#E8773C" }} />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-orange transition-colors line-clamp-3 leading-snug">Interview met je ouder starten: praktische gids</h3>
                  </div>
                </Link>
                <Link href="/kennisbank/waar-worden-mijn-levensverhalen-opgeslagen-nederlandse-servers" className="group block bg-white rounded-xl border border-neutral-sand overflow-hidden hover:shadow-sm hover:border-orange/30 transition-all">
                  <div className="h-1" style={{ backgroundColor: "#E8773C" }} />
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-orange transition-colors line-clamp-3 leading-snug">Waar worden mijn verhalen opgeslagen? 🇳🇱</h3>
                  </div>
                </Link>
              </>
            )}
          </div>
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-medium hover:bg-orange/90 transition-colors"
              >
                Gratis starten
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kennisbank"
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
