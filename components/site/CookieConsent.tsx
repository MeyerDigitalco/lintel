"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "lintel_cookie_consent";

/**
 * Cookie consent banner.
 *
 * Essential cookies (auth, preferences) always apply and need no consent.
 * Analytics cookies are non-essential, so under UK PECR they require prior
 * opt-in. This banner offers a genuine Accept and Reject, stores the choice,
 * and tells Google Consent Mode which way the visitor went. Analytics only
 * starts collecting after Accept.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // storage unavailable, don't block the page
    }
  }, []);

  function choose(decision: "accepted" | "rejected") {
    try {
      localStorage.setItem(KEY, decision);
    } catch {
      /* ignore */
    }
    // Update Google Consent Mode if GA is present.
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: decision === "accepted" ? "granted" : "denied",
      });
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-edge border border-sepia bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-umber">
          We use essential cookies to keep you signed in, and optional analytics cookies to
          understand how the site is used. See our{" "}
          <Link href="/privacy" className="text-clay hover:underline">Privacy Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("rejected")}
            className="rounded-edge border border-sepia px-4 py-2 text-sm font-medium text-char transition-colors hover:bg-bone"
          >
            Reject
          </button>
          <button
            onClick={() => choose("accepted")}
            className="rounded-edge bg-char px-4 py-2 text-sm font-medium text-bone transition-colors hover:bg-clay"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
