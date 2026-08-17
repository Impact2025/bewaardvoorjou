/**
 * SEO-integrity guardrail.
 *
 * Voorkomt de regressie van aug 2026: een hand-matige redirect/sitemap-lijst
 * die naar dode of niet-gepubliceerde slugs wees, met 7 GSC-indexeringsfouten
 * en een "nieuwe reden: 404"-mail als gevolg.
 *
 * De offline asserts draaien altijd (snel, geen netwerk). De live asserts
 * (curl naar de productie-site + DB) draaien alleen als SEO_LIVE_CHECK=1
 * (CI-stap met netwerk), zodat lokale `vitest run` niet netwerk-afhankelijk is.
 */
import { describe, expect, it, vi } from "vitest";
import { BLOG_SLUG_REDIRECTS } from "@/lib/seo/redirects";
import { STATIC_SITEMAP_PAGES } from "@/lib/seo/static-pages";
import { scoreIndexability, INDEXABILITY_THRESHOLD } from "@/lib/seo/indexability";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://bewaardvoorjou-production.up.railway.app/api/v1";

async function fetchPublishedSlugs(
  section: "blog" | "knowledge"
): Promise<string[]> {
  const res = await fetch(
    `${API_BASE}/blog/public/list?section=${section}&limit=200`
  );
  if (!res.ok) throw new Error(`API ${section} → ${res.status}`);
  const data = (await res.json()) as { slug: string }[];
  return data.map((a) => a.slug);
}

const LIVE = process.env.SEO_LIVE_CHECK === "1";
const itLive = LIVE ? it : it.skip;

async function httpStatus(url: string): Promise<number> {
  // HEAD first; some hosts dislike HEAD, fall back to GET.
  for (const method of ["HEAD", "GET"] as const) {
    const res = await fetch(url, {
      method,
      redirect: "manual",
      headers: { "user-agent": "seo-integrity-check" },
    });
    if (res.status !== 405) return res.status;
  }
  return 0;
}

