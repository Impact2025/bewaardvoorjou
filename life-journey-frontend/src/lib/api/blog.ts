/**
 * Blog + Kennisbank API client
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_session") ?? sessionStorage.getItem("auth_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw).access_token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface BlogPost {
  id: string;
  author_id: string;
  section: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  header_type: "color" | "image";
  header_color: string | null;
  header_text_color: string | null;
  header_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  keywords: string | null;
  tags: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface BlogPostListItem {
  id: string;
  section: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

export interface BlogPostCreate {
  title: string;
  slug: string;
  content: string;
  section?: string;
  excerpt?: string;
  header_type?: string;
  header_color?: string;
  header_text_color?: string;
  header_image_url?: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  keywords?: string;
  tags?: string;
  published_at?: string | null;
}

export type BlogPostUpdate = Partial<BlogPostCreate>;

export interface InternalLinkSuggestion {
  slug: string;
  title: string;
  reason: string;
}

export interface ExternalLinkSuggestion {
  url: string;
  title: string;
  reason: string;
}

export interface SeoOptimizeResult {
  meta_title: string;
  meta_description: string;
  keywords: string;
  tags: string;
  excerpt: string;
  slug: string;
  internal_links: InternalLinkSuggestion[];
  external_links: ExternalLinkSuggestion[];
}

export const blogApi = {
  list: (status?: string, section?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (section) params.set("section", section);
    const qs = params.toString();
    return apiFetch<BlogPostListItem[]>(`/blog${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => apiFetch<BlogPost>(`/blog/${id}`),

  create: (data: BlogPostCreate) =>
    apiFetch<BlogPost>("/blog", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: BlogPostUpdate) =>
    apiFetch<BlogPost>(`/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) => apiFetch<void>(`/blog/${id}`, { method: "DELETE" }),

  publish: (id: string) =>
    apiFetch<BlogPost>(`/blog/${id}/publish`, { method: "POST" }),

  unpublish: (id: string) =>
    apiFetch<BlogPost>(`/blog/${id}/unpublish`, { method: "POST" }),

  seoOptimize: (payload: {
    title: string;
    content: string;
    excerpt?: string;
    existing_keywords?: string;
    existing_posts?: { slug: string; title: string }[];
  }) =>
    apiFetch<SeoOptimizeResult>("/blog/seo-optimize", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadImage: async (file: File): Promise<string> => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/blog/images/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Upload mislukt");
    }
    const { url } = await res.json();
    return url as string;
  },

  uploadVideo: async (file: File): Promise<string> => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/blog/videos/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Video upload mislukt");
    }
    const { url } = await res.json();
    return url as string;
  },
};
