import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  tone?: "default" | "evergreen" | "amber" | "red";
  hint?: string;
}) {
  const toneClass = {
    default: "text-ink",
    evergreen: "text-evergreen",
    amber: "text-amber",
    red: "text-red",
  }[tone];
  return (
    <div className="rounded-lintel border border-hairline bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-slate">{label}</p>
      <p className={cn("mt-2 font-heading text-2xl font-semibold tabular-nums", toneClass)}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lintel border border-dashed border-hairline bg-surface p-10 text-center">
      <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "evergreen" | "amber" | "red" | "mint";
}) {
  const cls = {
    default: "bg-ink/5 text-slate",
    evergreen: "bg-evergreen/10 text-evergreen",
    amber: "bg-amber/10 text-amber",
    red: "bg-red/10 text-red",
    mint: "bg-mint/15 text-evergreen",
  }[tone];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", cls)}>
      {children}
    </span>
  );
}
