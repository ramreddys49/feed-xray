"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EngineerWorkspace } from "@/components/engineer-workspace";
import { Feed } from "@/components/feed";
import { FeedIntro } from "@/components/feed-intro";
import { GuidedDemoPanel } from "@/components/guided-demo-panel";
import { Header } from "@/components/header";
import { LearnWorkspace } from "@/components/learn-workspace";
import { RightPanel } from "@/components/right-panel";
import type { VisibilityGate } from "@/hooks/use-feed-visibility";
import { useGuidedDemo } from "@/hooks/use-guided-demo";
import { posts } from "@/data/posts";
import {
  applyEventToCommercialProfile,
  buildAdProfileView,
  createEmptyCommercialProfile,
  getCommercialLeader,
  hasCommercialSignal,
  selectSponsoredAd,
  type CommercialProfile,
} from "@/lib/ad-engine";
import { buildWhyThisAdExplanation } from "@/lib/ad-explanation";
import {
  buildAdCandidateRows,
  buildCandidateRows,
  buildCommercialVector,
  buildConsoleRows,
  buildEventTrace,
  buildInterestVector,
  buildSelectedPostInspector,
  cloneScores,
  createRankingSnapshot,
  movementLabel,
  rankingSnapshotPending,
  type RankingSnapshot,
  type ViewMode,
} from "@/lib/engineer-view";
import {
  buildLearnSession,
  isGuidedDemoActive,
  walkthroughReturnMode,
} from "@/lib/learn-view";
import { tallySessionEvents } from "@/lib/event-tally";
import {
  hasGuidedProgress,
  isGuidedStepSatisfied,
  pickGuidePostId,
  type GuidedSnapshot,
} from "@/lib/guided-demo";
import { createBehaviorEvent, noteUniqueView, prependEvent } from "@/lib/events";
import {
  applyBehaviorEventToProfile,
  buildAlgorithmMirror,
  buildFeedDna,
  createEmptyProfile,
  getProfileLeader,
  type InterestProfile,
  type ProfileChange,
} from "@/lib/profile-engine";
import { buildWhyThisPostExplanation } from "@/lib/recommendation-explanation";
import {
  appendTimeline,
  formatClockLabel,
  stepsFromAdPersonalization,
  stepsFromAdSelection,
  stepsFromBehavior,
  stepsFromPersonalization,
  stepsFromRankingApply,
  type TimelineStep,
} from "@/lib/recommendation-timeline";
import {
  applyEventToPostMemory,
  buildFeedMix,
  buildUserRankHints,
  hasRankableProfile,
  isStrongRankingEvent,
  rankFeed,
  type PostMemory,
  type RankingResult,
} from "@/lib/ranking-engine";
import { describeSignal, type ActivitySummary } from "@/lib/signal-copy";
import { MIN_LEAVE_MS, QUICK_SKIP_MS, scheduleLayoutSettle } from "@/lib/visibility";
import type { BehaviorEvent } from "@/types/events";
import type { Post } from "@/types/post";

const postsById = new Map(posts.map((post) => [post.id, post]));

function hasTechnology(ids: ReadonlySet<string>) {
  for (const id of ids) {
    if (postsById.get(id)?.category === "Technology") return true;
  }
  return false;
}

