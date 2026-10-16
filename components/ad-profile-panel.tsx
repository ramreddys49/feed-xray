import { CATEGORY_ACCENT } from "@/lib/category-style";
import type { AdProfileView } from "@/lib/ad-engine";

interface AdProfilePanelProps {
  view: AdProfileView;
}

export function AdProfilePanel({ view }: AdProfilePanelProps) {
  return (
    <article className="rounded-2xl border border-amber-300/16 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">Ad Profile</h3>
        <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-100">
          Commercial
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Commercial affinity for sponsored placement — separate from organic interests.
      </p>

      {!view.hasSignals ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4">
          <p className="text-sm font-medium text-slate-200">
            Not enough commercial signal yet.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Contextual sponsored content can still appear. Stronger actions such
            as save, share, or a longer watch raise commercial affinity in this
            demo.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {view.rows.map((row) => (
            <li
              key={row.category}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-slate-200">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: CATEGORY_ACCENT[row.category] }}
                  aria-hidden
                />
                {row.category}
              </span>
              <span className="text-xs text-slate-400">{row.label}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
