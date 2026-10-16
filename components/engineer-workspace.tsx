"use client";

import { useId, useState } from "react";
import { EngineerAds } from "@/components/engineer-ads";
import { EngineerEventConsole } from "@/components/engineer-event-console";
import { EngineerRanking } from "@/components/engineer-ranking";
import { EngineerVectors } from "@/components/engineer-vectors";
import {
  ENGINEER_TABS,
  formatEngineerClock,
  type AdCandidateRow,
  type CandidateRow,
  type EngineerConsoleRow,
  type EngineerTab,
  type EventTraceView,
  type ProfileVectorRow,
  type RankingSnapshot,
  type SelectedPostInspector,
} from "@/lib/engineer-view";
import type { AdSelectionResult } from "@/lib/ad-engine";
import type { CategoryScores } from "@/lib/profile-engine";
import type { GuideHighlight } from "@/lib/guided-demo";
import type { BehaviorEvent } from "@/types/events";

interface EngineerWorkspaceProps {
  consoleRows: EngineerConsoleRow[];
  selectedEvent: BehaviorEvent | null;
  trace: EventTraceView | null;
  onSelectEvent: (eventId: string) => void;
  interest: ProfileVectorRow[];
  commercial: ProfileVectorRow[];
  snapshotScores: CategoryScores | null;
  pending: boolean;
  snapshot: RankingSnapshot | null;
  personalizationOn: boolean;
  rankingApplied: boolean;
  inspector: SelectedPostInspector | null;
  candidates: CandidateRow[];
  selectedPostId: string | null;
  onSelectPost: (postId: string) => void;
  adPersonalizationOn: boolean;
  adSelection: AdSelectionResult;
  adRows: AdCandidateRow[];
  onReset: () => void;
  guideHighlight?: GuideHighlight | null;
}

