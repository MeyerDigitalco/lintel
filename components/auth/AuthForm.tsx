"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { signInAction, signUpAction, type AuthState } from "@/app/(auth)/actions";
import { JURISDICTION_OPTIONS } from "@/lib/jurisdictions";

const fieldCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Please wait…" : label}
    </Button>
  );
}

export function AuthForm({
  mode,
  next,
}: {
  mode: "signin" | "signup";
  next?: string;
}) {
  const action = mode === "signin" ? signInAction : signUpAction;
  const [state, formAction] = useFormState<AuthState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Portfolio name</span>
            <input name="org_name" placeholder="e.g. Meyer Lettings" className={fieldCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Your region</span>
            <select name="region" defaultValue="england" className={fieldCls}>
              {JURISDICTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-slate">
              Loads the correct tenancy, tax and compliance rules. You can&apos;t
              change this later, so pick where your properties are.
            </span>
          </label>
        </>
      )}
      <label className="block">
        <span className="mb-1 block text-sm text-ink">Email</span>
        <input name="email" type="email" required autoComplete="email" className={fieldCls} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-ink">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          minLength={8}
          className={fieldCls}
        />
      </label>
      {next && <input type="hidden" name="next" value={next} />}
      {state?.error && (
        <p className="rounded-lintel border border-red/30 bg-red/5 px-3 py-2 text-sm text-red">
          {state.error}
        </p>
      )}
      <Submit label={mode === "signin" ? "Sign in" : "Create account"} />
    </form>
  );
}
