import { SIGNAL_LOG_LIMIT } from "@/lib/events";
import { describeSignal } from "@/lib/signal-copy";
import type { ActivitySummary } from "@/lib/signal-copy";
import type { BehaviorEvent } from "@/types/events";

interface BehaviorSignalsPanelProps {
  events: BehaviorEvent[];
  summary: ActivitySummary;
  flash: string | null;
  onReset: () => void;
}

const TONE_CLASS: Record<string, string> = {
  positive: "border-cyan-300/20 bg-cyan-400/8 text-cyan-100",
  negative: "border-rose-300/20 bg-rose-400/8 text-rose-100",
  engagement: "border-violet-300/20 bg-violet-400/8 text-violet-100",
  neutral: "border-white/10 bg-white/[0.04] text-slate-300",
};

export function BehaviorSignalsPanel({
  events,
  summary,
  flash,
  onReset,
}: BehaviorSignalsPanelProps) {
  const latest = events.slice(0, SIGNAL_LOG_LIMIT);

  return (
    <article className="rounded-2xl border border-cyan-300/16 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">Behavior Signals</h3>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          Activity
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        What you did. Recommendation systems can learn from this even when you
        never choose an interest explicitly.
      </p>

      {flash ? (
        <p className="signal-flash mt-3 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-3 py-2 text-xs tracking-wide text-cyan-50">
          Signal captured
          <span className="mt-0.5 block text-slate-300">{flash}</span>
        </p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
        <SummaryStat label="Posts viewed" value={summary.postsViewed} />
        <SummaryStat label="Likes" value={summary.likes} />
        <SummaryStat label="Saves" value={summary.saves} />
        <SummaryStat label="Shares" value={summary.shares} />
        <SummaryStat label="Long watches" value={summary.longWatches} />
        <SummaryStat label="Quick skips" value={summary.quickSkips} />
        <SummaryStat label="Not interested" value={summary.notInterested} />
      </dl>

      <div className="signal-log mt-4 max-h-52 overflow-y-auto overscroll-contain pr-3" aria-live="polite">
        {latest.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4">
            <p className="text-sm font-medium text-slate-200">
              No behavioral signals yet.
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Scroll, pause, like, save, or skip posts to see what a
              recommendation system could learn.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {latest.map((event) => {
              const copy = describeSignal(event);
              return (
                <li
                  key={event.id}
                  className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium tracking-[0.12em] text-slate-200">
                      {copy.title}
                    </p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] tracking-wide ${TONE_CLASS[copy.tone]}`}
                    >
                      {copy.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{copy.category}</p>
                  {copy.detail ? (
                    <p className="mt-0.5 text-xs text-slate-500">{copy.detail}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 text-xs text-slate-500 underline-offset-2 transition hover:text-slate-300 hover:underline"
      >
        Reset activity
      </button>
    </article>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/8 bg-black/20 px-2.5 py-2">
      <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-100">{value}</dd>
    </div>
  );
}
