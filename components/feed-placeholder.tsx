export function FeedPlaceholder() {
  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" aria-hidden>
          <svg viewBox="0 0 180 180" className="h-full w-full">
            <defs>
              <radialGradient id="empty-glow" cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#7ee7ff" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#7ee7ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="90" cy="90" r="78" fill="url(#empty-glow)" />
            <circle cx="90" cy="90" r="62" fill="none" stroke="#7ee7ff" strokeOpacity="0.18" />
            <circle cx="90" cy="90" r="42" fill="none" stroke="#7ee7ff" strokeOpacity="0.28" />
            <rect x="52" y="58" width="76" height="64" rx="12" fill="#081018" stroke="#7ee7ff" strokeOpacity="0.35" />
            <rect x="64" y="70" width="36" height="6" rx="3" fill="#7ee7ff" opacity="0.55" />
            <rect x="64" y="84" width="52" height="5" rx="2.5" fill="#94a3b8" opacity="0.35" />
            <rect x="64" y="96" width="44" height="5" rx="2.5" fill="#94a3b8" opacity="0.2" />
            <path d="M28 90h124" stroke="#7ee7ff" strokeWidth="1.4" opacity="0.45" />
            <circle cx="90" cy="90" r="4" fill="#7ee7ff" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-200/70">
            Empty state
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-50 sm:text-xl">
            Start interacting with the feed.
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-400">
            Interact first. Then turn personalization on to see how inferred
            interests can change the order.
          </p>
        </div>
      </div>
    </section>
  );
}
