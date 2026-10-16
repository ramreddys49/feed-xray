import type { BehaviorEvent } from "@/types/events";

export type SignalTone = "positive" | "negative" | "engagement" | "neutral";

export interface SignalCopy {
  title: string;
  category: BehaviorEvent["category"];
  label: string;
  detail?: string;
  tone: SignalTone;
  flash: string;
}

export function formatDuration(durationMs: number) {
  const seconds = durationMs / 1000;
  if (seconds < 10) {
    return `${seconds.toFixed(1)} sec`;
  }

  return `${Math.round(seconds)} sec`;
}

export function formatCompactDuration(durationMs: number) {
  const seconds = durationMs / 1000;
  return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`;
}

export function describeSignal(event: BehaviorEvent): SignalCopy {
  switch (event.type) {
    case "post_view": {
      const title = event.metadata.revisit ? "VIEW AGAIN" : "VIEW";
      return {
        title,
        category: event.category,
        label: "Attention signal",
        tone: "neutral",
        flash: `${title} · ${event.category}`,
      };
    }
    case "dwell_time":
      return {
        title: "DWELL",
        category: event.category,
        label: "Positive signal",
        detail: `${formatDuration(event.metadata.durationMs)} watched`,
        tone: "positive",
        flash: `${formatCompactDuration(event.metadata.durationMs)} dwell · ${event.category}`,
      };
    case "quick_skip":
      return {
        title: "QUICK SKIP",
        category: event.category,
        label: "Weak negative signal",
        detail: `${formatCompactDuration(event.metadata.durationMs)} visible`,
        tone: "negative",
        flash: `QUICK SKIP · ${event.category}`,
      };
    case "like":
      return {
        title: "LIKE",
        category: event.category,
        label: "Positive signal",
        tone: "positive",
        flash: `LIKE · ${event.category}`,
      };
    case "unlike":
      return {
        title: "UNLIKE",
        category: event.category,
        label: "Withdrawn positive signal",
        tone: "neutral",
        flash: `UNLIKE · ${event.category}`,
      };
    case "save":
      return {
        title: "SAVE",
        category: event.category,
        label: "Strong positive signal",
        tone: "positive",
        flash: `SAVE · ${event.category}`,
      };
    case "unsave":
      return {
        title: "UNSAVE",
        category: event.category,
        label: "Withdrawn save",
        tone: "neutral",
        flash: `UNSAVE · ${event.category}`,
      };
    case "share":
      return {
        title: "SHARE",
        category: event.category,
        label: "Strong positive signal",
        tone: "positive",
        flash: `SHARE · ${event.category}`,
      };
    case "comment_open":
      return {
        title: "COMMENT",
        category: event.category,
        label: "Engagement signal",
        tone: "engagement",
        flash: `COMMENT · ${event.category}`,
      };
    case "not_interested":
      return {
        title: "NOT INTERESTED",
        category: event.category,
        label: "Strong negative signal",
        tone: "negative",
        flash: `NOT INTERESTED · ${event.category}`,
      };
  }
}

/**
 * User-facing counters are not a 1:1 map of the raw event stream.
 *
 * Unique / current-state:
 * - postsViewed = distinct postIds with at least one post_view
 * - likes / saves / notInterested = posts currently in that toggle state
 *
 * Session event counts:
 * - shares = share events
 * - longWatches = dwell_time events (already past QUICK_SKIP_MS)
 * - quickSkips = quick_skip events
 */
export interface ActivitySummary {
  postsViewed: number;
  likes: number;
  saves: number;
  shares: number;
  longWatches: number;
  quickSkips: number;
  notInterested: number;
}

