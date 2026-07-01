"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { revokePortalLink } from "./actions";

export function TenantLink({ url, tenancyId }: { url: string; tenancyId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked, user can still select the text
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <code className="block break-all rounded-lintel bg-paper px-3 py-2 text-xs text-evergreen">{url}</code>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" type="button" onClick={copy}>{copied ? "Copied!" : "Copy link"}</Button>
        <form
          action={revokePortalLink}
          onSubmit={(e) => {
            if (!confirm("Revoke this link? The tenant will immediately lose access.")) e.preventDefault();
          }}
        >
          <input type="hidden" name="tenancy_id" value={tenancyId} />
          <Button size="sm" variant="outline" type="submit">Revoke access</Button>
        </form>
      </div>
    </div>
  );
}
