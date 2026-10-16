import { CATEGORY_ACCENT } from "@/lib/category-style";
import {
  formatProfileDelta,
  type AlgorithmMirrorView,
  type ProfileChange,
} from "@/lib/profile-engine";

interface AlgorithmMirrorPanelProps {
  mirror: AlgorithmMirrorView;
  flash: ProfileChange | null;
}

export function AlgorithmMirrorPanel({
  mirror,
  flash,
}: AlgorithmMirrorPanelProps) {
  const empty = mirror.interests.length === 0;

  return (
    <article className="rounded-2xl border border-violet-300/16 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">Algorithm Mirror</h3>
        <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-violet-100">
          Inference
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Inferred interests from your actions — what you may want to see.
      </p>

      {flash ? (
        <p className="signal-flash mt-3 rounded-xl border border-violet-300/15 bg-violet-400/8 px-3 py-2 text-xs tracking-wide text-violet-50">
          Profile updated
          <span className="mt-0.5 block text-slate-200">
            {flash.category} {formatProfileDelta(flash.delta)}
          </span>
          <span className="mt-0.5 block text-slate-400">{flash.reason}</span>
        </p>
      ) : null}

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Profile Strength
        </p>
        <p className="text-sm font-medium text-slate-100">{mirror.strength.label}</p>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{mirror.strength.detail}</p>

      {empty ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4">
          <p className="text-sm font-medium text-slate-200">
            No clear interests yet.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Like, save, or watch a post to start an inferred interest profile.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {mirror.interests.map((interest) => (
            <li key={interest.category}>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {interest.category}
                  </p>
                  <p className="text-[11px] text-slate-500">{interest.label}</p>
                </div>
                <p className="text-sm tabular-nums text-slate-200">
                  {interest.percent}%
                </p>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="profile-bar h-full rounded-full"
                  style={{
                    width: `${interest.percent}%`,
                    background: CATEGORY_ACCENT[interest.category],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {mirror.primary ? (
        <div className="mt-4 space-y-1 text-sm leading-6 text-slate-400">
          <p>{mirror.primary}</p>
          {mirror.secondary ? <p>{mirror.secondary}</p> : null}
        </div>
      ) : null}

      {mirror.recentChanges.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Recent profile changes
          </p>
          <ul className="mt-2 space-y-1.5">
            {mirror.recentChanges.map((change) => (
              <li
                key={change.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-black/20 px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-[0.12em] text-slate-200">
                    {change.title}
                  </p>
                  <p className="truncate text-xs text-slate-500">{change.category}</p>
                </div>
                <p
                  className={`shrink-0 text-xs tabular-nums ${
                    change.delta < 0 ? "text-rose-200" : "text-cyan-100"
                  }`}
                >
                  {formatProfileDelta(change.delta)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
