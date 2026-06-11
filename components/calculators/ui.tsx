"use client";

import { cn } from "@/lib/cn";

export function Field({
  label,
  suffix,
  prefix,
  help,
  ...props
}: {
  label: string;
  suffix?: string;
  prefix?: string;
  help?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink">{label}</span>
      <span className="flex items-center rounded-lintel border border-hairline bg-surface focus-within:ring-2 focus-within:ring-evergreen/30">
        {prefix && <span className="pl-3 text-sm text-slate">{prefix}</span>}
        <input
          className="h-11 w-full bg-transparent px-3 text-sm tabular-nums outline-none"
          inputMode="decimal"
          {...props}
        />
        {suffix && <span className="pr-3 text-sm text-slate">{suffix}</span>}
      </span>
      {help && <span className="mt-1 block text-xs text-slate">{help}</span>}
    </label>
  );
}

export function Select({
  label,
  options,
  ...props
}: {
  label: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink">{label}</span>
      <select
        className="h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30"
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm text-ink"
    >
      <span
        className={cn(
          "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-evergreen" : "bg-hairline"
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-surface transition-transform",
            checked && "translate-x-4"
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function Result({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline py-2 last:border-0">
      <span className="text-sm text-slate">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          emphasis
            ? "font-heading text-xl font-semibold text-evergreen"
            : "text-sm text-ink"
        )}
      >
        {value}
      </span>
    </div>
  );
}
