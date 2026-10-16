import { describe, expect, it } from "vitest";
import {
  createRankingSnapshot,
  rankingSnapshotPending,
  scoresDiffer,
} from "@/lib/engineer-view";
import { tallySessionEvents } from "@/lib/event-tally";
import { noteUniqueView } from "@/lib/events";
import {
  applyBehaviorEventToProfile,
  createEmptyProfile,
} from "@/lib/profile-engine";
import { rankFeed } from "@/lib/ranking-engine";
import { posts } from "@/data/posts";
import { isRectMeaningfullyVisible, scheduleLayoutSettle } from "@/lib/visibility";
import { makeEvent, techPost } from "./helpers";

describe("unique views and counters", () => {
  it("does not inflate unique views on revisit", () => {
    const viewed = new Set<string>();
    const first = noteUniqueView(viewed, "px-01");
    const again = noteUniqueView(viewed, "px-01");
    const other = noteUniqueView(viewed, "px-02");
    expect(first.revisit).toBe(false);
    expect(again.revisit).toBe(true);
    expect(other.revisit).toBe(false);
    expect(first.uniqueCount).toBe(1);
    expect(again.uniqueCount).toBe(1);
    expect(other.uniqueCount).toBe(2);
  });

  it("keeps like/save toggles and skip/dwell counts aligned with events", () => {
    const post = techPost();
    const events = [
      makeEvent("not_interested", post, { source: "post_card" }),
      makeEvent("unsave", post, { source: "post_card" }),
      makeEvent("save", post, { source: "post_card" }),
      makeEvent("unlike", post, { source: "post_card" }),
      makeEvent("like", post, { source: "post_card" }),
      makeEvent("quick_skip", post, { durationMs: 300 }),
      makeEvent("dwell_time", post, { durationMs: 4000 }),
      makeEvent("share", post, { source: "post_card" }),
      makeEvent("post_view", post, { visibilityRatio: 0.9, revisit: true }),
      makeEvent("post_view", post, { visibilityRatio: 0.9, revisit: false }),
    ];
    const tally = tallySessionEvents(events);
    expect(tally.uniqueViewsFromLog).toBe(1);
    expect(tally.likes).toBe(0);
    expect(tally.saves).toBe(0);
    expect(tally.shares).toBe(1);
    expect(tally.longWatches).toBe(1);
    expect(tally.quickSkips).toBe(1);
    expect(tally.notInterested).toBe(1);
  });
});

describe("ranking snapshot consistency", () => {
  it("is pending only when the live profile differs from the snapshot", () => {
    const post = techPost();
    const like = makeEvent("like", post, { source: "post_card" });
    const profile = applyBehaviorEventToProfile(createEmptyProfile(), like);
    const result = rankFeed({ posts, profile, memory: {} });
    const snapshot = createRankingSnapshot({
      profile,
      result,
      generatedAt: 1,
      feedVersion: 2,
    });
    expect(
      rankingSnapshotPending(true, true, profile, snapshot),
    ).toBe(false);

    const drifted = applyBehaviorEventToProfile(
      profile,
      makeEvent("save", post, { source: "post_card" }),
    );
    expect(scoresDiffer(profile.scores, drifted.scores)).toBe(true);
    expect(
      rankingSnapshotPending(true, true, drifted, snapshot),
    ).toBe(true);
    expect(
      rankingSnapshotPending(false, true, drifted, snapshot),
    ).toBe(false);
  });
});

describe("visibility helpers", () => {
  it("treats tall cards as visible when they fill most of a short viewport", () => {
    expect(
      isRectMeaningfullyVisible({ top: 0, bottom: 800, height: 800 }, 400),
    ).toEqual({ visible: true, ratio: 0.5 });
    expect(
      isRectMeaningfullyVisible({ top: 500, bottom: 700, height: 200 }, 400),
    ).toEqual({ visible: false, ratio: 0 });
  });

  it("runs layout settle after two animation frames", () => {
    const frames: FrameRequestCallback[] = [];
    const raf = (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    };
    const caf = (id: number) => {
      frames[id - 1] = () => undefined;
    };
    let settled = false;
    scheduleLayoutSettle(() => {
      settled = true;
    }, raf, caf);
    expect(settled).toBe(false);
    frames[0]?.(0);
    expect(settled).toBe(false);
    frames[1]?.(0);
    expect(settled).toBe(true);
  });
});
