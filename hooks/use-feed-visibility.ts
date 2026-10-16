"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type MutableRefObject } from "react";
import {
  VisibilityTracker,
  browserVisibilityClock,
} from "@/lib/visibility-tracker";
import {
  isMeaningfullyVisible,
  scheduleLayoutSettle,
  snapshotVisiblePosts,
} from "@/lib/visibility";

export interface VisibilityGate {
  pause: () => void;
  settle: () => void;
}

interface UseFeedVisibilityOptions {
  resetKey: number;
  layoutGeneration: number;
  gateRef: MutableRefObject<VisibilityGate | null>;
  onView: (postId: string, visibilityRatio: number) => void;
  onLeave: (postId: string, durationMs: number) => void;
}

export function useFeedVisibility({
  resetKey,
  layoutGeneration,
  gateRef,
  onView,
  onLeave,
}: UseFeedVisibilityOptions) {
  const nodesRef = useRef(new Map<string, Element>());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onViewRef = useRef(onView);
  const onLeaveRef = useRef(onLeave);
  const trackerRef = useRef<VisibilityTracker | null>(null);

  if (trackerRef.current == null) {
    trackerRef.current = new VisibilityTracker(
      () => ({
        onView: (postId, ratio) => onViewRef.current(postId, ratio),
        onLeave: (postId, durationMs) => onLeaveRef.current(postId, durationMs),
      }),
      browserVisibilityClock,
    );
  }

  useEffect(() => {
    onViewRef.current = onView;
    onLeaveRef.current = onLeave;
  }, [onLeave, onView]);

  useLayoutEffect(() => {
    gateRef.current = {
      pause: () => {
        observerRef.current?.takeRecords();
        trackerRef.current?.beginProgrammaticUpdate();
      },
      settle: () => {
        observerRef.current?.takeRecords();
        trackerRef.current?.finishProgrammaticUpdate(
          snapshotVisiblePosts(
            nodesRef.current,
            typeof window === "undefined" ? 0 : window.innerHeight,
          ),
        );
      },
    };
  });

  useLayoutEffect(() => {
    if (layoutGeneration === 0) return;
    observerRef.current?.takeRecords();
    trackerRef.current?.beginProgrammaticUpdate();
  }, [layoutGeneration]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const tracker = trackerRef.current;
        if (!tracker) return;
        for (const entry of entries) {
          const postId = (entry.target as HTMLElement).dataset.postId;
          if (!postId) continue;
          tracker.handleObservation(
            postId,
            isMeaningfullyVisible(entry),
            entry.intersectionRatio,
          );
        }
      },
      { threshold: [0, 0.6, 1] },
    );

    observerRef.current = observer;
    nodesRef.current.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [resetKey]);

  useEffect(() => {
    const tracker = trackerRef.current;
    return () => {
      tracker?.dispose();
    };
  }, []);

  useEffect(() => {
    if (layoutGeneration === 0) return;
    return scheduleLayoutSettle(() => {
      const tracker = trackerRef.current;
      if (!tracker) return;
      observerRef.current?.takeRecords();
      tracker.finishProgrammaticUpdate(
        snapshotVisiblePosts(
          nodesRef.current,
          typeof window === "undefined" ? 0 : window.innerHeight,
        ),
      );
    });
  }, [layoutGeneration]);

  return useCallback((postId: string, node: HTMLElement | null) => {
    const observer = observerRef.current;
    const previous = nodesRef.current.get(postId);

    if (previous && previous !== node) {
      observer?.unobserve(previous);
      nodesRef.current.delete(postId);
    }

    if (!node) {
      trackerRef.current?.detach(postId);
      return;
    }

    node.dataset.postId = postId;
    nodesRef.current.set(postId, node);
    observer?.observe(node);
  }, []);
}
