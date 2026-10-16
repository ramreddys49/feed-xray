import {
  COMMERCIAL_RECOVERY_FLOOR,
  getCommercialDelta,
  type AdSelectionResult,
  type CommercialProfile,
} from "@/lib/ad-engine";
import { ads } from "@/data/ads";
import {
  formatProfileDelta,
  getEventProfileDelta,
  getProfileLeader,
  type CategoryScores,
  type InterestProfile,
} from "@/lib/profile-engine";
import type { RankingFactors, RankingResult } from "@/lib/ranking-engine";
import type { SponsoredAd } from "@/types/ad";
import type { BehaviorEvent } from "@/types/events";
import { POST_CATEGORIES, type Post, type PostCategory } from "@/types/post";

export const ENGINEER_CONSOLE_LIMIT = 12;

export const VIEW_MODES = ["user", "engineer", "learn"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];
export type SimulationViewMode = Exclude<ViewMode, "learn">;

export function cycleViewMode(current: ViewMode, delta: number): ViewMode {
  const index = VIEW_MODES.indexOf(current);
  const next = (index + delta + VIEW_MODES.length) % VIEW_MODES.length;
  return VIEW_MODES[next];
}
export type EngineerTab = "events" | "profiles" | "ranking" | "ads";

export const ENGINEER_TABS: { id: EngineerTab; label: string }[] = [
  { id: "events", label: "Events" },
  { id: "profiles", label: "Profiles" },
  { id: "ranking", label: "Ranking" },
  { id: "ads", label: "Ads" },
];

export interface RankingSnapshot {
  generatedAt: number;
  scores: CategoryScores;
  leader: PostCategory | null;
  feedVersion: number;
  applied: boolean;
  reason: RankingResult["reason"];
  candidateCount: number;
}

export interface EngineerConsoleRow {
  event: BehaviorEvent;
  clock: string;
  postId: string;
  postTitle: string;
  category: PostCategory;
  signalLabel: string;
  organicDelta: number;
}

export interface ProfileVectorRow {
  category: PostCategory;
  score: number;
}

export interface CandidateRow {
  rank: number;
  postId: string;
  title: string;
  category: PostCategory;
  affinity: number;
  exploration: number;
  penalty: number;
  total: number;
  moved: number;
  catalogIndex: number;
}

export interface AdCandidateRow {
  adId: string;
  advertiser: string;
  category: SponsoredAd["category"];
  commercialAffinity: number;
  eligible: boolean;
  selected: boolean;
}

export interface SelectedPostInspector {
  postId: string;
  title: string;
  category: PostCategory;
  originalRank: number;
  personalizedRank: number;
  moved: number;
  totalScore: number;
  factors: RankingFactors;
  explorationApplied: boolean;
  diversityApplied: boolean;
  negativeApplied: boolean;
  seenApplied: boolean;
}

export interface EventTraceView {
  eventType: string;
  category: PostCategory;
  organicDelta: number;
  commercialDelta: number;
  profileResult: number;
  rankingNote: string;
  snapshotStale: boolean;
}

