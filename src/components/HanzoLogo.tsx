/**
 * HanzoLogo — branded SVG mark for Hanzo Connect.
 * A stylized "H" formed by two pillars connected by a glowing link node,
 * representing people connecting inside communities.
 */
export function HanzoLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-label="Hanzo Connect logo">
      <defs>
        <linearGradient id="hanzoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.68 0.22 280)" />
          <stop offset="100%" stopColor="oklch(0.72 0.2 200)" />
        </linearGradient>
        <radialGradient id="hanzoGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rounded background tile */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#hanzoGrad)" />

      {/* Stylized H — two pillars + linking node */}
      <rect x="10" y="11" width="4.2" height="18" rx="2.1" fill="white" opacity="0.95" />
      <rect x="25.8" y="11" width="4.2" height="18" rx="2.1" fill="white" opacity="0.95" />
      <rect x="14.2" y="18" width="11.6" height="4" rx="2" fill="white" opacity="0.85" />

      {/* Connection node glow */}
      <circle cx="20" cy="20" r="3.6" fill="url(#hanzoGlow)" />
      <circle cx="20" cy="20" r="2" fill="white" />
    </svg>
  );
}

/** Inline wordmark used in headers — pairs the icon with the gradient name. */
export function HanzoWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-base" },
    md: { icon: "h-9 w-9", text: "text-lg" },
    lg: { icon: "h-12 w-12", text: "text-2xl" },
  } as const;
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5">
      <HanzoLogo className={s.icon} />
      <span className={`font-display font-bold tracking-tight ${s.text}`}>
        Hanzo <span className="text-gradient">Connect</span>
      </span>
    </div>
  );
}
