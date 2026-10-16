import { distributePercents, type InterestProfile } from "@/lib/profile-engine";
import type { BehaviorEvent } from "@/types/events";
import { POST_CATEGORIES, type Post, type PostCategory } from "@/types/post";

/**
 * These values are Feed X-Ray teaching weights and do not represent Instagram,
 * TikTok, Meta, X, LinkedIn, YouTube, or any real platform's production ranking
 * weights.
 *
 * Interest affinity is the main driver. Freshness, quality, and popularity are
 * small demo factors so the feed does not ignore content metadata entirely.
 */
export const RANKING_WEIGHTS = {
  affinity: 70,
  freshness: 8,
  quality: 6,
  popularity: 4,
  exploration: 18,
  engagement: 4,
  adjacentPenalty: 50,
  recentRepeatPenalty: 14,
  notInterested: 32,
  skipOnce: 7,
  skipRepeat: 16,
  negativeCategory: 16,
  seenPost: 11,
} as const;

const MIX_NAMED_LIMIT = 4;
/** Compare the visible top of the feed, not the full catalog (order-only ranking). */
export const VISIBLE_MIX_WINDOW = 8;

export interface PostMemory {
  skipCount: number;
  notInterested: boolean;
  liked: boolean;
  saved: boolean;
  shareCount: number;
}

export interface RankingFactors {
  affinity: number;
  freshness: number;
  quality: number;
  popularity: number;
  exploration: number;
  engagement: number;
  diversityPenalty: number;
  negativeFeedback: number;
  seenPostPenalty: number;
}

export interface RankedEntry {
  postId: string;
  totalScore: number;
  catalogIndex: number;
  rankedIndex: number;
  moved: number;
  factors: RankingFactors;
  why: string;
}

export interface RankingResult {
  posts: Post[];
  entries: RankedEntry[];
  applied: boolean;
  reason: "neutral" | "personalized" | "insufficient";
  headline: string;
}

export interface CategoryMixSlice {
  key: PostCategory | "Other";
  percent: number;
}

export interface FeedMixView {
  slices: CategoryMixSlice[];
  personalized: boolean;
}

export function createEmptyPostMemory(): PostMemory {
  return {
    skipCount: 0,
    notInterested: false,
    liked: false,
    saved: false,
    shareCount: 0,
  };
}

export function applyEventToPostMemory(
  memory: Record<string, PostMemory>,
  event: BehaviorEvent,
): Record<string, PostMemory> {
  const current = memory[event.postId] ?? createEmptyPostMemory();
  const next = { ...current };

  switch (event.type) {
    case "quick_skip":
      next.skipCount += 1;
      break;
    case "not_interested":
      next.notInterested = true;
      break;
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
    case "share":
      next.shareCount += 1;
      break;
    default:
      return memory;
  }

  return { ...memory, [event.postId]: next };
}

export function hasRankableProfile(profile: InterestProfile) {
  return (
    profile.meaningfulCount > 0 &&
    POST_CATEGORIES.some((category) => profile.scores[category] > 0)
  );
}

export function normalizeAffinities(scores: InterestProfile["scores"]) {
  const leader = Math.max(0, ...POST_CATEGORIES.map((category) => scores[category]));
  if (leader <= 0) {
    return Object.fromEntries(POST_CATEGORIES.map((category) => [category, 0])) as Record<
      PostCategory,
      number
    >;
  }

  return Object.fromEntries(
    POST_CATEGORIES.map((category) => [category, Math.max(0, scores[category] / leader)]),
  ) as Record<PostCategory, number>;
}

