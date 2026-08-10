import { NextRequest, NextResponse } from "next/server";

function isValidToken(cookie: string | undefined): boolean {
  if (!cookie) return false;
  const parts = cookie.split(".");
  if (parts.length !== 3) return false;
  try {
    const pad = parts[1].length % 4;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad ? 4 - pad : 0);
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function isSafeRedirect(pathname: string): boolean {
  return pathname.startsWith("/") && !pathname.startsWith("//");
}

/**
 * Blogslugs die zijn samengevoegd om keyword-cannibalisatie op te lossen
 * (twee artikelen die op hetzelfde zoekwoord targetten). De bronpost is in
 * de DB gearchiveerd; deze 301 zorgt dat bestaande links/indexering naar de
 * survivor wijzen in plaats van een 404 te geven.
 */
const BLOG_SLUG_REDIRECTS: Record<string, string> = {
  "/blog/digitale-erfenis-meer-dan-alleen-wachtwoorden":
    "/blog/digitale-erfenis-regelen-meer-dan-alleen-wachtwoorden",

  // Contentaudit aug 2026 (scripts/fix_blog_content_audit_aug2026.py).
  // Dit artikel targette hetzelfde zoekwoord als de pijlerpagina
  // /levensverhaal-vastleggen; het is hertarget op de long tail en kreeg
  // daarom een nieuwe slug.
  "/blog/levensverhaal-vastleggen-complete-gids-voor-2026":
    "/blog/levensverhaal-vastleggen-audio-video-of-opschrijven",

  // Restant van een genummerde serie in de slug.
  "/blog/1-start-met-een-digitaal-levensverhaal-de-basis-van-jouw":
    "/blog/start-met-een-digitaal-levensverhaal-de-basis-van-jouw-nalatenschap",

  // Slug zei 30 hoofdstukken, titel en inhoud zeggen er 58.
  "/kennisbank/de-30-hoofdstukken-van-je-leven-wat-kun-je-verwachten":
    "/kennisbank/de-58-hoofdstukken-van-je-leven-wat-kun-je-verwachten",
};

/**
 * Privépaden die nooit in de zoekresultaten horen. We zetten hier een
 * X-Robots-Tag in plaats van een `metadata.robots` per route, omdat een deel
 * van deze layouts client components zijn (o.a. /admin) en dus geen metadata
 * kan exporteren. Eén centrale lijst voorkomt bovendien dat een nieuwe
 * subroute het per ongeluk mist.
 */
const PRIVATE_PREFIXES = [
  "/admin",
  "/chapter",
  "/chapters",
  "/checkout",
  "/dashboard",
  "/email-bevestigen",
  "/email-verificeren",
  "/family",
  "/instellingen",
  "/journey",
  "/legacy",
  "/login",
  "/memos",
  "/onboarding",
  "/onboarding-wizard",
  "/overview",
  "/record",
  "/recordings",
  "/register",
  "/timeline",
  "/uitnodiging",
  "/vertel",
  "/wachtwoord-resetten",
  "/wachtwoord-vergeten",
];

function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // ── WWW → non-www 301 redirect (canonical fix) ──
  if (host.startsWith("www.")) {
    const nonWww = host.replace(/^www\./, "");
    const url = new URL(`https://${nonWww}${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url, { status: 301 });
  }

  // ── Samengevoegde blogposts 301'en naar de survivor ──
  const mergedTarget = BLOG_SLUG_REDIRECTS[pathname];
  if (mergedTarget) {
    return NextResponse.redirect(new URL(mergedTarget, request.url), { status: 301 });
  }

  // ── Admin auth check ──
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("ljauth")?.value;
    if (!isValidToken(token)) {
      const loginUrl = new URL("/login", request.url);
      const redirect = isSafeRedirect(pathname) ? pathname : "/admin";
      loginUrl.searchParams.set("redirect", redirect);
      const res = NextResponse.redirect(loginUrl);
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
  }

  const response = NextResponse.next();

  // ── Privépaden uit de index houden ──
  // Deze paden zijn bewust wél crawlbaar in robots.txt: Google moet de pagina
  // kunnen ophalen om deze noindex te zien. Blokkeren via robots.txt zou juist
  // betekenen dat reeds geïndexeerde URL's blijven staan.
  if (isPrivatePath(pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|static|public|favicon|apple-touch|manifest|sw|workbox|\.well-known).*)"],
};
