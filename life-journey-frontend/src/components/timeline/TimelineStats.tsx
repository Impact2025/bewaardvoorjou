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

    const durationFormatted = formatDuration(timeline.total_duration_seconds);

    const lastActivityFormatted = timeline.last_activity_at
      ? formatRelativeTime(new Date(timeline.last_activity_at))
      : "Nog geen activiteit";

    return {
      progressPercent,
      durationFormatted,
      lastActivityFormatted,
    };
  }, [timeline]);

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", className)}>
      {/* Progress */}
      <StatCard
        icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
        label="Voortgang"
        value={`${stats.progressPercent}%`}
        subtext={`${timeline.completed_chapters}/${timeline.total_chapters} hoofdstukken`}
        color="emerald"
      />

      {/* Media count */}
      <StatCard
        icon={<Video className="h-5 w-5 text-blue-500" />}
        label="Opnames"
        value={String(timeline.total_media)}
        subtext={timeline.total_media === 1 ? "opname" : "opnames"}
        color="blue"
      />

      {/* Duration */}
      <StatCard
        icon={<Clock className="h-5 w-5 text-violet-500" />}
        label="Totale duur"
        value={stats.durationFormatted}
        subtext="opgenomen"
        color="violet"
      />

      {/* Chapters */}
      <StatCard
        icon={<BookOpen className="h-5 w-5 text-amber-500" />}
        label="Laatste activiteit"
        value={stats.lastActivityFormatted}
        subtext=""
        color="amber"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: "emerald" | "blue" | "violet" | "amber";
}

const colorClasses = {
  emerald: "bg-emerald-50 border-emerald-200",
  blue: "bg-blue-50 border-blue-200",
  violet: "bg-violet-50 border-violet-200",
  amber: "bg-amber-50 border-amber-200",
};

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2 transition-all hover:shadow-sm",
        colorClasses[color],
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}u ${mins}m`;
  }
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
