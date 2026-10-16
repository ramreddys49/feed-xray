import { describe, expect, it } from "vitest";
import {
  applyBehaviorEventToProfile,
  createEmptyProfile,
  getEventProfileDelta,
  PROFILE_WEIGHTS,
} from "@/lib/profile-engine";
import { makeEvent, techPost } from "./helpers";

describe("profile engine", () => {
  it("reverses like and unlike on the same category", () => {
    const post = techPost();
    const liked = applyBehaviorEventToProfile(
      createEmptyProfile(),
      makeEvent("like", post, { source: "post_card" }),
    );
    expect(liked.scores.Technology).toBe(PROFILE_WEIGHTS.like);
    expect(liked.evidence.Technology.liked).toBe(true);

    const unliked = applyBehaviorEventToProfile(
      liked,
      makeEvent("unlike", post, { source: "post_card" }),
    );
    expect(unliked.scores.Technology).toBe(0);
    expect(unliked.evidence.Technology.liked).toBe(false);
  });

  it("reverses save and unsave", () => {
    const post = techPost();
    const saved = applyBehaviorEventToProfile(
      createEmptyProfile(),
      makeEvent("save", post, { source: "post_card" }),
    );
    expect(saved.scores.Technology).toBe(PROFILE_WEIGHTS.save);
    const unsaved = applyBehaviorEventToProfile(
      saved,
      makeEvent("unsave", post, { source: "post_card" }),
    );
    expect(unsaved.scores.Technology).toBe(0);
    expect(unsaved.evidence.Technology.saved).toBe(false);
  });

  it("weights a revisit view below a first view", () => {
    const post = techPost();
    const first = makeEvent("post_view", post, {
      visibilityRatio: 0.8,
      revisit: false,
    });
    const again = makeEvent("post_view", post, {
      visibilityRatio: 0.8,
      revisit: true,
    });
    expect(getEventProfileDelta(first)).toBe(PROFILE_WEIGHTS.post_view);
    expect(getEventProfileDelta(again)).toBe(PROFILE_WEIGHTS.post_view_revisit);
  });

  it("applies dwell-time thresholds", () => {
    const post = techPost();
    expect(
      getEventProfileDelta(makeEvent("dwell_time", post, { durationMs: 2000 })),
    ).toBe(PROFILE_WEIGHTS.dwellUnder3s);
    expect(
      getEventProfileDelta(makeEvent("dwell_time", post, { durationMs: 5000 })),
    ).toBe(PROFILE_WEIGHTS.dwell3to8s);
    expect(
      getEventProfileDelta(makeEvent("dwell_time", post, { durationMs: 10000 })),
    ).toBe(PROFILE_WEIGHTS.dwell8to15s);
    expect(
      getEventProfileDelta(makeEvent("dwell_time", post, { durationMs: 20000 })),
    ).toBe(PROFILE_WEIGHTS.dwell15sPlus);
  });

  it("applies negative feedback", () => {
    const post = techPost();
    const skipped = applyBehaviorEventToProfile(
      createEmptyProfile(),
      makeEvent("quick_skip", post, { durationMs: 400 }),
    );
    expect(skipped.scores.Technology).toBe(PROFILE_WEIGHTS.quick_skip);
    const blocked = applyBehaviorEventToProfile(
      skipped,
      makeEvent("not_interested", post, { source: "post_card" }),
    );
    expect(blocked.scores.Technology).toBe(
      PROFILE_WEIGHTS.quick_skip + PROFILE_WEIGHTS.not_interested,
    );
  });
});
