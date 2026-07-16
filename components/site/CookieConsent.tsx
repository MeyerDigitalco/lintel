"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "lintel_cookie_consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // storage unavailable, don't block the page
    }
  }, []);

  function accept() {
    try { localStorage.setItem(KEY, new Date().toISOString()); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 rounded-edge border border-sepia bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-umber">
          We use essential cookies to keep you signed in and remember preferences like language. See our{" "}
          <Link href="/privacy" className="text-clay hover:underline">Privacy Policy</Link>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-edge bg-char px-4 py-2 text-sm font-medium text-bone transition-colors hover:bg-clay"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