export function EngineerWorkspace({
  consoleRows,
  selectedEvent,
  trace,
  onSelectEvent,
  interest,
  commercial,
  snapshotScores,
  pending,
  snapshot,
  personalizationOn,
  rankingApplied,
  inspector,
  candidates,
  selectedPostId,
  onSelectPost,
  adPersonalizationOn,
  adSelection,
  adRows,
  onReset,
  guideHighlight = null,
}: EngineerWorkspaceProps) {
  const [tab, setTab] = useState<EngineerTab>("events");
  const baseId = useId();

  return (
    <aside className="insight-scroll flex min-w-0 flex-col gap-3 lg:sticky lg:top-[5.5rem] lg:max-h-[calc(100vh-6.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
      <div className="px-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200/80">
          Engineer Mode
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-50">
          Ranking observability
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          How exactly did the system arrive at this ranking? Mechanism, not outcome.
        </p>
      </div>

      <MentalModel />
      <Pipeline />
      {inspector ? (
        <p className="px-1 text-xs text-slate-400">
          Selected post: {inspector.title}
          {rankingApplied ? ` · #${inspector.personalizedRank}` : " · catalog"}
        </p>
      ) : null}

      <SnapshotCard
        snapshot={snapshot}
        personalizationOn={personalizationOn}
        rankingApplied={rankingApplied}
        pending={pending}
      />

      <div
        role="tablist"
        aria-label="Engineer inspection panels"
        data-guide-target={
          guideHighlight === "engineer-panels" ? "engineer-panels" : undefined
        }
        data-guide-active={guideHighlight === "engineer-panels" ? "true" : undefined}
        className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-black/20 p-0.5"
      >
        {ENGINEER_TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                event.preventDefault();
                const index = ENGINEER_TABS.findIndex((entry) => entry.id === tab);
                const delta = event.key === "ArrowRight" ? 1 : -1;
                const next =
                  ENGINEER_TABS[(index + delta + ENGINEER_TABS.length) % ENGINEER_TABS.length];
                setTab(next.id);
                requestAnimationFrame(() => {
                  document.getElementById(`${baseId}-${next.id}`)?.focus();
                });
              }}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                selected
                  ? "bg-emerald-400/18 text-emerald-50"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${tab}`}
        aria-labelledby={`${baseId}-${tab}`}
      >
        {tab === "events" ? (
          <EngineerEventConsole
            rows={consoleRows}
            selectedEvent={selectedEvent}
            trace={trace}
            onSelectEvent={onSelectEvent}
          />
        ) : null}
        {tab === "profiles" ? (
          <EngineerVectors
            interest={interest}
            commercial={commercial}
            snapshotScores={snapshotScores}
            pending={pending}
          />
        ) : null}
        {tab === "ranking" ? (
          <EngineerRanking
            inspector={inspector}
            candidates={candidates}
            rankingApplied={rankingApplied}
            selectedPostId={selectedPostId}
            onSelectPost={onSelectPost}
          />
        ) : null}
        {tab === "ads" ? (
          <EngineerAds
            adPersonalizationOn={adPersonalizationOn}
            selection={adSelection}
            rows={adRows}
          />
        ) : null}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-slate-300 transition hover:bg-white/[0.06]"
      >
        Reset activity
      </button>
    </aside>
  );
}

function MentalModel() {
  const stages = ["INPUT", "MODEL", "DECISION", "OUTPUT"];
  return (
    <section className="rounded-2xl border border-emerald-300/16 bg-black/25 px-3 py-3">
      <h3 className="text-sm font-medium text-slate-100">Input → Model → Decision → Output</h3>
      <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        {stages.map((stage, index) => (
          <li key={stage} className="flex items-center gap-1.5">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 font-medium tracking-[0.08em] text-emerald-100">
              {stage}
            </span>
            {index < stages.length - 1 ? (
              <span className="text-slate-600" aria-hidden>
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Behavioral event → interest / commercial profile → organic ranking / ad
        selection → feed position / sponsored placement.
      </p>
    </section>
  );
}

function Pipeline() {
  const steps = [
    "Behavior Events",
    "Interest Profile",
    "Candidate Generation",
    "Ranking Score",
    "Diversity / Exploration",
    "Final Feed",
  ];
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <h3 className="text-sm font-medium text-slate-100">Ranking Pipeline</h3>
      <ol className="mt-3 space-y-1 text-xs text-slate-400">
        {steps.map((step, index) => (
          <li key={step}>
            {step}
            {index < steps.length - 1 ? (
              <span className="mt-1 block text-slate-600" aria-hidden>
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function SnapshotCard({
  snapshot,
  personalizationOn,
  rankingApplied,
  pending,
}: {
  snapshot: RankingSnapshot | null;
  personalizationOn: boolean;
  rankingApplied: boolean;
  pending: boolean;
}) {
  return (
    <section className="rounded-2xl border border-emerald-300/16 bg-black/25 px-3 py-3">
      <h3 className="text-sm font-medium text-slate-100">Ranking Snapshot</h3>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
            Personalization
          </dt>
          <dd className="mt-0.5 text-slate-200">{personalizationOn ? "ON" : "OFF"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Generated</dt>
          <dd className="mt-0.5 font-mono text-slate-200">
            {snapshot ? formatEngineerClock(snapshot.generatedAt) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
            Profile Leader
          </dt>
          <dd className="mt-0.5 text-slate-200">{snapshot?.leader ?? "None"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Candidates</dt>
          <dd className="mt-0.5 text-slate-200">{snapshot?.candidateCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Feed Version</dt>
          <dd className="mt-0.5 text-slate-200">{snapshot?.feedVersion ?? 0}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Applied</dt>
          <dd className="mt-0.5 text-slate-200">{rankingApplied ? "Yes" : "No"}</dd>
        </div>
      </dl>
      {!rankingApplied ? (
        <p className="mt-3 text-xs text-slate-500">Reason: Original catalog order</p>
      ) : null}
      {pending ? (
        <p className="mt-3 rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-50">
          Current behavioral profile differs from the active feed ranking snapshot.
        </p>
      ) : null}
    </section>
  );
}
