"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Globe,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogEditor, type BlogEditorHandle } from "@/components/blog/BlogEditor";
import { SeoPanel } from "@/components/blog/SeoPanel";
import { HeaderBuilder, type HeaderSettings } from "@/components/blog/HeaderBuilder";
import { blogApi, type BlogPost, type BlogPostCreate } from "@/lib/api/blog";

type SeoFields = {
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  tags: string;
  og_image: string;
};

const emptySeo: SeoFields = {
  slug: "",
  excerpt: "",
  meta_title: "",
  meta_description: "",
  keywords: "",
  tags: "",
  og_image: "",
};

const defaultHeader: HeaderSettings = {
  header_type: "color",
  header_color: "#FF8C42",
  header_text_color: "#FFFFFF",
  header_image_url: "",
};

interface Props {
  postId?: string;
  section?: "blog" | "knowledge";
}

export function BlogPostEditorPage({ postId, section = "blog" }: Props) {
  const router = useRouter();
  const isNew = !postId;
  const backPath = section === "knowledge" ? "/admin/kennisbank" : "/admin/blog";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seo, setSeo] = useState<SeoFields>(emptySeo);
  const [header, setHeader] = useState<HeaderSettings>(defaultHeader);
  const [publishedAt, setPublishedAt] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const editorRef = useRef<BlogEditorHandle>(null);
  // Ref houdt altijd de meest recente content bij — ook vóór React re-render
  const latestContentRef = useRef(content);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (isNew || !postId) return;
    blogApi
      .get(postId)
      .then((p) => {
        setPost(p);
        setTitle(p.title);
        setContent(p.content);
        latestContentRef.current = p.content;
        setSeo({
          slug: p.slug ?? "",
          excerpt: p.excerpt ?? "",
          meta_title: p.meta_title ?? "",
          meta_description: p.meta_description ?? "",
          keywords: p.keywords ?? "",
          tags: p.tags ?? "",
          og_image: p.og_image ?? "",
        });
        setHeader({
          header_type: (p.header_type as "color" | "image") ?? "color",
          header_color: p.header_color ?? "#FF8C42",
          header_text_color: p.header_text_color ?? "#FFFFFF",
          header_image_url: p.header_image_url ?? "",
        });
        if (p.published_at) {
          // Zet om naar datetime-local formaat (YYYY-MM-DDTHH:mm)
          const d = new Date(p.published_at);
          setPublishedAt(d.toISOString().slice(0, 16));
        }
      })
      .catch(() => showToast("error", "Post niet gevonden"))
      .finally(() => setLoading(false));
  }, [postId, isNew]);

  // Auto-slug op basis van titel (alleen nieuwe posts, alleen als slug leeg)
  useEffect(() => {
    if (!isNew || seo.slug) return;
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
    setSeo((s) => ({ ...s, slug: generated }));
  }, [title]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSeoChange = useCallback((field: string, value: string) => {
    setSeo((s) => ({ ...s, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleHeaderChange = useCallback((field: keyof HeaderSettings, value: string) => {
    setHeader((h) => ({ ...h, [field]: value }));
    // Sync header image naar og_image
    if (field === "header_image_url" && value) {
      setSeo((s) => ({ ...s, og_image: value }));
    }
    setIsDirty(true);
  }, []);

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    return blogApi.uploadImage(file);
  }, []);

  const handleVideoUpload = useCallback(async (file: File): Promise<string> => {
    return blogApi.uploadVideo(file);
  }, []);

  const handleInsertLink = useCallback((href: string, text: string) => {
    editorRef.current?.insertLink(href, text);
  }, []);

  // Wordt aangeroepen door SeoPanel nadat beide AI-stappen klaar zijn.
  // Slaat automatisch op met de verbeterde content (zonder timing-probleem).
  const handleAfterOptimize = useCallback(async (enhancedHtml: string | null) => {
    await handleSave(enhancedHtml ?? undefined);
    showToast("success", "AI-verbeteringen opgeslagen en zichtbaar op de site");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, title, seo, header, publishedAt, isNew]);

  const buildPayload = (contentOverride?: string): BlogPostCreate => ({
    title: title.trim(),
    slug: seo.slug,
    content: contentOverride ?? latestContentRef.current,
    section,
    excerpt: seo.excerpt || undefined,
    header_type: header.header_type,
    header_color: header.header_color || undefined,
    header_text_color: header.header_text_color || undefined,
    header_image_url: header.header_image_url || undefined,
    meta_title: seo.meta_title || undefined,
    meta_description: seo.meta_description || undefined,
    og_image: seo.og_image || undefined,
    keywords: seo.keywords || undefined,
    tags: seo.tags || undefined,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : undefined,
  });

  const revalidate = (slug: string) => {
    let token: string | null = null;
    try {
      token = JSON.parse(localStorage.getItem("life-journey.auth") ?? "{}").token ?? null;
    } catch {
      token = null;
    }
    return fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ slug, section }),
    }).catch(() => null);
  };

  const handleSave = async (contentOverride?: string): Promise<BlogPost | null> => {
    if (!title.trim() || !seo.slug) {
      showToast("error", "Titel en slug zijn verplicht");
      return null;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await blogApi.create(buildPayload(contentOverride));
        setPost(created);
        setIsDirty(false);
        showToast("success", "Concept opgeslagen");
        const editPath = section === "knowledge" ? `/admin/kennisbank/${created.id}` : `/admin/blog/${created.id}`;
        router.replace(editPath);
        return created;
      } else {
        const updated = await blogApi.update(post!.id, buildPayload(contentOverride));
        setPost(updated);
        setIsDirty(false);
        await revalidate(updated.slug);
        showToast("success", "Opgeslagen");
        return updated;
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Opslaan mislukt");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    let currentPost = post;
    if (isDirty || isNew) {
      currentPost = await handleSave();
      if (!currentPost) return;
    }
    setPublishing(true);
    try {
      if (currentPost!.status === "published") {
        const updated = await blogApi.unpublish(currentPost!.id);
        setPost(updated);
        await revalidate(updated.slug);
        showToast("success", "Terug naar concept gezet");
      } else {
        const updated = await blogApi.publish(currentPost!.id);
        setPost(updated);
        await revalidate(updated.slug);
        showToast("success", "Gepubliceerd! Zoekmachines worden geïnformeerd.");
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Publiceren mislukt");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const isPublished = post?.status === "published";
  const sectionLabel = section === "knowledge" ? "Kennisbank" : "Blog";

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => router.push(backPath)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar {sectionLabel}
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {post && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {isPublished ? "Gepubliceerd" : "Concept"}
            </span>
          )}
          {isDirty && (
            <span className="text-xs text-amber-600 font-medium">Niet opgeslagen</span>
          )}
          <Button
            variant="secondary"
            onClick={() => handleSave()}
            disabled={saving || publishing}
            className="border-slate-200"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1.5" />
            )}
            Opslaan
          </Button>
          <Button
            onClick={handlePublish}
            disabled={saving || publishing}
            className={
              isPublished
                ? "bg-slate-700 hover:bg-slate-800 text-white"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            }
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : isPublished ? (
              <FileText className="h-4 w-4 mr-1.5" />
            ) : (
              <Globe className="h-4 w-4 mr-1.5" />
            )}
            {isPublished ? "Naar concept" : "Publiceren"}
          </Button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            toast.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left: title + editor */}
        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsDirty(true);
            }}
            placeholder={`${sectionLabel}artikel titel…`}
            className="w-full text-3xl font-bold text-slate-900 placeholder-slate-300 border-0 border-b-2 border-slate-100 focus:border-indigo-400 focus:outline-none pb-3 bg-transparent transition-colors"
          />

          <BlogEditor
            ref={editorRef}
            content={content}
            onChange={(html) => {
              latestContentRef.current = html;
              setContent(html);
              setIsDirty(true);
            }}
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
          />
        </div>

        {/* Right: sidebar */}
        <div className="sticky top-24 space-y-4">
          {/* Header builder */}
          <HeaderBuilder
            title={title}
            values={header}
            onChange={handleHeaderChange}
            onImageUpload={handleImageUpload}
          />

          {/* Publicatiedatum */}
          <div className="border border-slate-200 rounded-xl bg-white p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <Calendar className="h-4 w-4 text-slate-500" />
              Publicatiedatum
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => {
                setPublishedAt(e.target.value);
                setIsDirty(true);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Leeg = datum wordt ingesteld op het moment van publiceren
            </p>
          </div>

          {/* SEO panel */}
          <SeoPanel
            title={title}
            content={content}
            section={section}
            values={seo}
            onChange={handleSeoChange}
            onInsertLink={handleInsertLink}
            onContentChange={(html) => {
              latestContentRef.current = html;
              setContent(html);
              // Force-update TipTap direct via ref, omzeilt React render-cycle
              editorRef.current?.setContent(html);
              setIsDirty(true);
            }}
            onAfterOptimize={handleAfterOptimize}
          />
        </div>
      </div>
    </div>
  );
}
