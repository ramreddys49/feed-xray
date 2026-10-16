import type { ProfileVectorRow } from "@/lib/engineer-view";
import { formatEngineerScore } from "@/lib/engineer-view";
import type { CategoryScores } from "@/lib/profile-engine";

interface EngineerVectorsProps {
  interest: ProfileVectorRow[];
  commercial: ProfileVectorRow[];
  snapshotScores: CategoryScores | null;
  pending: boolean;
}

export function EngineerVectors({
  interest,
  commercial,
  snapshotScores,
  pending,
}: EngineerVectorsProps) {
  return (
    <div className="space-y-3">
      {pending ? (
        <p className="rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-50">
          PENDING CHANGES. Current behavioral profile differs from the active feed
          ranking snapshot.
        </p>
      ) : null}

      <VectorCard
        title="Interest Profile Vector"
        subtitle="Organic recommendation · Feed X-Ray simulation score"
        rows={interest}
        snapshotScores={snapshotScores}
      />
      <VectorCard
        title="Commercial Affinity Vector"
        subtitle="Sponsored selection · separate from organic interest"
        rows={commercial}
        tone="amber"
      />
    </div>
  );
}

function VectorCard({
  title,
  subtitle,
  rows,
  snapshotScores = null,
  tone = "emerald",
}: {
  title: string;
  subtitle: string;
  rows: ProfileVectorRow[];
  snapshotScores?: CategoryScores | null;
  tone?: "emerald" | "amber";
}) {
  const border =
    tone === "amber" ? "border-amber-300/16" : "border-emerald-300/16";

  return (
    <section className={`rounded-2xl border ${border} bg-black/25 px-3 py-3`}>
      <h3 className="text-sm font-medium text-slate-100">{title}</h3>
      <p className="mt-0.5 text-xs leading-5 text-slate-500">{subtitle}</p>
      <ul className="mt-3 space-y-1 font-mono text-[12px]">
        {rows.map((row) => {
          const snapshot = snapshotScores?.[row.category];
          const drifted = snapshot !== undefined && snapshot !== row.score;
          return (
            <li
              key={row.category}
              className="flex items-baseline justify-between gap-3 rounded-lg px-1 py-0.5"
            >
              <span className="text-slate-300">{row.category}</span>
              <span className="tabular-nums text-slate-100">
                {formatEngineerScore(row.score)}
                {drifted ? (
                  <span className="ml-2 text-[10px] text-amber-100">
                    snap {formatEngineerScore(snapshot)}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      {snapshotScores ? (
        <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-slate-500">
          Amber snap values are the active ranking snapshot, not current scores.
        </p>
      ) : null}
    </section>
  );
}
