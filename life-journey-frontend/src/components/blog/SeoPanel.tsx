"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Link2,
  ExternalLink,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogApi, type InternalLinkSuggestion, type ExternalLinkSuggestion, type SeoOptimizeResult } from "@/lib/api/blog";

interface SeoPanelProps {
  title: string;
  content: string;
  section: string;
  values: {
    slug: string;
    excerpt: string;
    meta_title: string;
    meta_description: string;
    keywords: string;
    tags: string;
    og_image: string;
  };
  onChange: (field: string, value: string) => void;
  onInsertLink?: (href: string, text: string) => void;
}

export function SeoPanel({ title, content, section, values, onChange, onInsertLink }: SeoPanelProps) {
  const [open, setOpen] = useState(true);
  const [linksOpen, setLinksOpen] = useState(false);
  const [extLinksOpen, setExtLinksOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SeoOptimizeResult | null>(null);
  const [existingPosts, setExistingPosts] = useState<{ slug: string; title: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Laad gepubliceerde posts voor interne links
  useEffect(() => {
    blogApi
      .list("published")
      .then((posts) => setExistingPosts(posts.map((p) => ({ slug: p.slug, title: p.title }))))
      .catch(() => {});
  }, []);

  const handleAiOptimize = async () => {
    if (!title.trim()) {
      setError("Vul eerst een titel in voordat je SEO optimaliseert.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await blogApi.seoOptimize({
        title,
        content,
        excerpt: values.excerpt || undefined,
        existing_keywords: values.keywords || undefined,
        existing_posts: existingPosts.length > 0 ? existingPosts : undefined,
      });
      setLastResult(result);
      onChange("meta_title", result.meta_title);
      onChange("meta_description", result.meta_description);
      onChange("keywords", result.keywords);
      onChange("tags", result.tags);
      onChange("excerpt", result.excerpt);
      if (!values.slug) onChange("slug", result.slug);
      if (result.internal_links?.length > 0) setLinksOpen(true);
      if (result.external_links?.length > 0) setExtLinksOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI SEO fout");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (slug: string, linkTitle: string) => {
    const base = section === "knowledge" ? "kennisbank" : "blog";
    const md = `[${linkTitle}](/${base}/${slug})`;
    navigator.clipboard.writeText(md).then(() => {
      setCopied(slug);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const copyExternalLink = (url: string, linkTitle: string) => {
    const md = `[${linkTitle}](${url})`;
    navigator.clipboard.writeText(md).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const metaDescLen = values.meta_description?.length ?? 0;
  const metaTitleLen = values.meta_title?.length ?? 0;

  return (
    <div className="space-y-3">
      {/* SEO & Meta panel */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">SEO & Meta</span>
            <SeoScore values={values} />
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {open && (
          <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
            {/* AI button */}
            <div className="pt-4">
              <Button
                type="button"
                onClick={handleAiOptimize}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {loading ? "AI analyseert…" : "AI SEO Optimaliseren"}
              </Button>
              <p className="text-xs text-slate-400 mt-1.5 text-center">
                Genereert meta tags, keywords, excerpt, interne én externe links
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {lastResult && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                SEO-velden bijgewerkt door AI
              </div>
            )}

            {/* Slug */}
            <Field label="Slug / URL">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 whitespace-nowrap">
                  /{section === "knowledge" ? "kennisbank" : "blog"}/
                </span>
                <input
                  value={values.slug}
                  onChange={(e) => onChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                  placeholder="mijn-artikel"
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </Field>

            {/* Excerpt */}
            <Field label="Excerpt">
              <textarea
                value={values.excerpt}
                onChange={(e) => onChange("excerpt", e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Korte samenvatting voor zoekresultaten…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <span className="text-xs text-slate-400">{values.excerpt?.length ?? 0}/500</span>
            </Field>

            {/* Meta Title */}
            <Field label="Meta Title">
              <input
                value={values.meta_title}
                onChange={(e) => onChange("meta_title", e.target.value)}
                maxLength={70}
                placeholder="SEO-titel (max 60 tekens)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <LengthIndicator current={metaTitleLen} ideal={60} max={70} />
            </Field>

            {/* Meta Description */}
            <Field label="Meta Description">
              <textarea
                value={values.meta_description}
                onChange={(e) => onChange("meta_description", e.target.value)}
                rows={3}
                maxLength={160}
                placeholder="Beschrijving in zoekresultaten (140-155 tekens ideaal)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <LengthIndicator current={metaDescLen} ideal={155} max={160} />
            </Field>

            {/* Keywords */}
            <Field label="Keywords" hint="kommagescheiden">
              <input
                value={values.keywords}
                onChange={(e) => onChange("keywords", e.target.value)}
                placeholder="levensverhaal, herinneringen, familie"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>

            {/* Tags */}
            <Field label="Tags" hint="kommagescheiden">
              <input
                value={values.tags}
                onChange={(e) => onChange("tags", e.target.value)}
                placeholder="herinneringen, familie, tips"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>

            {/* OG Image */}
            <Field label="OG Afbeelding URL">
              <input
                value={values.og_image}
                onChange={(e) => onChange("og_image", e.target.value)}
                placeholder="https://… (wordt auto-ingesteld bij header-upload)"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </Field>

            {/* Google Preview */}
            {(values.meta_title || values.meta_description) && (
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Google Preview</p>
                <div className="space-y-1">
                  <p className="text-blue-600 text-base font-medium line-clamp-1">
                    {values.meta_title || title || "Paginatitel"}
                  </p>
                  <p className="text-green-700 text-xs">
                    bewaardvoorjou.nl/{section === "knowledge" ? "kennisbank" : "blog"}/{values.slug || "slug"}
                  </p>
                  <p className="text-slate-600 text-sm line-clamp-2">
                    {values.meta_description || "Meta description…"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Internal Links panel */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setLinksOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-slate-500" />
            <span className="font-semibold text-slate-800">Interne Links</span>
            {lastResult?.internal_links?.length ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {lastResult.internal_links.length} suggesties
              </span>
            ) : null}
          </div>
          {linksOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {linksOpen && (
          <div className="px-5 pb-5 border-t border-slate-100 space-y-4">
            {/* AI suggestions */}
            {lastResult?.internal_links?.length ? (
              <div className="pt-4 space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">AI Suggesties</p>
                {lastResult.internal_links.map((link) => {
                  const base = section === "knowledge" ? "kennisbank" : "blog";
                  const href = `/${base}/${link.slug}`;
                  return (
                    <LinkRow
                      key={link.slug}
                      link={link}
                      section={section}
                      copied={copied === link.slug}
                      onCopy={() => copyLink(link.slug, link.title)}
                      onInsert={onInsertLink ? () => onInsertLink(href, link.title) : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="pt-4 text-xs text-slate-400">
                Klik op "AI SEO Optimaliseren" om automatisch interne link-suggesties te ontvangen.
              </p>
            )}

            {/* All published posts */}
            {existingPosts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Alle gepubliceerde artikelen
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {existingPosts.map((post) => {
                    const base = section === "knowledge" ? "kennisbank" : "blog";
                    const href = `/${base}/${post.slug}`;
                    return (
                      <LinkRow
                        key={post.slug}
                        link={{ slug: post.slug, title: post.title, reason: "" }}
                        section={section}
                        copied={copied === post.slug}
                        onCopy={() => copyLink(post.slug, post.title)}
                        onInsert={onInsertLink ? () => onInsertLink(href, post.title) : undefined}
                        compact
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Kopieer als Markdown-link en plak in de editor.
            </p>
          </div>
        )}
      </div>

      {/* External Links panel */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setExtLinksOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-slate-500" />
            <span className="font-semibold text-slate-800">Externe Links</span>
            {lastResult?.external_links?.length ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                {lastResult.external_links.length} suggesties
              </span>
            ) : null}
          </div>
          {extLinksOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {extLinksOpen && (
          <div className="px-5 pb-5 border-t border-slate-100 space-y-4">
            {lastResult?.external_links?.length ? (
              <div className="pt-4 space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">AI Suggesties</p>
                {lastResult.external_links.map((link) => (
                  <div key={link.url} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{link.title}</p>
                      <p className="text-xs text-slate-400 truncate">{link.url}</p>
                      {link.reason && (
                        <p className="text-xs text-emerald-600 mt-0.5">{link.reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {onInsertLink && (
                        <button
                          type="button"
                          onClick={() => onInsertLink(link.url, link.title)}
                          title="Invoegen in editor"
                          className="p-1.5 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => copyExternalLink(link.url, link.title)}
                        title="Kopieer als Markdown link"
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        {copied === link.url ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="pt-4 text-xs text-slate-400">
                Klik op "AI SEO Optimaliseren" om automatisch externe link-suggesties te ontvangen.
              </p>
            )}
            <p className="text-xs text-slate-400">
              Kopieer als Markdown-link en plak in de editor. Externe links naar gezaghebbende bronnen versterken je SEO.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LinkRow({
  link,
  section,
  copied,
  onCopy,
  onInsert,
  compact = false,
}: {
  link: InternalLinkSuggestion;
  section: string;
  copied: boolean;
  onCopy: () => void;
  onInsert?: () => void;
  compact?: boolean;
}) {
  const base = section === "knowledge" ? "kennisbank" : "blog";
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{link.title}</p>
        <p className="text-xs text-slate-400">/{base}/{link.slug}</p>
        {!compact && link.reason && (
          <p className="text-xs text-indigo-600 mt-0.5">{link.reason}</p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onInsert && (
          <button
            type="button"
            onClick={onInsert}
            title="Invoegen in editor"
            className="p-1.5 rounded text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onCopy}
          title="Kopieer als Markdown link"
          className="p-1.5 rounded text-slate-400 hover:text-slate-700 transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {label}
        {hint && <span className="text-xs font-normal text-slate-400">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function LengthIndicator({ current, ideal, max }: { current: number; ideal: number; max: number }) {
  const color =
    current === 0
      ? "text-slate-400"
      : current <= ideal
      ? "text-green-600"
      : current <= max
      ? "text-amber-600"
      : "text-red-600";
  return (
    <span className={`text-xs ${color}`}>
      {current}/{max} tekens{current > 0 && current <= ideal && " ✓"}
    </span>
  );
}

function SeoScore({ values }: { values: SeoPanelProps["values"] }) {
  const fields = [values.slug, values.excerpt, values.meta_title, values.meta_description, values.keywords];
  const filled = fields.filter(Boolean).length;
  const score = Math.round((filled / fields.length) * 100);
  const color =
    score < 40
      ? "bg-red-100 text-red-700"
      : score < 80
      ? "bg-amber-100 text-amber-700"
      : "bg-green-100 text-green-700";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      SEO {score}%
    </span>
  );
}
