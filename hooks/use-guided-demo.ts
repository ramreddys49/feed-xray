"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  createGuidedState,
  currentGuidedStep,
  reduceGuidedDemo,
  resolveGuideHighlight,
  type GuidedAction,
  type GuidedSnapshot,
  type GuidedState,
} from "@/lib/guided-demo";
import {
  guideTargetSelector,
  runGuideScroll,
} from "@/lib/guide-scroll";

interface UseGuidedDemoOptions {
  snapshot: GuidedSnapshot;
  pauseVisibility: () => void;
  settleVisibility: () => void;
}

function reducer(state: GuidedState, action: { action: GuidedAction; snapshot: GuidedSnapshot }) {
  return reduceGuidedDemo(state, action.action, action.snapshot);
}

export function useGuidedDemo({
  snapshot,
  pauseVisibility,
  settleVisibility,
}: UseGuidedDemoOptions) {
  const [state, rawDispatch] = useReducer(reducer, undefined, createGuidedState);
  const snapshotRef = useRef(snapshot);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const dispatch = useCallback((action: GuidedAction) => {
    rawDispatch({ action, snapshot: snapshotRef.current });
  }, []);

  const step = currentGuidedStep(state);
  const highlight = useMemo(
    () => resolveGuideHighlight(state, snapshot),
    [snapshot, state],
  );

  useEffect(() => {
    rawDispatch({ action: { type: "AUTO_ADVANCE" }, snapshot });
  }, [snapshot, state.status, state.stepIndex, state.allowAutoAdvance]);

  useEffect(() => {
    if (!highlight || typeof document === "undefined") return;
    let cancelled = false;
    let cancelScroll = () => {};
    let frame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const attempt = (remaining: number) => {
      if (cancelled) return;
      const element = document.querySelector<HTMLElement>(guideTargetSelector(highlight));
      if (!element && remaining > 0) {
        frame = requestAnimationFrame(() => attempt(remaining - 1));
        return;
      }
      const result = runGuideScroll({
        target: highlight,
        element,
        viewportHeight: window.innerHeight,
        pause: pauseVisibility,
        settle: settleVisibility,
        reducedMotion,
        readY: () => window.scrollY,
      });
      cancelScroll = result.cancel;
    };

    attempt(8);
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      cancelScroll();
    };
  }, [highlight, pauseVisibility, settleVisibility]);

  return {
    state,
    step,
    highlight,
    dispatch,
  };
}
