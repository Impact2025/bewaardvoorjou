"use client";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useAuth } from "@/store/auth-context";
import { useEffect, useState, useCallback, useMemo } from "react";
import { apiFetch, isApiError } from "@/lib/api-client";
import { API_BASE_URL } from "@/lib/config";
import { CHAPTERS } from "@/lib/chapters";
import {
  Video,
  Mic,
  Download,
  PlayCircle,
  FileText,
  Edit2,
  Eye,
  Trash2,
  Search,
  X,
  Clock,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Recording {
  id: string;
  chapter_id: string;
  modality: "video" | "audio" | "text";
  filename: string;
  duration_seconds?: number;
  size_bytes: number;
  storage_state: string;
  recorded_at: string;
  object_key?: string;
}

type TabFilter = "all" | "text" | "video" | "audio";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTotalDuration(totalSeconds: number): string {
  if (!totalSeconds) return "0 min";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h} uur ${m} min`;
  return `${m} min`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Vandaag";
  if (diffDays === 1) return "Gisteren";
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });
}

function estimateWordCount(sizeBytes: number): number {
  return Math.max(1, Math.round(sizeBytes / 5.5));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RecordingListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-neutral-sand bg-cream"
        >
          <Skeleton variant="rectangular" className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Skeleton variant="rectangular" className="h-9 w-9 rounded-xl" />
            <Skeleton variant="rectangular" className="h-9 w-9 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Recording Card ───────────────────────────────────────────────────────────

const MODALITY_CONFIG = {
  text: {
    icon: FileText,
    color: "text-warm-amber",
    bg: "bg-warm-amber/15",
    border: "hover:border-warm-amber/50",
    actionBg: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  },
  video: {
    icon: Video,
    color: "text-teal",
    bg: "bg-teal/15",
    border: "hover:border-teal/50",
    actionBg: "bg-teal-50 text-teal-600 hover:bg-teal-100",
  },
  audio: {
    icon: Mic,
    color: "text-orange",
    bg: "bg-orange/15",
    border: "hover:border-orange/50",
    actionBg: "bg-orange-50 text-orange-500 hover:bg-orange-100",
  },
};

interface RecordingCardProps {
  recording: Recording;
  isDeleting: boolean;
  onPlay: (r: Recording) => void;
  onView: (r: Recording) => void;
  onEdit: (r: Recording) => void;
  onDownload: (r: Recording) => void;
  onDelete: (r: Recording) => void;
}

function RecordingCard({
  recording,
  isDeleting,
  onPlay,
  onView,
  onEdit,
  onDownload,
  onDelete,
}: RecordingCardProps) {
  const chapter = CHAPTERS.find((ch) => ch.id === recording.chapter_id);
  const cfg = MODALITY_CONFIG[recording.modality];
  const Icon = cfg.icon;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border border-neutral-sand bg-cream transition-colors ${cfg.border}`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-lg ${cfg.bg} flex items-center justify-center`}
      >
        <Icon className={`h-5 w-5 ${cfg.color}`} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-slate-900 truncate text-sm">
            {chapter?.title || recording.chapter_id}
          </h4>
          {chapter?.phaseTitle && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium whitespace-nowrap shrink-0">
              {chapter.phaseTitle.split(":")[0]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-medium mt-0.5 flex-wrap">
          {recording.modality === "text" ? (
            <span>~{estimateWordCount(recording.size_bytes)} woorden</span>
          ) : recording.duration_seconds ? (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatDuration(recording.duration_seconds)}
            </span>
          ) : null}
          {(recording.modality === "text" || recording.duration_seconds) && <span>·</span>}
          <span className="flex items-center gap-0.5">
            <HardDrive className="h-3 w-3" />
            {formatFileSize(recording.size_bytes)}
          </span>
          <span>·</span>
          <span>{formatRelativeDate(recording.recorded_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {recording.modality === "text" ? (
          <>
            <ActionButton
              label="Bekijken"
              className={cfg.actionBg}
              onClick={() => onView(recording)}
            >
              <Eye className="h-4 w-4" />
            </ActionButton>
            <ActionButton
              label="Bewerken"
              className={cfg.actionBg}
              onClick={() => onEdit(recording)}
            >
              <Edit2 className="h-4 w-4" />
            </ActionButton>
          </>
        ) : (
          <>
            <ActionButton
              label="Afspelen"
              className={cfg.actionBg}
              onClick={() => onPlay(recording)}
            >
              <PlayCircle className="h-4 w-4" />
            </ActionButton>
            <ActionButton
              label="Downloaden"
              className="bg-slate-100 text-slate-600 hover:bg-slate-200"
              onClick={() => onDownload(recording)}
            >
              <Download className="h-4 w-4" />
            </ActionButton>
          </>
        )}
        <ActionButton
          label="Verwijderen"
          className="bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40"
          onClick={() => onDelete(recording)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </ActionButton>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  className,
  onClick,
  disabled,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors active:scale-95 ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  filter,
  hasSearch,
}: {
  filter: TabFilter;
  hasSearch: boolean;
}) {
  const Icon =
    filter === "video" ? Video : filter === "audio" ? Mic : filter === "text" ? FileText : Video;

  if (hasSearch) {
    return (
      <div className="py-16 text-center">
        <Search className="h-10 w-10 mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Geen resultaten gevonden</p>
        <p className="text-sm text-slate-400 mt-1">Probeer een andere zoekterm</p>
      </div>
    );
  }

  return (
    <div className="py-16 text-center">
      <Icon className="h-12 w-12 mx-auto text-slate-200 mb-4" />
      <h3 className="font-semibold text-slate-700 mb-1">
        {filter === "all" ? "Nog geen opnames" : `Nog geen ${filter === "text" ? "teksten" : filter === "video" ? "video's" : "audio opnames"}`}
      </h3>
      <p className="text-sm text-slate-400 mb-6">
        Ga naar een hoofdstuk om je eerste verhaal vast te leggen
      </p>
      <Button asChild className="btn-primary">
        <a href="/chapters">Verhaal starten</a>
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function RecordingsContent() {
  const { journey, isLoading: journeyLoading } = useJourneyBootstrap();
  const { session } = useAuth();
  const toast = useToast();

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  // Player
  const [playingRecording, setPlayingRecording] = useState<Recording | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [playingTranscript, setPlayingTranscript] = useState<string | null>(null);

  // Text viewer
  const [viewingRecording, setViewingRecording] = useState<Recording | null>(null);
  const [viewingContent, setViewingContent] = useState<string>("");
  const [viewingLoading, setViewingLoading] = useState(false);

  // Text editor
  const [editingRecording, setEditingRecording] = useState<Recording | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deleteCandidate, setDeleteCandidate] = useState<Recording | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch recordings ───────────────────────────────────────────────────────

  const fetchRecordings = useCallback(async () => {
    if (!journey?.id || !session?.token) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiFetch<Recording[]>(
        `/media/${journey.id}`,
        {},
        { token: session.token }
      );
      setRecordings(data);
    } catch {
      setLoadError("Kon opnames niet laden. Controleer je verbinding en probeer opnieuw.");
    } finally {
      setIsLoading(false);
    }
  }, [journey?.id, session?.token]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  // ── Media URL resolution ───────────────────────────────────────────────────

  const getMediaUrl = useCallback(
    (recording: Recording) => {
      const key =
        recording.object_key ||
        `${journey?.id}/${recording.chapter_id}/${recording.id}/${recording.filename}`;
      return `${API_BASE_URL}/media/file/${key}`;
    },
    [journey?.id]
  );

  const resolveMediaUrl = useCallback(
    async (recording: Recording): Promise<string> => {
      if (mediaUrls[recording.id]) return mediaUrls[recording.id];
      const url = getMediaUrl(recording);
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.type === "s3" && data.url) {
          setMediaUrls((prev) => ({ ...prev, [recording.id]: data.url }));
          return data.url;
        }
      } catch {
        // Direct FileResponse (local storage) — use original URL
      }
      return url;
    },
    [mediaUrls, getMediaUrl]
  );

  // ── Load text content ──────────────────────────────────────────────────────

  const loadTextContent = useCallback(
    async (recording: Recording): Promise<string> => {
      if (session?.token) {
        try {
          const transcript = await apiFetch<{ ready: boolean; text: string | null }>(
            `/media/${recording.id}/transcript`,
            {},
            { token: session.token }
          );
          if (transcript.ready && transcript.text) return transcript.text;
        } catch {
          // fall through
        }
      }
      const url = getMediaUrl(recording);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data.content) return data.content;
      if (data.type === "s3" && data.url) return await (await fetch(data.url)).text();
      return typeof data === "string" ? data : JSON.stringify(data);
    },
    [session?.token, getMediaUrl]
  );

  // ── Play ───────────────────────────────────────────────────────────────────

  const handlePlay = useCallback(
    async (recording: Recording) => {
      setPlayingRecording(recording);
      setPlayingUrl(null);
      setPlayingTranscript(null);
      const [url, transcript] = await Promise.allSettled([
        resolveMediaUrl(recording),
        session?.token
          ? apiFetch<{ ready: boolean; text: string | null }>(
              `/media/${recording.id}/transcript`,
              {},
              { token: session.token }
            ).then((t) => (t.ready && t.text ? t.text : null))
          : Promise.resolve(null),
      ]);
      setPlayingUrl(url.status === "fulfilled" ? url.value : null);
      setPlayingTranscript(
        transcript.status === "fulfilled" ? transcript.value : null
      );
    },
    [resolveMediaUrl, session?.token]
  );

  const closePlayer = useCallback(() => {
    setPlayingRecording(null);
    setPlayingUrl(null);
    setPlayingTranscript(null);
  }, []);

  // ── View text ──────────────────────────────────────────────────────────────

  const handleView = useCallback(
    async (recording: Recording) => {
      setViewingRecording(recording);
      setViewingContent("");
      setViewingLoading(true);
      try {
        const content = await loadTextContent(recording);
        setViewingContent(content);
      } catch {
        setViewingRecording(null);
        toast.error("Kon tekst niet laden", "Controleer je verbinding en probeer opnieuw.");
      } finally {
        setViewingLoading(false);
      }
    },
    [loadTextContent, toast]
  );

  // ── Edit text ──────────────────────────────────────────────────────────────

  const handleEdit = useCallback(
    async (recording: Recording) => {
      setEditingRecording(recording);
      setEditContent("");
      setEditLoading(true);
      try {
        const content = await loadTextContent(recording);
        setEditContent(content);
      } catch {
        setEditingRecording(null);
        toast.error("Kon tekst niet laden", "Controleer je verbinding en probeer opnieuw.");
      } finally {
        setEditLoading(false);
      }
    },
    [loadTextContent, toast]
  );

  const handleSaveText = useCallback(async () => {
    if (!editingRecording || !session?.token || !journey?.id) return;
    setIsSaving(true);
    try {
      const blob = new Blob([editContent], { type: "text/plain" });
      const presign = await apiFetch<{
        upload_url: string;
        asset_id: string;
        upload_method: "POST" | "PUT";
      }>(
        "/media/presign",
        {
          method: "POST",
          body: JSON.stringify({
            journey_id: journey.id,
            chapter_id: editingRecording.chapter_id,
            modality: "text",
            filename: editingRecording.filename,
            size_bytes: blob.size,
            checksum: "",
          }),
        },
        { token: session.token }
      );

      if (presign.upload_url.includes("/media/local-upload/")) {
        const fd = new FormData();
        fd.append("file", blob, editingRecording.filename);
        await fetch(presign.upload_url, { method: "PUT", body: fd });
      }

      await apiFetch(
        `/media/${presign.asset_id}/complete`,
        { method: "POST" },
        { token: session.token }
      );

      setEditingRecording(null);
      toast.success("Opgeslagen", "Je tekst is succesvol bijgewerkt.");
      fetchRecordings();
    } catch {
      toast.error("Opslaan mislukt", "Probeer het opnieuw.");
    } finally {
      setIsSaving(false);
    }
  }, [editingRecording, editContent, session?.token, journey?.id, fetchRecordings, toast]);

  // ── Download ───────────────────────────────────────────────────────────────

  const handleDownload = useCallback(
    async (recording: Recording) => {
      try {
        const url = await resolveMediaUrl(recording);
        const link = document.createElement("a");
        link.href = url;
        link.download = recording.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        toast.error("Download mislukt", "Probeer het opnieuw.");
      }
    },
    [resolveMediaUrl, toast]
  );

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCandidate || !session?.token) return;
    setIsDeleting(true);
    setDeletingId(deleteCandidate.id);
    try {
      await apiFetch(
        `/media/${deleteCandidate.id}`,
        { method: "DELETE" },
        { token: session.token }
      );
      setRecordings((prev) => prev.filter((r) => r.id !== deleteCandidate.id));
      if (playingRecording?.id === deleteCandidate.id) closePlayer();
      if (viewingRecording?.id === deleteCandidate.id) setViewingRecording(null);
      if (editingRecording?.id === deleteCandidate.id) setEditingRecording(null);
      toast.success("Verwijderd", "De opname is permanent verwijderd.");
    } catch (err) {
      let msg = "Probeer het opnieuw.";
      if (isApiError(err)) msg = err.message;
      else if (err instanceof Error) msg = err.message;
      toast.error("Verwijderen mislukt", msg);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
      setDeleteCandidate(null);
    }
  }, [deleteCandidate, session?.token, playingRecording, viewingRecording, editingRecording, closePlayer, toast]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = recordings;
    if (activeTab !== "all") list = list.filter((r) => r.modality === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const chapter = CHAPTERS.find((ch) => ch.id === r.chapter_id);
        return (
          (chapter?.title || r.chapter_id).toLowerCase().includes(q) ||
          (chapter?.phaseTitle || "").toLowerCase().includes(q)
        );
      });
    }
    return [...list].sort(
      (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
  }, [recordings, activeTab, searchQuery]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalDuration = recordings
      .filter((r) => r.modality !== "text")
      .reduce((sum, r) => sum + (r.duration_seconds || 0), 0);
    const totalSize = recordings.reduce((sum, r) => sum + r.size_bytes, 0);
    return { totalDuration, totalSize };
  }, [recordings]);

  const counts = useMemo(
    () => ({
      text: recordings.filter((r) => r.modality === "text").length,
      video: recordings.filter((r) => r.modality === "video").length,
      audio: recordings.filter((r) => r.modality === "audio").length,
    }),
    [recordings]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (journeyLoading) {
    return (
      <AppShell title="Mijn Opnames" activeHref="/recordings">
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <RecordingListSkeleton />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Mijn Opnames" description="Al je herinneringen op één plek" activeHref="/recordings">
      <div className="space-y-5">

        {/* Stats bar */}
        {recordings.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Opnames", value: recordings.length.toString() },
              { label: "Opgenomen", value: formatTotalDuration(stats.totalDuration) },
              { label: "Opgeslagen", value: formatFileSize(stats.totalSize) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-neutral-sand bg-cream p-3 text-center"
              >
                <div className="text-xl font-bold text-teal">{value}</div>
                <div className="text-xs text-medium mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{loadError}</p>
            </div>
            <button
              onClick={fetchRecordings}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Opnieuw
            </button>
          </div>
        )}

        {/* Tabs + search */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabFilter)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="bg-cream border border-neutral-sand w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-none text-xs">
                Alle {recordings.length > 0 && <span className="ml-1 text-slate-400">({recordings.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="text" className="flex-1 sm:flex-none text-xs">
                Tekst {counts.text > 0 && <span className="ml-1 text-slate-400">({counts.text})</span>}
              </TabsTrigger>
              <TabsTrigger value="video" className="flex-1 sm:flex-none text-xs">
                Video {counts.video > 0 && <span className="ml-1 text-slate-400">({counts.video})</span>}
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex-1 sm:flex-none text-xs">
                Audio {counts.audio > 0 && <span className="ml-1 text-slate-400">({counts.audio})</span>}
              </TabsTrigger>
            </TabsList>

            {recordings.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Zoek op hoofdstuk…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-52 pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-sand bg-cream focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          {/* List */}
          {(["all", "text", "video", "audio"] as TabFilter[]).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {isLoading ? (
                <RecordingListSkeleton />
              ) : filtered.length === 0 ? (
                <EmptyState filter={activeTab} hasSearch={searchQuery.trim().length > 0} />
              ) : (
                <div className="space-y-2.5">
                  {filtered.map((recording) => (
                    <RecordingCard
                      key={recording.id}
                      recording={recording}
                      isDeleting={deletingId === recording.id}
                      onPlay={handlePlay}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDownload={handleDownload}
                      onDelete={setDeleteCandidate}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* ── Player Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!playingRecording}
        onClose={closePlayer}
        size="xl"
        title={
          playingRecording
            ? CHAPTERS.find((c) => c.id === playingRecording.chapter_id)?.title ||
              playingRecording.chapter_id
            : ""
        }
        description={
          playingRecording
            ? `${formatRelativeDate(playingRecording.recorded_at)} · ${formatFileSize(playingRecording.size_bytes)}`
            : ""
        }
      >
        {playingRecording && (
          <div className="space-y-4">
            {playingRecording.modality === "video" ? (
              playingUrl ? (
                <video
                  controls
                  autoPlay
                  className="w-full rounded-xl bg-black aspect-video"
                  src={playingUrl}
                />
              ) : (
                <div className="w-full aspect-video rounded-xl bg-slate-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                </div>
              )
            ) : (
              <div className="bg-cream rounded-xl p-6">
                <div className="flex justify-center mb-5">
                  <div className="h-16 w-16 rounded-full bg-orange/15 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-orange" />
                  </div>
                </div>
                {playingUrl ? (
                  <audio controls autoPlay className="w-full" src={playingUrl} />
                ) : (
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>
            )}

            {playingTranscript && (
              <div className="rounded-xl border border-neutral-sand bg-cream p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Transcriptie
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {playingTranscript}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── View Text Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={!!viewingRecording}
        onClose={() => setViewingRecording(null)}
        size="xl"
        title={
          viewingRecording
            ? CHAPTERS.find((c) => c.id === viewingRecording.chapter_id)?.title ||
              viewingRecording.chapter_id
            : ""
        }
        description={
          viewingRecording ? formatRelativeDate(viewingRecording.recorded_at) : ""
        }
      >
        {viewingRecording && (
          <div className="space-y-4">
            {viewingLoading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="bg-cream rounded-xl p-5">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {viewingContent}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setViewingRecording(null)}>
                Sluiten
              </Button>
              <Button
                className="btn-primary"
                onClick={() => {
                  setViewingRecording(null);
                  handleEdit(viewingRecording);
                }}
                disabled={viewingLoading}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Text Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editingRecording}
        onClose={() => !isSaving && setEditingRecording(null)}
        size="xl"
        title="Tekst bewerken"
        description={
          editingRecording
            ? CHAPTERS.find((c) => c.id === editingRecording.chapter_id)?.title ||
              editingRecording.chapter_id
            : ""
        }
        closeOnOverlayClick={!isSaving}
      >
        {editingRecording && (
          <div className="space-y-4">
            {editLoading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSaving}
                rows={12}
                className="w-full resize-none rounded-xl border-2 border-input-border bg-cream px-4 py-3 text-base leading-relaxed focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-50"
                placeholder="Schrijf hier je tekst…"
                autoFocus
              />
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-medium">
                {editContent.trim().split(/\s+/).filter(Boolean).length} woorden
              </span>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setEditingRecording(null)}
                  disabled={isSaving}
                >
                  Annuleren
                </Button>
                <Button
                  className="btn-primary"
                  onClick={handleSaveText}
                  disabled={isSaving || editLoading || !editContent.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opslaan…
                    </>
                  ) : (
                    "Opslaan"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteCandidate}
        onClose={() => !isDeleting && setDeleteCandidate(null)}
        size="sm"
        title="Opname verwijderen"
        closeOnOverlayClick={!isDeleting}
      >
        {deleteCandidate && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">
                Weet je zeker dat je{" "}
                <span className="font-semibold">
                  {CHAPTERS.find((c) => c.id === deleteCandidate.chapter_id)?.title ||
                    deleteCandidate.chapter_id}
                </span>{" "}
                wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
              >
                Annuleren
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verwijderen…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Definitief verwijderen
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}

export default function RecordingsPage() {
  return (
    <ProtectedRoute>
      <RecordingsContent />
    </ProtectedRoute>
  );
}
