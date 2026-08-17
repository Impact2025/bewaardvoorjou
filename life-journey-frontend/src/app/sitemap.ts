import { MetadataRoute } from "next";
import { STATIC_SITEMAP_PAGES } from "@/lib/seo/static-pages";

const BASE_URL = "https://bewaardvoorjou.nl";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface ArticleItem {
  slug: string;
  published_at: string | null;
  updated_at?: string | null;
}

async function fetchPublishedSlugs(section: string): Promise<ArticleItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/blog/public/list?section=${section}&limit=200`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogArticles, kennisbankArticles] = await Promise.all([
    fetchPublishedSlugs("blog"),
    fetchPublishedSlugs("knowledge"),
  ]);

  const now = new Date();

  // ── Statische / marketing pagina's (bron: @/lib/seo/static-pages) ──
  const staticPages: MetadataRoute.Sitemap = STATIC_SITEMAP_PAGES.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // ── Blog artikelen ──
  const blogPages: MetadataRoute.Sitemap = blogArticles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ── Kennisbank artikelen ──
  const kennisbankPages: MetadataRoute.Sitemap = kennisbankArticles.map((a) => ({
    url: `${BASE_URL}/kennisbank/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...kennisbankPages];
}
