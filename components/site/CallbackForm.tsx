"use client";

import { useState } from "react";
import { requestCallback } from "@/app/actions/lead";

/**
 * Callback request form.
 *
 * The primary conversion path on the marketing site. We deliberately ask for a
 * phone number and promise a human call rather than pushing self-serve signup:
 * a conversation qualifies the lead and, unlike a public feature list, it
 * cannot be scraped by a competitor.
 *
 * Type is set larger and darker than typical marketing small print because the
 * audience skews older and the previous design used 13px on warm grey.
 */
const field =
  "h-12 w-full rounded-edge border border-sepia bg-white px-4 text-[15px] text-char outline-none transition-colors placeholder:text-umber/60 focus:border-char focus:ring-2 focus:ring-char/15";

export function CallbackForm({ id = "callback", token }: { id?: string; token: string }) {
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div id={id} className="rounded-edge border-2 border-char bg-white p-6 md:p-8">
      {state?.ok ? (
        <div className="py-8 text-center">
          <p className="font-display text-[26px] leading-snug text-char">Thank you.</p>
          <p className="mx-auto mt-3 max-w-[34ch] text-[16px] leading-relaxed text-umber">
            A Lintel partner will call you shortly to walk you through the platform and answer
            anything you need.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-display text-[26px] leading-tight text-char md:text-[30px]">
            Speak to a Lintel partner
          </h2>
          <p className="mt-3 text-[16px] leading-relaxed text-umber">
            Leave your details and we will call you back, walk you through the platform and set up
            your portfolio with you. No obligation.
          </p>

          <form
            action={async (fd) => {
              setPending(true);
              setState(await requestCallback(fd));
              setPending(false);
            }}
            className="mt-6 grid gap-4"
          >
            {/* Signed at render time; the action rejects instant or stale posts. */}
            <input type="hidden" name="t" value={token} />

            {/* Honeypot, hidden from people, filled by bots. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <label className="block">
              <span className="mb-1.5 block text-[14px] font-medium text-char">Your name</span>
              <input name="name" required autoComplete="name" placeholder="Jane Smith" className={field} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[14px] font-medium text-char">Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="jane@example.com" className={field} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[14px] font-medium text-char">Phone</span>
                <input name="phone" type="tel" required autoComplete="tel" placeholder="07700 900123" className={field} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[14px] font-medium text-char">Country</span>
                <input name="country" autoComplete="country-name" placeholder="United Kingdom" className={field} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[14px] font-medium text-char">How many properties</span>
                <select name="properties" defaultValue="" className={field}>
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2-5">2 to 5</option>
                  <option value="6-20">6 to 20</option>
                  <option value="21+">21 or more</option>
                </select>
              </label>
            </div>

            {state && !state.ok && (
              <p className="rounded-edge border border-clay/40 bg-clay/5 px-4 py-3 text-[15px] text-clay">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="mt-1 inline-flex h-14 w-full items-center justify-center rounded-edge bg-clay text-[17px] font-medium text-bone transition-colors hover:bg-char disabled:pointer-events-none disabled:opacity-60"
            >
              {pending ? "Sending..." : "Request a callback"}
            </button>

            <p className="text-[13px] leading-relaxed text-umber">
              We use your details only to contact you about Lintel. We never sell or share them. See
              our <a href="/privacy" className="underline hover:text-clay">privacy policy</a>.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
