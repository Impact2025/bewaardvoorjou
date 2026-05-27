"use client";

import { Memo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, FileText } from "lucide-react";
import { CHAPTERS } from "@/lib/chapters";

interface MemoCardProps {
  memo: Memo;
  onEdit: (memo: Memo) => void;
  onDelete: (memoId: string) => void;
}

export function MemoCard({ memo, onEdit, onDelete }: MemoCardProps) {
  const chapter = memo.chapterId ? CHAPTERS.find(ch => ch.id === memo.chapterId) : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="hover:shadow-xl transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal" />
              {memo.title}
            </CardTitle>
            {chapter && (
              <p className="text-xs text-subtle mt-1">
                {chapter.phaseTitle} • {chapter.title}
              </p>
            )}
            <p className="text-xs text-subtle mt-1">{formatDate(memo.createdAt)}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(memo)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
              aria-label="Bewerken"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(memo.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100 active:scale-95"
              aria-label="Verwijderen"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-medium leading-relaxed whitespace-pre-wrap line-clamp-4">
          {memo.content}
        </p>
      </CardContent>
    </Card>
  );
}
