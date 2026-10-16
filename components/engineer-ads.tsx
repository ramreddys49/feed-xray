import {
  describeAdEngineReason,
  formatEngineerScore,
  type AdCandidateRow,
} from "@/lib/engineer-view";
import type { AdSelectionResult } from "@/lib/ad-engine";

interface EngineerAdsProps {
  adPersonalizationOn: boolean;
  selection: AdSelectionResult;
  rows: AdCandidateRow[];
}

export function EngineerAds({
  adPersonalizationOn,
  selection,
  rows,
}: EngineerAdsProps) {
  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-amber-300/20 bg-amber-400/[0.05] px-3 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-amber-100">
          Separate ad engine
        </p>
        <h3 className="mt-1 text-sm font-medium text-slate-100">Ad Selection</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
              Ad Personalization
            </dt>
            <dd className="mt-0.5 text-slate-200">
              {adPersonalizationOn ? "ON" : "OFF"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
              Selected Advertiser
            </dt>
            <dd className="mt-0.5 text-slate-200">{selection.ad.advertiser}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
              Selected Category
            </dt>
            <dd className="mt-0.5 text-slate-200">{selection.selectedCategory}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
              Commercial Affinity
            </dt>
            <dd className="mt-0.5 font-mono text-slate-200">
              {formatEngineerScore(selection.commercialAffinity)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-slate-300">
          Reason: {describeAdEngineReason(selection, adPersonalizationOn)}
        </p>
        <ul className="mt-3 space-y-1 font-mono text-[12px] text-slate-300">
          <li className="flex justify-between gap-3">
            <span>saved</span>
            <span>{String(selection.factors.saved)}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>shared</span>
            <span>{String(selection.factors.shared)}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>dwelled</span>
            <span>{String(selection.factors.dwelled)}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>liked</span>
            <span>{String(selection.factors.liked)}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>blocked</span>
            <span>{String(selection.factors.blocked)}</span>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-300/16 bg-black/25 px-3 py-3">
        <h3 className="text-sm font-medium text-slate-100">Ad Candidates</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Fictional catalog only. No bidding or auction.
        </p>
        <div className="mt-3 overflow-x-auto overscroll-x-contain rounded-xl border border-white/8">
          <table className="w-full min-w-[22rem] text-left text-[11px] font-mono">
            <caption className="sr-only">Fictional ad candidates</caption>
            <thead className="bg-[#0b1018] text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-2 py-1.5 font-medium">Advertiser</th>
                <th className="px-2 py-1.5 font-medium">Category</th>
                <th className="px-2 py-1.5 font-medium">Affinity</th>
                <th className="px-2 py-1.5 font-medium">Eligible</th>
                <th className="px-2 py-1.5 font-medium">Selected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.adId}
                  className={row.selected ? "bg-amber-400/12 text-amber-50" : "text-slate-300"}
                >
                  <td className="px-2 py-1.5">{row.advertiser}</td>
                  <td className="px-2 py-1.5">{row.category}</td>
                  <td className="px-2 py-1.5 tabular-nums">
                    {formatEngineerScore(row.commercialAffinity)}
                  </td>
                  <td className="px-2 py-1.5">{row.eligible ? "Yes" : "No"}</td>
                  <td className="px-2 py-1.5">{row.selected ? "Selected" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
