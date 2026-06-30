"use client";

import { useEffect, useState } from "react";

// Free-to-use period ends end of 31 August 2026.
const END = new Date("2026-08-31T23:59:59");

export function FreeCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setDays(Math.max(0, Math.ceil((END.getTime() - Date.now()) / 86400000)));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  if (days === null) return null;
  const ended = days === 0;

  return (
    <div className="mx-3 mb-3 rounded-lintel border border-evergreen/20 bg-evergreen/5 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-evergreen">Free access</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-ink">
        {ended ? "Ended" : `${days} day${days === 1 ? "" : "s"} left`}
      </p>
      <p className="text-xs text-slate">
        {ended ? "The free period has ended." : "Everything free until 31 Aug 2026."}
      </p>
    </div>
  );
}
