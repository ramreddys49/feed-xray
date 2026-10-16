import type { GuideHighlight } from "@/lib/guided-demo";
import { scheduleLayoutSettle } from "@/lib/visibility";

export const GUIDE_HEADER_OFFSET = 96;
export const GUIDE_FOOTER_OFFSET = 160;

export function guideTargetSelector(target: GuideHighlight) {
  return `[data-guide-target="${target}"]`;
}

export function isGuideTargetInView(
  rect: Pick<DOMRectReadOnly, "top" | "bottom">,
  viewportHeight: number,
  header = GUIDE_HEADER_OFFSET,
  footer = GUIDE_FOOTER_OFFSET,
) {
  return rect.top >= header && rect.bottom <= viewportHeight - footer;
}

/**
 * Programmatic guide scrolling must pause visibility first so IntersectionObserver
 * does not treat the scroll as a user skip/view.
 */
export function planGuideScroll(input: {
  target: GuideHighlight | null;
  rect: Pick<DOMRectReadOnly, "top" | "bottom"> | null;
  viewportHeight: number;
}): "missing" | "in-view" | "scroll" {
  if (!input.target || !input.rect) return "missing";
  if (input.rect.bottom - input.rect.top <= 0) return "missing";
  if (isGuideTargetInView(input.rect, input.viewportHeight)) return "in-view";
  return "scroll";
}

export function afterScrollIdle(
  onIdle: () => void,
  readY: () => number,
  raf: typeof requestAnimationFrame = requestAnimationFrame,
) {
  let last = readY();
  let stable = 0;
  let frame = 0;
  const tick = () => {
    const next = readY();
    if (next === last) stable += 1;
    else {
      stable = 0;
      last = next;
    }
    if (stable >= 2) {
      onIdle();
      return;
    }
    frame = raf(tick);
  };
  frame = raf(tick);
  return () => cancelAnimationFrame(frame);
}

export function runGuideScroll(input: {
  target: GuideHighlight | null;
  element: { getBoundingClientRect: () => DOMRectReadOnly; scrollIntoView: (init?: ScrollIntoViewOptions) => void } | null;
  viewportHeight: number;
  pause: () => void;
  settle: () => void;
  reducedMotion: boolean;
  readY?: () => number;
  raf?: typeof requestAnimationFrame;
}) {
  const plan = planGuideScroll({
    target: input.target,
    rect: input.element?.getBoundingClientRect() ?? null,
    viewportHeight: input.viewportHeight,
  });
  if (plan !== "scroll" || !input.element) {
    return { plan, cancel: () => undefined };
  }

  input.pause();
  input.element.scrollIntoView({
    block: "center",
    behavior: input.reducedMotion ? "auto" : "smooth",
  });

  const finish = () => {
    scheduleLayoutSettle(input.settle, input.raf);
  };

  if (input.reducedMotion) {
    finish();
    return { plan, cancel: () => undefined };
  }

  const cancel = afterScrollIdle(finish, input.readY ?? (() => 0), input.raf);
  return { plan, cancel };
}
