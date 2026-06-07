import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug: string | undefined = body?.slug;

  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ revalidated: true, slug: slug ?? null });
}
