import { describe, expect, it } from "vitest";
import { LEARN_NAV, learnSectionHref } from "@/lib/learn-view";
import { footerNav, SITE } from "@/lib/site";
import { planViewTransition } from "@/lib/learn-view";

describe("product metadata", () => {
  it("uses the recruiter-facing title and simulation description", () => {
    expect(SITE.title).toBe("Feed X-Ray | Interactive Recommendation System Simulator");
    expect(SITE.description).toContain("behavioral signals");
    expect(SITE.headline).toBe("Your Feed Isn't Random. Discover Why.");
    expect(SITE.tagline).toBe("See why you see what you see.");
    expect(SITE.githubUrl).toBe("https://github.com/ramreddys49/feed-xray");
    expect(SITE.demoUrl).toBe("https://feed-xray.vercel.app");
  });
});

describe("footer links", () => {
  it("includes the GitHub repository and About This Project", () => {
    const links = footerNav();
    expect(links).toEqual([
      { label: "GitHub", href: "https://github.com/ramreddys49/feed-xray" },
      { label: "About This Project", href: "#about-this-project" },
    ]);
  });
});

describe("Learn section navigation", () => {
  it("exposes in-page anchors for every Learn module", () => {
    expect(LEARN_NAV.map((item) => item.label)).toEqual([
      "Pipeline",
      "Signals",
      "Ranking",
      "Exploration",
      "Feedback Loop",
      "Ads",
      "Simulation Limits",
    ]);
    for (const item of LEARN_NAV) {
      expect(learnSectionHref(item.id)).toBe(`#learn-${item.id}`);
    }
  });
});

describe("view switching still preserves simulation", () => {
  it("does not reset state when entering Learn or Engineer", () => {
    expect(planViewTransition("user", "learn").preserveSimulation).toBe(true);
    expect(planViewTransition("engineer", "learn").preserveGuidedDemo).toBe(true);
    expect(planViewTransition("learn", "user").settleVisibility).toBe(true);
  });
});
