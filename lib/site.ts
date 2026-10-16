/**
 * Product identity and public metadata.
 */
export const SITE = {
  name: "Feed X-Ray",
  tagline: "See why you see what you see.",
  headline: "Your Feed Isn't Random. Discover Why.",
  supporting:
    "Explore how your interactions shape the content and advertisements you see in a simulated social feed.",
  about:
    "An interactive educational simulation of recommendation systems and advertising decisions.",
  fictionalNotice:
    "All posts, creators, advertisers, and scoring rules are fictional. No real social platform data is used.",
  title: "Feed X-Ray | Interactive Recommendation System Simulator",
  description:
    "Explore how behavioral signals influence social media recommendations and sponsored content through an interactive educational simulation.",
  githubUrl: "https://github.com/ramreddys49/feed-xray" as string | null,
  demoUrl: "https://feed-xray.vercel.app" as string | null,
} as const;

export function footerNav() {
  const links: { label: string; href: string }[] = [
    { label: "About This Project", href: "#about-this-project" },
  ];
  if (SITE.githubUrl) {
    links.unshift({ label: "GitHub", href: SITE.githubUrl });
  }
  return links;
}

export const MODE_HINTS = {
  user: "Interact with the fictional feed and watch inferred interests form.",
  engineer: "Inspect events, profile vectors, ranking snapshots, and ad selection.",
  learn: "Read how real-world feeds can use behavior, ranking, and ads.",
} as const;
