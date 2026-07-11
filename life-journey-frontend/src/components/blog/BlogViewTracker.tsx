"use client";

import { useEffect } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

/**
 * Registreert één weergave per artikel per bezoeker. We onthouden reeds
 * getelde slugs in localStorage, zodat herladen of terugnavigeren de teller
 * niet kunstmatig opblaast. De backend rate-limit vangt grover misbruik af.
 */
export function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const KEY = "bvj.viewed";
    let seen: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      seen = [];
    }
    if (seen.includes(slug)) return;

    fetch(`${API_BASE}/blog/public/${slug}/view`, { method: "POST" })
      .then(() => {
        try {
          localStorage.setItem(KEY, JSON.stringify([...seen, slug].slice(-500)));
        } catch {
          // localStorage vol of geblokkeerd — niet erg, we tellen dan opnieuw
        }
      })
      .catch(() => {});
  }, [slug]);

  return null;
}
