import { POST_VIEW_HOLD_MS } from "@/lib/visibility";

export interface VisibilityCallbacks {
  onView: (postId: string, visibilityRatio: number) => void;
  onLeave: (postId: string, durationMs: number) => void;
}

export interface VisibilityClock {
  now: () => number;
  setTimeout: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearTimeout: (id: ReturnType<typeof setTimeout>) => void;
}

export const browserVisibilityClock: VisibilityClock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
};

type VisibilitySession = {
  startedAt: number;
  viewTimer: ReturnType<typeof setTimeout> | null;
  ratio: number;
};

/**
 * Tracks meaningful visibility sessions. Programmatic feed updates must call
 * beginProgrammaticUpdate / finishProgrammaticUpdate so IntersectionObserver
 * reconnects and DOM reorders do not emit synthetic behavioral events.
 */
export class VisibilityTracker {
  private sessions = new Map<string, VisibilitySession>();
  private paused = false;
  private pauseCount = 0;

  constructor(
    private readonly getCallbacks: () => VisibilityCallbacks,
    private readonly clock: VisibilityClock = browserVisibilityClock,
  ) {}

  isPaused() {
    return this.paused;
  }

  beginProgrammaticUpdate() {
    this.pauseCount += 1;
    this.paused = true;
    this.clearSessions(false);
  }

  finishProgrammaticUpdate(visible: readonly { postId: string; ratio: number }[]) {
    if (this.pauseCount > 0) {
      this.pauseCount -= 1;
    }
    if (this.pauseCount > 0) {
      return;
    }
    this.clearSessions(false);
    this.paused = false;
    for (const item of visible) {
      this.startSession(item.postId, item.ratio, false);
    }
  }

  handleObservation(postId: string, visible: boolean, ratio: number) {
    if (this.paused) return;
    if (visible) {
      this.startSession(postId, ratio, true);
      return;
    }
    if (this.sessions.has(postId)) {
      this.endSession(postId, true);
    }
  }

  /** Card unmount / observer detach. Never emits a leave. */
  detach(postId: string) {
    this.endSession(postId, false);
  }

  dispose() {
    this.clearSessions(false);
    this.pauseCount = 0;
    this.paused = false;
  }

  activePostIds() {
    return [...this.sessions.keys()];
  }

  private startSession(postId: string, ratio: number, emitView: boolean) {
    if (this.sessions.has(postId)) return;

    const session: VisibilitySession = {
      startedAt: this.clock.now(),
      viewTimer: null,
      ratio,
    };

    if (emitView) {
      session.viewTimer = this.clock.setTimeout(() => {
        session.viewTimer = null;
        this.getCallbacks().onView(postId, ratio);
      }, POST_VIEW_HOLD_MS);
    }

    this.sessions.set(postId, session);
  }

  private endSession(postId: string, emitLeave: boolean) {
    const session = this.sessions.get(postId);
    if (!session) return;

    if (session.viewTimer) {
      this.clock.clearTimeout(session.viewTimer);
    }
    this.sessions.delete(postId);

    if (emitLeave) {
      this.getCallbacks().onLeave(postId, this.clock.now() - session.startedAt);
    }
  }

  private clearSessions(emitLeave: boolean) {
    for (const postId of [...this.sessions.keys()]) {
      this.endSession(postId, emitLeave);
    }
  }
}