describe("SEO redirect & sitemap integrity", () => {
  describe("offline: redirect map is internally consistent", () => {
    const entries = Object.entries(BLOG_SLUG_REDIRECTS);

    it("heeft geen regels die naar zichzelf wijzen", () => {
      for (const [src, dst] of entries) {
        expect(src, `redirect ${src} mag niet naar zichzelf wijzen`).not.toBe(
          dst
        );
      }
    });

    it("heeft geen regels met identieke bron en doel-pad", () => {
      for (const [src, dst] of entries) {
        expect(src.replace(/\/$/, "")).not.toBe(dst.replace(/\/$/, ""));
      }
    });

    it("verwijst elk doel naar een abs/rel pad dat met / begint", () => {
      for (const [, dst] of entries) {
        expect(dst.startsWith("/")).toBe(true);
      }
    });
  });

  describe("live: redirects & sitemap point at real, published, 200 content", () => {
    let published = new Set<string>();

    itLive("laadt de gepubliceerde slugs uit de DB", async () => {
      const [blog, kb] = await Promise.all([
        fetchPublishedSlugs("blog"),
        fetchPublishedSlugs("knowledge"),
      ]);
      for (const s of blog) published.add(`/blog/${s}`);
      for (const s of kb) published.add(`/kennisbank/${s}`);
      expect(published.size).toBeGreaterThan(0);
    }, 30_000);

    itLive("elke redirect-doel verwijst naar een gepubliceerd artikel", async () => {
      const [blog, kb] = await Promise.all([
        fetchPublishedSlugs("blog"),
        fetchPublishedSlugs("knowledge"),
      ]);
      const pub = new Set<string>();
      for (const s of blog) pub.add(`/blog/${s}`);
      for (const s of kb) pub.add(`/kennisbank/${s}`);
      for (const [, dst] of Object.entries(BLOG_SLUG_REDIRECTS)) {
        expect(
          pub.has(dst),
          `redirect-doel ${dst} is niet gepubliceerd in de DB`
        ).toBe(true);
      }
    }, 30_000);

    itLive("elke redirect-bron is NIET zelf gepubliceerd (anders verbergt de 301 een live post)", async () => {
      const [blog, kb] = await Promise.all([
        fetchPublishedSlugs("blog"),
        fetchPublishedSlugs("knowledge"),
      ]);
      const pub = new Set<string>();
      for (const s of blog) pub.add(`/blog/${s}`);
      for (const s of kb) pub.add(`/kennisbank/${s}`);
      for (const [src] of Object.entries(BLOG_SLUG_REDIRECTS)) {
        expect(
          pub.has(src),
          `redirect-bron ${src} is wél gepubliceerd → de 301 verbergt een live post`
        ).toBe(false);
      }
    }, 30_000);

    itLive("elke statische sitemap-pagina geeft HTTP 200 op productie", async () => {
      const base = "https://bewaardvoorjou.nl";
      for (const page of STATIC_SITEMAP_PAGES) {
        const status = await httpStatus(`${base}${page.path}`);
        expect(
          status,
          `statische sitemap-URL ${page.path} geeft ${status} (verwacht 200)`
        ).toBe(200);
      }
    }, 60_000);

    itLive("de sitemap.xml bevat geen dode /cadeau-achtige paden meer", async () => {
      const xml = await (
        await fetch("https://bewaardvoorjou.nl/sitemap.xml")
      ).text();
      for (const dead of ["/cadeau<", "/cadeaubon<", "/ouder-interview<"]) {
        expect(xml.includes(`https://bewaardvoorjou.nl${dead}`)).toBe(false);
      }
    });

    itLive("indexeerbaarheid: niet meer dan een baseline aantal risico-posts", async () => {
      // Haalt content + meta op per post en telt hoeveel onder de drempel
      // zakken. Failt niet hard op het absolute aantal (content-uitbreiding is
      // een redactioneel traject), maar waakt wél dat een deploy het aantal
      // risico-posts niet LATER doet stijgen dan de bekende baseline.
      const BASELINE_RISK = Number(process.env.SEO_BASELINE_RISK ?? "86");
      const API = process.env.NEXT_PUBLIC_API_BASE_URL ??
        "https://bewaardvoorjou-production.up.railway.app/api/v1";
      const htmlToWords = (h?: string | null) =>
        h ? h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length : 0;

      const posts: { slug: string; section: "blog" | "knowledge"; tags?: string | null; view_count?: number; meta?: string | null }[] = [];
      for (const sec of ["blog", "knowledge"] as const) {
        const list = (await (
          await fetch(`${API}/blog/public/list?section=${sec}&limit=200`)
        ).json()) as any[];
        for (const a of list) posts.push({ slug: a.slug, section: sec, tags: a.tags, view_count: a.view_count, meta: a.meta_description });
      }

      let risk = 0;
      for (const p of posts) {
        const j = await (
          await fetch(`${API}/blog/public/slug/${p.slug}`)
        ).json().catch(() => null);
        const wc = htmlToWords(j?.content);
        const md = (j?.meta_description ?? p.meta ?? "").length;
        const s = scoreIndexability({
          slug: p.slug,
          section: p.section,
          wordCount: wc,
          hasMetaDescription: md > 0,
          metaDescriptionLength: md,
          inboundLinks: 3, // rotatie-graaf garandeert >=2; hier conservatief 3
          hasTags: !!p.tags,
          views: p.view_count ?? 0,
        });
        if (s.score < INDEXABILITY_THRESHOLD) risk++;
      }
      // Log voor zichtbaarheid in CI-output; faalt alleen als het de baseline
      // overschrijdt (zodat een slechte deploy niet ongemerkt live gaat).
      console.log(`[seo] risico-posts: ${risk} (baseline ${BASELINE_RISK})`);
      expect(risk, `aantal risico-posts (${risk}) overschrijdt baseline ${BASELINE_RISK}`).toBeLessThanOrEqual(BASELINE_RISK);
    });
  });
});
