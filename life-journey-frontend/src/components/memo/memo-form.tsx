"use client";

import { useState } from "react";
import { Memo, ChapterId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CHAPTERS } from "@/lib/chapters";
import { X } from "lucide-react";

interface MemoFormProps {
  memo?: Memo;
  onSubmit: (data: { title: string; content: string; chapterId?: ChapterId }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function MemoForm({ memo, onSubmit, onCancel, isLoading }: MemoFormProps) {
  const [title, setTitle] = useState(memo?.title || "");
  const [content, setContent] = useState(memo?.content || "");
  const [chapterId, setChapterId] = useState<ChapterId | "">(memo?.chapterId || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Titel is verplicht");
      return;
    }

    if (!content.trim()) {
      setError("Inhoud is verplicht");
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        chapterId: chapterId || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card-background rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-card-border">
        <div className="sticky top-0 bg-card-background border-b border-card-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold text-heading">
            {memo ? "Memo bewerken" : "Nieuwe memo"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-coral/10 border border-coral/30 rounded-2xl p-4">
              <p className="text-sm text-coral">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-heading">
              Titel
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Geef je memo een titel..."
              maxLength={200}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-subtle">{title.length}/200 tekens</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter" className="text-sm font-medium text-heading">
              Hoofdstuk (optioneel)
            </Label>
            <select
              id="chapter"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value as ChapterId | "")}
              disabled={isLoading}
              className="w-full rounded-2xl border border-input-border bg-input-background px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-teal/50 disabled:opacity-50"
            >
              <option value="">Geen hoofdstuk</option>
              {CHAPTERS.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.phaseTitle} • {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-heading">
              Inhoud
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schrijf hier je notities, gedachten of extra informatie..."
              rows={12}
              disabled={isLoading}
              className="w-full resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
              className="bg-teal hover:bg-teal/90"
            >
              {isLoading ? "Bezig..." : memo ? "Opslaan" : "Memo maken"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
