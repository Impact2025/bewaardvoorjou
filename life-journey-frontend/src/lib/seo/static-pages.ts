/**
 * Single source of truth for the static / marketing URLs in the sitemap.
 *
 * WHY: historically the sitemap listed routes that had no page.tsx
 * (/cadeau, /cadeaubon, /ouder-interview) → 404 in Google's face. That lived
 * inline in sitemap.ts, untested. Now both the sitemap and
 * `src/__tests__/seo-integrity.test.ts` read from here, so a dead route in this
 * list FAILS THE BUILD before it ever reaches GSC.
 *
 * RULE: only add a path here if `src/app/<path>/page.tsx` actually exists.
 * The test curls each URL on the live site and fails on any non-200.
 */

export interface StaticSitemapEntry {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
}

export const STATIC_SITEMAP_PAGES: StaticSitemapEntry[] = [
  // core
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.9, changeFrequency: "daily" },
  { path: "/kennisbank", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.9, changeFrequency: "weekly" },
  // seo / legal
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/security", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  // landing pages (thematisch)
  { path: "/autobiografie-hulp", priority: 0.8, changeFrequency: "monthly" },
  { path: "/veilig-digitaal-familiearchief", priority: 0.8, changeFrequency: "monthly" },
  { path: "/levensverhaal-opschrijven", priority: 0.8, changeFrequency: "monthly" },
  { path: "/levensverhaal-bewaren-usb", priority: 0.8, changeFrequency: "monthly" },
  { path: "/cadeau-opa-80-jaar", priority: 0.8, changeFrequency: "monthly" },
  { path: "/vaderdag", priority: 0.6, changeFrequency: "yearly" },
  { path: "/levensverhaal-vastleggen", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pensioen-afscheidscadeau", priority: 0.8, changeFrequency: "monthly" },
  { path: "/baby-herinneringen-vastleggen", priority: 0.8, changeFrequency: "monthly" },
  { path: "/mijlpaal-cadeau", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voor-baby", priority: 0.8, changeFrequency: "monthly" },
  { path: "/voor-baby/hoe-het-werkt", priority: 0.7, changeFrequency: "monthly" },
  { path: "/voor-baby/over-ons", priority: 0.5, changeFrequency: "monthly" },
];
