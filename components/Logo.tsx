import { cn } from "@/lib/cn";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="9" fill="#16233A" />
        <path
          d="M13 30V17.5C13 16.7 13.6 16 14.4 16H25.6C26.4 16 27 16.7 27 17.5V30"
          stroke="#F6F8FB"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <rect x="11" y="12.4" width="18" height="2.8" rx="1.4" fill="#3B82F6" />
      </svg>
      {showWordmark && (
        <span className="font-heading text-lg font-semibold tracking-tight text-ink">
          Lintel
        </span>
      )}
    </span>
  );
}
