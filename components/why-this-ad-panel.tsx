import type { WhyThisAdView } from "@/lib/ad-explanation";

interface WhyThisAdPanelProps {
  view: WhyThisAdView;
}

export function WhyThisAdPanel({ view }: WhyThisAdPanelProps) {
  return (
    <article className="rounded-2xl border border-amber-300/16 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">Why This Ad?</h3>
        <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-100">
          Advertising
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Why this sponsored placement was selected. Separate from Why This Post.
      </p>

      <div className="mt-4 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          {view.targeting} · {view.advertiser}
        </p>
        <p className="text-sm font-medium text-slate-100">{view.headline}</p>
        <ul className="space-y-1.5 text-sm leading-6 text-slate-400">
          {view.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="rounded-xl border border-amber-300/15 bg-amber-400/8 px-3 py-2 text-xs leading-5 text-amber-50/90">
          {view.education}
        </p>
      </div>
    </article>
  );
}
