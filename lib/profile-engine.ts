import { formatCompactDuration } from "@/lib/signal-copy";
import type { BehaviorEvent, BehaviorEventType } from "@/types/events";
import { POST_CATEGORIES, type PostCategory } from "@/types/post";

/**
 * These values are Feed X-Ray teaching weights and do not represent Instagram,
 * TikTok, Meta, X, LinkedIn, YouTube, or any real platform's production ranking
 * weights.
 *
 * Internal category scores stay unbounded so Phase 4 can reuse them for ranking.
 * User View never shows these raw numbers.
 */
export const PROFILE_WEIGHTS = {
  post_view: 1,
  post_view_revisit: 0.5,
  dwellUnder3s: 0,
  dwell3to8s: 2,
  dwell8to15s: 4,
  dwell15sPlus: 6,
  like: 8,
  unlike: -8,
  save: 12,
  unsave: -12,
  share: 14,
  comment_open: 4,
  quick_skip: -2,
  not_interested: -18,
} as const;

export const PROFILE_CHANGE_LIMIT = 4;
const DNA_NAMED_LIMIT = 3;

export type CategoryScores = Record<PostCategory, number>;

export interface CategoryEvidence {
  liked: boolean;
  saved: boolean;
  dwelled: boolean;
  shared: boolean;
}

export interface ProfileChange {
  id: string;
  eventId: string;
  type: BehaviorEventType;
  title: string;
  category: PostCategory;
  delta: number;
  reason: string;
}

export interface InterestProfile {
  scores: CategoryScores;
  evidence: Record<PostCategory, CategoryEvidence>;
  meaningfulCount: number;
  recentChanges: ProfileChange[];
}

export type ProfileStrengthLabel =
  | "No profile"
  | "Early"
  | "Developing"
  | "Strong";

export interface ProfileStrength {
  label: ProfileStrengthLabel;
  meaningfulCount: number;
  detail: string;
}

export type MirrorRankLabel =
  | "Primary interest"
  | "Growing interest"
  | "Emerging interest";

export interface MirrorInterest {
  category: PostCategory;
  percent: number;
  label: MirrorRankLabel;
}

export interface AlgorithmMirrorView {
  interests: MirrorInterest[];
  primary: string;
  secondary?: string;
  strength: ProfileStrength;
  recentChanges: ProfileChange[];
}

export interface DnaSlice {
  key: PostCategory | "Other";
  percent: number;
}

export interface FeedDnaView {
  slices: DnaSlice[];
  hasSignals: boolean;
}

const MIRROR_LABELS: MirrorRankLabel[] = [
  "Primary interest",
  "Growing interest",
  "Emerging interest",
];

export function createEmptyScores(): CategoryScores {
  return Object.fromEntries(
    POST_CATEGORIES.map((category) => [category, 0]),
  ) as CategoryScores;
}

export function createEmptyEvidenceMap(): Record<PostCategory, CategoryEvidence> {
  return Object.fromEntries(
    POST_CATEGORIES.map((category) => [category, emptyEvidence()]),
  ) as Record<PostCategory, CategoryEvidence>;
}

export function createEmptyProfile(): InterestProfile {
  return {
    scores: createEmptyScores(),
    evidence: createEmptyEvidenceMap(),
    meaningfulCount: 0,
    recentChanges: [],
  };
}

function emptyEvidence(): CategoryEvidence {
  return {
    liked: false,
    saved: false,
    dwelled: false,
    shared: false,
  };
}

