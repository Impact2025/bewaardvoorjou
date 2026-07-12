import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

/**
 * Revalideert een blog- of kennisbankpagina na een wijziging in de admin.
 *
 * Beveiliging: de aanroeper moet een geldig admin-Bearer-token meesturen. We
 * verifiëren dat token tegen een admin-only backend-endpoint, zodat anonieme
 * bezoekers de cache-invalidatie niet kunnen misbruiken.
 */
async function isAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    const res = await fetch(`${API_BASE}/blog?limit=1`, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req.headers.get("authorization")))) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const slug: string | undefined = body?.slug;
  const section: string | undefined = body?.section;
  const base = section === "knowledge" ? "/kennisbank" : "/blog";

  revalidatePath(base);
  if (slug) revalidatePath(`${base}/${slug}`);

  return NextResponse.json({ revalidated: true, base, slug: slug ?? null });
}
