import * as React from "react";

/**
 * Pop-style icon set — bold rounded outlines with a soft duotone accent fill.
 * Inspired by playful "core pop" style but drawn from scratch.
 *
 * - Stroke uses `currentColor` so it inherits text color (active = primary).
 * - Fill uses currentColor at 18% opacity for the duotone accent.
 * - Default size 24, strokeWidth 1.75, rounded caps & joins.
 */

export type PopIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number;
};

const Base = React.forwardRef<SVGSVGElement, PopIconProps & { children: React.ReactNode }>(
  ({ size = 24, strokeWidth = 1.75, children, ...rest }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  ),
);
Base.displayName = "PopIconBase";

// Shared duotone fill style
const accent = { fill: "currentColor", fillOpacity: 0.18, stroke: "none" } as const;

/* ─────────── Icons ─────────── */

export const Activity = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" {...accent} />
    <path d="M3 12h4l2-5 4 10 2-5h6" />
  </Base>
);

export const LayoutDashboard = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="8" height="9" rx="2" {...accent} />
    <rect x="13" y="3" width="8" height="5" rx="2" />
    <rect x="13" y="10" width="8" height="11" rx="2" {...accent} />
    <rect x="3" y="14" width="8" height="7" rx="2" />
    <rect x="3" y="3" width="8" height="9" rx="2" />
  </Base>
);

export const Eye = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" {...accent} />
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const Headphones = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M4 17v-5a8 8 0 0 1 16 0v5" />
    <rect x="3" y="14" width="5" height="7" rx="2" {...accent} />
    <rect x="16" y="14" width="5" height="7" rx="2" {...accent} />
    <rect x="3" y="14" width="5" height="7" rx="2" />
    <rect x="16" y="14" width="5" height="7" rx="2" />
  </Base>
);

export const Search = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" {...accent} />
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);

export const Package = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" {...accent} />
    <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
    <path d="m7.5 5.25 9 4.5" />
  </Base>
);

export const ListOrdered = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="9" y="5" width="12" height="3" rx="1.5" {...accent} />
    <rect x="9" y="10.5" width="12" height="3" rx="1.5" {...accent} />
    <rect x="9" y="16" width="12" height="3" rx="1.5" {...accent} />
    <path d="M9 6.5h12M9 12h12M9 17.5h12" />
    <path d="M4 4v4M3 8h2M3 4h1.5" />
    <path d="M3 11h3l-3 3h3M3 18h3M5 17v2H3" />
  </Base>
);

export const BookOpen = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3V5Z" {...accent} />
    <path d="M21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7V5Z" />
    <path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3V5Z" />
  </Base>
);

export const ShoppingCart = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M5 7h15l-2 9H8L5 4H2" />
    <path d="M5 7h15l-2 9H8" {...accent} />
    <path d="M5 7h15l-2 9H8L5 4H2" />
    <circle cx="9" cy="20" r="1.5" {...accent} />
    <circle cx="17" cy="20" r="1.5" {...accent} />
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
  </Base>
);

export const Plus = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" {...accent} />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </Base>
);

export const ClipboardList = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="5" y="4" width="14" height="17" rx="2" {...accent} />
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <rect x="9" y="2.5" width="6" height="3.5" rx="1" fill="currentColor" stroke="none" fillOpacity={0.4} />
    <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
    <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
  </Base>
);

export const CalendarClock = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" {...accent} />
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <circle cx="15" cy="16" r="3.5" fill="hsl(var(--background))" />
    <circle cx="15" cy="16" r="3.5" />
    <path d="M15 14.5V16l1 1" />
  </Base>
);

export const Trash2 = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M5 7h14l-1.2 12.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 7Z" {...accent} />
    <path d="M3 7h18" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M5 7h14l-1.2 12.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 7Z" />
    <path d="M10 11v6M14 11v6" />
  </Base>
);

export const Users = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" {...accent} />
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.7-3.4 3.4-5.5 6.5-5.5s5.8 2.1 6.5 5.5" {...accent} />
    <path d="M2.5 20c.7-3.4 3.4-5.5 6.5-5.5s5.8 2.1 6.5 5.5" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M17 14.6c2.6.5 4.4 2.6 5 5.4" />
  </Base>
);

export const UserCog = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="10" cy="8" r="3.5" {...accent} />
    <circle cx="10" cy="8" r="3.5" />
    <path d="M3 20c.6-3.4 3.4-5.5 7-5.5 1 0 1.9.2 2.7.5" />
    <circle cx="18" cy="17" r="2.5" {...accent} />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M18 13v1.5M18 19.5V21M14 17h1.5M20.5 17H22M15.2 14.2l1 1M19.8 18.8l1 1M15.2 19.8l1-1M19.8 15.2l1-1" />
  </Base>
);

