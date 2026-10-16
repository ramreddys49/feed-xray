import type { BehaviorEvent } from "@/types/events";

/**
 * Session counts derived from the event log so the UI cannot drift from state.
 * Unique views stay on a dedicated Set because the log is capped.
 */
export function tallySessionEvents(events: readonly BehaviorEvent[]) {
  let shares = 0;
  let longWatches = 0;
  let quickSkips = 0;
  const viewedIds = new Set<string>();
  const liked = new Set<string>();
  const saved = new Set<string>();
  const notInterested = new Set<string>();

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    switch (event.type) {
      case "post_view":
        viewedIds.add(event.postId);
        break;
      case "share":
        shares += 1;
        break;
      case "dwell_time":
        longWatches += 1;
        break;
      case "quick_skip":
        quickSkips += 1;
        break;
      case "like":
        liked.add(event.postId);
        break;
      case "unlike":
        liked.delete(event.postId);
        break;
      case "save":
        saved.add(event.postId);
        break;
      case "unsave":
        saved.delete(event.postId);
        break;
      case "not_interested":
        notInterested.add(event.postId);
        break;
      default:
        break;
    }
  }

  return {
    uniqueViewsFromLog: viewedIds.size,
    likes: liked.size,
    saves: saved.size,
    shares,
    longWatches,
    quickSkips,
    notInterested: notInterested.size,
  };
}