/** Organic posts only. Sponsored placements are inserted after this ranking. */
export function rankFeed(input: {
  posts: Post[];
  profile: InterestProfile;
  memory: Record<string, PostMemory>;
}): RankingResult {
  const catalogEntries = input.posts.map((post, catalogIndex) =>
    buildNeutralEntry(post, catalogIndex, catalogIndex),
  );

  if (!hasRankableProfile(input.profile)) {
    return {
      posts: input.posts,
      entries: catalogEntries,
      applied: false,
      reason: input.profile.meaningfulCount === 0 ? "neutral" : "insufficient",
      headline: "Not enough behavioral signal yet.",
    };
  }

  const affinities = normalizeAffinities(input.profile.scores);
  const catalogIndexById = new Map(input.posts.map((post, index) => [post.id, index]));
  const rankedPositive = POST_CATEGORIES.filter((category) => affinities[category] > 0).sort(
    (a, b) => affinities[b] - affinities[a] || a.localeCompare(b),
  );
  const topCategories = new Set(rankedPositive.slice(0, 2));
  const remaining = [...input.posts];
  const placed: RankedEntry[] = [];
  const recentCategories: PostCategory[] = [];

  while (remaining.length > 0) {
    let bestIndex = 0;
    let best = scoreCandidate({
      post: remaining[0],
      catalogIndex: catalogIndexById.get(remaining[0].id) ?? 0,
      rankedIndex: placed.length,
      affinities,
      topCategories,
      profile: input.profile,
      memory: input.memory[remaining[0].id] ?? createEmptyPostMemory(),
      recentCategories,
    });

    for (let index = 1; index < remaining.length; index += 1) {
      const post = remaining[index];
      const candidate = scoreCandidate({
        post,
        catalogIndex: catalogIndexById.get(post.id) ?? 0,
        rankedIndex: placed.length,
        affinities,
        topCategories,
        profile: input.profile,
        memory: input.memory[post.id] ?? createEmptyPostMemory(),
        recentCategories,
      });

      if (compareCandidates(candidate, best) < 0) {
        best = candidate;
        bestIndex = index;
      }
    }

    const chosen = remaining[bestIndex];
    placed.push(best);
    remaining.splice(bestIndex, 1);
    recentCategories.push(chosen.category);
    if (recentCategories.length > 2) recentCategories.shift();
  }

  const leaders = rankedPositive.slice(0, 2);
  return {
    posts: placed.map((entry) => input.posts.find((post) => post.id === entry.postId)!),
    entries: placed,
    applied: true,
    reason: "personalized",
    headline: describeFeedUpdate(leaders),
  };
}

export function buildFeedMix(
  orderedPosts: Post[],
  windowSize = VISIBLE_MIX_WINDOW,
): FeedMixView {
  const visible = orderedPosts.slice(0, windowSize);
  const counts = Object.fromEntries(POST_CATEGORIES.map((category) => [category, 0])) as Record<
    PostCategory,
    number
  >;
  for (const post of visible) {
    counts[post.category] += 1;
  }

  const ranked = POST_CATEGORIES.map((category) => ({
    category,
    raw: counts[category],
  }))
    .filter((item) => item.raw > 0)
    .sort((a, b) => b.raw - a.raw || a.category.localeCompare(b.category));

  const named = ranked.slice(0, MIX_NAMED_LIMIT);
  const otherRaw = ranked.slice(MIX_NAMED_LIMIT).reduce((sum, item) => sum + item.raw, 0);
  const parts = [
    ...named.map((item) => ({ key: item.category as CategoryMixSlice["key"], raw: item.raw })),
    ...(otherRaw > 0 ? [{ key: "Other" as const, raw: otherRaw }] : []),
  ];
  const percents = distributePercents(parts.map((part) => part.raw));

  return {
    personalized: false,
    slices: parts.map((part, index) => ({
      key: part.key,
      percent: percents[index],
    })),
  };
}

export function buildUserRankHints(result: RankingResult | null) {
  const hints = new Map<
    string,
    { label: "Recommended for you" | "Ranked higher"; explanation: string }
  >();
  if (!result?.applied) return hints;

  const movers = result.entries
    .filter((entry) => entry.moved > 0)
    .sort((a, b) => b.moved - a.moved || a.rankedIndex - b.rankedIndex);
  const recommended = new Set(movers.slice(0, 4).map((entry) => entry.postId));

  for (const entry of movers) {
    hints.set(entry.postId, {
      label: recommended.has(entry.postId) ? "Recommended for you" : "Ranked higher",
      explanation: entry.why,
    });
  }

  return hints;
}

