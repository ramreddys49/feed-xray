import { describe, expect, it } from "vitest";
import { cycleViewMode } from "@/lib/engineer-view";
import {
  LEARN_DISCLAIMER,
  LEARN_DOES_NOT_IMPLEMENT,
  LEARN_IMPLEMENTS,
  ORGANIC_VS_SPONSORED,
  PERSONALIZATION_COMBOS,
  PIPELINE_STAGES,
  buildLearnSession,
  describeProfileLive,
  describeRankingLive,
  describeSignalLive,
  hasInteractiveLearnActivity,
  isGuidedDemoActive,
  personalizationComboId,
  planViewTransition,
  walkthroughReturnMode,
  type LearnLiveInput,
} from "@/lib/learn-view";

const emptyLive: LearnLiveInput = {
  likes: 0,
  saves: 0,
  shares: 0,
  longWatches: 0,
  quickSkips: 0,
  notInterested: 0,
  postsViewed: 4,
  interestLeader: null,
  rankingApplied: false,
  personalizationOn: false,
  adPersonalizationOn: false,
  organicTopCategory: "Technology",
  sponsoredCategory: "Contextual",
  rankingHeadline: null,
  movedUpCategories: [],
  catalogSize: 20,
  topOrganicCategories: ["Technology", "Travel", "Food", "Fitness"],
};

describe("Learn navigation", () => {
  it("preserves simulation and guided-demo state when changing views", () => {
    expect(planViewTransition("user", "learn")).toEqual({
      pauseVisibility: true,
      settleVisibility: false,
      preserveSimulation: true,
      preserveGuidedDemo: true,
    });
    expect(planViewTransition("learn", "user")).toMatchObject({
      pauseVisibility: false,
      settleVisibility: true,
      preserveSimulation: true,
      preserveGuidedDemo: true,
    });
    expect(planViewTransition("engineer", "learn").preserveSimulation).toBe(true);
    expect(planViewTransition("learn", "engineer").preserveGuidedDemo).toBe(true);
    expect(planViewTransition("user", "engineer").pauseVisibility).toBe(false);
  });

  it("cycles User, Engineer, and Learn without skipping a mode", () => {
    expect(cycleViewMode("user", 1)).toBe("engineer");
    expect(cycleViewMode("engineer", 1)).toBe("learn");
    expect(cycleViewMode("learn", 1)).toBe("user");
    expect(cycleViewMode("user", -1)).toBe("learn");
  });

  it("returns an active walkthrough to the feed, or Engineer on that step", () => {
    expect(isGuidedDemoActive("running")).toBe(true);
    expect(isGuidedDemoActive("idle")).toBe(false);
    expect(walkthroughReturnMode("running", "save-tech")).toBe("user");
    expect(walkthroughReturnMode("running", "engineer")).toBe("engineer");
  });
});

describe("pipeline live-data mapping", () => {
  it("does not treat unique views as an interactive session", () => {
    expect(hasInteractiveLearnActivity(emptyLive)).toBe(false);
    const session = buildLearnSession(emptyLive);
    expect(session.hasSession).toBe(false);
    expect(session.signalNote).toBeNull();
    expect(session.emptyPrompt).toContain("liking or saving");
  });

  it("maps likes and saves into a real session note", () => {
    expect(describeSignalLive({ likes: 3, saves: 2 })).toBe(
      "Your session has recorded 3 likes and 2 saves.",
    );
    expect(describeProfileLive("Technology")).toBe(
      "Technology is currently your strongest inferred interest.",
    );
    expect(
      describeRankingLive({
        rankingApplied: true,
        personalizationOn: true,
        movedUpCategories: ["Technology"],
        rankingHeadline: "ignored when movement exists",
      }),
    ).toBe("Technology content moved higher after personalization.");
  });

  it("builds an active session from live state", () => {
    const session = buildLearnSession({
      ...emptyLive,
      likes: 1,
      saves: 1,
      interestLeader: "Technology",
      personalizationOn: true,
      rankingApplied: true,
      adPersonalizationOn: true,
      sponsoredCategory: "Technology",
      movedUpCategories: ["Technology"],
    });
    expect(session.hasSession).toBe(true);
    expect(session.actionsRecorded).toBe(2);
    expect(session.interestLeader).toBe("Technology");
    expect(session.personalizationOn).toBe(true);
    expect(session.adPersonalizationOn).toBe(true);
    expect(session.comboId).toBe("feed-on-ads-on");
    expect(session.rankingNote).toContain("Technology");
  });
});

describe("personalization and organic/ad separation", () => {
  it("maps the four feed/ad combinations", () => {
    expect(personalizationComboId(false, false)).toBe("feed-off-ads-off");
    expect(personalizationComboId(true, false)).toBe("feed-on-ads-off");
    expect(personalizationComboId(false, true)).toBe("feed-off-ads-on");
    expect(personalizationComboId(true, true)).toBe("feed-on-ads-on");
    expect(PERSONALIZATION_COMBOS).toHaveLength(4);
  });

  it("keeps organic ranking and sponsored selection as separate processes", () => {
    expect(ORGANIC_VS_SPONSORED.organic.output).toBe("Order of organic posts");
    expect(ORGANIC_VS_SPONSORED.sponsored.output).toBe("Selected sponsored placement");
    expect(ORGANIC_VS_SPONSORED.separation).toContain("separate decision processes");
    expect(ORGANIC_VS_SPONSORED.adsRemain).toContain("does not necessarily remove advertising");
  });

  it("does not claim production candidate retrieval", () => {
    const candidates = PIPELINE_STAGES.find((stage) => stage.id === "candidates");
    expect(candidates?.feedXray).toContain("does not implement production-scale candidate retrieval");
    expect(candidates?.realWorld).toContain("large content pool");
  });
});

describe("simulation limitation messaging", () => {
  it("states the educational disclaimer and what the demo does not implement", () => {
    expect(LEARN_DISCLAIMER).toContain("educational simulation");
    expect(LEARN_DISCLAIMER).not.toContain("the same as Instagram");
    expect(LEARN_IMPLEMENTS).toContain("Deterministic interest scoring");
    expect(LEARN_DOES_NOT_IMPLEMENT).toContain("Real social platform algorithms");
    expect(LEARN_DOES_NOT_IMPLEMENT).toContain("Machine learning model training");
    expect(LEARN_DOES_NOT_IMPLEMENT).toContain("Production candidate retrieval");
    expect(LEARN_DOES_NOT_IMPLEMENT).toContain("Real advertising auctions");
  });
});
