import { Headphones, FileText } from "lucide-react";

interface PodcastPlayerProps {
  audioUrl: string;
  title?: string | null;
  durationSeconds?: number | null;
  transcript?: string | null;
  articleUrl?: string;
}

function formatDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")} min`;
}

/**
 * Server-rendered podcast player for blog / kennisbank posts.
 *
 * Mirrors the weareimpact PodcastPlayer: native <audio> element (no client JS)
 * plus the full transcript inside a <details> disclosure. The transcript is in
 * the DOM on first paint, so it is fully crawlable/indexable — that unique text
 * is the actual SEO payload, on top of the AudioObject JSON-LD emitted on the page.
 */
export function PodcastPlayer({
  audioUrl,
  title,
  durationSeconds,
  transcript,
  articleUrl,
}: PodcastPlayerProps) {
  if (!audioUrl) return null;

  const duration = formatDuration(durationSeconds);

  // AudioObject JSON-LD voor Google Podcast / rich results.
  const audioObjectLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: title || "Podcast bij dit artikel",
    contentUrl: audioUrl,
    encodingFormat: "audio/mpeg",
    ...(durationSeconds
      ? { duration: `PT${Math.floor(durationSeconds / 60)}M${durationSeconds % 60}S` }
      : {}),
    ...(articleUrl ? { associatedArticle: articleUrl } : {}),
  };

  return (
    <section
      aria-label="Podcast"
      className="mb-12 rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(audioObjectLd) }}
      />
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
          <Headphones size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange">
            Luister in plaats van lezen
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-slate-900">
            {title || "Podcast bij dit artikel"}
          </h2>
          {duration && (
            <p className="text-sm text-slate-500">{duration}</p>
          )}

          <audio controls preload="metadata" className="mt-4 w-full">
            <source src={audioUrl} type="audio/mpeg" />
            <source src={audioUrl} type="audio/mp4" />
            Je browser ondersteunt geen audio.{" "}
            <a href={audioUrl} className="text-orange underline">
              Download de aflevering
            </a>
            .
          </audio>
        </div>
      </div>

      {transcript && transcript.trim().length > 0 && (
        <details className="group mt-5 border-t border-slate-100 pt-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 marker:content-[''] hover:text-slate-900">
            <FileText size={16} className="text-slate-400" />
            Lees het transcript
            <span className="text-slate-400 transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {transcript}
          </div>
        </details>
      )}
    </section>
  );
}
