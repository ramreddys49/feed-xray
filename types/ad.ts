import type { IllustrationKind, PostCategory } from "@/types/post";

export type AdCategory = PostCategory | "Contextual";

export interface SponsoredAd {
  id: string;
  advertiser: string;
  category: AdCategory;
  headline: string;
  description: string;
  cta: string;
  illustration: IllustrationKind;
  commercialTags: string[];
}
