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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // ── WWW → non-www 301 redirect (canonical fix) ──
  if (host.startsWith("www.")) {
    const nonWww = host.replace(/^www\./, "");
    const url = new URL(`https://${nonWww}${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url, { status: 301 });
  }

  // ── Admin auth check ──
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("ljauth")?.value;
    if (!isValidToken(token)) {
      const loginUrl = new URL("/login", request.url);
      const redirect = isSafeRedirect(pathname) ? pathname : "/admin";
      loginUrl.searchParams.set("redirect", redirect);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|public|favicon|apple-touch|manifest|sw|workbox|\.well-known).*)"],
};
