/**
 * Timeline components for the visual journey timeline.
 *
 * Usage:
 * ```tsx
 * import { Timeline } from "@/components/timeline";
 *
 * <Timeline
 *   journeyId={journeyId}
 *   onChapterSelect={(chapterId) => router.push(`/chapters/${chapterId}`)}
 * />
 * ```
 */

export { Timeline } from "./Timeline";
export { TimelinePhaseSection } from "./TimelinePhase";
export { TimelineChapter } from "./TimelineChapter";
export { TimelineStats } from "./TimelineStats";
