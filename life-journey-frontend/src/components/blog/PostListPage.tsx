"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Globe, FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { blogApi, type BlogPostListItem } from "@/lib/api/blog";

interface PostListPageProps {
  section: "blog" | "knowledge";
}

export function PostListPage({ section }: PostListPageProps) {
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const newPath = section === "knowledge" ? "/admin/kennisbank/new" : "/admin/blog/new";
  const editBasePath = section === "knowledge" ? "/admin/kennisbank" : "/admin/blog";
  const label = section === "knowledge" ? "Kennisbank" : "Blog";
  const publicPath = section === "knowledge" ? "kennisbank" : "blog";

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await blogApi.list(statusFilter || undefined, section);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Laden mislukt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Weet je zeker dat je "${title}" wil verwijderen?`)) return;
    setActionLoading(id);
    try {
      await blogApi.delete(id);
      setPosts((p) => p.filter((post) => post.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verwijderen mislukt");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (post: BlogPostListItem) => {
    setActionLoading(post.id);
    try {
      if (post.status === "published") {
        await blogApi.unpublish(post.id);
      } else {
        await blogApi.publish(post.id);
      }
      await loadPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Actie mislukt");
    } finally {
      setActionLoading(null);
    }
  };

  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{label}</h1>
          <p className="text-slate-600 mt-1">
            {published} gepubliceerd · {drafts} concept
          </p>
        </div>
        <Link href={newPath}>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw artikel
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        {["", "published", "draft"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === "" ? "Alles" : s === "published" ? "Gepubliceerd" : "Concept"}
          </button>
        ))}
      </div>

      {error && <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {!loading && posts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Nog geen artikelen</p>
            <p className="text-sm mt-1">Klik op "Nieuw artikel" om te beginnen.</p>
          </CardContent>
        </Card>
      )}

      {!loading && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-slate-400">
                        {new Date(
                          post.published_at ?? post.created_at
                        ).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">/{publicPath}/{post.slug}</p>
                    {post.excerpt && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handlePublish(post)}
                      disabled={actionLoading === post.id}
                      title={
                        post.status === "published" ? "Verberg (concept)" : "Publiceren + indexeren"
                      }
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === post.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : post.status === "published" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                    <Link href={`${editBasePath}/${post.id}`}>
                      <button className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </Link>

                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={actionLoading === post.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      <Globe className="h-3 w-3" /> Gepubliceerd
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
      <FileText className="h-3 w-3" /> Concept
    </span>
  );
}
