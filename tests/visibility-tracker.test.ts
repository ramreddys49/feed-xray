import { describe, expect, it, vi } from "vitest";
import { POST_VIEW_HOLD_MS, MIN_LEAVE_MS } from "@/lib/visibility";
import {
  VisibilityTracker,
  type VisibilityClock,
} from "@/lib/visibility-tracker";

function createClock() {
  let now = 0;
  const timers = new Map<number, { fn: () => void; at: number }>();
  let nextId = 1;
  const clock: VisibilityClock = {
    now: () => now,
    setTimeout: (fn, ms) => {
      const id = nextId;
      nextId += 1;
      timers.set(id, { fn, at: now + ms });
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout: (id) => {
      timers.delete(id as unknown as number);
    },
  };
  return {
    clock,
    advance(ms: number) {
      now += ms;
      for (const [id, timer] of [...timers.entries()]) {
        if (timer.at <= now) {
          timers.delete(id);
          timer.fn();
        }
      }
    },
  };
}

describe("VisibilityTracker", () => {
  it("emits post_view after a genuine hold, then dwell on leave", () => {
    const { clock, advance } = createClock();
    const onView = vi.fn();
    const onLeave = vi.fn();
    const tracker = new VisibilityTracker(() => ({ onView, onLeave }), clock);

    tracker.handleObservation("px-01", true, 0.9);
    expect(onView).not.toHaveBeenCalled();
    advance(POST_VIEW_HOLD_MS);
    expect(onView).toHaveBeenCalledWith("px-01", 0.9);

    advance(2000);
    tracker.handleObservation("px-01", false, 0);
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(onLeave.mock.calls[0][1]).toBeGreaterThan(MIN_LEAVE_MS);
  });

  it("does not emit events during a programmatic feed update", () => {
    const { clock, advance } = createClock();
    const onView = vi.fn();
    const onLeave = vi.fn();
    const tracker = new VisibilityTracker(() => ({ onView, onLeave }), clock);

    tracker.handleObservation("px-01", true, 0.8);
    tracker.beginProgrammaticUpdate();
    tracker.handleObservation("px-01", false, 0);
    tracker.handleObservation("px-13", true, 1);
    advance(POST_VIEW_HOLD_MS);
    expect(onView).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();

    tracker.finishProgrammaticUpdate([{ postId: "px-13", ratio: 1 }]);
    advance(POST_VIEW_HOLD_MS);
    expect(onView).not.toHaveBeenCalled();
    expect(tracker.activePostIds()).toEqual(["px-13"]);
  });

  it("does not emit on reset/dispose cleanup", () => {
    const { clock, advance } = createClock();
    const onView = vi.fn();
    const onLeave = vi.fn();
    const tracker = new VisibilityTracker(() => ({ onView, onLeave }), clock);

    tracker.handleObservation("px-01", true, 0.7);
    tracker.dispose();
    advance(POST_VIEW_HOLD_MS);
    expect(onView).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("resumes genuine tracking after a programmatic settle", () => {
    const { clock, advance } = createClock();
    const onView = vi.fn();
    const onLeave = vi.fn();
    const tracker = new VisibilityTracker(() => ({ onView, onLeave }), clock);

    tracker.beginProgrammaticUpdate();
    tracker.finishProgrammaticUpdate([{ postId: "px-01", ratio: 0.9 }]);
    tracker.handleObservation("px-02", true, 0.8);
    advance(POST_VIEW_HOLD_MS);
    expect(onView).toHaveBeenCalledWith("px-02", 0.8);

    advance(1800);
    tracker.handleObservation("px-02", false, 0);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("keeps a nested programmatic pause until the last settle", () => {
    const { clock, advance } = createClock();
    const onView = vi.fn();
    const onLeave = vi.fn();
    const tracker = new VisibilityTracker(() => ({ onView, onLeave }), clock);

    tracker.beginProgrammaticUpdate();
    tracker.beginProgrammaticUpdate();
    tracker.finishProgrammaticUpdate([{ postId: "px-01", ratio: 1 }]);
    tracker.handleObservation("px-01", false, 0);
    tracker.handleObservation("px-13", true, 1);
    advance(POST_VIEW_HOLD_MS);
    expect(onView).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
    expect(tracker.isPaused()).toBe(true);

    tracker.finishProgrammaticUpdate([{ postId: "px-13", ratio: 1 }]);
    expect(tracker.isPaused()).toBe(false);
    advance(POST_VIEW_HOLD_MS);
    expect(onView).not.toHaveBeenCalled();
  });

  it("detach does not leak a leave event", () => {
    const { clock, advance } = createClock();
    const onView = vi.fn();
    const onLeave = vi.fn();
    const tracker = new VisibilityTracker(() => ({ onView, onLeave }), clock);
    tracker.handleObservation("px-01", true, 1);
    tracker.detach("px-01");
    advance(POST_VIEW_HOLD_MS);
    expect(onView).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
  });
});
