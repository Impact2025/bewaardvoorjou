"use client";

import { Memo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          <div className="flex gap-2">
            <Button
              variant="ghost"

              onClick={() => onEdit(memo)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"

              onClick={() => onDelete(memo.id)}
              className="h-8 w-8 p-0 text-coral hover:text-coral"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
