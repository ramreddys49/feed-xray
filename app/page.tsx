import { FeedXrayApp } from "@/components/feed-xray-app";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-cyan-400/20 focus:px-3 focus:py-2 focus:text-sm focus:text-cyan-50"
      >
        Skip to feed
      </a>
      <FeedXrayApp />
      <SiteFooter />
    </div>
  );
}
