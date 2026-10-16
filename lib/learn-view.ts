import type { GuidedStatus, GuidedStepId } from "@/lib/guided-demo";
import type { SimulationViewMode, ViewMode } from "@/lib/engineer-view";
import type { PostCategory } from "@/types/post";

export const LEARN_CATALOG_SIZE = 20;

export const LEARN_DISCLAIMER =
  "Feed X-Ray is an educational simulation. Its weights and decision rules are fictional and are not the proprietary algorithms of Instagram, TikTok, YouTube, LinkedIn, X, or other platforms.";

export const LEARN_NAV = [
  { id: "pipeline", label: "Pipeline" },
  { id: "signals", label: "Signals" },
  { id: "ranking", label: "Ranking" },
  { id: "exploration", label: "Exploration" },
  { id: "feedback", label: "Feedback Loop" },
  { id: "ads", label: "Ads" },
  { id: "limits", label: "Simulation Limits" },
] as const;

export type LearnNavId = (typeof LEARN_NAV)[number]["id"];

export function learnSectionHref(id: LearnNavId) {
  return `#learn-${id}`;
}

export const PIPELINE_STAGE_IDS = [
  "interactions",
  "signals",
  "profile",
  "candidates",
  "ranking",
  "diversity",
  "feed",
] as const;

export type PipelineStageId = (typeof PIPELINE_STAGE_IDS)[number];

export interface PipelineStageCopy {
  id: PipelineStageId;
  label: string;
  beginner: string;
  realWorld?: string;
  feedXray?: string;
}

export const PIPELINE_STAGES: PipelineStageCopy[] = [
  {
    id: "interactions",
    label: "User interactions",
    beginner:
      "People like, save, skip, watch, and tap through posts. Those actions are the raw material a feed can observe.",
  },
  {
    id: "signals",
    label: "Behavioral signals",
    beginner:
      "Actions such as likes, saves, and watch time can provide clues about what someone may find interesting.",
  },
  {
    id: "profile",
    label: "Interest profile",
    beginner:
      "A recommendation system may summarize these clues into a representation of inferred interests.",
  },
  {
    id: "candidates",
    label: "Candidate content",
    beginner:
      "Large systems may first retrieve a smaller set of potentially relevant posts from a much larger collection.",
    realWorld: "Candidate retrieval from a large content pool.",
    feedXray: `All ${LEARN_CATALOG_SIZE} local posts are available to the ranking engine. Feed X-Ray does not implement production-scale candidate retrieval.`,
  },
  {
    id: "ranking",
    label: "Ranking",
    beginner: "Candidate posts can be scored and ordered based on multiple factors.",
  },
  {
    id: "diversity",
    label: "Diversity / exploration",
    beginner:
      "Some systems may introduce different content to avoid showing only one type of post, and may show unfamiliar topics to learn more.",
  },
  {
    id: "feed",
    label: "Personalized feed",
    beginner:
      "The visitor sees an ordered mix of organic posts, plus a separately chosen sponsored placement.",
  },
];

export interface LearnSignalCopy {
  id: "like" | "save" | "watch" | "skip" | "not-interested";
  title: string;
  beginner: string;
  caveat: string;
}

export const LEARN_SIGNALS: LearnSignalCopy[] = [
  {
    id: "like",
    title: "Like",
    beginner: "A positive preference signal.",
    caveat: "A like is still just one action. It does not prove a lasting preference.",
  },
  {
    id: "save",
    title: "Save",
    beginner: "May indicate stronger interest or future intent.",
    caveat: "People also save things to revisit later, not only because they enjoy them.",
  },
  {
    id: "watch",
    title: "Watch time",
    beginner: "Longer engagement can indicate interest, but does not always mean enjoyment.",
    caveat:
      "Watching something for a long time does not necessarily mean you liked it. It might be surprising, confusing, or hard to look away from.",
  },
  {
    id: "skip",
    title: "Quick skip",
    beginner: "May indicate low interest, but can also happen for unrelated reasons.",
    caveat: "A skip can mean “not now,” a mis-tap, or simply scrolling past — not a verified dislike.",
  },
  {
    id: "not-interested",
    title: "Not Interested",
    beginner: "Explicit negative feedback.",
    caveat: "Even explicit rejection is about this content in this moment, not a person’s whole identity.",
  },
];

export interface RankingFactorCopy {
  id: string;
  title: string;
  beginner: string;
  technical: string;
}

