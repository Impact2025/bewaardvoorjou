"use client";

import { useEffect } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

export function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`${API_BASE}/blog/public/${slug}/view`, { method: "POST" }).catch(
      () => {}
    );
  }, [slug]);

  return null;
}
