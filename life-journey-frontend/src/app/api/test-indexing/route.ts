/**
 * Test route voor SEO indexering — alleen beschikbaar in development.
 * Gebruik: GET /api/test-indexing?url=https://bewaardvoorjou.nl/blog/test-post
 */
import { NextRequest, NextResponse } from "next/server";
import { pingIndexNow, pingGoogleIndexingAPI } from "@/lib/indexing";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Alleen beschikbaar in development" }, { status: 403 });
  }

  const url =
    request.nextUrl.searchParams.get("url") ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://bewaardvoorjou.nl"}/blog/test-indexing-${Date.now()}`;

  const results: Record<string, unknown> = { url, timestamp: new Date().toISOString() };

  // IndexNow
  try {
    await pingIndexNow([url]);
    results.indexNow = "OK";
  } catch (err) {
    results.indexNow = { error: String(err) };
  }

  // Google Indexing API
  try {
    await pingGoogleIndexingAPI(url);
    results.googleIndexing = "OK";
  } catch (err) {
    results.googleIndexing = { error: String(err) };
  }

  return NextResponse.json(results);
}