/** Dwell under 3s is a no-op so brief visibility does not shape the profile. */
export function getEventProfileDelta(event: BehaviorEvent): number {
  switch (event.type) {
    case "post_view":
      return event.metadata.revisit
        ? PROFILE_WEIGHTS.post_view_revisit
        : PROFILE_WEIGHTS.post_view;
    case "dwell_time": {
      const seconds = event.metadata.durationMs / 1000;
      if (seconds < 3) return PROFILE_WEIGHTS.dwellUnder3s;
      if (seconds < 8) return PROFILE_WEIGHTS.dwell3to8s;
      if (seconds < 15) return PROFILE_WEIGHTS.dwell8to15s;
      return PROFILE_WEIGHTS.dwell15sPlus;
    }
    case "like":
      return PROFILE_WEIGHTS.like;
    case "unlike":
      return PROFILE_WEIGHTS.unlike;
    case "save":
      return PROFILE_WEIGHTS.save;
    case "unsave":
      return PROFILE_WEIGHTS.unsave;
    case "share":
      return PROFILE_WEIGHTS.share;
    case "comment_open":
      return PROFILE_WEIGHTS.comment_open;
    case "quick_skip":
      return PROFILE_WEIGHTS.quick_skip;
    case "not_interested":
      return PROFILE_WEIGHTS.not_interested;
  }
}

export function applyBehaviorEventToProfile(
  profile: InterestProfile,
  event: BehaviorEvent,
): InterestProfile {
  const delta = getEventProfileDelta(event);
  if (delta === 0) {
    return profile;
  }

  const category = event.category;
  const scores = { ...profile.scores };
  scores[category] = scores[category] + delta;

  const change: ProfileChange = {
    id: `chg-${event.id}`,
    eventId: event.id,
    type: event.type,
    title: describeProfileChangeTitle(event),
    category,
    delta,
    reason: describeProfileReason(event),
  };

  return {
    scores,
    evidence: updateEvidence(profile.evidence, event),
    meaningfulCount: profile.meaningfulCount + 1,
    recentChanges: [change, ...profile.recentChanges].slice(
      0,
      PROFILE_CHANGE_LIMIT,
    ),
  };
}

function updateEvidence(
  evidence: Record<PostCategory, CategoryEvidence>,
  event: BehaviorEvent,
): Record<PostCategory, CategoryEvidence> {
  const current = evidence[event.category];
  const next = { ...current };

  switch (event.type) {
    case "like":
      next.liked = true;
      break;
    case "unlike":
      next.liked = false;
      break;
    case "save":
      next.saved = true;
      break;
    case "unsave":
      next.saved = false;
      break;
    case "dwell_time":
      next.dwelled = true;
      break;
    case "share":
      next.shared = true;
      break;
    default:
      break;
  }

  return { ...evidence, [event.category]: next };
}

export function getProfileStrength(meaningfulCount: number): ProfileStrength {
  let label: ProfileStrengthLabel;
  if (meaningfulCount <= 0) label = "No profile";
  else if (meaningfulCount <= 4) label = "Early";
  else if (meaningfulCount <= 9) label = "Developing";
  else label = "Strong";

  return {
    label,
    meaningfulCount,
    detail:
      meaningfulCount === 0
        ? "No profile yet"
        : `Based on ${meaningfulCount} meaningful behavioral ${
            meaningfulCount === 1 ? "signal" : "signals"
          }.`,
  };
}

export function getProfileLeader(profile: InterestProfile): PostCategory | null {
  return positiveCategories(profile.scores)[0]?.category ?? null;
}

function positiveCategories(scores: CategoryScores) {
  return POST_CATEGORIES.map((category) => ({
    category,
    raw: scores[category],
  }))
    .filter((item) => item.raw > 0)
    .sort((a, b) => b.raw - a.raw || a.category.localeCompare(b.category));
}

export function buildAlgorithmMirror(profile: InterestProfile): AlgorithmMirrorView {
  const ranked = positiveCategories(profile.scores);
  const leaderRaw = ranked[0]?.raw ?? 0;
  const interests = ranked.slice(0, 3).map((item, index) => ({
    category: item.category,
    percent: leaderRaw > 0 ? Math.round((item.raw / leaderRaw) * 100) : 0,
    label: MIRROR_LABELS[index],
  }));

  const leader = interests[0]?.category ?? null;
  const summary = buildMirrorSummary(
    leader,
    leader ? profile.evidence[leader] : null,
  );

  return {
    interests,
    ...summary,
    strength: getProfileStrength(profile.meaningfulCount),
    recentChanges: profile.recentChanges,
  };
}