export const RANKING_FACTORS_COPY: RankingFactorCopy[] = [
  {
    id: "affinity",
    title: "Category affinity",
    beginner: "Posts related to your inferred interests may receive a higher ranking score.",
    technical:
      "Feed X-Ray uses a deterministic weighted scoring function. Category affinity is the largest educational weight.",
  },
  {
    id: "freshness",
    title: "Freshness",
    beginner: "Newer content may receive a small boost.",
    technical: "Freshness is a small demo factor so the catalog’s recency still has a voice.",
  },
  {
    id: "quality",
    title: "Content quality",
    beginner: "A post can rank a little higher when the demo treats it as higher quality.",
    technical: "Quality is a static teaching signal on each fictional post — not a trained quality model.",
  },
  {
    id: "popularity",
    title: "Popularity",
    beginner: "Widely engaged content may get a modest lift.",
    technical: "Popularity here is a canned demo value, not live collaborative filtering.",
  },
  {
    id: "exploration",
    title: "Exploration",
    beginner: "A system may show unfamiliar topics to learn whether you are interested.",
    technical: "Exploration can give weaker-affinity posts a chance to appear near the top.",
  },
  {
    id: "engagement",
    title: "Engagement",
    beginner: "Saves, shares, and similar actions on a post can support its rank.",
    technical: "Post-level memory of likes, saves, and shares contributes a small engagement term.",
  },
  {
    id: "diversity",
    title: "Diversity penalty",
    beginner: "A system may avoid showing too many similar posts consecutively.",
    technical:
      "Feed X-Ray uses greedy placement with diversity penalties so adjacent repeats are discouraged.",
  },
  {
    id: "negative",
    title: "Negative feedback",
    beginner: "Content similar to something you rejected may rank lower.",
    technical: "Not Interested and repeated skips reduce a post’s educational score.",
  },
  {
    id: "seen",
    title: "Seen-post penalty",
    beginner: "Posts you have already seen may be slightly less likely to stay on top.",
    technical: "A seen-post penalty reduces repetition after a post has already appeared.",
  },
];

export const PERSONALIZATION_COMBOS = [
  {
    id: "feed-off-ads-off",
    feedOn: false,
    adsOn: false,
    title: "Feed off / Ads off",
    body: "Organic posts stay in catalog order. Sponsored content can still appear, selected contextually.",
  },
  {
    id: "feed-on-ads-off",
    feedOn: true,
    adsOn: false,
    title: "Feed on / Ads off",
    body: "Organic ranking can reorder posts from inferred interests. Ads stay contextual.",
  },
  {
    id: "feed-off-ads-on",
    feedOn: false,
    adsOn: true,
    title: "Feed off / Ads on",
    body: "The organic feed stays neutral while sponsored selection may use the commercial profile.",
  },
  {
    id: "feed-on-ads-on",
    feedOn: true,
    adsOn: true,
    title: "Feed on / Ads on",
    body: "Organic ranking and sponsored selection can both personalize — still as separate processes.",
  },
] as const;

export const LEARN_IMPLEMENTS = [
  "Local behavioral events",
  "Deterministic interest scoring",
  "Organic ranking",
  "Diversity and exploration",
  "Commercial affinity scoring",
  "Fictional sponsored selection",
  "Ranking explanations",
  "Engineer observability",
] as const;

export const LEARN_DOES_NOT_IMPLEMENT = [
  "Real social platform algorithms",
  "Machine learning model training",
  "Embeddings",
  "Collaborative filtering",
  "Production candidate retrieval",
  "Large-scale distributed infrastructure",
  "Real advertising auctions",
  "Real advertiser integrations",
  "User identity tracking",
  "Backend behavioral storage",
] as const;

export const ILLUSTRATIVE_WITHOUT_DIVERSITY = [
  "Technology",
  "Technology",
  "Technology",
  "Technology",
] as const;

export const ILLUSTRATIVE_WITH_DIVERSITY = [
  "Technology",
  "Travel",
  "Technology",
  "Food",
] as const;

export interface LearnLiveInput {
  likes: number;
  saves: number;
  shares: number;
  longWatches: number;
  quickSkips: number;
  notInterested: number;
  postsViewed: number;
  interestLeader: PostCategory | null;
  rankingApplied: boolean;
  personalizationOn: boolean;
  adPersonalizationOn: boolean;
  organicTopCategory: PostCategory | null;
  sponsoredCategory: string;
  rankingHeadline: string | null;
  movedUpCategories: readonly PostCategory[];
  catalogSize: number;
  topOrganicCategories: readonly PostCategory[];
}

