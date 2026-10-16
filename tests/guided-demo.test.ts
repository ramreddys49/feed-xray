import { describe, expect, it, vi } from "vitest";
import { posts } from "@/data/posts";
import {
  createGuidedState,
  currentGuidedStep,
  firstPlayableStepIndex,
  hasGuidedProgress,
  isGuidedStepSatisfied,
  pickGuidePostId,
  reduceGuidedDemo,
  resolveGuideHighlight,
  type GuidedSnapshot,
  type GuidedState,
} from "@/lib/guided-demo";
import { planGuideScroll, runGuideScroll } from "@/lib/guide-scroll";
import { VisibilityTracker } from "@/lib/visibility-tracker";

const emptySnapshot: GuidedSnapshot = {
  likedTechnology: false,
  savedTechnology: false,
  feedPersonalizationOn: false,
  rankingApplied: false,
  profileStale: false,
  selectedTechnology: false,
  adPersonalizationOn: false,
  whyAdOpen: false,
  notInterestedTechnology: false,
  viewMode: "user",
  hasProgress: false,
};

function apply(state: GuidedState, type: Parameters<typeof reduceGuidedDemo>[1]["type"], snapshot = emptySnapshot) {
  return reduceGuidedDemo(state, { type }, snapshot);
}

describe("guided demo machine", () => {
  it("starts at the first step when there is no progress", () => {
    const next = apply(createGuidedState(), "REQUEST_START");
    expect(next.status).toBe("running");
    expect(next.stepIndex).toBe(0);
    expect(currentGuidedStep(next)?.id).toBe("neutral");
  });

  it("asks before starting over existing progress", () => {
    const next = apply(createGuidedState(), "REQUEST_START", {
      ...emptySnapshot,
      hasProgress: true,
      likedTechnology: true,
    });
    expect(next.status).toBe("confirm-start");
  });

  it("keep-progress jumps to the first unsatisfied action", () => {
    const snapshot: GuidedSnapshot = {
      ...emptySnapshot,
      hasProgress: true,
      likedTechnology: true,
      savedTechnology: true,
    };
    const confirming = apply(createGuidedState(), "REQUEST_START", snapshot);
    const kept = apply(confirming, "CONFIRM_KEEP", snapshot);
    expect(kept.status).toBe("running");
    expect(currentGuidedStep(kept)?.id).toBe("personalize-feed");
  });

  it("fresh start always begins at the neutral step", () => {
    const confirming = apply(createGuidedState(), "REQUEST_START", {
      ...emptySnapshot,
      hasProgress: true,
    });
    const fresh = apply(confirming, "CONFIRM_FRESH");
    expect(fresh.stepIndex).toBe(0);
    expect(fresh.status).toBe("running");
  });

  it("does not auto-advance Like until a Technology like exists", () => {
    let state = apply(createGuidedState(), "REQUEST_START");
    state = apply(state, "NEXT");
    expect(currentGuidedStep(state)?.id).toBe("like-tech");
    const blocked = apply(state, "AUTO_ADVANCE");
    expect(blocked.stepIndex).toBe(state.stepIndex);
    const advanced = apply(state, "AUTO_ADVANCE", {
      ...emptySnapshot,
      likedTechnology: true,
    });
    expect(currentGuidedStep(advanced)?.id).toBe("save-tech");
  });

  it("waits for personalization plus applied ranking", () => {
    expect(
      isGuidedStepSatisfied("personalize-feed", {
        ...emptySnapshot,
        feedPersonalizationOn: true,
        rankingApplied: false,
      }),
    ).toBe(false);
    expect(
      isGuidedStepSatisfied("personalize-feed", {
        ...emptySnapshot,
        feedPersonalizationOn: true,
        rankingApplied: true,
      }),
    ).toBe(true);
  });

  it("waits for Engineer Mode before completing that step", () => {
    expect(isGuidedStepSatisfied("engineer", emptySnapshot)).toBe(false);
    expect(
      isGuidedStepSatisfied("engineer", { ...emptySnapshot, viewMode: "engineer" }),
    ).toBe(true);
  });

  it("auto-advances into the complete state after Engineer Mode", () => {
    const state: GuidedState = {
      status: "running",
      stepIndex: 7,
      allowAutoAdvance: true,
      introVisible: false,
    };
    const done = apply(state, "AUTO_ADVANCE", {
      ...emptySnapshot,
      viewMode: "engineer",
    });
    expect(done.status).toBe("done");
  });

  it("exit preserves machine-idle without rewriting snapshot", () => {
    let state = apply(createGuidedState(), "REQUEST_START");
    state = apply(state, "EXIT", { ...emptySnapshot, likedTechnology: true, hasProgress: true });
    expect(state.status).toBe("idle");
    expect(state.introVisible).toBe(false);
  });

  it("restart asks before clearing progress", () => {
    const done: GuidedState = {
      status: "done",
      stepIndex: 7,
      allowAutoAdvance: false,
      introVisible: false,
    };
    const confirm = apply(done, "REQUEST_RESTART", {
      ...emptySnapshot,
      hasProgress: true,
    });
    expect(confirm.status).toBe("confirm-restart");
  });

  it("back does not auto-skip a satisfied step", () => {
    let state = apply(createGuidedState(), "REQUEST_START");
    state = apply(state, "NEXT");
    state = apply(state, "AUTO_ADVANCE", { ...emptySnapshot, likedTechnology: true });
    expect(currentGuidedStep(state)?.id).toBe("save-tech");
    state = apply(state, "BACK", { ...emptySnapshot, likedTechnology: true });
    expect(currentGuidedStep(state)?.id).toBe("like-tech");
    expect(state.allowAutoAdvance).toBe(false);
    const stayed = apply(state, "AUTO_ADVANCE", { ...emptySnapshot, likedTechnology: true });
    expect(stayed.stepIndex).toBe(state.stepIndex);
  });

  it("skip can leave an unsatisfied action", () => {
    let state = apply(createGuidedState(), "REQUEST_START");
    state = apply(state, "NEXT");
    state = apply(state, "SKIP");
    expect(currentGuidedStep(state)?.id).toBe("save-tech");
  });
});