export function formatEngineerClock(timestamp: number) {
  const date = new Date(timestamp);
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function formatEngineerScore(value: number) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

export function cloneScores(scores: CategoryScores): CategoryScores {
  return { ...scores };
}

export function scoresDiffer(left: CategoryScores, right: CategoryScores) {
  return POST_CATEGORIES.some((category) => left[category] !== right[category]);
}

export function createRankingSnapshot(input: {
  profile: InterestProfile;
  result: RankingResult;
  generatedAt: number;
  feedVersion: number;
}): RankingSnapshot {
  return {
    generatedAt: input.generatedAt,
    scores: cloneScores(input.profile.scores),
    leader: getProfileLeader(input.profile),
    feedVersion: input.feedVersion,
    applied: input.result.applied,
    reason: input.result.reason,
    candidateCount: input.result.entries.length,
  };
}

export function buildConsoleRows(
  events: BehaviorEvent[],
  postsById: Map<string, Post>,
): EngineerConsoleRow[] {
  return events.slice(0, ENGINEER_CONSOLE_LIMIT).map((event) => {
    const organicDelta = getEventProfileDelta(event);
    return {
      event,
      clock: formatEngineerClock(event.timestamp),
      postId: event.postId,
      postTitle: postsById.get(event.postId)?.title ?? event.postId,
      category: event.category,
      signalLabel: formatProfileDelta(organicDelta),
      organicDelta,
    };
  });
}

export function buildInterestVector(profile: InterestProfile): ProfileVectorRow[] {
  return POST_CATEGORIES.map((category) => ({
    category,
    score: profile.scores[category],
  })).sort((a, b) => b.score - a.score || a.category.localeCompare(b.category));
}

export function buildCommercialVector(commercial: CommercialProfile): ProfileVectorRow[] {
  return POST_CATEGORIES.map((category) => ({
    category,
    score: commercial.scores[category],
  })).sort((a, b) => b.score - a.score || a.category.localeCompare(b.category));
}

export function rankingSnapshotPending(
  personalizationOn: boolean,
  rankingApplied: boolean,
  current: InterestProfile,
  snapshot: RankingSnapshot | null,
) {
  if (!personalizationOn || !rankingApplied || !snapshot) return false;
  return scoresDiffer(current.scores, snapshot.scores);
}

export function buildCandidateRows(
  ranking: RankingResult | null,
  postsById: Map<string, Post>,
): CandidateRow[] {
  if (!ranking?.applied) return [];
  return ranking.entries.map((entry) => {
    const post = postsById.get(entry.postId);
    return {
      rank: entry.rankedIndex + 1,
      postId: entry.postId,
      title: post?.title ?? entry.postId,
      category: post?.category ?? "Technology",
      affinity: entry.factors.affinity,
      exploration: entry.factors.exploration,
      penalty:
        entry.factors.diversityPenalty +
        entry.factors.negativeFeedback +
        entry.factors.seenPostPenalty,
      total: entry.totalScore,
      moved: entry.moved,
      catalogIndex: entry.catalogIndex,
    };
  });
}

export function buildSelectedPostInspector(
  post: Post | null,
  ranking: RankingResult | null,
  rankingApplied: boolean,
  catalog: Post[],
): SelectedPostInspector | null {
  if (!post) return null;
  const catalogIndex = catalog.findIndex((item) => item.id === post.id);
  const originalRank = catalogIndex >= 0 ? catalogIndex + 1 : 0;
  const entry = ranking?.entries.find((item) => item.postId === post.id) ?? null;
  if (!entry || !rankingApplied) {
    return {
      postId: post.id,
      title: post.title,
      category: post.category,
      originalRank,
      personalizedRank: originalRank,
      moved: 0,
      totalScore: 0,
      factors: emptyFactors(),
      explorationApplied: false,
      diversityApplied: false,
      negativeApplied: false,
      seenApplied: false,
    };
  }

  return {
    postId: post.id,
    title: post.title,
    category: post.category,
    originalRank: entry.catalogIndex + 1,
    personalizedRank: entry.rankedIndex + 1,
    moved: entry.moved,
    totalScore: entry.totalScore,
    factors: entry.factors,
    explorationApplied: entry.factors.exploration > 0,
    diversityApplied: entry.factors.diversityPenalty > 0,
    negativeApplied: entry.factors.negativeFeedback > 0,
    seenApplied: entry.factors.seenPostPenalty > 0,
  };
}

export function buildAdCandidateRows(
  commercial: CommercialProfile,
  selection: AdSelectionResult,
  adPersonalizationOn: boolean,
): AdCandidateRow[] {
  return ads.map((ad) => {
    const affinity =
      ad.category === "Contextual" ? 0 : commercial.scores[ad.category];
    return {
      adId: ad.id,
      advertiser: ad.advertiser,
      category: ad.category,
      commercialAffinity: affinity,
      eligible: isAdEligible(ad, commercial, adPersonalizationOn, selection),
      selected: ad.id === selection.adId,
    };
  });
}

export function buildEventTrace(input: {
  event: BehaviorEvent;
  profile: InterestProfile;
  rankingApplied: boolean;
  snapshotPending: boolean;
}): EventTraceView {
  const organicDelta = getEventProfileDelta(input.event);
  const commercialDelta = getCommercialDelta(input.event);
  let rankingNote: string;
  if (!input.rankingApplied) {
    rankingNote =
      "No personalized ranking snapshot. The organic feed is still catalog order.";
  } else if (input.snapshotPending) {
    rankingNote =
      "Profile changed. Ranking snapshot still uses the previous profile.";
  } else {
    rankingNote = `${input.event.category} posts are eligible for a higher affinity score after the next or current ranking snapshot.`;
  }

  return {
    eventType: input.event.type,
    category: input.event.category,
    organicDelta,
    commercialDelta,
    profileResult: input.profile.scores[input.event.category],
    rankingNote,
    snapshotStale: input.snapshotPending,
  };
}

export function describeAdEngineReason(
  selection: AdSelectionResult,
  adPersonalizationOn: boolean,
) {
  if (!adPersonalizationOn) {
    return "Ad Personalization is off. Contextual placement.";
  }
  if (selection.reason !== "personalized") {
    return "Not enough commercial signal. Contextual fallback.";
  }
  return `${selection.selectedCategory} is strongest eligible commercial category.`;
}

export function eventInspectPayload(event: BehaviorEvent) {
  return {
    id: event.id,
    timestamp: event.timestamp,
    type: event.type,
    postId: event.postId,
    category: event.category,
    creatorId: event.creatorId,
    metadata: event.metadata,
  };
}

export function movementLabel(moved: number) {
  if (moved > 0) return `+${moved}`;
  if (moved < 0) return String(moved);
  return "→";
}

export function factorRows(factors: RankingFactors) {
  return [
    { label: "Affinity", value: factors.affinity, signed: true },
    { label: "Freshness", value: factors.freshness, signed: true },
    { label: "Quality", value: factors.quality, signed: true },
    { label: "Popularity", value: factors.popularity, signed: true },
    { label: "Exploration", value: factors.exploration, signed: true },
    { label: "Engagement", value: factors.engagement, signed: true },
    { label: "Diversity Penalty", value: -factors.diversityPenalty, signed: true },
    { label: "Negative Feedback", value: -factors.negativeFeedback, signed: true },
    { label: "Seen Post Penalty", value: -factors.seenPostPenalty, signed: true },
  ];
}

function emptyFactors(): RankingFactors {
  return {
    affinity: 0,
    freshness: 0,
    quality: 0,
    popularity: 0,
    exploration: 0,
    engagement: 0,
    diversityPenalty: 0,
    negativeFeedback: 0,
    seenPostPenalty: 0,
  };
}

function isAdEligible(
  ad: SponsoredAd,
  commercial: CommercialProfile,
  adPersonalizationOn: boolean,
  selection: AdSelectionResult,
) {
  if (ad.category === "Contextual") {
    return selection.reason !== "personalized";
  }
  if (!adPersonalizationOn) return false;
  const score = commercial.scores[ad.category];
  if (score <= 0) return false;
  const blocked = commercial.evidence[ad.category].notInterested;
  return !blocked || score >= COMMERCIAL_RECOVERY_FLOOR;
}
