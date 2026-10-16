import type { ViewMode } from "@/lib/engineer-view";
import type { Post } from "@/types/post";

export const GUIDED_STEP_IDS = [
  "neutral",
  "like-tech",
  "save-tech",
  "personalize-feed",
  "inspect-post",
  "personalize-ads",
  "negative",
  "engineer",
] as const;

export type GuidedStepId = (typeof GUIDED_STEP_IDS)[number];

export type GuidedStatus =
  | "idle"
  | "confirm-start"
  | "running"
  | "done"
  | "confirm-restart";

export type GuideHighlight =
  | "like-tech"
  | "save-tech"
  | "feed-personalization-on"
  | "why-this-post"
  | "ad-personalization-on"
  | "why-this-ad"
  | "not-interested-tech"
  | "refresh-feed"
  | "engineer-mode"
  | "engineer-panels";

export interface GuidedSnapshot {
  likedTechnology: boolean;
  savedTechnology: boolean;
  feedPersonalizationOn: boolean;
  rankingApplied: boolean;
  profileStale: boolean;
  selectedTechnology: boolean;
  adPersonalizationOn: boolean;
  whyAdOpen: boolean;
  notInterestedTechnology: boolean;
  viewMode: ViewMode;
  hasProgress: boolean;
}

export interface GuidedState {
  status: GuidedStatus;
  stepIndex: number;
  allowAutoAdvance: boolean;
  introVisible: boolean;
}

export type GuidedAction =
  | { type: "REQUEST_START" }
  | { type: "CONFIRM_FRESH" }
  | { type: "CONFIRM_KEEP" }
  | { type: "CANCEL_CONFIRM" }
  | { type: "EXPLORE_FREELY" }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SKIP" }
  | { type: "EXIT" }
  | { type: "REQUEST_RESTART" }
  | { type: "AUTO_ADVANCE" };

export interface GuidedStepCopy {
  id: GuidedStepId;
  number: number;
  title: string;
  body: string;
  observation: string;
  cta: string | null;
  autoAdvance: boolean;
}

export const GUIDED_STEPS: GuidedStepCopy[] = [
  {
    id: "neutral",
    number: 1,
    title: "Everyone starts with the same fictional feed",
    body: "Feed Personalization and Ad Personalization are off. This is the original catalog order — not a personalized ranking.",
    observation: "Notice the mix of topics. Nothing has been inferred yet.",
    cta: "Next: Teach the Feed",
    autoAdvance: false,
  },
  {
    id: "like-tech",
    number: 2,
    title: "Like a Technology post",
    body: "Your like becomes a positive behavioral signal.",
    observation: "Watch Algorithm Mirror — Technology should appear as an inferred interest.",
    cta: null,
    autoAdvance: true,
  },
  {
    id: "save-tech",
    number: 3,
    title: "Save a Technology post",
    body: "Saving a post is a stronger signal in this simulation.",
    observation: "Technology interest should become stronger in Feed DNA.",
    cta: null,
    autoAdvance: true,
  },
  {
    id: "personalize-feed",
    number: 4,
    title: "Turn Feed Personalization on",
    body: "Your inferred interests can now influence content order.",
    observation: "Technology posts should move up in the actual ranking.",
    cta: null,
    autoAdvance: true,
  },
  {
    id: "inspect-post",
    number: 5,
    title: "Inspect a Technology recommendation",
    body: "Open Why This Post on a Technology card to see original position, personalized position, and why it moved.",
    observation: "This explanation uses the live ranking snapshot — not a scripted story.",
    cta: null,
    autoAdvance: true,
  },
  {
    id: "personalize-ads",
    number: 6,
    title: "Turn Ad Personalization on",
    body: "Advertising uses a separate commercial profile.",
    observation: "Open Why This Ad on the sponsored card. Organic ranking does not pick this placement.",
    cta: null,
    autoAdvance: true,
  },
  {
    id: "negative",
    number: 7,
    title: "Mark a Technology post Not Interested",
    body: "Negative feedback can change what the system recommends.",
    observation: "If the feed is personalized, refresh it to apply the new scores.",
    cta: null,
    autoAdvance: true,
  },
  {
    id: "engineer",
    number: 8,
    title: "Open Recommendation Engineer Mode",
    body: "These are the internal simulation values behind the experience: Event Console, Interest Profile Vector, Ranking Inspector, Commercial Profile Vector, and Ad Selection.",
    observation: "User View shows outcomes. Engineer Mode shows mechanism.",
    cta: null,
    autoAdvance: true,
  },
];

