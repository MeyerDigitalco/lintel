import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/app/ui";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PortalDocuments() {
  const { active } = await requireTenant();
  const supabase = createClient();

  const { data: docs } = await supabase
    .from("shared_documents")
    .select("id, label, kind, storage_path, created_at")
    .eq("tenancy_id", active.tenancyId)
    .order("created_at", { ascending: false });

  // Short-lived signed URLs for download (RLS allows tenancy members to read).
  const withUrls = await Promise.all(
    (docs ?? []).map(async (d) => {
      const { data } = await supabase.storage
        .from("tenancy-docs")
        .createSignedUrl(d.storage_path, 60 * 10);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight">Documents</h1>
      <p className="text-xs text-slate">
        Documents your landlord has shared with you — agreement, certificates and
        any required notices.
      </p>

      {withUrls.length === 0 ? (
        <EmptyState title="No documents" body="Your landlord hasn't shared anything yet." />
      ) : (
        <div className="space-y-3">
          {withUrls.map((d) => (
            <Card key={d.id}>
              <CardBody className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-ink">{d.label}</p>
                  <p className="text-xs text-slate">
                    {d.kind && <Badge>{d.kind}</Badge>} shared {fmtDate(d.created_at)}
                  </p>
                </div>
                {d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-evergreen hover:underline"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-slate">Unavailable</span>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
