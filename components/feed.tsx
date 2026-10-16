"use client";

import { memo, type MutableRefObject } from "react";
import { AdPersonalizationBar } from "@/components/ad-personalization-bar";
import { FeedPlaceholder } from "@/components/feed-placeholder";
import { PersonalizationBar } from "@/components/personalization-bar";
import { PostCard, type RankHint } from "@/components/post-card";
import { SponsoredCard } from "@/components/sponsored-card";
import {
  useFeedVisibility,
  type VisibilityGate,
} from "@/hooks/use-feed-visibility";
import type { WhyThisAdView } from "@/lib/ad-explanation";
import { AD_SLOT_INDEX, type AdSelectionResult } from "@/lib/ad-engine";
import type { GuideHighlight } from "@/lib/guided-demo";
import type { Post } from "@/types/post";

interface FeedProps {
  resetKey: number;
  layoutGeneration: number;
  visibilityGateRef: MutableRefObject<VisibilityGate | null>;
  orderedPosts: Post[];
  rankHints: ReadonlyMap<string, RankHint>;
  selectedPostId: string | null;
  personalizationOn: boolean;
  canPersonalize: boolean;
  rankingApplied: boolean;
  profileStale: boolean;
  feedFlash: string | null;
  feedHeadline: string | null;
  likedIds: ReadonlySet<string>;
  savedIds: ReadonlySet<string>;
  openCommentIds: ReadonlySet<string>;
  notInterestedIds: ReadonlySet<string>;
  sharedPostId: string | null;
  adPersonalizationOn: boolean;
  hasCommercialSignal: boolean;
  adSelection: AdSelectionResult;
  whyAd: WhyThisAdView;
  selectedAd: boolean;
  engineerOverlays?: ReadonlyMap<string, { rank: number; movedLabel: string }> | null;
  guideHighlight?: GuideHighlight | null;
  guidePostId?: string | null;
  showEmptyState?: boolean;
  onTogglePersonalization: (enabled: boolean) => void;
  onToggleAdPersonalization: (enabled: boolean) => void;
  onRefreshFeed: () => void;
  onSelectPost: (postId: string) => void;
  onSelectAd: () => void;
  onView: (postId: string, visibilityRatio: number) => void;
  onLeave: (postId: string, durationMs: number) => void;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
  onShare: (post: Post) => void;
  onComment: (post: Post) => void;
  onNotInterested: (post: Post) => void;
}

export const Feed = memo(function Feed({
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
  feedHeadline,
  likedIds,
  savedIds,
  openCommentIds,
  notInterestedIds,
  sharedPostId,
  adPersonalizationOn,
  hasCommercialSignal,
  adSelection,
  whyAd,
  selectedAd,
  engineerOverlays = null,
  guideHighlight = null,
  guidePostId = null,
  showEmptyState = true,
  onTogglePersonalization,
  onToggleAdPersonalization,
  onRefreshFeed,
  onSelectPost,
  onSelectAd,
  onView,
  onLeave,
  onLike,
  onSave,
  onShare,
  onComment,
  onNotInterested,
}: FeedProps) {
  const registerVisibility = useFeedVisibility({
    resetKey,
    layoutGeneration,
    gateRef: visibilityGateRef,
    onView,
    onLeave,
  });

  return (
    <section className="flex min-w-0 flex-col gap-4 overflow-x-clip">
      <PersonalizationBar
        enabled={personalizationOn}
        canPersonalize={canPersonalize}
        applied={rankingApplied}
        stale={profileStale}
        feedFlash={feedFlash}
        headline={feedHeadline}
        onToggle={onTogglePersonalization}
        onRefresh={onRefreshFeed}
        guideHighlight={guideHighlight}
      />
      <AdPersonalizationBar
        enabled={adPersonalizationOn}
        hasCommercialSignal={hasCommercialSignal}
        targeting={adSelection.reason === "personalized" ? "Personalized" : "Contextual"}
        advertiser={adSelection.ad.advertiser}
        onToggle={onToggleAdPersonalization}
        guideHighlight={guideHighlight}
      />
      {showEmptyState ? <FeedPlaceholder /> : null}
      <div className="feed-reorder flex min-w-0 flex-col gap-4">
        {orderedPosts.map((post, index) => (
          <div key={post.id} className="flex flex-col gap-4">
            {index === AD_SLOT_INDEX ? (
              <SponsoredCard
                ad={adSelection.ad}
                selection={adSelection}
                explanation={whyAd}
                selected={selectedAd}
                onSelect={onSelectAd}
                guideHighlight={guideHighlight}
              />
            ) : null}
            <PostCard
              post={post}
              liked={likedIds.has(post.id)}
              saved={savedIds.has(post.id)}
              commentsOpen={openCommentIds.has(post.id)}
              notInterested={notInterestedIds.has(post.id)}
              justShared={sharedPostId === post.id}
              rankHint={engineerOverlays ? null : rankHints.get(post.id) ?? null}
              engineerOverlay={engineerOverlays?.get(post.id) ?? null}
              selected={selectedPostId === post.id}
              onSelectPost={onSelectPost}
              onLike={onLike}
              onSave={onSave}
              onShare={onShare}
              onComment={onComment}
              onNotInterested={onNotInterested}
              registerVisibility={registerVisibility}
              guideHighlight={guideHighlight}
              isGuidePost={guidePostId === post.id}
            />
          </div>
        ))}
      </div>
    </section>
  );
});
