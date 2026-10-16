import { CATEGORY_ACCENT } from "@/lib/category-style";
import type { FeedDnaView } from "@/lib/profile-engine";

interface FeedDnaPanelProps {
  dna: FeedDnaView;
}

export function FeedDnaPanel({ dna }: FeedDnaPanelProps) {
  return (
    <article className="rounded-2xl border border-cyan-300/14 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">Your Feed DNA</h3>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          Interest
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Mix of inferred interests. Organic Feed Mix below shows what is on screen.
      </p>

      {dna.hasSignals ? (
        <>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/8">
            {dna.slices.map((slice) => (
              <div
                key={slice.key}
                className="profile-bar h-full"
                style={{
                  width: `${slice.percent}%`,
                  background: CATEGORY_ACCENT[slice.key],
                }}
                title={`${slice.key} ${slice.percent}%`}
              />
            ))}
          </div>
          <ul className="mt-3 space-y-1.5">
            {dna.slices.map((slice) => (
              <li
                key={slice.key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2 text-slate-300">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: CATEGORY_ACCENT[slice.key] }}
                    aria-hidden
                  />
                  {slice.key}
                </span>
                <span className="tabular-nums text-slate-200">{slice.percent}%</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 px-3 py-4">
          <p className="text-sm font-medium text-slate-200">
            No profile signals yet.
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Like or save a post to start an inferred interest mix.
          </p>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Percentages describe inferred mix, not a probability that you will like the next post.
      </p>
    </article>
  );
}
