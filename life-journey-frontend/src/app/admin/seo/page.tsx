"use client";

import { useEffect, useMemo, useState } from "react";
import {
  scoreIndexability,
  INDEXABILITY_THRESHOLD,
  IndexabilityScore,
} from "@/lib/seo/indexability";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface Post {
  slug: string;
  section: "blog" | "knowledge";
  tags?: string | null;
  view_count?: number;
  meta_description?: string | null;
}

function htmlToWords(html?: string | null): number {
  if (!html) return 0;
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.split(/\s+/).filter(Boolean).length;
}

export default function AdminSeoPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "risk">("risk");
  const [section, setSection] = useState<"all" | "blog" | "knowledge">("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const lists = await Promise.all([
          fetch(`${API}/blog/public/list?section=blog&limit=200`).then((r) => r.json()),
          fetch(`${API}/blog/public/list?section=knowledge&limit=200`).then((r) => r.json()),
        ]);
        const all: Post[] = [
          ...lists[0].map((a: any) => ({ ...a, section: "blog" as const })),
          ...lists[1].map((a: any) => ({ ...a, section: "knowledge" as const })),
        ];
        if (cancelled) return;
        setPosts(all);

        // Haal content + meta op per post (publieke endpoint, geen auth).
        // In batches van 6 om de rate-limiter niet te raken.
        const wordAndMeta: Record<string, { w: number; md: number }> = {};
        for (let i = 0; i < all.length; i += 6) {
          const batch = all.slice(i, i + 6);
          const results = await Promise.all(
            batch.map((p) =>
              fetch(`${API}/blog/public/slug/${p.slug}`)
                .then((r) => (r.ok ? r.json() : null))
                .catch(() => null)
            )
          );
          results.forEach((j, idx) => {
            const p = batch[idx];
            const key = `${p.section}/${p.slug}`;
            wordAndMeta[key] = {
              w: htmlToWords(j?.content),
              md: (j?.meta_description ?? "").length,
            };
          });
          if (cancelled) return;
        }

        // Inbound links graaf (rotatie, per sectie) — gespiegeld van
        // src/lib/related-articles.ts.
        const inbound: Record<string, number> = {};
        for (const sec of ["blog", "knowledge"] as const) {
          const secPosts = all.filter((p) => p.section === sec);
          for (const p of secPosts) inbound[`${sec}/${p.slug}`] = 0;
          for (const p of secPosts) {
            const idx = secPosts.findIndex((x) => x.slug === p.slug);
            const total = secPosts.length;
            for (let step = 1; step < total; step++) {
              const cand = secPosts[(idx + step) % total];
              if (cand.slug !== p.slug) {
                inbound[`${sec}/${cand.slug}`] = (inbound[`${sec}/${cand.slug}`] ?? 0) + 1;
                if (Object.values(inbound).filter((v, i) => i < step + 1).length >= 3) break;
              }
            }
          }
        }

        const scored: Record<string, number> = {};
        for (const p of all) {
          const key = `${p.section}/${p.slug}`;
          const wm = wordAndMeta[key] ?? { w: 0, md: 0 };
          const s = scoreIndexability({
            slug: p.slug,
            section: p.section,
            wordCount: wm.w,
            hasMetaDescription: wm.md > 0,
            metaDescriptionLength: wm.md,
            inboundLinks: inbound[key] ?? 0,
            hasTags: !!p.tags,
            views: p.view_count ?? 0,
          });
          scored[key] = s.score;
        }
        if (cancelled) return;
        setScores(scored);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "laadfout");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo<{ post: Post; score: number }[]>(() => {
    return posts
      .map((p) => ({ post: p, score: scores[`${p.section}/${p.slug}`] ?? 0 }))
      .filter((r) => (filter === "risk" ? r.score < INDEXABILITY_THRESHOLD : true))
      .filter((r) => (section === "all" ? true : r.post.section === section))
      .sort((a, b) => a.score - b.score);
  }, [posts, scores, filter, section]);

  const avg = useMemo(() => {
    const vals = Object.values(scores);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [scores]);

  const atRisk = useMemo(
    () => Object.values(scores).filter((s) => s < INDEXABILITY_THRESHOLD).length,
    [scores]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">SEO-indexeerbaarheid</h1>
        <p className="text-slate-600 mt-1">
          Score per gepubliceerd artikel op basis van contentdichtheid, meta_description,
          interne links, tags en leesvolume. Spiegelt de factoren die Google gebruikt bij
          &ldquo;gevonden / gecrawld, maar niet geïndexeerd&rdquo;.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Posts totaal" value={posts.length} />
        <Stat label="Gemiddelde score" value={avg} />
        <Stat label="Onder drempel (<60)" value={atRisk} accent="red" />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Toggle active={filter === "risk"} onClick={() => setFilter("risk")}>
          Alleen risico-posts
        </Toggle>
        <Toggle active={filter === "all"} onClick={() => setFilter("all")}>
          Alles
        </Toggle>
        <span className="mx-2 text-slate-400">|</span>
        <Toggle active={section === "all"} onClick={() => setSection("all")}>
          Alle secties
        </Toggle>
        <Toggle active={section === "blog"} onClick={() => setSection("blog")}>
          Blog
        </Toggle>
        <Toggle active={section === "knowledge"} onClick={() => setSection("knowledge")}>
          Kennisbank
        </Toggle>
      </div>

      {loading && <p className="text-slate-500">Bezig met analyseren van {posts.length} posts…</p>}
      {error && <p className="text-red-600">Fout: {error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3 font-medium">Post</th>
                <th className="text-left p-3 font-medium">Sectie</th>
                <th className="text-right p-3 font-medium">Score</th>
                <th className="text-left p-3 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ post, score }) => (
                <tr key={`${post.section}/${post.slug}`} className="border-t border-slate-100">
                  <td className="p-3 font-mono text-xs text-slate-700">{post.slug}</td>
                  <td className="p-3 text-slate-500">{post.section}</td>
                  <td className="p-3 text-right">
                    <ScoreBadge score={score} />
                  </td>
                  <td className="p-3">
                    <a
                      href={`https://bewaardvoorjou.nl/${post.section}/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      open
                    </a>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400">
                    Geen posts in deze selectie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: "red" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent === "red" ? "text-red-600" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
        active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? "bg-green-100 text-green-700"
    : score >= 70 ? "bg-lime-100 text-lime-700"
    : score >= 60 ? "bg-yellow-100 text-yellow-700"
    : score >= 45 ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";
  return <span className={`inline-block px-2.5 py-1 rounded-full font-semibold ${color}`}>{score}</span>;
}