export const GUIDED_DISCLAIMER =
  "Feed X-Ray is an educational simulation. Its scoring rules are fictional and do not represent the proprietary algorithms of real social platforms.";

export function createGuidedState(): GuidedState {
  return {
    status: "idle",
    stepIndex: 0,
    allowAutoAdvance: true,
    introVisible: true,
  };
}

export function currentGuidedStep(state: GuidedState): GuidedStepCopy | null {
  if (state.status !== "running") return null;
  return GUIDED_STEPS[state.stepIndex] ?? null;
}

export function isGuidedStepSatisfied(id: GuidedStepId, snapshot: GuidedSnapshot) {
  switch (id) {
    case "neutral":
      return false;
    case "like-tech":
      return snapshot.likedTechnology;
    case "save-tech":
      return snapshot.savedTechnology;
    case "personalize-feed":
      return snapshot.feedPersonalizationOn && snapshot.rankingApplied;
    case "inspect-post":
      return snapshot.selectedTechnology;
    case "personalize-ads":
      return snapshot.adPersonalizationOn && snapshot.whyAdOpen;
    case "negative":
      if (!snapshot.notInterestedTechnology) return false;
      if (snapshot.feedPersonalizationOn && snapshot.rankingApplied && snapshot.profileStale) {
        return false;
      }
      return true;
    case "engineer":
      return snapshot.viewMode === "engineer";
  }
}

export function firstPlayableStepIndex(snapshot: GuidedSnapshot) {
  for (let index = 1; index < GUIDED_STEP_IDS.length; index += 1) {
    if (!isGuidedStepSatisfied(GUIDED_STEP_IDS[index], snapshot)) return index;
  }
  return GUIDED_STEP_IDS.length;
}

export function resolveGuideHighlight(
  state: GuidedState,
  snapshot: GuidedSnapshot,
): GuideHighlight | null {
  if (state.status === "done" && snapshot.viewMode === "engineer") {
    return "engineer-panels";
  }
  if (state.status !== "running") return null;
  const id = GUIDED_STEP_IDS[state.stepIndex];
  switch (id) {
    case "neutral":
      return null;
    case "like-tech":
      return snapshot.likedTechnology ? null : "like-tech";
    case "save-tech":
      return snapshot.savedTechnology ? null : "save-tech";
    case "personalize-feed":
      return snapshot.feedPersonalizationOn && snapshot.rankingApplied
        ? null
        : "feed-personalization-on";
    case "inspect-post":
      return snapshot.selectedTechnology ? null : "why-this-post";
    case "personalize-ads":
      if (!snapshot.adPersonalizationOn) return "ad-personalization-on";
      if (!snapshot.whyAdOpen) return "why-this-ad";
      return null;
    case "negative":
      if (!snapshot.notInterestedTechnology) return "not-interested-tech";
      if (snapshot.feedPersonalizationOn && snapshot.profileStale) return "refresh-feed";
      return null;
    case "engineer":
      return snapshot.viewMode === "engineer" ? "engineer-panels" : "engineer-mode";
  }
}

export function pickGuidePostId(
  stepId: GuidedStepId | null,
  orderedPosts: readonly Post[],
  likedIds: ReadonlySet<string>,
  savedIds: ReadonlySet<string>,
  notInterestedIds: ReadonlySet<string>,
) {
  const tech = orderedPosts.filter((post) => post.category === "Technology");
  if (tech.length === 0) return null;
  if (stepId === "like-tech") {
    return tech.find((post) => !likedIds.has(post.id))?.id ?? tech[0].id;
  }
  if (stepId === "save-tech") {
    return tech.find((post) => !savedIds.has(post.id))?.id ?? tech[0].id;
  }
  if (stepId === "negative") {
    return tech.find((post) => !notInterestedIds.has(post.id))?.id ?? tech[0].id;
  }
  if (stepId === "inspect-post") {
    return tech[0].id;
  }
  return tech[0].id;
}

