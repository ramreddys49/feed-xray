import { RANKING_WEIGHTS, type RankedEntry, type RankingResult } from "@/lib/ranking-engine";
import type { Post, PostCategory } from "@/types/post";

export type ExplanationKind =
  | "personalized"
  | "exploration"
  | "diversity"
  | "negative"
  | "neutral"
  | "off"
  | "insufficient";

export type FactorLevelLabel = "None" | "Low" | "Medium" | "High" | "Strong";

export interface WhyFactorRow {
  key: string;
  label: string;
  level: FactorLevelLabel;
  bars: number;
  hint: string;
}

export interface WhyThisPostView {
  status: "empty" | "ready";
  kind: ExplanationKind;
  category: PostCategory | null;
  creatorName: string;
  title: string;
  headline: string;
  body: string;
  education: string | null;
  outcome: string;
  catalogPosition: number;
  rankedPosition: number;
  moved: number;
  showFactors: boolean;
  factors: WhyFactorRow[];
}

const EMPTY_VIEW: WhyThisPostView = {
  status: "empty",
  kind: "neutral",
  category: null,
  creatorName: "",
  title: "",
  headline: "Select a post to inspect why it appears here.",
  body: "Why This Post explains a single ranking decision. It does not change the feed.",
  education: null,
  outcome: "",
  catalogPosition: 0,
  rankedPosition: 0,
  moved: 0,
  showFactors: false,
  factors: [],
};

export function buildWhyThisPostExplanation(input: {
  post: Post | null;
  catalog: Post[];
  ranking: RankingResult | null;
  personalizationOn: boolean;
  rankingApplied: boolean;
}): WhyThisPostView {
  if (!input.post) return EMPTY_VIEW;

  const catalogIndex = input.catalog.findIndex((item) => item.id === input.post?.id);
  const entry = input.ranking?.entries.find((item) => item.postId === input.post?.id) ?? null;
  const catalogPosition = catalogIndex + 1;
  const rankedPosition = input.rankingApplied && entry ? entry.rankedIndex + 1 : catalogPosition;
  const moved = input.rankingApplied && entry ? entry.moved : 0;
  const kind = resolveKind({
    personalizationOn: input.personalizationOn,
    rankingApplied: input.rankingApplied,
    entry,
    rankingReason: input.ranking?.reason ?? "neutral",
  });
  const copy = copyForKind(kind, input.post.category, moved);

  return {
    status: "ready",
    kind,
    category: input.post.category,
    creatorName: input.post.creatorName,
    title: input.post.title,
    headline: copy.headline,
    body: copy.body,
    education: copy.education,
    outcome: copy.outcome,
    catalogPosition,
    rankedPosition,
    moved,
    showFactors: kind !== "off" && kind !== "insufficient" && Boolean(entry && input.rankingApplied),
    factors: entry ? buildFactorRows(entry) : [],
  };
}

function resolveKind(input: {
  personalizationOn: boolean;
  rankingApplied: boolean;
  entry: RankedEntry | null;
  rankingReason: RankingResult["reason"];
}): ExplanationKind {
  if (!input.personalizationOn) return "off";
  if (!input.rankingApplied || input.rankingReason === "insufficient") return "insufficient";
  if (!input.entry) return "neutral";

  const { factors, moved } = input.entry;
  const affinityStrong = factors.affinity >= RANKING_WEIGHTS.affinity * 0.55;
  const explorationHigh = factors.exploration >= RANKING_WEIGHTS.exploration * 0.5;
  const negativeHigh = factors.negativeFeedback >= RANKING_WEIGHTS.skipOnce;
  const diversityHigh = factors.diversityPenalty >= RANKING_WEIGHTS.recentRepeatPenalty;

  if (negativeHigh && (moved < 0 || factors.negativeFeedback >= RANKING_WEIGHTS.notInterested * 0.75)) {
    return "negative";
  }
  if (explorationHigh && !affinityStrong) return "exploration";
  if (diversityHigh && !affinityStrong) return "diversity";
  if (affinityStrong && moved > 0) return "personalized";
  if (affinityStrong) return "personalized";
  if (explorationHigh) return "exploration";
  if (moved === 0) return "neutral";
  return "neutral";
}

