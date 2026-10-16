import type { GuideHighlight } from "@/lib/guided-demo";

interface AdPersonalizationBarProps {
  enabled: boolean;
  hasCommercialSignal: boolean;
  targeting: "Personalized" | "Contextual";
  advertiser: string;
  onToggle: (enabled: boolean) => void;
  guideHighlight?: GuideHighlight | null;
}

export function AdPersonalizationBar({
  enabled,
  hasCommercialSignal,
  targeting,
  advertiser,
  onToggle,
  guideHighlight = null,
}: AdPersonalizationBarProps) {
  return (
    <section className="rounded-[1.35rem] border border-amber-300/16 bg-amber-400/[0.04] px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-100/80">
            Ad Personalization
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-50">
            {enabled ? "Personalized ads" : "Contextual ads"}
          </h2>
        </div>
        <div className="flex rounded-full border border-amber-300/15 bg-black/20 p-0.5">
          <ToggleChip
            label="Off"
            active={!enabled}
            ariaLabel="Turn Ad Personalization off"
            onClick={() => onToggle(false)}
          />
          <ToggleChip
            label="On"
            active={enabled}
            ariaLabel="Turn Ad Personalization on"
            onClick={() => onToggle(true)}
            guideTarget="ad-personalization-on"
            guideHighlight={guideHighlight}
          />
        </div>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Social platforms can use different systems to choose organic content and
        sponsored content.
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Turning off ad personalization does not necessarily mean ads disappear —
        they may become contextual instead.
      </p>

      <p className="mt-3 text-xs text-slate-400">
        Current sponsored placement:{" "}
        <span className="text-slate-200">
          {targeting} · {advertiser}
        </span>
        {enabled && !hasCommercialSignal
          ? " · Not enough commercial signal yet."
          : null}
      </p>
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
          ? "bg-amber-400/18 text-amber-50"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}
