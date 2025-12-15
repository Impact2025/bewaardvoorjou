"use client";

import { Memo, ChapterId } from "@/lib/types";
import { MemoCard } from "./memo-card";
import { FileText } from "lucide-react";

interface MemoListProps {
  memos: Memo[];
  onEdit: (memo: Memo) => void;
  onDelete: (memoId: string) => void;
  filterChapter?: ChapterId;
}

export function MemoList({ memos, onEdit, onDelete, filterChapter }: MemoListProps) {
  const filteredMemos = filterChapter
    ? memos.filter((memo) => memo.chapterId === filterChapter)
    : memos;

  if (filteredMemos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-teal/10 p-6 mb-4">
          <FileText className="h-12 w-12 text-teal" />
        </div>
        <h3 className="text-xl font-serif font-semibold text-heading mb-2">
          Nog geen memo's
        </h3>
        <p className="text-medium text-center max-w-md">
          {filterChapter
            ? "Er zijn geen memo's voor dit hoofdstuk. Maak je eerste memo aan!"
            : "Maak je eerste memo aan om notities en gedachten vast te leggen."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {filteredMemos.map((memo) => (
        <MemoCard
          key={memo.id}
          memo={memo}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
