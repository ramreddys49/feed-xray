import type { TimelineStep } from "@/lib/recommendation-timeline";

interface RecommendationTimelinePanelProps {
  steps: TimelineStep[];
}

export function RecommendationTimelinePanel({
  steps,
}: RecommendationTimelinePanelProps) {
  return (
    <article className="rounded-2xl border border-sky-300/16 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">Recommendation Timeline</h3>
        <span className="rounded-full border border-sky-300/20 bg-sky-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-sky-100">
          Story
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        How your behavior changed organic ranking and sponsored selection.
      </p>

      {steps.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4">
          <p className="text-sm font-medium text-slate-200">No recommendation story yet.</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Strong actions, profile shifts, and feed refreshes will appear here.
            Everyday views stay in Behavior Signals.
          </p>
        </div>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {steps.map((step) => (
            <li
              key={step.id}
              className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5"
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                {step.clockLabel}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-100">{step.title}</p>
              {step.detail ? (
                <p className="mt-0.5 text-xs leading-5 text-slate-500">{step.detail}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