export const UsersRound = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="12" cy="9" r="4" {...accent} />
    <circle cx="12" cy="9" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </Base>
);

export const Globe = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" {...accent} />
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
  </Base>
);

export const Code = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="2.5" y="4" width="19" height="16" rx="3" {...accent} />
    <rect x="2.5" y="4" width="19" height="16" rx="3" />
    <path d="M9 9.5 6 12l3 2.5M15 9.5l3 2.5-3 2.5M13.5 9l-3 6" />
  </Base>
);

export const FileImage = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M6 3h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" {...accent} />
    <path d="M6 3h7l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path d="M13 3v5h5" />
    <circle cx="9" cy="13" r="1.5" />
    <path d="m6 19 3-3 2.5 2 3-3.5L18 19" />
  </Base>
);

export const ArrowUpDown = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" {...accent} />
    <circle cx="12" cy="12" r="9" />
    <path d="M8 9.5 10.5 7 13 9.5M10.5 7v10M16 14.5 13.5 17 11 14.5M13.5 17V7" />
  </Base>
);

export const Share2 = (p: PopIconProps) => (
  <Base {...p}>
    <circle cx="18" cy="5" r="2.5" {...accent} />
    <circle cx="6" cy="12" r="2.5" {...accent} />
    <circle cx="18" cy="19" r="2.5" {...accent} />
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
  </Base>
);

export const ChevronsLeftRight = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="3" {...accent} />
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="m9 9-3 3 3 3M15 9l3 3-3 3" />
  </Base>
);

export const Settings = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M12 2.5l2 2 2.8-.4.8 2.7 2.5 1.4-.7 2.7 1.6 2.3-2 2 .4 2.8-2.7.8-1.4 2.5-2.7-.7-2.3 1.6-2-2-2.8.4-.8-2.7L1.5 14l.7-2.7L.6 9l2-2-.4-2.8 2.7-.8L6.3 1l2.7.7L12 2.5Z" {...accent} />
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const Palette = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.5-3.4c-.6-.6-.2-1.6.6-1.6H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9Z" {...accent} />
    <path d="M12 3a9 9 0 1 0 0 18 2 2 0 0 0 1.5-3.4c-.6-.6-.2-1.6.6-1.6H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9Z" />
    <circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="10" cy="7" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
  </Base>
);

export const Languages = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="2" y="3" width="13" height="13" rx="2.5" {...accent} />
    <rect x="2" y="3" width="13" height="13" rx="2.5" />
    <path d="M5 6h7M8.5 6v1.5C8.5 9.5 7 11 5 12M6 9c1 1.5 3 3 5 3.5" />
    <rect x="9" y="9" width="13" height="12" rx="2.5" fill="hsl(var(--background))" />
    <rect x="9" y="9" width="13" height="12" rx="2.5" />
    <path d="m12 18 3.5-7 3.5 7M13 16h5" />
  </Base>
);

export const MousePointer2 = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M5 3.5 19 11l-6.5 1.5L11 19l-6-15.5Z" {...accent} />
    <path d="M5 3.5 19 11l-6.5 1.5L11 19l-6-15.5Z" />
  </Base>
);

export const Keyboard = (p: PopIconProps) => (
  <Base {...p}>
    <rect x="2" y="6" width="20" height="13" rx="2.5" {...accent} />
    <rect x="2" y="6" width="20" height="13" rx="2.5" />
    <path d="M6 10h.5M9.5 10h.5M13 10h.5M16.5 10h.5M6 13h.5M9.5 13h.5M13 13h.5M16.5 13h.5M7 16h10" />
  </Base>
);

export const BellRing = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M5.5 17h13l-1.5-2v-4a5.5 5.5 0 0 0-11 0v4L5.5 17Z" {...accent} />
    <path d="M5.5 17h13l-1.5-2v-4a5.5 5.5 0 0 0-11 0v4L5.5 17Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
    <path d="M3 6.5C3.5 5 4.5 4 6 3.5M21 6.5C20.5 5 19.5 4 18 3.5" />
  </Base>
);

export const ChevronDown = (p: PopIconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const LogOut = (p: PopIconProps) => (
  <Base {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" {...accent} />
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M9 8 5 12l4 4M5 12h11" />
  </Base>
);
