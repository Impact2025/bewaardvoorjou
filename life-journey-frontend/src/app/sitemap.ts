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

  const now = new Date();

  // ── Core statische pagina's (hoogste prioriteit) ──
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/kennisbank`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  // ── Subpagina's met SEO-waarde ──
  const seoPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/security`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // ── Landingspagina's (thematisch, CTA-gericht) ──
  const landingPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/autobiografie-hulp`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/veilig-digitaal-familiearchief`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/levensverhaal-opschrijven`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/levensverhaal-bewaren-usb`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/cadeau-opa-80-jaar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/cadeau`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/cadeaubon`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/vaderdag`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/levensverhaal-vastleggen`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/pensioen-afscheidscadeau`, lastModified: new Date("2026-05-14"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/baby-herinneringen-vastleggen`, lastModified: new Date("2026-06-03"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/mijlpaal-cadeau`, lastModified: new Date("2026-06-24"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/voor-baby`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/voor-baby/hoe-het-werkt`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/voor-baby/over-ons`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/ouder-interview`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

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

  return [...staticPages, ...seoPages, ...landingPages, ...blogPages, ...kennisbankPages];
}
