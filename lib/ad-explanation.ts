import type { AdSelectionResult } from "@/lib/ad-engine";

export interface WhyThisAdView {
  advertiser: string;
  categoryLabel: string;
  targeting: "Personalized" | "Contextual";
  headline: string;
  bullets: string[];
  education: string;
}

export function buildWhyThisAdExplanation(input: {
  selection: AdSelectionResult;
  adPersonalizationOn: boolean;
}): WhyThisAdView {
  const ad = input.selection.ad;

  if (!input.adPersonalizationOn) {
    return {
      advertiser: ad.advertiser,
      categoryLabel: "Contextual",
      targeting: "Contextual",
      headline: "Ad Personalization is off.",
      bullets: [
        "This sponsored post was selected without using your behavioral interest profile.",
        "Contextual advertising can still exist without behavioral targeting.",
      ],
      education:
        "Turning off ad personalization does not necessarily mean ads disappear — they may become contextual instead.",
    };
  }

  if (input.selection.reason !== "personalized") {
    return {
      advertiser: ad.advertiser,
      categoryLabel: "Contextual",
      targeting: "Contextual",
      headline: "Not enough commercial signal yet.",
      bullets: [
        "Selected without using your behavioral profile.",
        "Contextual sponsored content can still appear.",
      ],
      education:
        "Turning off ad personalization does not necessarily mean ads disappear — they may become contextual instead.",
    };
  }

  const category = input.selection.selectedCategory;
  const { factors } = input.selection;
  const commercialBits = [
    factors.saved ? "saved" : null,
    factors.dwelled ? "spent more time on" : null,
    factors.liked ? "liked" : null,
    factors.shared ? "shared" : null,
  ].filter((item): item is string => Boolean(item));

  const activity =
    commercialBits.length > 0
      ? `You also ${joinList(commercialBits)} ${category} content.`
      : `Stronger actions on ${category} content raised its commercial affinity in this demo.`;

  return {
    advertiser: ad.advertiser,
    categoryLabel: String(category),
    targeting: "Personalized",
    headline: `${category} is currently your strongest inferred interest.`,
    bullets: [
      activity,
      `This demo therefore selected a ${category}-related sponsored placement.`,
    ],
    education:
      "Social platforms can use different systems to choose organic content and sponsored content.",
  };
}

function joinList(parts: string[]) {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} or ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, or ${parts[parts.length - 1]}`;
}