describe("guided demo helpers", () => {
  it("does not treat unique views as restart-worthy progress", () => {
    expect(
      hasGuidedProgress({
        likedCount: 0,
        savedCount: 0,
        notInterestedCount: 0,
        feedPersonalizationOn: false,
        adPersonalizationOn: false,
        viewMode: "user",
        selectedPostId: null,
      }),
    ).toBe(false);
  });

  it("picks a Technology post for like/save/inspect", () => {
    const liked = new Set<string>();
    const saved = new Set<string>();
    const blocked = new Set<string>();
    expect(pickGuidePostId("like-tech", posts, liked, saved, blocked)).toBe("px-01");
    liked.add("px-01");
    expect(pickGuidePostId("like-tech", posts, liked, saved, blocked)).toBe("px-13");
  });

  it("highlights Why This Ad after ad personalization is on", () => {
    const state: GuidedState = {
      status: "running",
      stepIndex: 5,
      allowAutoAdvance: true,
      introVisible: false,
    };
    expect(
      resolveGuideHighlight(state, {
        ...emptySnapshot,
        adPersonalizationOn: true,
        whyAdOpen: false,
      }),
    ).toBe("why-this-ad");
  });

  it("requires a refresh when negative feedback made the snapshot stale", () => {
    expect(
      isGuidedStepSatisfied("negative", {
        ...emptySnapshot,
        notInterestedTechnology: true,
        feedPersonalizationOn: true,
        rankingApplied: true,
        profileStale: true,
      }),
    ).toBe(false);
    expect(firstPlayableStepIndex({ ...emptySnapshot, likedTechnology: true })).toBe(2);
  });

  it("waits for Why This Post and Why This Ad on inspect steps", () => {
    expect(isGuidedStepSatisfied("inspect-post", emptySnapshot)).toBe(false);
    expect(
      isGuidedStepSatisfied("inspect-post", {
        ...emptySnapshot,
        selectedTechnology: true,
      }),
    ).toBe(true);
    expect(
      isGuidedStepSatisfied("personalize-ads", {
        ...emptySnapshot,
        adPersonalizationOn: true,
      }),
    ).toBe(false);
    expect(
      isGuidedStepSatisfied("personalize-ads", {
        ...emptySnapshot,
        adPersonalizationOn: true,
        whyAdOpen: true,
      }),
    ).toBe(true);
  });

  it("hands off to Engineer panels after the walkthrough", () => {
    const done: GuidedState = {
      status: "done",
      stepIndex: 7,
      allowAutoAdvance: false,
      introVisible: false,
    };
    expect(
      resolveGuideHighlight(done, { ...emptySnapshot, viewMode: "engineer" }),
    ).toBe("engineer-panels");
    expect(resolveGuideHighlight(done, emptySnapshot)).toBeNull();
  });
});

describe("guide scrolling vs visibility", () => {
  it("plans a scroll only when the target is offscreen", () => {
    expect(
      planGuideScroll({
        target: "like-tech",
        rect: { top: 120, bottom: 200 },
        viewportHeight: 800,
      }),
    ).toBe("in-view");
    expect(
      planGuideScroll({
        target: "like-tech",
        rect: { top: 900, bottom: 980 },
        viewportHeight: 800,
      }),
    ).toBe("scroll");
  });

  it("pauses visibility before scrolling an offscreen target", () => {
    const pause = vi.fn();
    const settle = vi.fn();
    const scrollIntoView = vi.fn();
    const raf = (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    };
    const result = runGuideScroll({
      target: "like-tech",
      element: {
        getBoundingClientRect: () =>
          ({ top: 900, bottom: 980, height: 80 }) as DOMRectReadOnly,
        scrollIntoView,
      },
      viewportHeight: 800,
      pause,
      settle,
      reducedMotion: true,
      raf,
    });
    expect(result.plan).toBe("scroll");
    expect(pause).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("does not pause visibility when the target is already on screen", () => {
    const pause = vi.fn();
    const result = runGuideScroll({
      target: "like-tech",
      element: {
        getBoundingClientRect: () =>
          ({ top: 120, bottom: 200, height: 80 }) as DOMRectReadOnly,
        scrollIntoView: vi.fn(),
      },
      viewportHeight: 800,
      pause,
      settle: vi.fn(),
      reducedMotion: true,
    });
    expect(result.plan).toBe("in-view");
    expect(pause).not.toHaveBeenCalled();
  });

  it("does not emit visibility events while a programmatic guide scroll is paused", () => {
    const clock = {
      now: () => 0,
      setTimeout: (fn: () => void, _delay?: number) => {
        void _delay;
        fn();
        return 1 as unknown as ReturnType<typeof setTimeout>;
      },
      clearTimeout: () => undefined,
    };
    const onView = vi.fn();
    const onLeave = vi.fn();
    const tracker = new VisibilityTracker(() => ({ onView, onLeave }), clock);
    tracker.beginProgrammaticUpdate();
    tracker.handleObservation("px-01", true, 1);
    tracker.handleObservation("px-01", false, 0);
    expect(onView).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
    tracker.finishProgrammaticUpdate([{ postId: "px-01", ratio: 1 }]);
    expect(onView).not.toHaveBeenCalled();
  });
});