export function buildFeedDna(profile: InterestProfile): FeedDnaView {
  const ranked = positiveCategories(profile.scores);
  const total = ranked.reduce((sum, item) => sum + item.raw, 0);
  if (total <= 0) {
    return { slices: [], hasSignals: false };
  }

  const named = ranked.slice(0, DNA_NAMED_LIMIT);
  const otherRaw = ranked.slice(DNA_NAMED_LIMIT).reduce((sum, item) => sum + item.raw, 0);
  const parts = [
    ...named.map((item) => ({ key: item.category as DnaSlice["key"], raw: item.raw })),
    ...(otherRaw > 0 ? [{ key: "Other" as const, raw: otherRaw }] : []),
  ];
  const percents = distributePercents(parts.map((part) => part.raw));

  return {
    hasSignals: true,
    slices: parts.map((part, index) => ({
      key: part.key,
      percent: percents[index],
    })),
  };
}

export function formatProfileDelta(delta: number) {
  const absolute = Math.abs(delta);
  const body = Number.isInteger(absolute) ? String(absolute) : absolute.toFixed(1);
  if (delta > 0) return `+${body}`;
  if (delta < 0) return `-${body}`;
  return body;
}

export function describeProfileChangeTitle(event: BehaviorEvent) {
  switch (event.type) {
    case "post_view":
      return event.metadata.revisit ? "VIEW AGAIN" : "VIEW";
    case "dwell_time":
      return `DWELL · ${formatCompactDuration(event.metadata.durationMs)}`;
    case "quick_skip":
      return "QUICK SKIP";
    case "like":
      return "LIKE";
    case "unlike":
      return "UNLIKE";
    case "save":
      return "SAVE";
    case "unsave":
      return "UNSAVE";
    case "share":
      return "SHARE";
    case "comment_open":
      return "COMMENT";
    case "not_interested":
      return "NOT INTERESTED";
  }
}

export function describeProfileReason(event: BehaviorEvent) {
  const category = event.category;
  switch (event.type) {
    case "post_view":
      return event.metadata.revisit
        ? `Because you returned to a ${category} post`
        : `Because you viewed a ${category} post`;
    case "dwell_time":
      return `Because you watched a ${category} post for ${formatCompactDuration(event.metadata.durationMs)}`;
    case "like":
      return `Because you liked a ${category} post`;
    case "unlike":
      return `Because you unliked a ${category} post`;
    case "save":
      return `Because you saved a ${category} post`;
    case "unsave":
      return `Because you unsaved a ${category} post`;
    case "share":
      return `Because you shared a ${category} post`;
    case "comment_open":
      return `Because you opened comments on a ${category} post`;
    case "quick_skip":
      return `Because you skipped a ${category} post quickly`;
    case "not_interested":
      return "Because you selected Not Interested";
  }
}

function buildMirrorSummary(
  leader: PostCategory | null,
  evidence: CategoryEvidence | null,
) {
  if (!leader) {
    return { primary: "" };
  }

  const primary = `Based on your recent behavior, ${leader} is currently your strongest inferred interest.`;

  if (evidence?.saved && evidence.dwelled) {
    return {
      primary,
      secondary: `You saved ${leader} content and spent more time on it than other categories.`,
    };
  }
  if (evidence?.saved) {
    return { primary, secondary: `You saved ${leader} content.` };
  }
  if (evidence?.dwelled) {
    return {
      primary,
      secondary: `You spent more time on ${leader} than other categories.`,
    };
  }
  if (evidence?.liked) {
    return { primary, secondary: `You liked ${leader} content.` };
  }

  return { primary };
}

export function distributePercents(weights: number[]) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) return weights.map(() => 0);

  const raw = weights.map((weight) => (weight / total) * 100);
  const floors = raw.map(Math.floor);
  const leftover = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  const percents = [...floors];
  for (let step = 0; step < leftover; step += 1) {
    percents[order[step].index] += 1;
  }
  return percents;
}
