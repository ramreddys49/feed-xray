"use client";

import { useEffect, useRef } from "react";
import { AdProfilePanel } from "@/components/ad-profile-panel";
import { AlgorithmMirrorPanel } from "@/components/algorithm-mirror-panel";
import { BehaviorSignalsPanel } from "@/components/behavior-signals-panel";
import { FeedDnaPanel } from "@/components/feed-dna-panel";
import { FeedMixPanel } from "@/components/feed-mix-panel";
import { RecommendationTimelinePanel } from "@/components/recommendation-timeline-panel";
import { WhyThisAdPanel } from "@/components/why-this-ad-panel";
import { WhyThisPostPanel } from "@/components/why-this-post-panel";
import type { ActivitySummary } from "@/lib/signal-copy";
import type {
  AlgorithmMirrorView,
  FeedDnaView,
  ProfileChange,
} from "@/lib/profile-engine";
import type { AdProfileView } from "@/lib/ad-engine";
import type { WhyThisAdView } from "@/lib/ad-explanation";
import type { WhyThisPostView } from "@/lib/recommendation-explanation";
import type { TimelineStep } from "@/lib/recommendation-timeline";
import type { FeedMixView } from "@/lib/ranking-engine";
import type { BehaviorEvent } from "@/types/events";

interface RightPanelProps {
  events: BehaviorEvent[];
  summary: ActivitySummary;
  flash: string | null;
  profileFlash: ProfileChange | null;
  mirror: AlgorithmMirrorView;
  dna: FeedDnaView;
  catalogMix: FeedMixView;
  currentMix: FeedMixView;
  personalizedMix: boolean;
  whyView: WhyThisPostView;
  adProfile: AdProfileView;
  whyAd: WhyThisAdView;
  sponsoredCategory: string | null;
  timeline: TimelineStep[];
  resetKey: number;
  onReset: () => void;
}

export function RightPanel({
  events,
  summary,
  flash,
  profileFlash,
  mirror,
  dna,
  catalogMix,
  currentMix,
  personalizedMix,
  whyView,
  adProfile,
  whyAd,
  sponsoredCategory,
  timeline,
  resetKey,
  onReset,
}: RightPanelProps) {
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (asideRef.current) {
      asideRef.current.scrollTop = 0;
    }
  }, [resetKey]);

  return (
    <aside
      ref={asideRef}
      className="insight-scroll flex min-w-0 flex-col gap-3 lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100vh-6.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-1"
    >
      <div className="px-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-200/70">
          User View
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-50">
          What this session inferred
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Outcomes from your actions — not the ranking math. Open Engineer Mode for scores.
        </p>
      </div>

      <AlgorithmMirrorPanel mirror={mirror} flash={profileFlash} />
      <FeedDnaPanel dna={dna} />
      <FeedMixPanel
        before={catalogMix}
        after={currentMix}
        personalized={personalizedMix}
        sponsoredCategory={sponsoredCategory}
      />
      <AdProfilePanel view={adProfile} />
      <WhyThisPostPanel view={whyView} />
      <WhyThisAdPanel view={whyAd} />
      <RecommendationTimelinePanel steps={timeline} />
      <BehaviorSignalsPanel
        events={events}
        summary={summary}
        flash={flash}
        onReset={onReset}
      />
    </aside>
  );
}
