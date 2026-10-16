import type { Post } from "@/types/post";
import type { BehaviorEvent, BehaviorEventType, EventMetadataMap } from "@/types/events";

export const MAX_SESSION_EVENTS = 250;
/** Latest events kept in the scrollable signal log. */
export const SIGNAL_LOG_LIMIT = 40;

let nextEventSeq = 0;

function nextEventId() {
  nextEventSeq += 1;
  return `evt-${nextEventSeq}`;
}

/**
 * Build a behavior event from a client handler or effect.
 * Callers must pass `timestamp` so this module never reads Date.now()
 * or random UUIDs during server render / prerender.
 */
export function createBehaviorEvent<T extends BehaviorEventType>(input: {
  type: T;
  post: Post;
  metadata: EventMetadataMap[T];
  timestamp: number;
}): Extract<BehaviorEvent, { type: T }> {
  return {
    id: nextEventId(),
    timestamp: input.timestamp,
    type: input.type,
    postId: input.post.id,
    category: input.post.category,
    creatorId: input.post.creatorHandle,
    metadata: input.metadata,
  } as Extract<BehaviorEvent, { type: T }>;
}

export function prependEvent(
  events: BehaviorEvent[],
  incoming: BehaviorEvent,
  limit = MAX_SESSION_EVENTS,
) {
  return [incoming, ...events].slice(0, limit);
}

/** Unique-view bookkeeping. Revisits do not grow the unique count. */
export function noteUniqueView(viewedIds: Set<string>, postId: string) {
  const revisit = viewedIds.has(postId);
  if (!revisit) viewedIds.add(postId);
  return { revisit, uniqueCount: viewedIds.size };
}
