"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAccessCode } from "@/app/accountant/actions";

const field =
  "h-14 w-full rounded-edge border border-sepia bg-white px-4 text-center text-[20px] font-medium uppercase tracking-[0.25em] text-char outline-none transition-colors placeholder:tracking-normal placeholder:text-umber/50 focus:border-char focus:ring-2 focus:ring-char/15";

export function AccessGate() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-edge border-2 border-char bg-white p-8">
        <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-clay">
          For accounting practices
        </div>
        <h1 className="display mt-4 text-[2rem] leading-tight text-char">
          Enter your access code
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-umber">
          This page is for invited accounting practices. Enter the code your Lintel contact gave
          you.
        </p>

        <form
          action={async (fd) => {
            setPending(true);
            setError(null);
            const res = await submitAccessCode(fd);
            setPending(false);
            if (res.ok) router.refresh();
            else setError(res.message ?? "That code was not recognised.");
          }}
          className="mt-6 grid gap-4"
        >
          <label className="block">
            <span className="mb-2 block text-[14px] font-medium text-char">Access code</span>
            <input
              name="code"
              required
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="Enter code"
              className={field}
            />
          </label>

          {error && (
            <p className="rounded-edge border border-clay/40 bg-clay/5 px-4 py-3 text-[15px] text-clay">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-14 w-full items-center justify-center rounded-edge bg-clay text-[17px] font-medium text-bone transition-colors hover:bg-char disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? "Checking..." : "View the partner briefing"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[15px] leading-relaxed text-umber">
        Don&apos;t have a code?{" "}
        <a href="mailto:hello@lintelsquared.com" className="underline hover:text-clay">
          Email us
        </a>{" "}
        and we&apos;ll send you one.
      </p>
    </div>
  );
}
