import {
  GUIDED_DISCLAIMER,
  type GuidedStatus,
} from "@/lib/guided-demo";
import { SITE } from "@/lib/site";

interface FeedIntroProps {
  status: GuidedStatus;
  introVisible: boolean;
  hasProgress: boolean;
  onStart: () => void;
  onExplore: () => void;
  onFresh: () => void;
  onKeep: () => void;
  onCancelConfirm: () => void;
}

export function FeedIntro({
  status,
  introVisible,
  hasProgress,
  onStart,
  onExplore,
  onFresh,
  onKeep,
  onCancelConfirm,
}: FeedIntroProps) {
  if (status === "running" || status === "done" || status === "confirm-restart") {
    return null;
  }

  if (!introVisible && status === "idle") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2.5">
        <p className="text-sm text-slate-400">{SITE.tagline}</p>
        <button type="button" onClick={onStart} className="fx-btn-primary">
          Start Guided Demo
        </button>
      </div>
    );
  }

  const confirming = status === "confirm-start";

  return (
    <section className="rounded-[1.35rem] border border-cyan-300/16 bg-cyan-400/[0.05] px-4 py-4 sm:px-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-cyan-200/80">
        {SITE.tagline}
      </p>
      <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
        {SITE.headline}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-400">{SITE.supporting}</p>

      {confirming ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-slate-200">Start with a fresh simulation?</p>
          <p className="text-xs leading-5 text-slate-500">
            Starting fresh clears likes, saves, profiles, and rankings. Keeping
            progress continues from your current session.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onFresh} className="fx-btn-primary">
              Start Fresh
            </button>
            <button type="button" onClick={onKeep} className="fx-btn-secondary">
              Keep My Progress
            </button>
            <button
              type="button"
              onClick={onCancelConfirm}
              className="rounded-full px-3 py-1.5 text-[12px] text-slate-500 hover:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={onStart} className="fx-btn-primary">
            Start Guided Demo
          </button>
          <button type="button" onClick={onExplore} className="fx-btn-secondary">
            Explore Freely
          </button>
        </div>
      )}

      {hasProgress && !confirming ? (
        <p className="mt-2 text-[11px] text-slate-500">
          You already have session activity. Starting the demo will ask before
          clearing it.
        </p>
      ) : null}

      <p className="mt-3 text-[11px] leading-5 text-slate-500">{GUIDED_DISCLAIMER}</p>
    </section>
  );
}
