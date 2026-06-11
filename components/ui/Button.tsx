import { cn } from "@/lib/cn";

type Variant = "primary" | "mint" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center rounded-lintel font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/40 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-evergreen text-paper hover:bg-evergreen/90",
  mint: "bg-mint text-ink hover:bg-mint/90",
  ghost: "text-ink hover:bg-ink/5",
  outline: "border border-hairline bg-surface text-ink hover:bg-ink/5",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
