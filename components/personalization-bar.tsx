import type { GuideHighlight } from "@/lib/guided-demo";

interface PersonalizationBarProps {
  enabled: boolean;
  canPersonalize: boolean;
  applied: boolean;
  stale: boolean;
  feedFlash: string | null;
  headline: string | null;
  onToggle: (enabled: boolean) => void;
  onRefresh: () => void;
  guideHighlight?: GuideHighlight | null;
}

export function PersonalizationBar({
  enabled,
  canPersonalize,
  applied,
  stale,
  feedFlash,
  headline,
  onToggle,
  onRefresh,
  guideHighlight = null,
}: PersonalizationBarProps) {
  return (
    <section className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-200/70">
            Feed Personalization
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-50">
            {enabled ? "Personalized feed" : "Neutral catalog order"}
          </h2>
        </div>
        <div className="flex rounded-full border border-white/10 bg-black/20 p-0.5">
          <ToggleChip
            label="Off"
            active={!enabled}
            ariaLabel="Turn Feed Personalization off"
            onClick={() => onToggle(false)}
          />
          <ToggleChip
            label="On"
            active={enabled}
            ariaLabel="Turn Feed Personalization on"
            onClick={() => onToggle(true)}
            guideTarget="feed-personalization-on"
            guideHighlight={guideHighlight}
          />
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Recommendation systems do not need you to choose interests directly. They
        can infer preferences from behavior and use those signals to decide what
        appears next.
      </p>

      {enabled ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            data-guide-target={guideHighlight === "refresh-feed" ? "refresh-feed" : undefined}
            data-guide-active={guideHighlight === "refresh-feed" ? "true" : undefined}
            className="rounded-full border border-cyan-300/25 bg-cyan-400/14 px-3.5 py-1.5 text-[12px] font-medium text-cyan-50 transition hover:bg-cyan-400/22"
          >
            Refresh My Feed
          </button>
          {!canPersonalize ? (
            <p className="text-xs text-slate-500">
              Not enough behavioral signal yet.
            </p>
          ) : stale ? (
            <p className="text-xs text-cyan-100/80">
              Your profile changed. Refresh your feed to see the effect.
            </p>
          ) : applied ? (
            <p className="text-xs text-slate-500">Showing the last refreshed ranking.</p>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          The profile can still form. Turn personalization on to apply it to the
          feed.
        </p>
      )}

      {feedFlash ? (
        <p className="signal-flash mt-3 rounded-xl border border-cyan-300/15 bg-cyan-400/8 px-3 py-2 text-xs tracking-wide text-cyan-50">
          Feed updated
          {headline ? (
            <span className="mt-0.5 block text-slate-300">{headline}</span>
          ) : null}
        </p>
      ) : null}
    </section>
  );
}

function ToggleChip({
  label,
  active,
  onClick,
  ariaLabel,
  guideTarget = null,
  guideHighlight = null,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  ariaLabel?: string;
  guideTarget?: GuideHighlight | null;
  guideHighlight?: GuideHighlight | null;
}) {
  const guided = Boolean(guideTarget) && guideTarget === guideHighlight;
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      data-guide-target={guided ? guideTarget : undefined}
      data-guide-active={guided ? "true" : undefined}
      className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition ${
        active
          ? "bg-cyan-400/18 text-cyan-50"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
