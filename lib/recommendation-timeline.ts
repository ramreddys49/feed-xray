import { RANKING_WEIGHTS, type RankingResult } from "@/lib/ranking-engine";
import type { BehaviorEvent } from "@/types/events";
import type { Post, PostCategory } from "@/types/post";

export const TIMELINE_LIMIT = 8;

export type TimelineKind =
  | "behavior"
  | "profile_lead"
  | "personalization"
  | "refresh"
  | "post_moved"
  | "negative"
  | "exploration"
  | "ad";

export interface TimelineStep {
  id: string;
  kind: TimelineKind;
  clockLabel: string;
  title: string;
  detail?: string;
}

let nextTimelineSeq = 0;

function nextTimelineId() {
  nextTimelineSeq += 1;
  return `tl-${nextTimelineSeq}`;
}

/** Format a clock label only from client handlers that already have a timestamp. */
export function formatClockLabel(timestamp: number) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export function appendTimeline(current: TimelineStep[], incoming: TimelineStep[]) {
  if (incoming.length === 0) return current;
  return [...incoming, ...current].slice(0, TIMELINE_LIMIT);
}

export function isTimelineBehavior(event: BehaviorEvent) {
  switch (event.type) {
    case "like":
    case "unlike":
    case "save":
    case "unsave":
    case "share":
    case "not_interested":
      return true;
    case "dwell_time":
      return event.metadata.durationMs >= 8000;
    default:
      return false;
  }
}

export function stepsFromBehavior(input: {
  event: BehaviorEvent;
  previousLeader: PostCategory | null;
  nextLeader: PostCategory | null;
  clockLabel: string;
}): TimelineStep[] {
  if (!isTimelineBehavior(input.event)) return [];

  const steps: TimelineStep[] = [
    {
      id: nextTimelineId(),
      kind: input.event.type === "not_interested" ? "negative" : "behavior",
      clockLabel: input.clockLabel,
      title: behaviorTitle(input.event),
      detail: input.event.type === "not_interested"
        ? `${input.event.category} will rank lower after the next refresh.`
        : undefined,
    },
  ];

  if (input.nextLeader && input.nextLeader !== input.previousLeader) {
    steps.push({
      id: nextTimelineId(),
      kind: "profile_lead",
      clockLabel: input.clockLabel,
      title: `${input.nextLeader} became strongest interest`,
      detail: "The inferred profile leader changed after this action.",
    });
  }

  return steps;
}

export function stepsFromPersonalization(input: {
  enabled: boolean;
  clockLabel: string;
}): TimelineStep[] {
  return [
    {
      id: nextTimelineId(),
      kind: "personalization",
      clockLabel: input.clockLabel,
      title: input.enabled
        ? "Feed Personalization turned on"
        : "Feed Personalization turned off",
      detail: input.enabled
        ? "The current organic profile can now change feed order."
        : "The organic feed returned to the original catalog order.",
    },
  ];
}

export function stepsFromRankingApply(input: {
  result: RankingResult;
  postsById: Map<string, Post>;
  clockLabel: string;
}): TimelineStep[] {
  const steps: TimelineStep[] = [
    {
      id: nextTimelineId(),
      kind: "refresh",
      clockLabel: input.clockLabel,
      title: "Feed refreshed",
      detail: input.result.applied
        ? input.result.headline
        : "Not enough behavioral signal yet. The feed stayed close to catalog order.",
    },
  ];

  if (!input.result.applied) return steps;

  const upward = [...input.result.entries]
    .filter((entry) => entry.moved >= 3)
    .sort((a, b) => b.moved - a.moved)[0];
  if (upward) {
    const post = input.postsById.get(upward.postId);
    steps.push({
      id: nextTimelineId(),
      kind: "post_moved",
      clockLabel: input.clockLabel,
      title: `${post?.category ?? "A post"} post moved from #${upward.catalogIndex + 1} to #${upward.rankedIndex + 1}`,
      detail: post ? post.title : undefined,
    });
  }

  const downward = [...input.result.entries]
    .filter((entry) => entry.moved <= -3 && entry.factors.negativeFeedback > 0)
    .sort((a, b) => a.moved - b.moved)[0];
  if (downward) {
    const post = input.postsById.get(downward.postId);
    steps.push({
      id: nextTimelineId(),
      kind: "negative",
      clockLabel: input.clockLabel,
      title: `${post?.category ?? "A category"} content moved lower`,
      detail: `${post?.category ?? "This category"} ranked lower after negative feedback.`,
    });
  }

  const exploration = input.result.entries.find(
    (entry) =>
      entry.rankedIndex < 6 &&
      entry.factors.exploration >= RANKING_WEIGHTS.exploration * 0.5 &&
      entry.factors.affinity < RANKING_WEIGHTS.affinity * 0.55,
  );
  if (exploration) {
    const post = input.postsById.get(exploration.postId);
    steps.push({
      id: nextTimelineId(),
      kind: "exploration",
      clockLabel: input.clockLabel,
      title: `Exploration surfaced ${post?.category ?? "another"} content`,
      detail: "The feed kept a category outside your strongest interests near the top.",
    });
  }

  return steps;
}

export function stepsFromAdPersonalization(input: {
  enabled: boolean;
  clockLabel: string;
}): TimelineStep[] {
  return [
    {
      id: nextTimelineId(),
      kind: "ad",
      clockLabel: input.clockLabel,
      title: input.enabled ? "Ad Personalization enabled" : "Ad Personalization disabled",
      detail: input.enabled
        ? "Sponsored selection can now use commercial signals."
        : "Sponsored content returned to a contextual placement.",
    },
  ];
}

export function stepsFromAdSelection(input: {
  previousCategory: string | null;
  nextCategory: string;
  previousLeader: string | null;
  nextLeader: string | null;
  clockLabel: string;
}): TimelineStep[] {
  const steps: TimelineStep[] = [];

  if (input.nextLeader && input.nextLeader !== input.previousLeader) {
    steps.push({
      id: nextTimelineId(),
      kind: "ad",
      clockLabel: input.clockLabel,
      title: `${input.nextLeader} became strongest commercial signal`,
      detail: "Commercial affinity is separate from the organic interest profile.",
    });
  }

  if (input.nextCategory !== input.previousCategory) {
    steps.push({
      id: nextTimelineId(),
      kind: "ad",
      clockLabel: input.clockLabel,
      title:
        input.nextCategory === "Contextual"
          ? "Sponsored placement changed to contextual"
          : `Sponsored placement changed to ${input.nextCategory}`,
      detail: "The ad engine chose this independently of organic ranking.",
    });
  }

  return steps;
}

function behaviorTitle(event: BehaviorEvent) {
  switch (event.type) {
    case "like":
      return `Liked ${event.category}`;
    case "unlike":
      return `Unliked ${event.category}`;
    case "save":
      return `Saved ${event.category}`;
    case "unsave":
      return `Unsaved ${event.category}`;
    case "share":
      return `Shared ${event.category}`;
    case "not_interested":
      return `Marked ${event.category} Not Interested`;
    case "dwell_time":
      return `Watched ${event.category} longer`;
    default:
      return `${event.category} signal`;
  }
}
