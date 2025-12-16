"use client";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CHAPTERS } from "@/lib/chapters";
import { formatDate } from "@/lib/utils";
import { Plus, FileText, Video, Mic, CheckCircle2, Lock, Circle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function OverviewContent() {
  const { journey, profile, isLoading, error } = useJourneyBootstrap();
  const [showAddMemo, setShowAddMemo] = useState(false);

  if (isLoading) {
    return (
      <AppShell title="Mijn Reis" description="Jouw complete levensverhaal overzicht" activeHref="/overview">
        <Card>
          <CardHeader>
            <CardTitle>Bezig met laden...</CardTitle>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  if (error || !journey) {
    return (
      <AppShell title="Mijn Reis" description="Jouw complete levensverhaal overzicht" activeHref="/overview">
        <Card>
          <CardHeader>
            <CardTitle>Fout bij laden</CardTitle>
            <CardDescription>{error || "Kon gegevens niet laden"}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  // Get all chapters with their status
  const chaptersWithStatus = CHAPTERS.map((chapter) => {
    const status = journey.chapterStatuses?.[chapter.id];
    const mediaForChapter = journey.media.filter((m) => m.chapterId === chapter.id);

    return {
      ...chapter,
      status: status?.status || "locked",
      mediaCount: status?.mediaCount || 0,
      isUnlocked: status?.isUnlocked || false,
      media: mediaForChapter,
    };
  });

  const totalMedia = journey.media.length;
  const completedChapters = journey.journeyProgress?.completedChapters || 0;
  const percentComplete = journey.journeyProgress?.percentComplete || 0;

  return (
    <AppShell
      title="Mijn Reis"
      description="Jouw complete levensverhaal overzicht"
      activeHref="/overview"
    >
      <div className="space-y-6">
        {/* Progress Overview Card */}
        <Card className="bg-gradient-to-br from-orange/10 to-teal/10 border-orange/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Je Reis</CardTitle>
                <CardDescription className="text-base mt-2">
                  {profile?.displayName}, dit is jouw levensverhaal in wording
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange">{percentComplete}%</div>
                <div className="text-sm text-slate-600">Voltooid</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-semibold text-slate-900">{completedChapters}</div>
                <div className="text-sm text-slate-600">Hoofdstukken voltooid</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-semibold text-slate-900">{totalMedia}</div>
                <div className="text-sm text-slate-600">Totaal opnames</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-semibold text-slate-900">{journey.media.filter(m => m.type === "text").length}</div>
                <div className="text-sm text-slate-600">Geschreven verhalen</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange to-teal transition-all duration-500"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters Timeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Jouw Hoofdstukken</h2>
            <Button variant="ghost" asChild>
              <Link href="/chapters">Alle hoofdstukken</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {chaptersWithStatus.map((chapter, index) => {
              const StatusIcon = chapter.status === "completed"
                ? CheckCircle2
                : chapter.status === "available"
                  ? Circle
                  : Lock;

              const statusColor = chapter.status === "completed"
                ? "text-success-green"
                : chapter.status === "available"
                  ? "text-orange"
                  : "text-slate-400";

              return (
                <Card
                  key={chapter.id}
                  className={chapter.status === "locked" ? "opacity-60" : ""}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 ${statusColor}`}>
                        <StatusIcon className="h-6 w-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs text-orange font-medium uppercase tracking-wide">
                              {chapter.phaseTitle}
                            </div>
                            <h3 className="font-semibold text-slate-900 mt-1">
                              {chapter.title}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {chapter.description}
                            </p>
                          </div>

                          {chapter.isUnlocked && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/chapter/${chapter.id}`}>
                                {chapter.mediaCount > 0 ? "Meer toevoegen" : "Start"}
                              </Link>
                            </Button>
                          )}
                        </div>

                        {/* Media items for this chapter */}
                        {chapter.media.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {chapter.media.map((media) => {
                              const MediaIcon = media.type === "text"
                                ? FileText
                                : media.type === "video"
                                  ? Video
                                  : Mic;

                              return (
                                <div
                                  key={media.id}
                                  className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg p-2"
                                >
                                  <MediaIcon className="h-4 w-4 text-slate-600" />
                                  <span className="flex-1 text-slate-700">
                                    {media.type === "text" ? "Geschreven verhaal" : "Opname"}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatDate(media.recordedAt)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Snelle acties</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild className="bg-orange hover:bg-orange/90">
              <Link href="/chapters">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe opname
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/memos">
                <FileText className="h-4 w-4 mr-2" />
                Memo toevoegen
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/recordings">
                Alle opnames bekijken
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <OverviewContent />
    </ProtectedRoute>
  );
}
