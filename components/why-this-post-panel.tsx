import type { WhyThisPostView } from "@/lib/recommendation-explanation";

interface WhyThisPostPanelProps {
  view: WhyThisPostView;
}

export function WhyThisPostPanel({ view }: WhyThisPostPanelProps) {
  return (
    <article className="rounded-2xl border border-amber-300/16 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">Why This Post?</h3>
        <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-100">
          Decision
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Why did this specific item rank here?
      </p>

      {view.status === "empty" ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4">
          <p className="text-sm font-medium text-slate-200">{view.headline}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{view.body}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              {view.category} post
            </p>
            <p className="mt-1 text-sm font-medium text-slate-100">{view.creatorName}</p>
            <p className="mt-0.5 text-sm leading-6 text-slate-400">{view.headline}</p>
          </div>

          <MovementMeter
            before={view.catalogPosition}
            after={view.rankedPosition}
            moved={view.moved}
          />

          {view.showFactors ? (
            <ul className="space-y-2">
              {view.factors.map((factor) => (
                <li key={factor.key}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">{factor.label}</span>
                    <span className="font-medium text-slate-200">{factor.level}</span>
                  </div>
                  <div className="mt-1 flex gap-0.5" aria-hidden>
                    {Array.from({ length: 8 }, (_, index) => (
                      <span
                        key={`${factor.key}-${index}`}
                        className={`h-1.5 flex-1 rounded-full ${
                          index < factor.bars ? "bg-amber-200/80" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="text-sm leading-6 text-slate-400">{view.body}</p>
          {view.education ? (
            <p className="rounded-xl border border-amber-300/15 bg-amber-400/8 px-3 py-2 text-xs leading-5 text-amber-50/90">
              {view.education}
            </p>
          ) : null}
          {view.outcome ? (
            <p className="text-xs text-slate-500">
              Final outcome: <span className="text-slate-200">{view.outcome}</span>
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}

function MovementMeter({
  before,
  after,
  moved,
}: {
  before: number;
  after: number;
  moved: number;
}) {
  const direction =
    moved > 0 ? "Moved up" : moved < 0 ? "Moved down" : "Position unchanged";
  const delta = Math.abs(moved);

  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <div>
          <p className="uppercase tracking-[0.14em] text-slate-500">Before</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">#{before}</p>
        </div>
        <div className="text-center text-slate-400">
          <p aria-hidden>{moved > 0 ? "↑" : moved < 0 ? "↓" : "→"}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            {moved === 0 ? "Same place" : `${moved > 0 ? "+" : "−"}${delta}`}
          </p>
        </div>
        <div className="text-right">
          <p className="uppercase tracking-[0.14em] text-slate-500">After</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">#{after}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Original position: #{before}
        <span className="mx-1.5 text-slate-600">·</span>
        Current position: #{after}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-200">
        {moved === 0 ? direction : `${direction} ${delta} ${delta === 1 ? "place" : "places"}`}
      </p>
    </div>
  );
}