function copyForKind(kind: ExplanationKind, category: PostCategory, moved: number) {
  switch (kind) {
    case "off":
      return {
        headline: "Personalization is off.",
        body: "This post appears in the original catalog order.",
        education: null,
        outcome: "Original catalog order",
      };
    case "insufficient":
      return {
        headline: "Not enough behavioral signal yet.",
        body: "This feed remains close to the neutral catalog order.",
        education: null,
        outcome: "Neutral catalog order",
      };
    case "personalized":
      return {
        headline: `${category} is currently one of your strongest inferred interests.`,
        body: `This moved up because ${category} is one of your strongest inferred interests.`,
        education: null,
        outcome: moved > 0 ? "Ranked higher" : "Held near the top",
      };
    case "exploration":
      return {
        headline: `This ${category} post is here for exploration.`,
        body: `This appeared higher even though ${category} is not your strongest interest because the feed is exploring what else you may like.`,
        education:
          "Recommendation systems may intentionally show content outside your strongest interests to learn what else you might enjoy.",
        outcome: moved > 0 ? "Ranked higher" : "Kept in the mix",
      };
    case "diversity":
      return {
        headline: "This post helps keep your feed from becoming too repetitive.",
        body: "This post helped diversify your feed so you do not see too many posts from the same category in a row.",
        education:
          "This is a teaching model. It does not claim that any real platform uses this exact diversity rule.",
        outcome: "Used to diversify the feed",
      };
    case "negative":
      return {
        headline: `${category} ranked lower after negative feedback.`,
        body: "This category ranked lower because you previously skipped or marked similar content Not Interested.",
        education: null,
        outcome: moved < 0 ? "Ranked lower" : "Held back",
      };
    default:
      return {
        headline: "Personalization did not meaningfully affect this post.",
        body: "This post stayed close to the place it already had in the catalog.",
        education: null,
        outcome: "Position unchanged",
      };
  }
}

function buildFactorRows(entry: RankedEntry): WhyFactorRow[] {
  const { factors } = entry;
  return [
    qualitativeRow(
      "affinity",
      "Interest match",
      factors.affinity / RANKING_WEIGHTS.affinity,
      "Matches your strongest inferred interest",
    ),
    qualitativeRow(
      "freshness",
      "Freshness",
      factors.freshness / RANKING_WEIGHTS.freshness,
      "A small demo recency signal, not a live platform clock",
    ),
    qualitativeRow(
      "quality",
      "Content quality",
      factors.quality / RANKING_WEIGHTS.quality,
      "A small demo quality signal, not a production score",
    ),
    qualitativeRow(
      "exploration",
      "Exploration",
      factors.exploration / RANKING_WEIGHTS.exploration,
      "Shown partly to explore a new interest",
    ),
    qualitativeRow(
      "negative",
      "Negative feedback",
      factors.negativeFeedback / RANKING_WEIGHTS.notInterested,
      "Reduced because of previous negative feedback",
    ),
  ];
}

function qualitativeRow(
  key: string,
  label: string,
  ratio: number,
  highHint: string,
): WhyFactorRow {
  const clamped = Math.max(0, Math.min(1, ratio));
  let level: FactorLevelLabel = "None";
  let bars = 0;

  if (clamped > 0.02 && clamped < 0.28) {
    level = "Low";
    bars = 2;
  } else if (clamped >= 0.28 && clamped < 0.55) {
    level = "Medium";
    bars = 4;
  } else if (clamped >= 0.55 && clamped < 0.82) {
    level = "High";
    bars = 6;
  } else if (clamped >= 0.82) {
    level = "Strong";
    bars = 8;
  }

  const hint =
    level === "None"
      ? "Not a meaningful driver for this post."
      : level === "Low"
        ? "A light influence on this placement."
        : highHint;

  return { key, label, level, bars, hint };
}
