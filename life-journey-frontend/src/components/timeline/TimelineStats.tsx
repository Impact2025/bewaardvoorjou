"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TimelineResponse } from "@/lib/timeline-types";
import { BookOpen, Clock, Video, CheckCircle } from "lucide-react";

interface TimelineStatsProps {
  timeline: TimelineResponse;
  className?: string;
}

export function TimelineStats({ timeline, className }: TimelineStatsProps) {
  const stats = useMemo(() => {
    const progressPercent = timeline.total_chapters > 0
      ? Math.round((timeline.completed_chapters / timeline.total_chapters) * 100)
      : 0;

    return {
      progressPercent,
      durationFormatted: formatDuration(timeline.total_duration_seconds),
      lastActivityFormatted: timeline.last_activity_at
        ? formatRelativeTime(new Date(timeline.last_activity_at))
        : "Nog geen activiteit",
    };
  }, [timeline]);

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      <StatCard
        icon={<CheckCircle className="h-4 w-4" />}
        label="Voortgang"
        value={`${stats.progressPercent}%`}
        subtext={`${timeline.completed_chapters}/${timeline.total_chapters} hoofdstukken`}
      />
      <StatCard
        icon={<Video className="h-4 w-4" />}
        label="Opnames"
        value={String(timeline.total_media)}
        subtext={timeline.total_media === 1 ? "opname" : "opnames"}
      />
      <StatCard
        icon={<Clock className="h-4 w-4" />}
        label="Totale duur"
        value={stats.durationFormatted}
        subtext="opgenomen"
      />
      <StatCard
        icon={<BookOpen className="h-4 w-4" />}
        label="Laatste activiteit"
        value={stats.lastActivityFormatted}
        subtext=""
      />
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-[#E6E2DD] bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#FF8C42]">{icon}</span>
        <span className="text-xs text-[#999] font-medium">{label}</span>
      </div>
      <div className="text-xl font-semibold text-[#333333]">{value}</div>
      {subtext && <div className="text-xs text-[#999] mt-0.5">{subtext}</div>}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0m";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}u ${mins}m`;
  return `${mins}m`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Zojuist";
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return "Gisteren";
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

export default TimelineStats;
