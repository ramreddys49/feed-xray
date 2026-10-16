"use client";

import { eventInspectPayload, type EngineerConsoleRow, type EventTraceView } from "@/lib/engineer-view";
import { formatProfileDelta } from "@/lib/profile-engine";
import type { BehaviorEvent } from "@/types/events";

interface EngineerEventConsoleProps {
  rows: EngineerConsoleRow[];
  selectedEvent: BehaviorEvent | null;
  trace: EventTraceView | null;
  onSelectEvent: (eventId: string) => void;
}

export function EngineerEventConsole({
  rows,
  selectedEvent,
  trace,
  onSelectEvent,
}: EngineerEventConsoleProps) {
  const payload = selectedEvent ? eventInspectPayload(selectedEvent) : null;
  const json = payload ? JSON.stringify(payload, null, 2) : null;

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-emerald-300/16 bg-black/25 px-3 py-3">
        <h3 className="text-sm font-medium text-slate-100">Live Event Console</h3>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          Latest {rows.length || 0} session events. Organic profile deltas only.
        </p>
        <div className="engineer-scroll mt-3 max-h-56 overflow-auto overscroll-contain rounded-xl border border-white/8">
          <table className="min-w-full text-left text-[11px] font-mono">
            <caption className="sr-only">Recent behavioral events</caption>
            <thead className="sticky top-0 bg-[#0b1018] text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-2 py-1.5 font-medium">Time</th>
                <th className="px-2 py-1.5 font-medium">Event</th>
                <th className="px-2 py-1.5 font-medium">Post</th>
                <th className="px-2 py-1.5 font-medium">Category</th>
                <th className="px-2 py-1.5 font-medium">Signal</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-4 text-slate-500">
                    Interact with the feed to populate this console. Likes, saves, and skips appear here.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const selected = selectedEvent?.id === row.event.id;
                  return (
                    <tr
                      key={row.event.id}
                      tabIndex={0}
                      aria-selected={selected}
                      onPointerDown={(event) => {
                        if (event.button !== 0) return;
                        onSelectEvent(row.event.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" && event.key !== " ") return;
                        event.preventDefault();
                        onSelectEvent(row.event.id);
                      }}
                      className={`cursor-pointer ${
                        selected
                          ? "bg-emerald-400/14 text-emerald-50 outline outline-1 outline-emerald-200/40"
                          : "text-slate-300 hover:bg-white/[0.04]"
                      }`}
                    >
                      <td className="whitespace-nowrap px-2 py-1.5">{row.clock}</td>
                      <td className="px-2 py-1.5">{row.event.type}</td>
                      <td className="max-w-[6rem] truncate px-2 py-1.5" title={row.postTitle}>
                        {row.postId}
                      </td>
                      <td className="px-2 py-1.5">{row.category}</td>
                      <td
                        className={`px-2 py-1.5 ${
                          row.organicDelta < 0 ? "text-rose-200" : "text-emerald-100"
                        }`}
                      >
                        {row.signalLabel}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-300/16 bg-black/25 px-3 py-3">
        <h3 className="text-sm font-medium text-slate-100">Raw Event</h3>
        {!payload ? (
          <p className="mt-2 text-sm text-slate-500">Select a console row to inspect the payload.</p>
        ) : (
          <>
            {trace ? (
              <ol className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
                <li>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Event</p>
                  <p className="font-mono text-slate-200">
                    {trace.eventType} · {trace.category}
                  </p>
                </li>
                <li>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    Profile effect
                  </p>
                  <p className="font-mono text-slate-200">
                    {trace.category} {formatProfileDelta(trace.organicDelta)}
                    <span className="ml-2 text-slate-500">
                      commercial {formatProfileDelta(trace.commercialDelta)}
                    </span>
                  </p>
                </li>
                <li>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    Profile result
                  </p>
                  <p className="font-mono text-slate-200">
                    {trace.category} {trace.profileResult}
                  </p>
                </li>
                <li>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    Ranking impact
                  </p>
                  <p className={trace.snapshotStale ? "text-amber-100" : "text-slate-300"}>
                    {trace.rankingNote}
                  </p>
                </li>
              </ol>
            ) : null}
            <details className="mt-3 rounded-xl border border-white/8 bg-black/30 px-3 py-2" open>
              <summary className="cursor-pointer text-xs text-emerald-100">Payload JSON</summary>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-300"
                  onClick={() => {
                    if (json) void navigator.clipboard.writeText(json);
                  }}
                >
                  Copy JSON
                </button>
              </div>
              <pre className="mt-2 overflow-x-auto font-mono text-[11px] leading-5 text-slate-300">
                {json}
              </pre>
            </details>
          </>
        )}
      </section>
    </div>
  );
}
