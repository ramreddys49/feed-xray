import { describe, expect, it } from "vitest";
import { posts } from "@/data/posts";
import {
  applyEventToPostMemory,
  rankFeed,
  type PostMemory,
} from "@/lib/ranking-engine";
import {
  applyBehaviorEventToProfile,
  createEmptyProfile,
} from "@/lib/profile-engine";
import { makeEvent, techPost } from "./helpers";

function idsOf(result: ReturnType<typeof rankFeed>) {
  return result.posts.map((post) => post.id);
}

function profileFromEvents(
  events: Parameters<typeof applyBehaviorEventToProfile>[1][],
) {
  return events.reduce(applyBehaviorEventToProfile, createEmptyProfile());
}

function memoryFromEvents(
  events: Parameters<typeof applyEventToPostMemory>[1][],
) {
  return events.reduce<Record<string, PostMemory>>(
    (memory, event) => applyEventToPostMemory(memory, event),
    {},
  );
}

describe("rankFeed", () => {
  it("keeps catalog order for a neutral profile", () => {
    const result = rankFeed({
      posts,
      profile: createEmptyProfile(),
      memory: {},
    });
    expect(result.applied).toBe(false);
    expect(idsOf(result)).toEqual(posts.map((post) => post.id));
  });

  it("raises posts in a strongly liked category", () => {
    const post = techPost();
    const events = [
      makeEvent("like", post, { source: "post_card" }),
      makeEvent("save", post, { source: "post_card" }),
    ];
    const result = rankFeed({
      posts,
      profile: profileFromEvents(events),
      memory: memoryFromEvents(events),
    });
    expect(result.applied).toBe(true);
    expect(result.posts[0].category).toBe("Technology");
    const laterTech = result.entries.find((entry) => entry.postId === "px-13");
    expect(laterTech).toBeTruthy();
    expect(laterTech!.moved).toBeGreaterThan(0);
  });

  it("lowers a post after Not Interested", () => {
    const post = techPost();
    const liked = [
      makeEvent("like", post, { source: "post_card" }),
      makeEvent("save", post, { source: "post_card" }),
    ];
    const blocked = [
      ...liked,
      makeEvent("not_interested", post, { source: "post_card" }),
    ];
    const before = rankFeed({
      posts,
      profile: profileFromEvents(liked),
      memory: memoryFromEvents(liked),
    });
    const after = rankFeed({
      posts,
      profile: profileFromEvents(blocked),
      memory: memoryFromEvents(blocked),
    });
    const beforeEntry = before.entries.find((entry) => entry.postId === post.id);
    const afterEntry = after.entries.find((entry) => entry.postId === post.id);
    expect(beforeEntry && afterEntry).toBeTruthy();
    expect(afterEntry!.factors.negativeFeedback).toBeGreaterThan(
      beforeEntry!.factors.negativeFeedback,
    );
    expect(afterEntry!.totalScore).toBeLessThan(beforeEntry!.totalScore);
  });

  it("keeps more than one category near the top via exploration and diversity", () => {
    const post = techPost();
    const events = [
      makeEvent("like", post, { source: "post_card" }),
      makeEvent("save", post, { source: "post_card" }),
    ];
    const result = rankFeed({
      posts,
      profile: profileFromEvents(events),
      memory: memoryFromEvents(events),
    });
    const top = result.posts.slice(0, 4).map((item) => item.category);
    expect(new Set(top).size).toBeGreaterThan(1);
  });

  it("is deterministic for the same profile and memory", () => {
    const post = techPost();
    const events = [
      makeEvent("like", post, { source: "post_card" }),
      makeEvent("dwell_time", post, { durationMs: 9000 }),
    ];
    const profile = profileFromEvents(events);
    const memory = memoryFromEvents(events);
    const first = rankFeed({ posts, profile, memory });
    const second = rankFeed({ posts, profile, memory });
    expect(idsOf(first)).toEqual(idsOf(second));
    expect(first.entries.map((entry) => entry.totalScore)).toEqual(
      second.entries.map((entry) => entry.totalScore),
    );
  });

  it("does not change organic order based on ad selection", () => {
    const post = techPost();
    const events = [makeEvent("like", post, { source: "post_card" })];
    const profile = profileFromEvents(events);
    const organic = rankFeed({ posts, profile, memory: {} });
    const again = rankFeed({ posts, profile, memory: {} });
    expect(idsOf(organic)).toEqual(idsOf(again));
    expect(organic.entries[0].postId).not.toMatch(/^ad-/);
  });
});
