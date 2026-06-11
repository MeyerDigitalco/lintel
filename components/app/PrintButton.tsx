"use client";

import { Button } from "@/components/ui/Button";

export function PrintButton() {
  return (
    <Button size="sm" onClick={() => window.print()} className="print:hidden">
      Print / save as PDF
    </Button>
  );
}
