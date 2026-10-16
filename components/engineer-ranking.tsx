import {
  factorRows,
  formatEngineerScore,
  movementLabel,
  type CandidateRow,
  type SelectedPostInspector,
} from "@/lib/engineer-view";

interface EngineerRankingProps {
  inspector: SelectedPostInspector | null;
  candidates: CandidateRow[];
  rankingApplied: boolean;
  selectedPostId: string | null;
  onSelectPost: (postId: string) => void;
}

export function EngineerRanking({
  inspector,
  candidates,
  rankingApplied,
  selectedPostId,
  onSelectPost,
}: EngineerRankingProps) {
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-emerald-300/16 bg-black/25 px-3 py-3">
        <h3 className="text-sm font-medium text-slate-100">Selected Post Ranking</h3>
        {!inspector ? (
          <p className="mt-2 text-sm text-slate-500">
            Select an organic post in the feed or the candidate table.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <Spec label="Post" value={inspector.title} />
              <Spec label="Category" value={inspector.category} />
              <Spec label="Original Rank" value={`#${inspector.originalRank}`} />
              <Spec
                label="Personalized Rank"
                value={rankingApplied ? `#${inspector.personalizedRank}` : "Not applied"}
              />
              <Spec
                label="Movement"
                value={
                  rankingApplied
                    ? `${movementLabel(inspector.moved)} positions`
                    : "Catalog order"
                }
              />
            </dl>
            <ul className="space-y-1 font-mono text-[12px]">
              {factorRows(inspector.factors).map((row) => (
                <li key={row.label} className="flex justify-between gap-3 text-slate-300">
                  <span>{row.label}</span>
                  <span className="tabular-nums text-slate-100">
                    {formatSigned(row.value)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex justify-between border-t border-white/10 pt-2 font-mono text-sm text-slate-50">
              <span>TOTAL SCORE</span>
              <span>{formatEngineerScore(inspector.totalScore)}</span>
            </p>
            <ul className="space-y-1.5 text-xs leading-5 text-slate-400">
              <Flag
                label="Exploration bonus applied"
                on={inspector.explorationApplied}
                detail="A non-leader category received an exploration bonus so the feed does not collapse into one topic."
              />
              <Flag
                label="Diversity penalty applied"
                on={inspector.diversityApplied}
                detail="Recent adjacent or repeated categories reduced this post's score."
              />
              <Flag
                label="Negative feedback penalty"
                on={inspector.negativeApplied}
                detail="Not Interested, skips, or a negative category score reduced this post."
              />
              <Flag
                label="Seen post penalty"
                on={inspector.seenApplied}
                detail="Like, save, or share on this post already applied a seen-post penalty."
              />
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-emerald-300/16 bg-black/25 px-3 py-3">
        <h3 className="text-sm font-medium text-slate-100">Candidate Ranking Table</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Order matches the active personalized snapshot. Not a live rerank.
        </p>
        {!rankingApplied || candidates.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            No personalized ranking snapshot yet. Turn Feed Personalization on in User View, then return here to inspect scores.
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-1 md:hidden">
              {candidates.map((row) => (
                <li key={row.postId}>
                  <button
                    type="button"
                    aria-pressed={row.postId === selectedPostId}
                    onPointerDown={(event) => {
                      if (event.button !== 0) return;
                      onSelectPost(row.postId);
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-left ${
                      row.postId === selectedPostId
                        ? "border-emerald-300/40 bg-emerald-400/14 text-emerald-50 outline outline-1 outline-emerald-200/35"
                        : "border-white/8 text-slate-300"
                    }`}
                  >
                    <span className="flex items-baseline justify-between gap-2 text-[12px]">
                      <span className="font-medium">
                        #{row.rank} {row.title}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatEngineerScore(row.total)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">
                      {row.category} · Affinity {formatEngineerScore(row.affinity)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 hidden overflow-x-auto overscroll-x-contain rounded-xl border border-white/8 md:block">
              <table className="w-full min-w-[32rem] text-left text-[11px] font-mono">
                <caption className="sr-only">Ranked organic candidates</caption>
                <thead className="bg-[#0b1018] text-[10px] uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-2 py-1.5 font-medium">Rank</th>
                    <th className="px-2 py-1.5 font-medium">Post</th>
                    <th className="px-2 py-1.5 font-medium">Category</th>
                    <th className="px-2 py-1.5 font-medium">Affinity</th>
                    <th className="px-2 py-1.5 font-medium">Exploration</th>
                    <th className="px-2 py-1.5 font-medium">Penalty</th>
                    <th className="px-2 py-1.5 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((row) => {
                    const selected = row.postId === selectedPostId;
                    return (
                      <tr
                        key={row.postId}
                        tabIndex={0}
                        aria-selected={selected}
                        onPointerDown={(event) => {
                          if (event.button !== 0) return;
                          onSelectPost(row.postId);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return;
                          event.preventDefault();
                          onSelectPost(row.postId);
                        }}
                        className={`cursor-pointer ${
                          selected
                            ? "bg-emerald-400/14 text-emerald-50 outline outline-1 outline-emerald-200/40"
                            : "text-slate-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        <td className="px-2 py-1.5">{row.rank}</td>
                        <td className="max-w-[9rem] truncate px-2 py-1.5" title={row.title}>
                          {row.title}
                        </td>
                        <td className="px-2 py-1.5">{row.category}</td>
                        <td className="px-2 py-1.5 tabular-nums">
                          {formatEngineerScore(row.affinity)}
                        </td>
                        <td className="px-2 py-1.5 tabular-nums">
                          {formatEngineerScore(row.exploration)}
                        </td>
                        <td className="px-2 py-1.5 tabular-nums">
                          {formatEngineerScore(row.penalty)}
                        </td>
                        <td className="px-2 py-1.5 tabular-nums">
                          {formatEngineerScore(row.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value}</dd>
    </div>
  );
}

function Flag({
  label,
  on,
  detail,
}: {
  label: string;
  on: boolean;
  detail: string;
}) {
  return (
    <li>
      <p className="text-slate-200">
        {label}: {on ? "Yes" : "No"}
      </p>
      <p>{detail}</p>
    </li>
  );
}

function formatSigned(value: number) {
  if (value > 0) return `+${formatEngineerScore(value)}`;
  return formatEngineerScore(value);
}
