interface CreatorAvatarProps {
  name: string;
  from: string;
  to: string;
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CreatorAvatar({ name, from, to }: CreatorAvatarProps) {
  const initials = initialsFor(name);
  const gradientId = `avatar-${initials}-${from.replace("#", "")}`;

  return (
    <span
      className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 text-[0.72rem] font-semibold tracking-wide text-slate-50 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      aria-hidden
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="44" height="44" fill={`url(#${gradientId})`} />
        <circle cx="14" cy="12" r="10" fill="white" opacity="0.12" />
      </svg>
      <span className="relative">{initials}</span>
    </span>
  );
}