export function hasGuidedProgress(input: {
  likedCount: number;
  savedCount: number;
  notInterestedCount: number;
  feedPersonalizationOn: boolean;
  adPersonalizationOn: boolean;
  viewMode: ViewMode;
  selectedPostId: string | null;
}) {
  return (
    input.likedCount > 0 ||
    input.savedCount > 0 ||
    input.notInterestedCount > 0 ||
    input.feedPersonalizationOn ||
    input.adPersonalizationOn ||
    input.viewMode === "engineer" ||
    Boolean(input.selectedPostId)
  );
}

export function reduceGuidedDemo(
  state: GuidedState,
  action: GuidedAction,
  snapshot: GuidedSnapshot,
): GuidedState {
  switch (action.type) {
    case "REQUEST_START":
      if (state.status !== "idle") return state;
      if (snapshot.hasProgress) {
        return { ...state, status: "confirm-start", introVisible: true };
      }
      return { ...state, status: "running", stepIndex: 0, allowAutoAdvance: true, introVisible: false };
    case "CONFIRM_FRESH":
      if (state.status !== "confirm-start" && state.status !== "confirm-restart") {
        return state;
      }
      return {
        status: "running",
        stepIndex: 0,
        allowAutoAdvance: true,
        introVisible: false,
      };
    case "CONFIRM_KEEP": {
      if (state.status !== "confirm-start" && state.status !== "confirm-restart") {
        return state;
      }
      const index = firstPlayableStepIndex(snapshot);
      if (index >= GUIDED_STEP_IDS.length) {
        return {
          status: "done",
          stepIndex: GUIDED_STEP_IDS.length - 1,
          allowAutoAdvance: false,
          introVisible: false,
        };
      }
      return {
        status: "running",
        stepIndex: index,
        allowAutoAdvance: true,
        introVisible: false,
      };
    }
    case "CANCEL_CONFIRM":
      if (state.status === "confirm-start") {
        return { ...state, status: "idle" };
      }
      if (state.status === "confirm-restart") {
        return { ...state, status: "done" };
      }
      return state;
    case "EXPLORE_FREELY":
      return {
        ...state,
        status: "idle",
        introVisible: false,
        allowAutoAdvance: false,
      };
    case "NEXT": {
      if (state.status !== "running") return state;
      const step = GUIDED_STEPS[state.stepIndex];
      if (!step) return state;
      if (step.autoAdvance && !isGuidedStepSatisfied(step.id, snapshot)) {
        return state;
      }
      return advance(state);
    }
    case "SKIP":
      if (state.status !== "running") return state;
      return advance(state);
    case "BACK":
      if (state.status === "done") {
        return {
          status: "running",
          stepIndex: GUIDED_STEP_IDS.length - 1,
          allowAutoAdvance: false,
          introVisible: false,
        };
      }
      if (state.status !== "running" || state.stepIndex <= 0) return state;
      return {
        ...state,
        stepIndex: state.stepIndex - 1,
        allowAutoAdvance: false,
      };
    case "EXIT":
      return {
        ...state,
        status: "idle",
        introVisible: false,
        allowAutoAdvance: false,
      };
    case "REQUEST_RESTART":
      if (state.status !== "done" && state.status !== "running") return state;
      if (snapshot.hasProgress) {
        return { ...state, status: "confirm-restart" };
      }
      return {
        status: "running",
        stepIndex: 0,
        allowAutoAdvance: true,
        introVisible: false,
      };
    case "AUTO_ADVANCE": {
      if (state.status !== "running" || !state.allowAutoAdvance) return state;
      const step = GUIDED_STEPS[state.stepIndex];
      if (!step?.autoAdvance) return state;
      if (!isGuidedStepSatisfied(step.id, snapshot)) return state;
      return advance(state);
    }
    default:
      return state;
  }
}

function advance(state: GuidedState): GuidedState {
  if (state.stepIndex >= GUIDED_STEP_IDS.length - 1) {
    return {
      status: "done",
      stepIndex: GUIDED_STEP_IDS.length - 1,
      allowAutoAdvance: false,
      introVisible: false,
    };
  }
  return {
    ...state,
    stepIndex: state.stepIndex + 1,
    allowAutoAdvance: true,
  };
}
