import type { PostCategory } from "@/types/post";

export const BEHAVIOR_EVENT_TYPES = [
  "post_view",
  "dwell_time",
  "like",
  "unlike",
  "save",
  "unsave",
  "share",
  "comment_open",
  "not_interested",
  "quick_skip",
] as const;

export type BehaviorEventType = (typeof BEHAVIOR_EVENT_TYPES)[number];

export type InteractionSource = "post_card";

export interface EventMetadataMap {
  post_view: {
    visibilityRatio: number;
    /** True when this post already produced a post_view in the session. */
    revisit: boolean;
  };
  dwell_time: {
    durationMs: number;
  };
  quick_skip: {
    durationMs: number;
  };
  like: {
    source: InteractionSource;
  };
  unlike: {
    source: InteractionSource;
  };
  save: {
    source: InteractionSource;
  };
  unsave: {
    source: InteractionSource;
  };
  share: {
    source: InteractionSource;
  };
  comment_open: {
    source: InteractionSource;
  };
  not_interested: {
    source: InteractionSource;
  };
}

export interface BehaviorEventBase<T extends BehaviorEventType> {
  id: string;
  timestamp: number;
  type: T;
  postId: string;
  category: PostCategory;
  creatorId: string;
  metadata: EventMetadataMap[T];
}

export type BehaviorEvent = {
  [T in BehaviorEventType]: BehaviorEventBase<T>;
}[BehaviorEventType];
