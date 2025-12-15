"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useAuth } from "@/store/auth-context";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Video, Mic, Download, PlayCircle, FileText, Edit2, Eye, Trash2 } from "lucide-react";
import { CHAPTERS } from "@/lib/chapters";
import { isApiError } from "@/lib/api-client";

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "Onbekend";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function RecordingsContent() {
  const { journey, isLoading: journeyLoading } = useJourneyBootstrap();
  const { session } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingRecording, setPlayingRecording] = useState<Recording | null>(null);
  const [viewingText, setViewingText] = useState<{ recording: Recording; content: string } | null>(null);
  const [editingText, setEditingText] = useState<{ recording: Recording; content: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!journey?.id || !session?.token) return;

    const fetchRecordings = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch<Recording[]>(
          `/media/${journey.id}`,
          {},
          { token: session.token }
        );
        setRecordings(data);
      } catch (err) {
        console.error("Failed to fetch recordings:", err);
        setError("Kon opnames niet laden");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [journey?.id, session?.token]);

  const getChapterInfo = (chapterId: string) => {
    return CHAPTERS.find((ch) => ch.id === chapterId);
  };

  const getMediaUrl = (recording: Recording) => {
    // For local storage, use object_key
    const objectKey = recording.object_key || `${journey?.id}/${recording.chapter_id}/${recording.id}/${recording.filename}`;
    return `http://localhost:8000/api/v1/media/local-file/${objectKey}`;
  };

  const handleDownload = (recording: Recording) => {
    const url = getMediaUrl(recording);
    const link = document.createElement("a");
    link.href = url;
    link.download = recording.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewText = async (recording: Recording) => {
    try {
      const url = getMediaUrl(recording);
      const response = await fetch(url);
      const text = await response.text();
      setViewingText({ recording, content: text });
    } catch (err) {
      console.error("Failed to load text:", err);
      alert("Kon tekst niet laden");
    }
  };

  const handleEditText = async (recording: Recording) => {
    try {
      const url = getMediaUrl(recording);
      const response = await fetch(url);
      const text = await response.text();
      setEditingText({ recording, content: text });
    } catch (err) {
      console.error("Failed to load text:", err);
      alert("Kon tekst niet laden");
    }
  };

  const handleDeleteRecording = async (recording: Recording) => {
    if (!session?.token) return;

    const confirmed = confirm(
      `Weet je zeker dat je deze ${recording.modality === "text" ? "tekst" : "opname"} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`
    );

    if (!confirmed) return;

    setDeletingId(recording.id);
    try {
      console.log("Deleting recording:", recording.id);
      const response = await apiFetch(
        `/media/${recording.id}`,
        { method: "DELETE" },
        { token: session.token }
      );
      console.log("Delete response:", response);

      // Remove from local state
      setRecordings(recordings.filter(r => r.id !== recording.id));

      // Close modals if this recording was being viewed
      if (playingRecording?.id === recording.id) {
        setPlayingRecording(null);
      }
      if (viewingText?.recording.id === recording.id) {
        setViewingText(null);
      }
      if (editingText?.recording.id === recording.id) {
        setEditingText(null);
      }

      console.log("Recording deleted successfully");
    } catch (err) {
      console.error("Failed to delete recording:", err);

      let errorMessage = "Onbekende fout";
      if (isApiError(err)) {
        errorMessage = err.message;
        console.error("API Error:", {
          status: err.status,
          code: err.code,
          message: err.message,
          details: err.details
        });
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      alert(`Verwijderen mislukt: ${errorMessage}. Probeer het opnieuw.`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveText = async () => {
    if (!editingText || !session?.token) return;

    setIsSaving(true);
    try {
      // Create a new text blob with updated content
      const textBlob = new Blob([editingText.content], { type: 'text/plain' });

      // Upload using the same presign flow
      const presignResponse = await apiFetch<{
        upload_url: string;
        asset_id: string;
        upload_method: "POST" | "PUT";
        fields?: Record<string, string>;
      }>(
        "/media/presign",
        {
          method: "POST",
          body: JSON.stringify({
            journey_id: journey?.id,
            chapter_id: editingText.recording.chapter_id,
            modality: "text",
            filename: editingText.recording.filename,
            size_bytes: textBlob.size,
            checksum: "",
          }),
        },
        { token: session.token },
      );

      // Upload the updated text
      if (presignResponse.upload_url.includes("/media/local-upload/")) {
        const formData = new FormData();
        formData.append("file", textBlob, editingText.recording.filename);
        await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: formData,
        });
      }

      // Complete the upload
      await apiFetch(
        `/media/${presignResponse.asset_id}/complete`,
        { method: "POST" },
        { token: session.token },
      );

      alert("Tekst succesvol bijgewerkt!");
      setEditingText(null);

      // Refresh recordings
      const data = await apiFetch<Recording[]>(
        `/media/${journey?.id}`,
        {},
        { token: session.token }
      );
      setRecordings(data);
    } catch (err) {
      console.error("Failed to save text:", err);
      alert("Opslaan mislukt");
    } finally {
      setIsSaving(false);
    }
  };

  if (journeyLoading || isLoading) {
    return (
      <AppShell title="Mijn Opnames" description="Al je herinneringen op één plek" activeHref="/recordings">
        <Card className="bg-card border-neutral-sand">
          <CardHeader>
            <CardTitle>Bezig met laden…</CardTitle>
            <CardDescription>We halen je opnames op.</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Mijn Opnames" description="Al je herinneringen op één plek" activeHref="/recordings">
        <Card className="bg-card border-neutral-sand">
          <CardHeader>
            <CardTitle>Fout bij laden</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  const videoRecordings = recordings.filter((r) => r.modality === "video");
  const audioRecordings = recordings.filter((r) => r.modality === "audio");
  const textRecordings = recordings.filter((r) => r.modality === "text");

  return (
    <AppShell
      title="Mijn Opnames"
      description="Bekijk al je video's en audio opnames"
      activeHref="/recordings"
    >
      <div className="space-y-8">
        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-neutral-sand">
            <CardHeader className="pb-3">
              <CardDescription>Totaal</CardDescription>
              <CardTitle className="text-3xl text-teal">{recordings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium">opnames</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-neutral-sand">
            <CardHeader className="pb-3">
              <CardDescription>Tekst</CardDescription>
              <CardTitle className="text-3xl text-warm-amber">{textRecordings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium">tekst opnames</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-neutral-sand">
            <CardHeader className="pb-3">
              <CardDescription>Video's</CardDescription>
              <CardTitle className="text-3xl text-teal">{videoRecordings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium">video opnames</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-neutral-sand">
            <CardHeader className="pb-3">
              <CardDescription>Audio</CardDescription>
              <CardTitle className="text-3xl text-orange">{audioRecordings.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medium">audio opnames</p>
            </CardContent>
          </Card>
        </div>

        {/* Recordings List */}
        {recordings.length === 0 ? (
          <Card className="bg-card border-neutral-sand">
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 mx-auto text-neutral-sand mb-4" />
              <h3 className="text-heading text-xl mb-2">Nog geen opnames</h3>
              <p className="text-medium mb-6">
                Ga naar een hoofdstuk om je eerste verhaal op te nemen
              </p>
              <Button asChild className="btn-primary">
                <a href="/chapters">Start opname</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Text Recordings */}
            {textRecordings.length > 0 && (
              <Card className="bg-card border-neutral-sand">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-warm-amber" />
                    <CardTitle>Tekst Opnames</CardTitle>
                  </div>
                  <CardDescription>{textRecordings.length} teksten</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {textRecordings.map((recording) => {
                      const chapter = getChapterInfo(recording.chapter_id);
                      const words = Math.ceil(recording.size_bytes / 5); // Rough estimate: 5 bytes per word
                      return (
                        <div
                          key={recording.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-neutral-sand bg-cream hover:border-warm-amber/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-warm-amber/20 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-warm-amber" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {chapter?.title || recording.chapter_id}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-medium mt-1">
                                <span>~{words} woorden</span>
                                <span>•</span>
                                <span>{formatFileSize(recording.size_bytes)}</span>
                                <span>•</span>
                                <span>{new Date(recording.recorded_at).toLocaleDateString("nl-NL")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-warm-amber hover:text-warm-amber/80"
                              onClick={() => handleViewText(recording)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-warm-amber hover:text-warm-amber/80"
                              onClick={() => handleEditText(recording)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900"
                              onClick={() => handleDownload(recording)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteRecording(recording)}
                              disabled={deletingId === recording.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Recordings */}
            {videoRecordings.length > 0 && (
              <Card className="bg-card border-neutral-sand">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-teal" />
                    <CardTitle>Video Opnames</CardTitle>
                  </div>
                  <CardDescription>{videoRecordings.length} video's</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {videoRecordings.map((recording) => {
                      const chapter = getChapterInfo(recording.chapter_id);
                      return (
                        <div
                          key={recording.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-neutral-sand bg-cream hover:border-teal/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-teal/20 flex items-center justify-center">
                              <Video className="h-6 w-6 text-teal" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {chapter?.title || recording.chapter_id}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-medium mt-1">
                                <span>{formatFileSize(recording.size_bytes)}</span>
                                <span>•</span>
                                <span>{formatDuration(recording.duration_seconds)}</span>
                                <span>•</span>
                                <span>{new Date(recording.recorded_at).toLocaleDateString("nl-NL")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-teal hover:text-teal-dark"
                              onClick={() => setPlayingRecording(recording)}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900"
                              onClick={() => handleDownload(recording)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteRecording(recording)}
                              disabled={deletingId === recording.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Recordings */}
            {audioRecordings.length > 0 && (
              <Card className="bg-card border-neutral-sand">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-orange" />
                    <CardTitle>Audio Opnames</CardTitle>
                  </div>
                  <CardDescription>{audioRecordings.length} audio fragmenten</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {audioRecordings.map((recording) => {
                      const chapter = getChapterInfo(recording.chapter_id);
                      return (
                        <div
                          key={recording.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-neutral-sand bg-cream hover:border-orange/40 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-orange/20 flex items-center justify-center">
                              <Mic className="h-6 w-6 text-orange" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900">
                                {chapter?.title || recording.chapter_id}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-medium mt-1">
                                <span>{formatFileSize(recording.size_bytes)}</span>
                                <span>•</span>
                                <span>{formatDuration(recording.duration_seconds)}</span>
                                <span>•</span>
                                <span>{new Date(recording.recorded_at).toLocaleDateString("nl-NL")}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange hover:text-orange-dark"
                              onClick={() => setPlayingRecording(recording)}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-600 hover:text-slate-900"
                              onClick={() => handleDownload(recording)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteRecording(recording)}
                              disabled={deletingId === recording.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Player Modal */}
        {playingRecording && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPlayingRecording(null)}
          >
            <div
              className="bg-card rounded-card p-6 max-w-2xl w-full card-shadow-hover"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-heading text-xl">
                    {getChapterInfo(playingRecording.chapter_id)?.title || playingRecording.chapter_id}
                  </h3>
                  <p className="text-sm text-medium">
                    {new Date(playingRecording.recorded_at).toLocaleDateString("nl-NL")} • {formatFileSize(playingRecording.size_bytes)}
                  </p>
                </div>
                <button
                  onClick={() => setPlayingRecording(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {playingRecording.modality === "video" ? (
                <video
                  controls
                  autoPlay
                  className="w-full rounded-lg bg-black"
                  src={getMediaUrl(playingRecording)}
                >
                  Je browser ondersteunt geen video playback.
                </video>
              ) : (
                <div className="bg-cream p-8 rounded-lg">
                  <div className="flex items-center justify-center mb-6">
                    <Mic className="h-16 w-16 text-orange" />
                  </div>
                  <audio
                    controls
                    autoPlay
                    className="w-full"
                    src={getMediaUrl(playingRecording)}
                  >
                    Je browser ondersteunt geen audio playback.
                  </audio>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Text Modal */}
        {viewingText && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewingText(null)}
          >
            <div
              className="bg-card rounded-card p-6 max-w-3xl w-full card-shadow-hover max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-heading text-xl">
                    {getChapterInfo(viewingText.recording.chapter_id)?.title || viewingText.recording.chapter_id}
                  </h3>
                  <p className="text-sm text-medium">
                    {new Date(viewingText.recording.recorded_at).toLocaleDateString("nl-NL")} • {formatFileSize(viewingText.recording.size_bytes)}
                  </p>
                </div>
                <button
                  onClick={() => setViewingText(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-cream p-6 rounded-lg">
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {viewingText.content}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => setViewingText(null)}
                >
                  Sluiten
                </Button>
                <Button
                  className="btn-primary"
                  onClick={() => {
                    handleEditText(viewingText.recording);
                    setViewingText(null);
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Bewerken
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Text Modal */}
        {editingText && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isSaving && setEditingText(null)}
          >
            <div
              className="bg-card rounded-card p-6 max-w-3xl w-full card-shadow-hover max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-heading text-xl">
                    Tekst bewerken
                  </h3>
                  <p className="text-sm text-medium">
                    {getChapterInfo(editingText.recording.chapter_id)?.title || editingText.recording.chapter_id}
                  </p>
                </div>
                <button
                  onClick={() => !isSaving && setEditingText(null)}
                  disabled={isSaving}
                  className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <textarea
                value={editingText.content}
                onChange={(e) => setEditingText({ ...editingText, content: e.target.value })}
                disabled={isSaving}
                className="flex-1 w-full resize-none rounded-xl border-2 border-input-border bg-cream px-4 py-3 text-input text-base leading-relaxed focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30 disabled:opacity-50"
                placeholder="Schrijf hier je tekst..."
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-medium">
                  {editingText.content.trim().split(/\s+/).filter(w => w.length > 0).length} woorden
                </span>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingText(null)}
                    disabled={isSaving}
                  >
                    Annuleren
                  </Button>
                  <Button
                    className="btn-primary"
                    onClick={handleSaveText}
                    disabled={isSaving || !editingText.content.trim()}
                  >
                    {isSaving ? "Opslaan..." : "Opslaan"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