export interface LearnSessionView {
  hasInteractiveActivity: boolean;
  hasSession: boolean;
  actionsRecorded: number;
  interestLeader: PostCategory | null;
  rankingApplied: boolean;
  personalizationOn: boolean;
  adPersonalizationOn: boolean;
  organicTopCategory: PostCategory | null;
  sponsoredCategory: string;
  comboId: (typeof PERSONALIZATION_COMBOS)[number]["id"];
  signalNote: string | null;
  profileNote: string | null;
  rankingNote: string | null;
  emptyPrompt: string;
  catalogSize: number;
  topOrganicCategories: readonly PostCategory[];
}

export function hasInteractiveLearnActivity(input: Pick<
  LearnLiveInput,
  "likes" | "saves" | "shares" | "longWatches" | "quickSkips" | "notInterested"
>) {
  return (
    input.likes +
      input.saves +
      input.shares +
      input.longWatches +
      input.quickSkips +
      input.notInterested >
    0
  );
}

export function personalizationComboId(feedOn: boolean, adsOn: boolean) {
  if (feedOn && adsOn) return "feed-on-ads-on" as const;
  if (feedOn) return "feed-on-ads-off" as const;
  if (adsOn) return "feed-off-ads-on" as const;
  return "feed-off-ads-off" as const;
}

export function describeSignalLive(input: Pick<LearnLiveInput, "likes" | "saves">) {
  if (input.likes === 0 && input.saves === 0) return null;
  const likes = `${input.likes} ${input.likes === 1 ? "like" : "likes"}`;
  const saves = `${input.saves} ${input.saves === 1 ? "save" : "saves"}`;
  return `Your session has recorded ${likes} and ${saves}.`;
}

export function describeProfileLive(leader: PostCategory | null) {
  if (!leader) return null;
  return `${leader} is currently your strongest inferred interest.`;
}

export function describeRankingLive(input: Pick<
  LearnLiveInput,
  "rankingApplied" | "personalizationOn" | "movedUpCategories" | "rankingHeadline"
>) {
  if (input.rankingApplied && input.movedUpCategories.length > 0) {
    const lead = input.movedUpCategories[0];
    return `${lead} content moved higher after personalization.`;
  }
  if (input.rankingApplied && input.rankingHeadline) {
    return input.rankingHeadline;
  }
  if (input.personalizationOn && !input.rankingApplied) {
    return "Feed Personalization is on, but a personalized ranking is not applied yet.";
  }
  return null;
}

export function buildLearnSession(input: LearnLiveInput): LearnSessionView {
  const interactive = hasInteractiveLearnActivity(input);
  const hasSession =
    interactive ||
    input.personalizationOn ||
    input.adPersonalizationOn ||
    Boolean(input.interestLeader);
  const actionsRecorded =
    input.likes +
    input.saves +
    input.shares +
    input.longWatches +
    input.quickSkips +
    input.notInterested;

  return {
    hasInteractiveActivity: interactive,
    hasSession,
    actionsRecorded,
    interestLeader: input.interestLeader,
    rankingApplied: input.rankingApplied,
    personalizationOn: input.personalizationOn,
    adPersonalizationOn: input.adPersonalizationOn,
    organicTopCategory: input.organicTopCategory,
    sponsoredCategory: input.sponsoredCategory,
    comboId: personalizationComboId(input.personalizationOn, input.adPersonalizationOn),
    signalNote: describeSignalLive(input),
    profileNote: describeProfileLive(input.interestLeader),
    rankingNote: describeRankingLive(input),
    emptyPrompt: "Try liking or saving a post to see this stage update.",
    catalogSize: input.catalogSize,
    topOrganicCategories: input.topOrganicCategories,
  };
}

export function planViewTransition(from: ViewMode, to: ViewMode) {
  return {
    pauseVisibility: from !== "learn" && to === "learn",
    settleVisibility: from === "learn" && to !== "learn",
    preserveSimulation: true,
    preserveGuidedDemo: true,
  };
}

export function isGuidedDemoActive(status: GuidedStatus) {
  return status === "running" || status === "confirm-restart";
}

export function walkthroughReturnMode(
  status: GuidedStatus,
  stepId: GuidedStepId | null,
): SimulationViewMode {
  if (status === "running" && stepId === "engineer") return "engineer";
  return "user";
}

export const ORGANIC_VS_SPONSORED = {
  organic: {
    title: "Organic recommendations",
    inputs: ["Behavioral signals", "Interest profile", "Content ranking factors"],
    output: "Order of organic posts",
  },
  sponsored: {
    title: "Sponsored content",
    inputs: ["Commercial signals", "Ad personalization setting", "Available fictional ads"],
    output: "Selected sponsored placement",
  },
  separation:
    "These are separate decision processes in Feed X-Ray. Real platforms may have more complex advertising systems.",
  adsRemain:
    "Disabling ad personalization does not necessarily remove advertising. It may change how ads are selected.",
} as const;
