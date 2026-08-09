"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInAction, signUpAction, type AuthState } from "@/app/(auth)/actions";

const fieldCls =
  "h-11 w-full rounded-edge border border-sepia bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-char/30";

// Public signup is UK-only. The i18n engine still supports every country, this
// form simply does not expose the choice. To reopen international signup, restore
// the country <select> over COUNTRY_OPTIONS from "@/lib/i18n/regions".
const UK_NATIONS = [
  { value: "england", label: "England" },
  { value: "wales", label: "Wales" },
  { value: "scotland", label: "Scotland" },
  { value: "northern_ireland", label: "Northern Ireland" },
];

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

export function AuthForm({
  mode,
  next,
}: {
  mode: "signin" | "signup";
  next?: string;
  /** Retained for API compatibility; public signup is locked to the UK. */
  defaultCountry?: string;
}) {
  const action = mode === "signin" ? signInAction : signUpAction;
  const [state, formAction] = useFormState<AuthState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <>
          <label className="block">
            <span className="mb-1 block text-sm text-char">Portfolio name</span>
            <input name="org_name" placeholder="e.g. Meyer Lettings" className={fieldCls} />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-char">Where your properties are</span>
            <select name="region" defaultValue="england" className={fieldCls}>
              {UK_NATIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-umber">
              Loads the right rules for your nation and bills in £ GBP.
            </span>
          </label>

          <input type="hidden" name="country" value="GB" />
          <input type="hidden" name="currency" value="GBP" />
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
