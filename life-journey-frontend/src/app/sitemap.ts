import { MetadataRoute } from "next";

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

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/kennisbank`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/cadeau-opa-80-jaar`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/security`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogArticles.map((a) => ({
    url: `${BASE_URL}/blog/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const kennisbankPages: MetadataRoute.Sitemap = kennisbankArticles.map((a) => ({
    url: `${BASE_URL}/kennisbank/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...kennisbankPages];
}
