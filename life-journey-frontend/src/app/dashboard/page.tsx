"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CHAPTERS } from "@/lib/chapters";
import { cn, formatDate } from "@/lib/utils";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { OnboardingModal, hasSeenOnboarding } from "@/components/onboarding/onboarding-modal";
import type { ChapterId } from "@/lib/types";
import {
  Play,
  BookOpen,
  Settings,
  Share2,
  Clock,
  Mic,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// Lazy load heavy Timeline component (reduces initial bundle)
const Timeline = dynamic(() => import("@/components/timeline").then(mod => ({ default: mod.Timeline })), {
  loading: () => (
    <div className="h-96 rounded-xl bg-slate-100 animate-pulse" />
  ),
  ssr: false,
});

function DashboardContent() {
  const router = useRouter();
  const { journey, profile, isLoading, error } = useJourneyBootstrap();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-show onboarding for first-time users
  useEffect(() => {
    if (!hasSeenOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleChapterSelect = (chapterId: ChapterId) => {
    router.push(`/chapter/${chapterId}`);
  };

  if (isLoading && !journey) {
    return (
      <AppShell
        title="Mijn dashboard"
        description="Ontdek wat je al hebt opgebouwd"
        activeHref="/dashboard"
      >
        <DashboardSkeleton />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        title="Mijn dashboard"
        description="Ontdek wat je al hebt opgebouwd"
        activeHref="/dashboard"
      >
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Kon dashboard niet laden</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  const progressPercent = journey?.journeyProgress?.percentComplete ?? 0;
  const completedChapters = journey?.journeyProgress?.completedChapters ?? 0;
  const totalChapters = journey?.journeyProgress?.totalChapters ?? 30;
  const nextChapter = journey?.journeyProgress?.nextAvailableChapter ?? journey?.activeChapterId;
  const nextChapterTitle = nextChapter
    ? CHAPTERS.find((ch) => ch.id === nextChapter)?.title
    : null;

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <AppShell
        title={`Welkom${profile?.displayName ? `, ${profile.displayName}` : ''}`}
        description={`Je levensverhaal · ${completedChapters}/${totalChapters} hoofdstukken voltooid`}
        activeHref="/dashboard"
        onShowHandleiding={() => setShowOnboarding(true)}
      >
        <div className="space-y-8 max-w-full overflow-hidden">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 sm:p-8 text-white">
            <div className="absolute top-0 right-0 opacity-10">
              <Sparkles className="h-48 w-48" />
            </div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {progressPercent === 0
                      ? "Begin je reis"
                      : progressPercent < 50
                      ? "Je bent goed op weg!"
                      : progressPercent < 100
                      ? "Bijna daar!"
                      : "Gefeliciteerd! 🎉"}
                  </h2>
                  <p className="text-teal-100 max-w-md">
                    {progressPercent === 0
                      ? "Neem je eerste opname en begin met het vastleggen van je levensverhaal."
                      : progressPercent < 100
                      ? `Je hebt al ${completedChapters} hoofdstukken voltooid. Blijf zo doorgaan!`
                      : "Je hebt alle hoofdstukken voltooid. Je levensverhaal is compleet."}
                  </p>
                </div>
                {nextChapter && (
                  <Button
                    asChild

                    className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg whitespace-nowrap"
                  >
                    <Link href={`/chapter/${nextChapter}`}>
                      <Play className="h-5 w-5 mr-2" />
                      {nextChapterTitle || "Start volgende"}
                    </Link>
                  </Button>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Voortgang</span>
                  <span className="font-semibold">{progressPercent}%</span>
                </div>
                <div className="h-3 bg-teal-500/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Timeline Section */}
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                      Je Levensreis
                    </CardTitle>
                    <CardDescription>
                      Volg je voortgang door alle levensfasen
                    </CardDescription>
                  </div>
                  <Button variant="ghost" asChild>
                    <Link href="/chapters">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Alle hoofdstukken
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {journey?.id ? (
                    <Timeline
                      journeyId={journey.id}
                      onChapterSelect={handleChapterSelect}
                    />
                  ) : (
                    <p className="text-slate-600 text-center py-8">
                      Nog geen journey gestart
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Snel overzicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <QuickStat
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Voltooid"
                    value={`${completedChapters}/${totalChapters}`}
                    color="emerald"
                  />
                  <QuickStat
                    icon={<Mic className="h-4 w-4" />}
                    label="Opnames"
                    value={String(journey?.media?.length || 0)}
                    color="blue"
                  />
                  <QuickStat
                    icon={<Clock className="h-4 w-4" />}
                    label="Laatste update"
                    value={journey ? formatDate(journey.updatedAt) : "-"}
                    color="violet"
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Snelle acties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {nextChapter && (
                    <QuickActionButton
                      href={`/chapter/${nextChapter}`}
                      icon={<Play className="h-4 w-4" />}
                      label="Verder met opnemen"
                      primary
                    />
                  )}
                  <QuickActionButton
                    href="/recordings"
                    icon={<Mic className="h-4 w-4" />}
                    label="Mijn opnames"
                  />
                  <QuickActionButton
                    href="/memos"
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Mijn memo's"
                  />
                  <QuickActionButton
                    href="/privacy"
                    icon={<Share2 className="h-4 w-4" />}
                    label="Delen & privacy"
                  />
                  <QuickActionButton
                    href="/onboarding"
                    icon={<Settings className="h-4 w-4" />}
                    label="Instellingen"
                  />
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-900 mb-1">
                        Hulp nodig?
                      </h3>
                      <p className="text-sm text-amber-700 mb-3">
                        Bekijk de handleiding voor tips en uitleg.
                      </p>
                      <Button

                        variant="ghost"
                        onClick={() => setShowOnboarding(true)}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        Open handleiding
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "emerald" | "blue" | "violet";
}

const statColors = {
  emerald: "text-emerald-600 bg-emerald-50",
  blue: "text-blue-600 bg-blue-50",
  violet: "text-violet-600 bg-violet-50",
};

function QuickStat({ icon, label, value, color }: QuickStatProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", statColors[color])}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}

function QuickActionButton({ href, icon, label, primary }: QuickActionButtonProps) {
  return (
    <Button
      asChild
      variant={primary ? "primary" : "ghost"}
      className={cn(
        "w-full justify-start",
        primary
          ? "bg-teal-600 hover:bg-teal-700 text-white"
          : "text-slate-700 hover:bg-slate-100",
      )}
    >
      <Link href={href}>
        {icon}
        <span className="ml-2">{label}</span>
      </Link>
    </Button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />

      {/* Content grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-96 rounded-xl bg-slate-100 animate-pulse" />
        <div className="space-y-6">
          <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-60 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
