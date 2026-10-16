"use client";

import { cycleViewMode, type ViewMode } from "@/lib/engineer-view";
import type { GuideHighlight } from "@/lib/guided-demo";
import { MODE_HINTS, SITE } from "@/lib/site";

function SearchField() {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="5.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13.2 13.2 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <div
        className="flex h-10 items-center rounded-full border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-slate-500"
        role="search"
        aria-label="Search"
      >
        Search posts, creators, and topics
      </div>
    </div>
  );
}

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  guideHighlight?: GuideHighlight | null;
}

export function Header({ viewMode, onViewModeChange, guideHighlight = null }: HeaderProps) {
  const engineer = viewMode === "engineer";
  const learn = viewMode === "learn";

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#05070d]/92 backdrop-blur-md">
      <div className="mx-auto grid w-full min-w-0 max-w-[1220px] grid-cols-1 gap-3 px-4 py-3 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(200px,420px)_minmax(0,1fr)] lg:items-center lg:gap-6 lg:px-8">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border ${
              engineer
                ? "border-emerald-300/25 bg-emerald-400/8 shadow-[0_0_24px_rgba(52,211,153,0.16)]"
                : learn
                  ? "border-violet-300/25 bg-violet-400/8 shadow-[0_0_24px_rgba(167,139,250,0.16)]"
                  : "border-cyan-300/25 bg-cyan-400/8 shadow-[0_0_24px_rgba(56,214,255,0.18)]"
            }`}
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <rect x="4.5" y="6" width="15" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4" className={engineer ? "text-emerald-200" : learn ? "text-violet-200" : "text-cyan-200"} />
              <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={engineer ? "text-emerald-200" : learn ? "text-violet-200" : "text-cyan-200"} />
              <path d="M3 12h18" stroke="currentColor" strokeWidth="1.2" opacity="0.55" className={engineer ? "text-emerald-200" : learn ? "text-violet-200" : "text-cyan-200"} />
            </svg>
          </div>
          <div>
            <h1 className="text-[1.15rem] font-semibold tracking-tight text-slate-50">
              Feed X-Ray
            </h1>
            <p className="mt-0.5 text-sm text-slate-400">{SITE.tagline}</p>
          </div>
        </div>

        <div className="order-3 hidden min-w-0 lg:order-none lg:block">
          <SearchField />
        </div>

        <div
          role="tablist"
          aria-label="Application mode"
          className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-0.5 lg:justify-self-end sm:gap-2"
          onKeyDown={(event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            event.preventDefault();
            onViewModeChange(cycleViewMode(viewMode, event.key === "ArrowRight" ? 1 : -1));
          }}
        >
          <ModeTab
            id="mode-user"
            controls="panel-user"
            selected={viewMode === "user"}
            label="User View"
            shortLabel="User"
            hint={MODE_HINTS.user}
            tone="user"
            onSelect={() => onViewModeChange("user")}
          />
          <ModeTab
            id="mode-engineer"
            controls="panel-engineer"
            selected={viewMode === "engineer"}
            label="Recommendation Engineer"
            shortLabel="Engineer"
            hint={MODE_HINTS.engineer}
            tone="engineer"
            guideTarget="engineer-mode"
            guideHighlight={guideHighlight}
            onSelect={() => onViewModeChange("engineer")}
          />
          <ModeTab
            id="mode-learn"
            controls="panel-learn"
            selected={viewMode === "learn"}
            label="Learn"
            hint={MODE_HINTS.learn}
            tone="learn"
            onSelect={() => onViewModeChange("learn")}
          />
        </div>
      </div>
    </header>
  );
}

function ModeTab({
  id,
  controls,
  selected,
  label,
  shortLabel,
  hint,
  tone,
  onSelect,
  guideTarget = null,
  guideHighlight = null,
}: {
  id: string;
  controls: string;
  selected: boolean;
  label: string;
  shortLabel?: string;
  hint: string;
  tone: "user" | "engineer" | "learn";
  onSelect: () => void;
  guideTarget?: GuideHighlight | null;
  guideHighlight?: GuideHighlight | null;
}) {
  const guided = Boolean(guideTarget) && guideTarget === guideHighlight;
  const selectedClass =
    tone === "engineer"
      ? "border-emerald-300/25 bg-emerald-400/16 text-emerald-50 shadow-[inset_0_0_0_1px_rgba(167,243,208,0.18)]"
      : tone === "learn"
        ? "border-violet-300/25 bg-violet-400/16 text-violet-50 shadow-[inset_0_0_0_1px_rgba(196,181,253,0.18)]"
        : "border-cyan-300/25 bg-cyan-400/16 text-cyan-50 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.18)]";
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={selected}
      aria-controls={controls}
      aria-label={label}
      title={hint}
      tabIndex={selected || guided ? 0 : -1}
      onClick={onSelect}
      data-guide-target={guided ? guideTarget : undefined}
      data-guide-active={guided ? "true" : undefined}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-wide whitespace-nowrap transition sm:px-3.5 ${
        selected
          ? selectedClass
          : "border-white/8 bg-white/[0.03] text-slate-500 hover:text-slate-300"
      }`}
    >
      {shortLabel ? (
        <>
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
