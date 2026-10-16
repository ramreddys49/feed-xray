/**
 * Educational demo thresholds for Feed X-Ray Phase 2.
 * These are not claimed Instagram / TikTok / Meta weights.
 */
export const MEANINGFUL_VISIBILITY_RATIO = 0.6;
export const POST_VIEW_HOLD_MS = 500;
export const QUICK_SKIP_MS = 1500;
/** Ignore IntersectionObserver flicker shorter than this. */
export const MIN_LEAVE_MS = 80;

export function isMeaningfullyVisible(entry: IntersectionObserverEntry) {
  if (entry.intersectionRatio >= MEANINGFUL_VISIBILITY_RATIO) {
    return true;
  }

  const rootHeight = entry.rootBounds?.height ?? 0;
  if (!entry.isIntersecting || rootHeight <= 0) {
    return false;
  }

  // Tall cards can never reach 60% of their own height in a short viewport.
  return entry.intersectionRect.height / rootHeight >= MEANINGFUL_VISIBILITY_RATIO;
}

/** Same threshold as IntersectionObserver entries, for post-layout seeding. */
export function isRectMeaningfullyVisible(
  rect: Pick<DOMRectReadOnly, "top" | "bottom" | "height">,
  viewportHeight: number,
) {
  if (viewportHeight <= 0 || rect.height <= 0) {
    return { visible: false, ratio: 0 };
  }

  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  if (visibleHeight <= 0) {
    return { visible: false, ratio: 0 };
  }

  const ratio = visibleHeight / rect.height;
  const viewportRatio = visibleHeight / viewportHeight;
  return {
    visible:
      ratio >= MEANINGFUL_VISIBILITY_RATIO ||
      viewportRatio >= MEANINGFUL_VISIBILITY_RATIO,
    ratio,
  };
}

export function snapshotVisiblePosts(
  nodes: Map<string, Element>,
  viewportHeight: number,
) {
  const visible: { postId: string; ratio: number }[] = [];
  nodes.forEach((node, postId) => {
    const result = isRectMeaningfullyVisible(
      node.getBoundingClientRect(),
      viewportHeight,
    );
    if (result.visible) {
      visible.push({ postId, ratio: result.ratio });
    }
  });
  return visible;
}

/** Wait for the browser to apply DOM reorder layout before reseeding visibility. */
export function scheduleLayoutSettle(
  callback: () => void,
  raf: typeof requestAnimationFrame = requestAnimationFrame,
  caf?: typeof cancelAnimationFrame,
) {
  const cancel = caf ?? ((id: number) => {
    if (typeof globalThis.cancelAnimationFrame === "function") {
      globalThis.cancelAnimationFrame(id);
    }
  });
  let inner = 0;
  const outer = raf(() => {
    inner = raf(callback);
  });
  return () => {
    cancel(outer);
    if (inner) cancel(inner);
  };
}