export function isStrongRankingEvent(event: BehaviorEvent) {
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

function scoreCandidate(input: {
  post: Post;
  catalogIndex: number;
  rankedIndex: number;
  affinities: Record<PostCategory, number>;
  topCategories: Set<PostCategory>;
  profile: InterestProfile;
  memory: PostMemory;
  recentCategories: PostCategory[];
}): RankedEntry {
  const affinityUnit = input.affinities[input.post.category];
  const affinity = affinityUnit * RANKING_WEIGHTS.affinity;
  const freshness = input.post.freshness * RANKING_WEIGHTS.freshness;
  const quality = input.post.quality * RANKING_WEIGHTS.quality;
  const popularity = input.post.popularity * RANKING_WEIGHTS.popularity;
  const exploration = explorationBonus(affinityUnit, input.topCategories.has(input.post.category));
  const engagement = categoryEngagement(input.profile, input.post.category);
  const diversityPenalty = diversityCost(input.post.category, input.recentCategories);
  const negativeFeedback = negativeCost(input.profile.scores[input.post.category], input.memory);
  const seenPostPenalty = alreadyActed(input.memory) ? RANKING_WEIGHTS.seenPost : 0;

  const totalScore =
    affinity +
    freshness +
    quality +
    popularity +
    exploration +
    engagement -
    diversityPenalty -
    negativeFeedback -
    seenPostPenalty;

  const moved = input.catalogIndex - input.rankedIndex;
  return {
    postId: input.post.id,
    totalScore,
    catalogIndex: input.catalogIndex,
    rankedIndex: input.rankedIndex,
    moved,
    factors: {
      affinity,
      freshness,
      quality,
      popularity,
      exploration,
      engagement,
      diversityPenalty,
      negativeFeedback,
      seenPostPenalty,
    },
    why: explainMove(input.post.category, affinityUnit, exploration, moved, input.memory),
  };
}

function explorationBonus(affinityUnit: number, isTop: boolean) {
  if (isTop) return 0;
  if (affinityUnit === 0) return RANKING_WEIGHTS.exploration;
  return RANKING_WEIGHTS.exploration * 0.55;
}

function categoryEngagement(profile: InterestProfile, category: PostCategory) {
  const evidence = profile.evidence[category];
  let bonus = 0;
  if (evidence.liked) bonus += RANKING_WEIGHTS.engagement;
  if (evidence.saved) bonus += RANKING_WEIGHTS.engagement + 1;
  if (evidence.shared) bonus += RANKING_WEIGHTS.engagement;
  return bonus;
}

function diversityCost(category: PostCategory, recent: PostCategory[]) {
  let penalty = 0;
  if (recent[recent.length - 1] === category) penalty += RANKING_WEIGHTS.adjacentPenalty;
  if (recent.includes(category)) penalty += RANKING_WEIGHTS.recentRepeatPenalty;
  return penalty;
}

function negativeCost(rawScore: number, memory: PostMemory) {
  let penalty = 0;
  if (memory.notInterested) penalty += RANKING_WEIGHTS.notInterested;
  if (memory.skipCount >= 2) penalty += RANKING_WEIGHTS.skipRepeat;
  else if (memory.skipCount === 1) penalty += RANKING_WEIGHTS.skipOnce;
  if (rawScore < 0) {
    penalty += RANKING_WEIGHTS.negativeCategory * Math.min(1, Math.abs(rawScore) / 18);
  }
  return penalty;
}

function alreadyActed(memory: PostMemory) {
  return memory.liked || memory.saved || memory.shareCount > 0;
}

function explainMove(
  category: PostCategory,
  affinityUnit: number,
  exploration: number,
  moved: number,
  memory: PostMemory,
) {
  if (memory.notInterested) {
    return `This post moved down because you marked it Not Interested.`;
  }
  if (moved <= 0 && exploration > affinityUnit * RANKING_WEIGHTS.affinity) {
    return `This ${category} post stayed in the mix so the feed does not collapse into one topic.`;
  }
  if (moved > 0 && affinityUnit >= 0.55) {
    return `This post moved up because ${category} is your strongest inferred interest.`;
  }
  if (moved > 0 && affinityUnit > 0) {
    return `This post moved up because you have shown interest in ${category}.`;
  }
  return `This post is in the current mix based on your inferred interests and a little exploration.`;
}

function describeFeedUpdate(leaders: PostCategory[]) {
  if (leaders.length >= 2) {
    return `${leaders[0]} and ${leaders[1]} moved higher based on your recent behavior.`;
  }
  if (leaders.length === 1) {
    return `${leaders[0]} moved higher based on your recent behavior.`;
  }
  return "Your feed was refreshed from the current profile.";
}

function compareCandidates(left: RankedEntry, right: RankedEntry) {
  if (left.totalScore !== right.totalScore) {
    return right.totalScore - left.totalScore;
  }
  return left.catalogIndex - right.catalogIndex;
}

function buildNeutralEntry(post: Post, catalogIndex: number, rankedIndex: number): RankedEntry {
  return {
    postId: post.id,
    totalScore: 0,
    catalogIndex,
    rankedIndex,
    moved: 0,
    factors: {
      affinity: 0,
      freshness: 0,
      quality: 0,
      popularity: 0,
      exploration: 0,
      engagement: 0,
      diversityPenalty: 0,
      negativeFeedback: 0,
      seenPostPenalty: 0,
    },
    why: "The feed is still in its original catalog order.",
  };
}
