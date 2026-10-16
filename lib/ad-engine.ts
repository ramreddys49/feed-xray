import { adsByCategory, contextualAd } from "@/data/ads";
import { createEmptyScores } from "@/lib/profile-engine";
import type { SponsoredAd } from "@/types/ad";
import type { BehaviorEvent } from "@/types/events";
import { POST_CATEGORIES, type PostCategory } from "@/types/post";

/**
 * These values are Feed X-Ray simulation weights and are not real ad-platform
 * weights. They do not represent Meta, Google, TikTok, Amazon, or any other
 * advertiser targeting model.
 *
 * Commercial affinity is a separate educational profile from organic interest.
 * Views alone do not create an ad profile.
 */
export const COMMERCIAL_WEIGHTS = {
  like: 4,
  unlike: -4,
  save: 10,
  unsave: -10,
  share: 8,
  comment_open: 2,
  dwell8to15s: 3,
  dwell15sPlus: 5,
  quick_skip: -2,
  not_interested: -15,
  post_view: 0,
} as const;

/** Inserted after this many organic posts. Ads are never rankFeed() candidates. */
export const AD_SLOT_INDEX = 6;

/** A Not Interested category stays out of ad selection until affinity recovers past this floor. */
export const COMMERCIAL_RECOVERY_FLOOR = 16;

export interface CommercialEvidence {
  liked: boolean;
  saved: boolean;
  shared: boolean;
  dwelled: boolean;
  notInterested: boolean;
}

export interface CommercialProfile {
  scores: Record<PostCategory, number>;
  evidence: Record<PostCategory, CommercialEvidence>;
}

export interface AdSelectionFactors {
  commercialAffinity: number;
  saved: boolean;
  shared: boolean;
  dwelled: boolean;
  liked: boolean;
  blocked: boolean;
}

export interface AdSelectionResult {
  adId: string;
  selectedCategory: SponsoredAd["category"];
  reason: "contextual" | "personalized" | "insufficient";
  factors: AdSelectionFactors;
  commercialAffinity: number;
  ad: SponsoredAd;
}

export interface AdProfileRow {
  category: PostCategory;
  label: "Strong" | "Growing" | "Low";
}

export interface AdProfileView {
  hasSignals: boolean;
  rows: AdProfileRow[];
}

export function createEmptyCommercialEvidence(): CommercialEvidence {
  return {
    liked: false,
    saved: false,
    shared: false,
    dwelled: false,
    notInterested: false,
  };
}

export function createEmptyCommercialProfile(): CommercialProfile {
  return {
    scores: createEmptyScores(),
    evidence: Object.fromEntries(
      POST_CATEGORIES.map((category) => [category, createEmptyCommercialEvidence()]),
    ) as Record<PostCategory, CommercialEvidence>,
  };
}

export function getCommercialDelta(event: BehaviorEvent) {
  switch (event.type) {
    case "like":
      return COMMERCIAL_WEIGHTS.like;
    case "unlike":
      return COMMERCIAL_WEIGHTS.unlike;
    case "save":
      return COMMERCIAL_WEIGHTS.save;
    case "unsave":
      return COMMERCIAL_WEIGHTS.unsave;
    case "share":
      return COMMERCIAL_WEIGHTS.share;
    case "comment_open":
      return COMMERCIAL_WEIGHTS.comment_open;
    case "quick_skip":
      return COMMERCIAL_WEIGHTS.quick_skip;
    case "not_interested":
      return COMMERCIAL_WEIGHTS.not_interested;
    case "dwell_time": {
      const seconds = event.metadata.durationMs / 1000;
      if (seconds >= 15) return COMMERCIAL_WEIGHTS.dwell15sPlus;
      if (seconds >= 8) return COMMERCIAL_WEIGHTS.dwell8to15s;
      return 0;
    }
    case "post_view":
      return COMMERCIAL_WEIGHTS.post_view;
  }
}

export function applyEventToCommercialProfile(
  profile: CommercialProfile,
  event: BehaviorEvent,
): CommercialProfile {
  const delta = getCommercialDelta(event);
  if (delta === 0) return profile;

  const category = event.category;
  const scores = { ...profile.scores };
  scores[category] = scores[category] + delta;

  return {
    scores,
    evidence: updateCommercialEvidence(profile.evidence, event),
  };
}

export function getCommercialLeader(profile: CommercialProfile): PostCategory | null {
  return rankCommercial(profile)[0]?.category ?? null;
}

export function hasCommercialSignal(profile: CommercialProfile) {
  return rankCommercial(profile).some((item) => item.raw > 0);
}

export function selectSponsoredAd(input: {
  commercial: CommercialProfile;
  adPersonalizationOn: boolean;
}): AdSelectionResult {
  if (!input.adPersonalizationOn) {
    return contextualResult("contextual");
  }

  const eligible = rankCommercial(input.commercial).filter((item) => {
    if (item.raw <= 0 || !adsByCategory.has(item.category)) return false;
    const blocked = input.commercial.evidence[item.category].notInterested;
    return !blocked || item.raw >= COMMERCIAL_RECOVERY_FLOOR;
  });
  const leader = eligible[0];
  if (!leader) {
    return contextualResult("insufficient");
  }

  const ad = adsByCategory.get(leader.category) ?? contextualAd;
  const evidence = input.commercial.evidence[leader.category];
  return {
    adId: ad.id,
    selectedCategory: ad.category,
    reason: "personalized",
    commercialAffinity: leader.raw,
    ad,
    factors: {
      commercialAffinity: leader.raw,
      saved: evidence.saved,
      shared: evidence.shared,
      dwelled: evidence.dwelled,
      liked: evidence.liked,
      blocked: false,
    },
  };
}

export function buildAdProfileView(profile: CommercialProfile): AdProfileView {
  const ranked = rankCommercial(profile).filter((item) => item.raw > 0).slice(0, 3);
  if (ranked.length === 0) {
    return { hasSignals: false, rows: [] };
  }

  const leader = ranked[0].raw;
  return {
    hasSignals: true,
    rows: ranked.map((item) => {
      const ratio = item.raw / leader;
      let label: AdProfileRow["label"] = "Low";
      if (ratio >= 0.85) label = "Strong";
      else if (ratio >= 0.4) label = "Growing";
      return { category: item.category, label };
    }),
  };
}

function contextualResult(reason: "contextual" | "insufficient"): AdSelectionResult {
  return {
    adId: contextualAd.id,
    selectedCategory: "Contextual",
    reason,
    commercialAffinity: 0,
    ad: contextualAd,
    factors: {
      commercialAffinity: 0,
      saved: false,
      shared: false,
      dwelled: false,
      liked: false,
      blocked: false,
    },
  };
}

function rankCommercial(profile: CommercialProfile) {
  return POST_CATEGORIES.map((category) => ({
    category,
    raw: profile.scores[category],
  })).sort((a, b) => b.raw - a.raw || a.category.localeCompare(b.category));
}

function updateCommercialEvidence(
  evidence: Record<PostCategory, CommercialEvidence>,
  event: BehaviorEvent,
) {
  const current = evidence[event.category];
  const next = { ...current };

  switch (event.type) {
    case "like":
      next.liked = true;
      break;
    case "unlike":
      next.liked = false;
      break;
    case "save":
      next.saved = true;
      break;
    case "unsave":
      next.saved = false;
      break;
    case "share":
      next.shared = true;
      break;
    case "dwell_time":
      if (event.metadata.durationMs >= 8000) next.dwelled = true;
      break;
    case "not_interested":
      next.notInterested = true;
      break;
    default:
      break;
  }

  return { ...evidence, [event.category]: next };
}
