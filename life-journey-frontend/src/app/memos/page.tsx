"use client";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { MemoList } from "@/components/memo/memo-list";
import { MemoForm } from "@/components/memo/memo-form";
import { useState, useEffect, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { Memo, ChapterId } from "@/lib/types";
import { fetchMemos, createMemo, updateMemo, deleteMemo } from "@/lib/memos-client";
import { useAuth } from "@/store/auth-context";
import { CHAPTERS } from "@/lib/chapters";
import { Input } from "@/components/ui/input";

function MemosContent() {
  const { journey, isLoading: journeyLoading, error: journeyError } = useJourneyBootstrap();
  const { session } = useAuth();

  const [memos, setMemos] = useState<Memo[]>([]);
  const [filteredMemos, setFilteredMemos] = useState<Memo[]>([]);
  const [isLoadingMemos, setIsLoadingMemos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [filterChapter, setFilterChapter] = useState<ChapterId | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadMemos = useCallback(async () => {
    if (!journey?.id || !session?.token) return;

    try {
      setIsLoadingMemos(true);
      setError(null);
      const data = await fetchMemos(journey.id, session.token);
      setMemos(data);
      setFilteredMemos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon memo's niet laden");
    } finally {
      setIsLoadingMemos(false);
    }
  }, [journey?.id, session?.token]);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  // Filter and search memos
  useEffect(() => {
    let filtered = memos;

    // Filter by chapter
    if (filterChapter) {
      filtered = filtered.filter((memo) => memo.chapterId === filterChapter);
    }

    // Search by title or content
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (memo) =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query)
      );
    }

    setFilteredMemos(filtered);
  }, [memos, filterChapter, searchQuery]);

  const handleCreate = () => {
    setEditingMemo(undefined);
    setShowForm(true);
  };

  const handleEdit = (memo: Memo) => {
    setEditingMemo(memo);
    setShowForm(true);
  };

  const handleSubmit = async (data: {
    title: string;
    content: string;
    chapterId?: ChapterId;
  }) => {
    if (!journey?.id || !session?.token) return;

    try {
      setIsSaving(true);
      if (editingMemo) {
        await updateMemo(editingMemo.id, data, session.token);
      } else {
        await createMemo(journey.id, data, session.token);
      }
      await loadMemos();
      setShowForm(false);
      setEditingMemo(undefined);
    } catch (err) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (memoId: string) => {
    if (!session?.token) return;
    if (!confirm("Weet je zeker dat je deze memo wilt verwijderen?")) return;

    try {
      await deleteMemo(memoId, session.token);
      await loadMemos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon memo niet verwijderen");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMemo(undefined);
  };

  if (journeyLoading || isLoadingMemos) {
    return (
      <AppShell title="Memo's" description="Je gedachten en ideeën voor later" activeHref="/memos">
        <Card className="bg-cream border-neutral-sand">
          <CardHeader>
            <CardTitle>Bezig met laden…</CardTitle>
            <CardDescription>We halen je memo's op.</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  if (journeyError || error) {
    return (
      <AppShell title="Memo's" description="Je gedachten en ideeën voor later" activeHref="/memos">
        <Card className="bg-cream border-neutral-sand">
          <CardHeader>
            <CardTitle>Kon memo's niet laden</CardTitle>
            <CardDescription>{journeyError || error}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Memo's" description="Jouw notities en aantekeningen" activeHref="/memos">
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="bg-gradient-to-br from-teal/10 to-cream border-teal/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Jouw memo's</CardTitle>
                <CardDescription className="text-base mt-2">
                  Maak notities, leg gedachten vast en voeg extra context toe aan je levensverhaal.
                </CardDescription>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-teal hover:bg-teal/90 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Nieuwe memo
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-subtle" />
            <Input
              type="text"
              placeholder="Zoeken in memo's..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value as ChapterId | "")}
            className="rounded-2xl border border-input-border bg-input-background px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-teal/50 sm:w-64"
          >
            <option value="">Alle hoofdstukken</option>
            {CHAPTERS.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.phaseTitle} • {chapter.title}
              </option>
            ))}
          </select>
        </div>

        {/* Memo Count */}
        {filteredMemos.length > 0 && (
          <p className="text-sm text-subtle">
            {filteredMemos.length} {filteredMemos.length === 1 ? "memo" : "memo's"}
            {(filterChapter || searchQuery) && ` (gefilterd van ${memos.length})`}
          </p>
        )}

        {/* Memo List */}
        <MemoList
          memos={filteredMemos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Memo Form Modal */}
      {showForm && (
        <MemoForm
          memo={editingMemo}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
        />
      )}
    </AppShell>
  );
}

export default function MemosPage() {
  return (
    <ProtectedRoute>
      <MemosContent />
    </ProtectedRoute>
  );
}
