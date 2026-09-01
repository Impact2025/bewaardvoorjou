/**
 * Canonical redirect map for merged/renamed blog & kennisbank slugs.
 *
 * HISTORY / WHY THIS IS A SEPARATE, TESTABLE MODULE
 * ------------------------------------------------
 * In aug 2026 a hand-maintained redirect map in middleware.ts pointed 2 LIVE,
 * published posts at 404-ing target slugs. That produced 7 GSC indexing errors
 * (404 / redirect error / page with redirect) and a "new reason: 404" email.
 *
 * The root cause was not a typo — it was that the map lived inside middleware
 * (untestable) and was edited without anyone validating the targets against
 * the published content in the DB. Extracting it here makes it unit-testable,
 * and `src/__tests__/seo-integrity.test.ts` now FAILS THE BUILD if:
 *   - a redirect target slug is not a currently published blog/kennisbank post
 *   - a source slug is itself still published (then the redirect hides it)
 *
 * RULE: before adding an entry, confirm BOTH the source and the target exist
 * in GET /blog/public/list (section=blog|knowledge). Never point at a slug you
 * have not verified is published.
 */
export const BLOG_SLUG_REDIRECTS: Record<string, string> = {
  // 1 sep 2026: kannibalisatie-cluster "levensverhaal vastleggen" (7 live
  // pagina's op dezelfde kernquery, beste positie 8,2 — zie waarheidsaudit
  // invariant cluster_kannibalisatie). Beide bronposts hieronder zijn in de
  // DB op status=draft gezet (published_at=NULL) vóórdat deze redirects
  // live gingen, zodat de live-asserts in seo-integrity.test.ts slagen.
  "/blog/levensverhaal-vastleggen-complete-gids-voor-2026":
    "/blog/alles-over-je-levensverhaal-vastleggen-complete-gids-voor-2026",
  "/kennisbank/levensverhaal-cadeau-geven":
    "/blog/levensverhaal-bewaren-geschenk-kinderen",
};

export type RedirectSource = keyof typeof BLOG_SLUG_REDIRECTS & string;
