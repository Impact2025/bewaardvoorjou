"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { JourneyExperience } from "@/components/journey/journey-experience";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyStore } from "@/store/journey-store";

function ChapterContent({ params }: { params: Promise<{ id: string }> }) {
  const [chapterId, setChapterId] = useState<string | null>(null);
  const updateJourney = useJourneyStore((state) => state.updateJourney);

  useEffect(() => {
    params.then((resolved) => {
      setChapterId(resolved.id);
      // Update the active chapter in the journey store
      updateJourney({ activeChapterId: resolved.id as import("@/lib/types").ChapterId });
    });
  }, [params, updateJourney]);

  if (!chapterId) {
    return (
      <AppShell title="Laden..." activeHref="/chapters">
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-600">Hoofdstuk wordt geladen...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Kernwoorden van je leven" activeHref="/chapters">
      <JourneyExperience />
    </AppShell>
  );
}

export default function ChapterPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <ChapterContent params={params} />
    </ProtectedRoute>
  );
}