export function FeedXrayApp() {
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [openCommentIds, setOpenCommentIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [notInterestedIds, setNotInterestedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [profileFlash, setProfileFlash] = useState<ProfileChange | null>(null);
  const [profile, setProfile] = useState<InterestProfile>(createEmptyProfile);
  const [personalizationOn, setPersonalizationOn] = useState(false);
  const [appliedRanking, setAppliedRanking] = useState<RankingResult | null>(null);
  const [profileStale, setProfileStale] = useState(false);
  const [feedFlash, setFeedFlash] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [commercial, setCommercial] = useState<CommercialProfile>(createEmptyCommercialProfile);
  const [adPersonalizationOn, setAdPersonalizationOn] = useState(false);
  const [selectedAd, setSelectedAd] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [rankingSnapshot, setRankingSnapshot] = useState<RankingSnapshot | null>(null);
  const [engineerSessionKey, setEngineerSessionKey] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [layoutGeneration, setLayoutGeneration] = useState(0);
  // Unique-view size for "Posts viewed". Raw post_view events may repeat.
  const [viewedCount, setViewedCount] = useState(0);

  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewedPostIdsRef = useRef<Set<string>>(new Set());
  const profileRef = useRef<InterestProfile>(profile);
  const postMemoryRef = useRef<Record<string, PostMemory>>({});
  const personalizationOnRef = useRef(false);
  const rankingAppliedRef = useRef(false);
  const leaderRef = useRef<ReturnType<typeof getProfileLeader>>(null);
  const commercialRef = useRef<CommercialProfile>(commercial);
  const adPersonalizationOnRef = useRef(false);
  const adCategoryRef = useRef<string>("Contextual");
  const commercialLeaderRef = useRef<ReturnType<typeof getCommercialLeader>>(null);
  const feedVersionRef = useRef(0);
  const visibilityGateRef = useRef<VisibilityGate | null>(null);

  const pauseVisibilityForLayout = useCallback(() => {
    visibilityGateRef.current?.pause();
  }, []);

  const settleVisibility = useCallback(() => {
    visibilityGateRef.current?.settle();
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const previousViewModeRef = useRef(viewMode);
  useLayoutEffect(() => {
    if (viewMode === "learn") {
      pauseVisibilityForLayout();
    }
  }, [pauseVisibilityForLayout, viewMode]);

  useEffect(() => {
    const previous = previousViewModeRef.current;
    previousViewModeRef.current = viewMode;
    if (previous === "learn" && viewMode !== "learn") {
      return scheduleLayoutSettle(settleVisibility);
    }
  }, [settleVisibility, viewMode]);

  const syncAdTimeline = useCallback((clockLabel: string): TimelineStep[] => {
    const selection = selectSponsoredAd({
      commercial: commercialRef.current,
      adPersonalizationOn: adPersonalizationOnRef.current,
    });
    const nextLeader = adPersonalizationOnRef.current
      ? getCommercialLeader(commercialRef.current)
      : commercialLeaderRef.current;
    const steps = stepsFromAdSelection({
      previousCategory: adCategoryRef.current,
      nextCategory: selection.selectedCategory,
      previousLeader: commercialLeaderRef.current,
      nextLeader,
      clockLabel,
    });
    adCategoryRef.current = selection.selectedCategory;
    if (adPersonalizationOnRef.current) {
      commercialLeaderRef.current = nextLeader;
    }
    return steps;
  }, []);

  const recordEvent = useCallback((event: BehaviorEvent) => {
    setEvents((current) => prependEvent(current, event));
    setFlash(describeSignal(event).flash);

    const nextProfile = applyBehaviorEventToProfile(profileRef.current, event);
    profileRef.current = nextProfile;
    setProfile(nextProfile);
    postMemoryRef.current = applyEventToPostMemory(postMemoryRef.current, event);

    const nextCommercial = applyEventToCommercialProfile(commercialRef.current, event);
    commercialRef.current = nextCommercial;
    setCommercial(nextCommercial);

    const nextLeader = getProfileLeader(nextProfile);
    const timelineSteps = stepsFromBehavior({
      event,
      previousLeader: leaderRef.current,
      nextLeader,
      clockLabel: formatClockLabel(event.timestamp),
    });
    leaderRef.current = nextLeader;
    const adSteps = syncAdTimeline(formatClockLabel(event.timestamp));
    if (timelineSteps.length > 0 || adSteps.length > 0) {
      setTimeline((current) => appendTimeline(current, [...timelineSteps, ...adSteps]));
    }

    if (
      personalizationOnRef.current &&
      rankingAppliedRef.current &&
      isStrongRankingEvent(event)
    ) {
      setProfileStale(true);
    }

    const change = nextProfile.recentChanges[0];
    if (change && change.eventId === event.id) {
      setProfileFlash(change);
      if (profileFlashTimerRef.current) {
        clearTimeout(profileFlashTimerRef.current);
      }
      profileFlashTimerRef.current = setTimeout(() => {
        setProfileFlash(null);
        profileFlashTimerRef.current = null;
      }, 1800);
    }

    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
    }

    flashTimerRef.current = setTimeout(() => {
      setFlash(null);
      flashTimerRef.current = null;
    }, 1800);
  }, [syncAdTimeline]);

  const recordForPost = useCallback(
    (postId: string, create: (post: Post) => BehaviorEvent) => {
      const post = postsById.get(postId);
      if (!post) return;
      recordEvent(create(post));
    },
    [recordEvent],
  );

  const handleView = useCallback(
    (postId: string, visibilityRatio: number) => {
      const { revisit } = noteUniqueView(viewedPostIdsRef.current, postId);
      setViewedCount(viewedPostIdsRef.current.size);

      recordForPost(postId, (post) =>
        createBehaviorEvent({
          type: "post_view",
          post,
          metadata: { visibilityRatio, revisit },
          timestamp: Date.now(),
        }),
      );
    },
    [recordForPost],
  );

  const handleLeave = useCallback(
    (postId: string, durationMs: number) => {
      if (durationMs < MIN_LEAVE_MS) return;

      if (durationMs < QUICK_SKIP_MS) {
        recordForPost(postId, (post) =>
          createBehaviorEvent({
            type: "quick_skip",
            post,
            metadata: { durationMs },
            timestamp: Date.now(),
          }),
        );
        return;
      }

      recordForPost(postId, (post) =>
        createBehaviorEvent({
          type: "dwell_time",
          post,
          metadata: { durationMs },
          timestamp: Date.now(),
        }),
      );
    },
    [recordForPost],
  );

  const handleLike = useCallback(
    (post: Post) => {
      const isLiked = likedIds.has(post.id);
      setLikedIds((current) => {
        const next = new Set(current);
        if (isLiked) next.delete(post.id);
        else next.add(post.id);
        return next;
      });
      recordEvent(
        createBehaviorEvent({
          type: isLiked ? "unlike" : "like",
          post,
          metadata: { source: "post_card" },
          timestamp: Date.now(),
        }),
      );
    },
    [likedIds, recordEvent],
  );

  const handleSave = useCallback(
    (post: Post) => {
      const isSaved = savedIds.has(post.id);
      setSavedIds((current) => {
        const next = new Set(current);
        if (isSaved) next.delete(post.id);
        else next.add(post.id);
        return next;
      });
      recordEvent(
        createBehaviorEvent({
          type: isSaved ? "unsave" : "save",
          post,
          metadata: { source: "post_card" },
          timestamp: Date.now(),
        }),
      );
    },
    [recordEvent, savedIds],
  );

  const handleShare = useCallback(
    (post: Post) => {
      setSharedPostId(post.id);
      if (shareTimerRef.current) {
        clearTimeout(shareTimerRef.current);
      }
      shareTimerRef.current = setTimeout(() => {
        setSharedPostId(null);
        shareTimerRef.current = null;
      }, 1600);
      recordEvent(
        createBehaviorEvent({
          type: "share",
          post,
          metadata: { source: "post_card" },
          timestamp: Date.now(),
        }),
      );
    },
    [recordEvent],
  );

  const handleComment = useCallback(
    (post: Post) => {
      const isOpen = openCommentIds.has(post.id);
      setOpenCommentIds((current) => {
        const next = new Set(current);
        if (isOpen) next.delete(post.id);
        else next.add(post.id);
        return next;
      });
      if (!isOpen) {
        recordEvent(
          createBehaviorEvent({
            type: "comment_open",
            post,
            metadata: { source: "post_card" },
            timestamp: Date.now(),
          }),
        );
      }
    },
    [openCommentIds, recordEvent],
  );

  const handleNotInterested = useCallback(
    (post: Post) => {
      if (notInterestedIds.has(post.id)) return;
      setNotInterestedIds((current) => {
        const next = new Set(current);
        next.add(post.id);
        return next;
      });
      recordEvent(
        createBehaviorEvent({
          type: "not_interested",
          post,
          metadata: { source: "post_card" },
          timestamp: Date.now(),
        }),
      );
    },
    [notInterestedIds, recordEvent],
  );

  const applyRanking = useCallback(() => {
    pauseVisibilityForLayout();
    const result = rankFeed({
      posts,
      profile: profileRef.current,
      memory: postMemoryRef.current,
    });
    rankingAppliedRef.current = result.applied;
    setAppliedRanking(result);
    setProfileStale(false);
    feedVersionRef.current += 1;
    setLayoutGeneration((value) => value + 1);
    const timestamp = Date.now();
    setRankingSnapshot(
      createRankingSnapshot({
        profile: profileRef.current,
        result,
        generatedAt: timestamp,
        feedVersion: feedVersionRef.current,
      }),
    );
    setTimeline((current) =>
      appendTimeline(
        current,
        stepsFromRankingApply({
          result,
          postsById,
          clockLabel: formatClockLabel(timestamp),
        }),
      ),
    );

    if (feedFlashTimerRef.current) {
      clearTimeout(feedFlashTimerRef.current);
    }

    if (result.applied) {
      setFeedFlash(result.headline);
      feedFlashTimerRef.current = setTimeout(() => {
        setFeedFlash(null);
        feedFlashTimerRef.current = null;
      }, 2200);
      return;
    }

    setFeedFlash(null);
  }, [pauseVisibilityForLayout]);

  const handleTogglePersonalization = useCallback(
    (enabled: boolean) => {
      personalizationOnRef.current = enabled;
      setPersonalizationOn(enabled);
      const timestamp = Date.now();
      setTimeline((current) =>
        appendTimeline(
          current,
          stepsFromPersonalization({
            enabled,
            clockLabel: formatClockLabel(timestamp),
          }),
        ),
      );
      if (enabled) {
        applyRanking();
        return;
      }

      pauseVisibilityForLayout();
      rankingAppliedRef.current = false;
      setAppliedRanking(null);
      setProfileStale(false);
      setFeedFlash(null);
      feedVersionRef.current += 1;
      setLayoutGeneration((value) => value + 1);
      setRankingSnapshot({
        generatedAt: Date.now(),
        scores: cloneScores(profileRef.current.scores),
        leader: getProfileLeader(profileRef.current),
        feedVersion: feedVersionRef.current,
        applied: false,
        reason: "neutral",
        candidateCount: posts.length,
      });
      if (feedFlashTimerRef.current) {
        clearTimeout(feedFlashTimerRef.current);
        feedFlashTimerRef.current = null;
      }
    },
    [applyRanking, pauseVisibilityForLayout],
  );

  const handleSelectPost = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setSelectedAd(false);
  }, []);

  const handleSelectAd = useCallback(() => {
    setSelectedAd(true);
  }, []);

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  const handleToggleAdPersonalization = useCallback(
    (enabled: boolean) => {
      adPersonalizationOnRef.current = enabled;
      setAdPersonalizationOn(enabled);
      const timestamp = Date.now();
      const clockLabel = formatClockLabel(timestamp);
      const steps = [
        ...stepsFromAdPersonalization({ enabled, clockLabel }),
        ...syncAdTimeline(clockLabel),
      ];
      setTimeline((current) => appendTimeline(current, steps));
    },
    [syncAdTimeline],
  );

  const handleReset = useCallback(() => {
    pauseVisibilityForLayout();
    viewedPostIdsRef.current = new Set();
    profileRef.current = createEmptyProfile();
    postMemoryRef.current = {};
    personalizationOnRef.current = false;
    rankingAppliedRef.current = false;
    leaderRef.current = null;
    commercialRef.current = createEmptyCommercialProfile();
    adPersonalizationOnRef.current = false;
    adCategoryRef.current = "Contextual";
    commercialLeaderRef.current = null;
    setEvents([]);
    setLikedIds(new Set());
    setSavedIds(new Set());
    setOpenCommentIds(new Set());
    setNotInterestedIds(new Set());
    setSharedPostId(null);
    setFlash(null);
    setProfileFlash(null);
    setProfile(createEmptyProfile());
    setPersonalizationOn(false);
    setAppliedRanking(null);
    setProfileStale(false);
    setFeedFlash(null);
    setSelectedPostId(null);
    setSelectedAd(false);
    setSelectedEventId(null);
    setRankingSnapshot(null);
    setEngineerSessionKey((value) => value + 1);
    setCommercial(createEmptyCommercialProfile());
    setAdPersonalizationOn(false);
    setTimeline([]);
    feedVersionRef.current += 1;
    setViewedCount(0);
    setLayoutGeneration((value) => value + 1);
    setResetKey((value) => value + 1);

    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    if (shareTimerRef.current) {
      clearTimeout(shareTimerRef.current);
      shareTimerRef.current = null;
    }
    if (profileFlashTimerRef.current) {
      clearTimeout(profileFlashTimerRef.current);
      profileFlashTimerRef.current = null;
    }
    if (feedFlashTimerRef.current) {
      clearTimeout(feedFlashTimerRef.current);
      feedFlashTimerRef.current = null;
    }
  }, [pauseVisibilityForLayout]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
      if (profileFlashTimerRef.current) clearTimeout(profileFlashTimerRef.current);
      if (feedFlashTimerRef.current) clearTimeout(feedFlashTimerRef.current);
    };
  }, []);

  const eventTally = useMemo(() => tallySessionEvents(events), [events]);
  const summary = useMemo<ActivitySummary>(
    () => ({
      postsViewed: viewedCount,
      likes: likedIds.size,
      saves: savedIds.size,
      shares: eventTally.shares,
      longWatches: eventTally.longWatches,
      quickSkips: eventTally.quickSkips,
      notInterested: notInterestedIds.size,
    }),
    [eventTally, likedIds.size, notInterestedIds.size, savedIds.size, viewedCount],
  );

  const mirror = useMemo(() => buildAlgorithmMirror(profile), [profile]);
  const dna = useMemo(() => buildFeedDna(profile), [profile]);
  const catalogMix = useMemo(() => buildFeedMix(posts), []);
  const canPersonalize = hasRankableProfile(profile);
  const rankingApplied = Boolean(personalizationOn && appliedRanking?.applied);
  const orderedPosts = rankingApplied && appliedRanking ? appliedRanking.posts : posts;
  const movedUpCategories = useMemo(() => {
    if (!rankingApplied || !appliedRanking) return [] as const;
    const seen: Post["category"][] = [];
    for (const entry of appliedRanking.entries) {
      if (entry.moved <= 0) continue;
      const category = postsById.get(entry.postId)?.category;
      if (category && !seen.includes(category)) seen.push(category);
    }
    return seen;
  }, [appliedRanking, rankingApplied]);
  const topOrganicCategories = useMemo(
    () => orderedPosts.slice(0, 4).map((post) => post.category),
    [orderedPosts],
  );
  const currentMix = useMemo(
    () => ({ ...buildFeedMix(orderedPosts), personalized: rankingApplied }),
    [orderedPosts, rankingApplied],
  );
  const rankHints = useMemo(
    () => buildUserRankHints(rankingApplied ? appliedRanking : null),
    [appliedRanking, rankingApplied],
  );
  const adSelection = useMemo(
    () =>
      selectSponsoredAd({
        commercial,
        adPersonalizationOn,
      }),
    [adPersonalizationOn, commercial],
  );
  const learnSession = useMemo(
    () =>
      buildLearnSession({
        likes: likedIds.size,
        saves: savedIds.size,
        shares: eventTally.shares,
        longWatches: eventTally.longWatches,
        quickSkips: eventTally.quickSkips,
        notInterested: notInterestedIds.size,
        postsViewed: viewedCount,
        interestLeader: getProfileLeader(profile),
        rankingApplied,
        personalizationOn,
        adPersonalizationOn,
        organicTopCategory: orderedPosts[0]?.category ?? null,
        sponsoredCategory: adSelection.selectedCategory,
        rankingHeadline: appliedRanking?.headline ?? null,
        movedUpCategories,
        catalogSize: posts.length,
        topOrganicCategories,
      }),
    [
      adPersonalizationOn,
      adSelection.selectedCategory,
      appliedRanking,
      eventTally.longWatches,
      eventTally.quickSkips,
      eventTally.shares,
      likedIds.size,
      movedUpCategories,
      notInterestedIds.size,
      orderedPosts,
      personalizationOn,
      profile,
      rankingApplied,
      savedIds.size,
      topOrganicCategories,
      viewedCount,
    ],
  );
  const adProfile = useMemo(() => buildAdProfileView(commercial), [commercial]);
  const whyAd = useMemo(
    () =>
      buildWhyThisAdExplanation({
        selection: adSelection,
        adPersonalizationOn,
      }),
    [adPersonalizationOn, adSelection],
  );
  const commercialReady = hasCommercialSignal(commercial);

  const snapshotPending = rankingSnapshotPending(
    personalizationOn,
    rankingApplied,
    profile,
    rankingSnapshot,
  );
  const consoleRows = useMemo(
    () => buildConsoleRows(events, postsById),
    [events],
  );
  const selectedEvent = selectedEventId
    ? (events.find((event) => event.id === selectedEventId) ?? null)
    : null;
  const eventTrace = useMemo(
    () =>
      selectedEvent
        ? buildEventTrace({
            event: selectedEvent,
            profile,
            rankingApplied,
            snapshotPending,
          })
        : null,
    [profile, rankingApplied, selectedEvent, snapshotPending],
  );
  const interestVector = useMemo(() => buildInterestVector(profile), [profile]);
  const commercialVector = useMemo(
    () => buildCommercialVector(commercial),
    [commercial],
  );
  const candidateRows = useMemo(
    () => buildCandidateRows(rankingApplied ? appliedRanking : null, postsById),
    [appliedRanking, rankingApplied],
  );
  const selectedInspector = useMemo(
    () =>
      buildSelectedPostInspector(
        selectedPostId ? (postsById.get(selectedPostId) ?? null) : null,
        appliedRanking,
        rankingApplied,
        posts,
      ),
    [appliedRanking, rankingApplied, selectedPostId],
  );
  const adRows = useMemo(
    () => buildAdCandidateRows(commercial, adSelection, adPersonalizationOn),
    [adPersonalizationOn, adSelection, commercial],
  );
  const engineerOverlays = useMemo(() => {
    if (viewMode !== "engineer") return null;
    const map = new Map<string, { rank: number; movedLabel: string }>();
    if (rankingApplied && appliedRanking) {
      for (const entry of appliedRanking.entries) {
        map.set(entry.postId, {
          rank: entry.rankedIndex + 1,
          movedLabel: movementLabel(entry.moved),
        });
      }
    } else {
      posts.forEach((post, index) => {
        map.set(post.id, { rank: index + 1, movedLabel: "→" });
      });
    }
    return map;
  }, [appliedRanking, rankingApplied, viewMode]);

  const whyView = useMemo(
    () =>
      buildWhyThisPostExplanation({
        post: selectedPostId ? (postsById.get(selectedPostId) ?? null) : null,
        catalog: posts,
        ranking: appliedRanking,
        personalizationOn,
        rankingApplied,
      }),
    [appliedRanking, personalizationOn, rankingApplied, selectedPostId],
  );

  const guidedSnapshot = useMemo<GuidedSnapshot>(
    () => ({
      likedTechnology: hasTechnology(likedIds),
      savedTechnology: hasTechnology(savedIds),
      feedPersonalizationOn: personalizationOn,
      rankingApplied,
      profileStale,
      selectedTechnology: selectedPostId
        ? postsById.get(selectedPostId)?.category === "Technology"
        : false,
      adPersonalizationOn,
      whyAdOpen: selectedAd,
      notInterestedTechnology: hasTechnology(notInterestedIds),
      viewMode,
      hasProgress: hasGuidedProgress({
        likedCount: likedIds.size,
        savedCount: savedIds.size,
        notInterestedCount: notInterestedIds.size,
        feedPersonalizationOn: personalizationOn,
        adPersonalizationOn,
        viewMode,
        selectedPostId,
      }),
    }),
    [
      adPersonalizationOn,
      likedIds,
      notInterestedIds,
      personalizationOn,
      profileStale,
      rankingApplied,
      savedIds,
      selectedAd,
      selectedPostId,
      viewMode,
    ],
  );

  const {
    state: guidedState,
    step: guidedStep,
    highlight: guideHighlight,
    dispatch: dispatchGuided,
  } = useGuidedDemo({
    snapshot: guidedSnapshot,
    pauseVisibility: pauseVisibilityForLayout,
    settleVisibility,
  });

  const startFreshDemo = useCallback(() => {
    handleViewModeChange("user");
    handleReset();
    dispatchGuided({ type: "CONFIRM_FRESH" });
  }, [dispatchGuided, handleReset, handleViewModeChange]);

  const guidePostId = pickGuidePostId(
    guidedStep?.id ?? null,
    orderedPosts,
    likedIds,
    savedIds,
    notInterestedIds,
  );
  const waitingForAction = Boolean(
    guidedStep?.autoAdvance &&
      !isGuidedStepSatisfied(guidedStep.id, guidedSnapshot),
  );
  const demoChrome =
    guidedState.status === "running" ||
    guidedState.status === "done" ||
    guidedState.status === "confirm-restart";

  const feedProps = useMemo(
    () => ({
      resetKey,
      layoutGeneration,
      visibilityGateRef,
      orderedPosts,
      rankHints,
      selectedPostId,
      personalizationOn,
      canPersonalize,
      rankingApplied,
      profileStale,
      feedFlash,
      feedHeadline: appliedRanking?.headline ?? null,
      likedIds,
      savedIds,
      openCommentIds,
      notInterestedIds,
      sharedPostId,
      adPersonalizationOn,
      hasCommercialSignal: commercialReady,
      adSelection,
      whyAd,
      selectedAd,
      engineerOverlays,
      guideHighlight,
      guidePostId,
      showEmptyState: !guidedState.introVisible && !demoChrome,
      onTogglePersonalization: handleTogglePersonalization,
      onToggleAdPersonalization: handleToggleAdPersonalization,
      onSelectAd: handleSelectAd,
      onRefreshFeed: applyRanking,
      onSelectPost: handleSelectPost,
      onView: handleView,
      onLeave: handleLeave,
      onLike: handleLike,
      onSave: handleSave,
      onShare: handleShare,
      onComment: handleComment,
      onNotInterested: handleNotInterested,
    }),
    [
      adPersonalizationOn,
      adSelection,
      appliedRanking,
      applyRanking,
      canPersonalize,
      commercialReady,
      engineerOverlays,
      demoChrome,
      guideHighlight,
      guidePostId,
      guidedState.introVisible,
      handleSelectAd,
      handleToggleAdPersonalization,
      selectedAd,
      selectedPostId,
      whyAd,
      feedFlash,
      handleComment,
      handleLeave,
      handleLike,
      handleNotInterested,
      handleSave,
      handleShare,
      handleSelectPost,
      handleTogglePersonalization,
      handleView,
      layoutGeneration,
      likedIds,
      notInterestedIds,
      openCommentIds,
      orderedPosts,
      personalizationOn,
      profileStale,
      rankHints,
      rankingApplied,
      resetKey,
      savedIds,
      sharedPostId,
    ],
  );

  const showDemoPanel = demoChrome && viewMode !== "learn";
  const guidedActive = isGuidedDemoActive(guidedState.status);

  return (
    <>
      <Header
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        guideHighlight={guideHighlight}
      />
      <main
        id="main-content"
        className={`mx-auto w-full min-w-0 px-4 py-5 md:px-6 md:py-6 lg:px-8 ${
          viewMode === "learn"
            ? "max-w-[920px]"
            : "max-w-[720px] md:max-w-[840px] lg:max-w-[1220px]"
        } ${showDemoPanel ? "pb-40 md:pb-10" : ""}`}
      >
        <div
          hidden={viewMode !== "learn"}
          className={viewMode === "learn" ? "" : "hidden"}
        >
          <LearnWorkspace
            session={learnSession}
            guidedActive={guidedActive}
            guidedLabel={
              guidedStep ? `Step ${guidedStep.number} of 8` : null
            }
            onOpenFeed={() => handleViewModeChange("user")}
            onOpenEngineer={() => handleViewModeChange("engineer")}
            onReturnToWalkthrough={() =>
              handleViewModeChange(
                walkthroughReturnMode(guidedState.status, guidedStep?.id ?? null),
              )
            }
          />
        </div>
        <div
          hidden={viewMode === "learn"}
          className={`grid min-w-0 grid-cols-1 gap-6 lg:items-start xl:gap-8 ${
            viewMode === "learn" ? "hidden" : ""
          } ${
            viewMode === "engineer"
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(260px,400px)] xl:grid-cols-[minmax(0,1fr)_minmax(300px,460px)]"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:grid-cols-[minmax(0,1fr)_340px]"
          }`}
        >
          <div className="flex min-w-0 flex-col gap-4">
            <FeedIntro
              status={guidedState.status}
              introVisible={guidedState.introVisible}
              hasProgress={guidedSnapshot.hasProgress}
              onStart={() => dispatchGuided({ type: "REQUEST_START" })}
              onExplore={() => dispatchGuided({ type: "EXPLORE_FREELY" })}
              onFresh={startFreshDemo}
              onKeep={() => dispatchGuided({ type: "CONFIRM_KEEP" })}
              onCancelConfirm={() => dispatchGuided({ type: "CANCEL_CONFIRM" })}
            />
            <Feed {...feedProps} />
          </div>
          <div
            id="panel-user"
            role="tabpanel"
            aria-labelledby="mode-user"
            hidden={viewMode !== "user"}
            className={`min-w-0 ${viewMode === "user" ? "" : "hidden"}`}
          >
            <RightPanel
              events={events}
              summary={summary}
              flash={flash}
              profileFlash={profileFlash}
              mirror={mirror}
              dna={dna}
              catalogMix={catalogMix}
              currentMix={currentMix}
              personalizedMix={rankingApplied}
              whyView={whyView}
              adProfile={adProfile}
              whyAd={whyAd}
              sponsoredCategory={adSelection.selectedCategory}
              timeline={timeline}
              resetKey={resetKey}
              onReset={handleReset}
            />
          </div>
          <div
            id="panel-engineer"
            role="tabpanel"
            aria-labelledby="mode-engineer"
            hidden={viewMode !== "engineer"}
            className={`min-w-0 ${viewMode === "engineer" ? "" : "hidden"}`}
          >
            <EngineerWorkspace
              key={engineerSessionKey}
              consoleRows={consoleRows}
              selectedEvent={selectedEvent}
              trace={eventTrace}
              onSelectEvent={handleSelectEvent}
              interest={interestVector}
              commercial={commercialVector}
              snapshotScores={snapshotPending ? rankingSnapshot?.scores ?? null : null}
              pending={snapshotPending}
              snapshot={rankingSnapshot}
              personalizationOn={personalizationOn}
              rankingApplied={rankingApplied}
              inspector={selectedInspector}
              candidates={candidateRows}
              selectedPostId={selectedPostId}
              onSelectPost={handleSelectPost}
              adPersonalizationOn={adPersonalizationOn}
              adSelection={adSelection}
              adRows={adRows}
              onReset={handleReset}
              guideHighlight={guideHighlight}
            />
          </div>
        </div>
      </main>
      {showDemoPanel ? (
      <GuidedDemoPanel
        state={guidedState}
        step={guidedStep}
        waiting={waitingForAction}
        onNext={() => dispatchGuided({ type: "NEXT" })}
        onBack={() => dispatchGuided({ type: "BACK" })}
        onSkip={() => dispatchGuided({ type: "SKIP" })}
        onExit={() => dispatchGuided({ type: "EXIT" })}
        onExplore={() => dispatchGuided({ type: "EXPLORE_FREELY" })}
        onRestart={() => dispatchGuided({ type: "REQUEST_RESTART" })}
        onFresh={startFreshDemo}
        onKeep={() => dispatchGuided({ type: "CONFIRM_KEEP" })}
        onCancelConfirm={() => dispatchGuided({ type: "CANCEL_CONFIRM" })}
      />
      ) : null}
    </>
  );
}
