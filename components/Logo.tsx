import { cn } from "@/lib/cn";

/**
 * Lintel wordmark.
 *
 * `accent` exists because the logo appears on two different palettes: the cool
 * dashboard (blue) and the warm editorial marketing site (oxblood). A single
 * hardcoded blue looked wrong against warm paper, and doubling the size made
 * that obvious.
 */
export function Logo({
  className,
  showWordmark = true,
  iconSize = 56,
  wordmarkClassName = "text-4xl",
  accent = "#3B82F6",
  plate = "#16233A",
  wordmarkColorClassName = "text-ink",
}: {
  className?: string;
  showWordmark?: boolean;
  iconSize?: number;
  wordmarkClassName?: string;
  /** Colour of the lintel bar and the squared "2". */
  accent?: string;
  /** Rounded tile behind the mark. */
  plate?: string;
  wordmarkColorClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="9" fill={plate} />
        <path
          d="M13 30V17.5C13 16.7 13.6 16 14.4 16H25.6C26.4 16 27 16.7 27 17.5V30"
          stroke="#F6F8FB"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect x="11" y="12.4" width="18" height="2.8" rx="1.4" fill={accent} />
        <text
          x="32"
          y="14"
          fontSize="12"
          fontWeight="800"
          fill={accent}
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
        >
          2
        </text>
      </svg>
      {showWordmark && (
        <span
          className={cn(
            "font-heading font-semibold tracking-tight",
            wordmarkColorClassName,
            wordmarkClassName
          )}
        >
          Lintel
          <sup className="ml-0.5 align-super text-[0.62em] font-bold" style={{ color: accent }}>
            2
          </sup>
        </span>
      )}
    </span>
  );
}
