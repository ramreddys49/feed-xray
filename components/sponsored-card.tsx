import { PostIllustration } from "@/components/post-illustration";
import type { GuideHighlight } from "@/lib/guided-demo";
import type { WhyThisAdView } from "@/lib/ad-explanation";
import type { AdSelectionResult } from "@/lib/ad-engine";
import type { SponsoredAd } from "@/types/ad";

interface SponsoredCardProps {
  ad: SponsoredAd;
  selection: AdSelectionResult;
  explanation: WhyThisAdView;
  selected: boolean;
  onSelect: () => void;
  guideHighlight?: GuideHighlight | null;
}

export function SponsoredCard({
  ad,
  selection,
  explanation,
  selected,
  onSelect,
  guideHighlight = null,
}: SponsoredCardProps) {
  const targeting = selection.reason === "personalized" ? "Personalized" : "Contextual";

  return (
    <article
      aria-label={`Sponsored content from ${ad.advertiser}`}
      className={`scroll-mt-28 rounded-[1.4rem] border p-4 sm:p-5 ${
        selected
          ? "border-amber-300/40 bg-amber-400/[0.07]"
          : "border-amber-300/18 bg-amber-400/[0.04]"
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-100">
            Sponsored
          </p>
          <p className="mt-1 text-sm font-medium text-slate-50">{ad.advertiser}</p>
          <p className="mt-0.5 text-xs text-slate-500">{ad.category}</p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-amber-100">
          {targeting}
        </span>
      </header>

      <div className="mt-4">
        <PostIllustration kind={ad.illustration} title={ad.headline} />
      </div>

      <div className="mt-4">
        <h3 className="text-[1.05rem] font-semibold tracking-tight text-slate-50">
          {ad.headline}
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-400">{ad.description}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-amber-300/10 pt-3">
        <button
          type="button"
          className="rounded-full border border-amber-300/25 bg-amber-400/16 px-3.5 py-1.5 text-[13px] font-medium text-amber-50"
        >
          {ad.cta}
          <span className="sr-only">. Demo only. No advertiser was contacted.</span>
        </button>
        <p className="text-[11px] text-slate-500">Demo advertiser · fictional</p>
      </div>

      <details
        className="mt-3 rounded-xl border border-amber-300/15 bg-black/20 px-3 py-2"
        onToggle={(event) => {
          if (event.currentTarget.open) onSelect();
        }}
      >
        <summary
          data-guide-target={guideHighlight === "why-this-ad" ? "why-this-ad" : undefined}
          data-guide-active={guideHighlight === "why-this-ad" ? "true" : undefined}
          className="cursor-pointer text-xs text-amber-100 underline-offset-2 hover:underline"
        >
          Why this ad?
        </summary>
        <div className="mt-2 space-y-1.5 text-sm leading-6 text-slate-400">
          <p className="font-medium text-slate-200">{explanation.headline}</p>
          {explanation.bullets.map((bullet) => (
            <p key={bullet}>{bullet}</p>
          ))}
        </div>
      </details>
    </article>
  );
}
