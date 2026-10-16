import { GUIDED_DISCLAIMER, GUIDED_STEPS, type GuidedState } from "@/lib/guided-demo";
import type { GuidedStepCopy } from "@/lib/guided-demo";

interface GuidedDemoPanelProps {
  state: GuidedState;
  step: GuidedStepCopy | null;
  waiting: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onExit: () => void;
  onExplore: () => void;
  onRestart: () => void;
  onFresh: () => void;
  onKeep: () => void;
  onCancelConfirm: () => void;
}

export function GuidedDemoPanel({
  state,
  step,
  waiting,
  onNext,
  onBack,
  onSkip,
  onExit,
  onExplore,
  onRestart,
  onFresh,
  onKeep,
  onCancelConfirm,
}: GuidedDemoPanelProps) {
  if (state.status !== "running" && state.status !== "done" && state.status !== "confirm-restart") {
    return null;
  }

  const confirming = state.status === "confirm-restart";
  const done = state.status === "done" || confirming;
  const total = GUIDED_STEPS.length;
  const current = done ? total : (step?.number ?? 1);

  return (
    <aside
      className="pointer-events-auto fixed inset-x-3 bottom-3 z-40 max-h-[42vh] overflow-y-auto rounded-2xl border border-cyan-300/20 bg-[#07111c]/96 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md sm:max-h-none md:inset-x-auto md:bottom-5 md:right-5 md:w-[22.5rem]"
      aria-label="Guided demo"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-cyan-200/80">
          {done ? "Demo complete" : `Step ${current} of ${total}`}
        </p>
        {!done ? (
          <button
            type="button"
            onClick={onExit}
            aria-label="Exit guided demo"
            className="text-[11px] text-slate-500 hover:text-slate-300"
          >
            Exit Demo
          </button>
        ) : null}
      </div>

      <div
        className="mt-2 flex gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label="Guided demo progress"
      >
        {GUIDED_STEPS.map((item, index) => (
          <span
            key={item.id}
            className={`h-1 flex-1 rounded-full ${
              index < current ? "bg-cyan-300/80" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <div role="status" aria-live="polite" className="mt-3">
        {confirming ? (
          <>
            <h2 className="text-sm font-semibold text-slate-50">
              Start with a fresh simulation?
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Restarting can clear your current likes, profile, and rankings. Keep
              progress to continue from this session.
            </p>
          </>
        ) : done ? (
          <>
            <h2 className="text-sm font-semibold text-slate-50">
              You&apos;ve seen how behavior can influence content and advertising.
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Keep exploring the feed, or open Engineer Mode to inspect the
              simulation values. Nothing resets unless you choose Restart.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-slate-50">{step?.title}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-300">{step?.body}</p>
            <p className="mt-1.5 hidden text-xs leading-5 text-slate-500 sm:block">{step?.observation}</p>
            {waiting ? (
              <p className="mt-2 text-[11px] text-cyan-100/90">
                Waiting for that interaction — the demo uses your real click.
              </p>
            ) : null}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={onFresh}
              className="rounded-full border border-cyan-300/25 bg-cyan-400/16 px-3 py-1.5 text-[12px] font-medium text-cyan-50"
            >
              Start Fresh
            </button>
            <button
              type="button"
              onClick={onKeep}
              className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-slate-200"
            >
              Keep My Progress
            </button>
            <button
              type="button"
              onClick={onCancelConfirm}
              className="rounded-full px-3 py-1.5 text-[12px] text-slate-500"
            >
              Cancel
            </button>
          </>
        ) : done ? (
          <>
            <button
              type="button"
              onClick={onExplore}
              className="rounded-full border border-cyan-300/25 bg-cyan-400/16 px-3 py-1.5 text-[12px] font-medium text-cyan-50"
            >
              Explore Freely
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-slate-200"
            >
              Restart Demo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBack}
              disabled={state.stepIndex <= 0}
              aria-label="Go back to the previous demo step"
              className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] text-slate-300 disabled:opacity-40"
            >
              Back
            </button>
            {step?.cta ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-full border border-cyan-300/25 bg-cyan-400/16 px-3 py-1.5 text-[12px] font-medium text-cyan-50"
              >
                {step.cta}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onSkip}
              aria-label="Skip this demo step"
              className="rounded-full px-3 py-1.5 text-[12px] text-slate-500 hover:text-slate-300"
            >
              Skip
            </button>
          </>
        )}
      </div>
      <p className="mt-2 text-[10px] leading-4 text-slate-600">{GUIDED_DISCLAIMER}</p>
    </aside>
  );
}
