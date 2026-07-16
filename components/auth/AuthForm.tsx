"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signInAction, signUpAction, type AuthState } from "@/app/(auth)/actions";
import { COUNTRIES, COUNTRY_OPTIONS } from "@/lib/i18n/regions";
import { currencyForCountry, CURRENCIES } from "@/lib/i18n/currency";

const fieldCls =
  "h-11 w-full rounded-edge border border-sepia bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-char/30";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-edge bg-char text-sm font-medium text-bone transition-colors hover:bg-clay disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Please wait…" : label}
    </button>
  );
}

const SUBREGION_LABEL: Record<string, string> = { US: "state", AE: "emirate", ZA: "province" };

export function AuthForm({
  mode,
  next,
  defaultCountry = "GB",
}: {
  mode: "signin" | "signup";
  next?: string;
  defaultCountry?: string;
}) {
  const action = mode === "signin" ? signInAction : signUpAction;
  const [state, formAction] = useFormState<AuthState, FormData>(action, undefined);
  const [country, setCountry] = useState(defaultCountry);

  const info = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];
  const isUK = info.code === "GB";
  const currency = currencyForCountry(country);
  const cur = CURRENCIES[currency];

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <>
          <label className="block">
            <span className="mb-1 block text-sm text-char">Portfolio name</span>
            <input name="org_name" placeholder="e.g. Meyer Lettings" className={fieldCls} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-char">Country</span>
            <select name="country" value={country} onChange={(e) => setCountry(e.target.value)} className={fieldCls}>
              {COUNTRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-char">
              Your {isUK ? "nation" : SUBREGION_LABEL[info.code] ?? "region"}
            </span>
            <select name={isUK ? "region" : "region_code"} defaultValue={info.regions[0]?.value} className={fieldCls} key={country}>
              {info.regions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-umber">
              Loads the right rules and bills in {cur?.symbol} {currency}. Pick where your properties are.
            </span>
          </label>

          {!isUK && <input type="hidden" name="region" value="england" />}
          <input type="hidden" name="currency" value={currency} />
        </>
      )}

      <label className="block">
        <span className="mb-1 block text-sm text-char">Email</span>
        <input name="email" type="email" required autoComplete="email" className={fieldCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-char">Password</span>
        <input name="password" type="password" required autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} className={fieldCls} />
      </label>
      {next && <input type="hidden" name="next" value={next} />}
      {state?.error && (
        <p className="rounded-edge border border-red/30 bg-red/5 px-3 py-2 text-sm text-red">{state.error}</p>
      )}
      <Submit label={mode === "signin" ? "Sign in" : "Create account"} />
    </form>
  );
}
