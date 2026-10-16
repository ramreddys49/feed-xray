import { describe, expect, it } from "vitest";
import { posts } from "@/data/posts";
import {
  applyEventToCommercialProfile,
  createEmptyCommercialProfile,
  selectSponsoredAd,
} from "@/lib/ad-engine";
import {
  applyBehaviorEventToProfile,
  createEmptyProfile,
} from "@/lib/profile-engine";
import { rankFeed } from "@/lib/ranking-engine";
import { makeEvent, techPost } from "./helpers";

describe("ad engine", () => {
  it("selects contextual content when ad personalization is off", () => {
    const post = techPost();
    const commercial = applyEventToCommercialProfile(
      createEmptyCommercialProfile(),
      makeEvent("like", post, { source: "post_card" }),
    );
    const result = selectSponsoredAd({
      commercial,
      adPersonalizationOn: false,
    });
    expect(result.reason).toBe("contextual");
    expect(result.ad.advertiser).toBe("Featured Today");
    expect(result.selectedCategory).toBe("Contextual");
  });

  it("selects a matching advertiser for strong commercial affinity", () => {
    const post = techPost();
    const commercial = applyEventToCommercialProfile(
      createEmptyCommercialProfile(),
      makeEvent("save", post, { source: "post_card" }),
    );
    const result = selectSponsoredAd({
      commercial,
      adPersonalizationOn: true,
    });
    expect(result.reason).toBe("personalized");
    expect(result.ad.advertiser).toBe("NovaDesk");
    expect(result.selectedCategory).toBe("Technology");
  });

  it("can block a category after Not Interested", () => {
    const post = techPost();
    let commercial = applyEventToCommercialProfile(
      createEmptyCommercialProfile(),
      makeEvent("like", post, { source: "post_card" }),
    );
    commercial = applyEventToCommercialProfile(
      commercial,
      makeEvent("not_interested", post, { source: "post_card" }),
    );
    const result = selectSponsoredAd({
      commercial,
      adPersonalizationOn: true,
    });
    expect(result.ad.advertiser).not.toBe("NovaDesk");
    expect(result.reason).not.toBe("personalized");
  });

  it("leaves organic ranking unchanged when ads are selected", () => {
    const post = techPost();
    const like = makeEvent("like", post, { source: "post_card" });
    const profile = applyBehaviorEventToProfile(createEmptyProfile(), like);
    const commercial = applyEventToCommercialProfile(
      createEmptyCommercialProfile(),
      like,
    );
    const organic = rankFeed({ posts, profile, memory: {} });
    const ad = selectSponsoredAd({
      commercial,
      adPersonalizationOn: true,
    });
    const organicAgain = rankFeed({ posts, profile, memory: {} });
    expect(organic.posts.map((item) => item.id)).toEqual(
      organicAgain.posts.map((item) => item.id),
    );
    expect(ad.adId).not.toBe(organic.posts[0].id);
  });
});
