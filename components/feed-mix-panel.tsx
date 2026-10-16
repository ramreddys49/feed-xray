import { CATEGORY_ACCENT } from "@/lib/category-style";
import type { FeedMixView } from "@/lib/ranking-engine";

interface FeedMixPanelProps {
  before: FeedMixView;
  after: FeedMixView;
  personalized: boolean;
  sponsoredCategory?: string | null;
}

export function FeedMixPanel({
  before,
  after,
  personalized,
  sponsoredCategory = null,
}: FeedMixPanelProps) {
  return (
    <article className="rounded-2xl border border-emerald-300/14 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-slate-100">How Your Feed Changed</h3>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-emerald-100">
          Feed mix
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        What content you are being shown near the top of the feed, not what you
        seem to like. This is mix, not a recommendation probability.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <MixColumn title="Before" mix={before} />
        <MixColumn
          title={personalized ? "After personalization" : "Current"}
          mix={after}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Organic Feed Mix only. Sponsored posts are not counted in these
        percentages.
        {sponsoredCategory ? (
          <>
            {" "}
            Sponsored category: <span className="text-slate-300">{sponsoredCategory}</span>.
          </>
        ) : null}
      </p>
    </article>
  );
}

function MixColumn({ title, mix }: { title: string; mix: FeedMixView }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/8">
        {mix.slices.map((slice) => (
          <div
            key={`${title}-${slice.key}`}
            className="profile-bar h-full"
            style={{
              width: `${slice.percent}%`,
              background: CATEGORY_ACCENT[slice.key],
            }}
          />
        ))}
      </div>
      <ul className="mt-2 space-y-1">
        {mix.slices.map((slice) => (
          <li key={`${title}-${slice.key}`} className="flex justify-between gap-2 text-slate-400">
            <span className="truncate">{slice.key}</span>
            <span className="tabular-nums text-slate-200">{slice.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
