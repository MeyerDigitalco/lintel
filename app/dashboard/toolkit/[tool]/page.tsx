import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/ui";
import { NoticeBuilder } from "@/components/app/toolkit/NoticeBuilder";
import { FitnessChecklist } from "@/components/app/toolkit/FitnessChecklist";
import { toolForm, TOOL_FORMS } from "@/lib/toolkit/forms";
import { getTemplate, toolsForJurisdiction } from "@/lib/toolkit";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(TOOL_FORMS).map((tool) => ({ tool }));
}

export default async function ToolPage({ params }: { params: { tool: string } }) {
  const form = toolForm(params.tool);
  if (!form) notFound();

  const { orgId } = await requireWriter();
  const supabase = createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("id, label, jurisdiction")
    .eq("org_id", orgId)
    .eq("jurisdiction", form.jurisdiction);

  const descriptor = toolsForJurisdiction(form.jurisdiction).find(
    (t) => t.slug === form.slug
  );

  return (
    <div>
      <Link href="/dashboard/toolkit" className="text-sm text-slate hover:text-ink">
        ← Toolkit
      </Link>
      <div className="mt-3">
        <PageHeader title={descriptor?.title ?? "Toolkit"} subtitle={descriptor?.blurb} />
      </div>

      {form.ui === "checklist" ? (
        <FitnessChecklist />
      ) : (
        (() => {
          const template = getTemplate(form.jurisdiction, form.kind);
          if (!template) notFound();
          return (
            <NoticeBuilder
              jurisdiction={form.jurisdiction}
              noticeKind={form.kind}
              title={template.title}
              templateVersion={template.version}
              templateBody={template.body}
              legislationUrl={template.legislationUrl}
              prescribedForm={template.prescribedForm}
              fields={form.fields}
              grounds={form.grounds}
              noticeMode={form.noticeMode}
              dateField={form.dateField}
              properties={(properties ?? []).map((p) => ({ id: p.id, label: p.label }))}
            />
          );
        })()
      )}
    </div>
  );
}
