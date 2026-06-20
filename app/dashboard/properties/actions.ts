"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";
import { resolveRegion } from "@/lib/i18n/rulesets";

function slug(label: string): string {
  return label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join("_").slice(0, 40);
}

export async function createProperty(formData: FormData) {
  const { orgId, country, region, regionCode } = await requireSession();
  const supabase = createClient();

  const jurisdiction = String(formData.get("jurisdiction")) as JurisdictionKey;
  const allElectric = formData.get("all_electric") === "on";
  const bedroomsRaw = String(formData.get("bedrooms") ?? "").trim();
  const { data: created, error } = await supabase
    .from("properties")
    .insert({
      org_id: orgId,
      jurisdiction,
      label: String(formData.get("label") ?? "").trim(),
      address_line1: String(formData.get("address_line1") ?? "") || null,
      address_line2: String(formData.get("address_line2") ?? "") || null,
      city: String(formData.get("city") ?? "") || null,
      postcode: String(formData.get("postcode") ?? "") || null,
      is_hmo: formData.get("is_hmo") === "on",
      subtype: String(formData.get("subtype") ?? "") || null,
      bedrooms: bedroomsRaw ? Number(bedroomsRaw) : null,
      status: String(formData.get("status") ?? "vacant") || "vacant",
      all_electric: allElectric,
      ownership: String(formData.get("ownership") ?? "personal") || "personal",
      company_name: String(formData.get("company_name") ?? "") || null,
      company_no: String(formData.get("company_no") ?? "") || null,
      year_end_month: String(formData.get("year_end_month") ?? "") || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Optional property photo.
  const photo = formData.get("photo");
  if (created?.id && photo instanceof File && photo.size > 0) {
    try {
      const ext = (photo.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${created.id}/photo-${Date.now()}.${ext}`;
      const bytes = Buffer.from(await photo.arrayBuffer());
      const { error: pErr } = await supabase.storage.from("property-docs").upload(path, bytes, { contentType: photo.type || "image/jpeg", upsert: true });
      if (!pErr) await supabase.from("properties").update({ photo_path: path }).eq("id", created.id);
    } catch {
      // non-fatal
    }
  }

  // Region-aware compliance auto-seeding from the org's country/region ruleset.
  if (created && created.id) {
    try {
      const ruleset = country === "GB" ? resolveRegion("GB", jurisdiction) : resolveRegion(country, region, regionCode);
      const rows = ruleset.compliance.filter((c) => !(allElectric && /gas/i.test(c.label))).map((c) => ({
        org_id: orgId,
        property_id: created.id,
        item_key: slug(c.label),
        label: c.label,
        statutory_basis: c.note,
        expires_at: null,
      }));
      if (rows.length > 0) {
        await supabase.from("compliance_items").insert(rows);
      }
    } catch {
      // non-fatal: the property is created regardless
    }
  }

  // Optional: store the uploaded tenancy contract in the property's document vault.
  const contract = formData.get("contract");
  if (created?.id && contract instanceof File && contract.size > 0) {
    try {
      const ext = (contract.name.split(".").pop() || "pdf").toLowerCase();
      const cpath = `${created.id}/contract-${Date.now()}.${ext}`;
      const cbytes = Buffer.from(await contract.arrayBuffer());
      const { error: cErr } = await supabase.storage
        .from("property-docs")
        .upload(cpath, cbytes, { contentType: contract.type || "application/pdf", upsert: true });
      if (!cErr) {
        await supabase.from("property_documents").insert({
          org_id: orgId,
          property_id: created.id,
          label: contract.name || "Tenancy contract",
          doc_type: "tenancy_agreement",
          storage_path: cpath,
          visible_to_tenant: false,
        });
      }
    } catch {
      // non-fatal
    }
  }

  // Optional: create a tenancy from the tenant fields captured at add-property time.
  const tName = String(formData.get("tenant_name") ?? "").trim();
  const tEmail = String(formData.get("tenant_email") ?? "").trim();
  const tPhone = String(formData.get("tenant_phone") ?? "").trim();
  const rentAmount = parseFloat(String(formData.get("rent_amount") ?? "")) || null;
  const depositAmount = parseFloat(String(formData.get("deposit_amount") ?? "")) || null;
  const startDate = String(formData.get("start_date") ?? "") || null;
  const endDate = String(formData.get("end_date") ?? "") || null;
  if (created?.id && (tName || tEmail || tPhone || rentAmount || startDate)) {
    try {
      const tType = resolveJurisdiction(jurisdiction).tenancyTypes?.[0]?.key ?? "tenancy";
      await supabase.from("tenancies").insert({
        org_id: orgId,
        property_id: created.id,
        type: tType,
        tenant_name: tName || null,
        tenant_email: tEmail || null,
        tenant_phone: tPhone || null,
        rent_amount: rentAmount,
        rent_period: String(formData.get("rent_period") ?? "monthly") || "monthly",
        deposit_amount: depositAmount,
        start_date: startDate,
        end_date: endDate,
        status: "active",
      });
      revalidatePath("/dashboard/rent");
    } catch {
      // non-fatal: the property is still created
    }
  }

  revalidatePath("/dashboard/properties");
}

export async function updateProperty(formData: FormData) {
  const { orgId, role } = await requireSession();
  if (!isWriterRole(role)) throw new Error("You don't have permission to edit properties.");
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("properties").update({
    label: String(formData.get("label") ?? "").trim() || "Property",
    address_line1: String(formData.get("address_line1") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    postcode: String(formData.get("postcode") ?? "") || null,
    is_hmo: formData.get("is_hmo") === "on",
  }).eq("id", id).eq("org_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${id}`);
  revalidatePath("/dashboard/properties");
}

export async function deleteProperty(formData: FormData) {
  const { orgId, role } = await requireSession();
  if (!isWriterRole(role)) throw new Error("You don't have permission to delete properties.");
  const supabase = createClient();
  const id = String(formData.get("id"));
  // Cascades to tenancies, compliance, documents and registrations via FK.
  const { error } = await supabase.from("properties").delete().eq("id", id).eq("org_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  if (String(formData.get("redirect") ?? "") === "1") redirect("/dashboard/properties");
}

export async function createUnit(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const propertyId = String(formData.get("property_id"));
  const { error } = await supabase.from("units").insert({
    property_id: propertyId,
    label: String(formData.get("label") ?? "").trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function createRegistration(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const propertyId = String(formData.get("property_id"));
  const { error } = await supabase.from("registrations").insert({
    property_id: propertyId,
    scheme: String(formData.get("scheme") ?? "").trim(),
    reference: String(formData.get("reference") ?? "") || null,
    issued_at: String(formData.get("issued_at") ?? "") || null,
    renews_at: String(formData.get("renews_at") ?? "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
}
