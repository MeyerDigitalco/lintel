import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Screen, Card, Badge, Row, EmptyState, Loading, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { daysUntil } from "@/lib/format";

type Check = { label: string; ok: boolean };
type Result = { tenancyId: string; property: string; score: number; checks: Check[] };

function inDate(expires: string | null): boolean {
  const d = daysUntil(expires);
  return d !== null && d >= 0;
}

export default function CourtReadiness() {
  const { orgId } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const [{ data: tenancies }, { data: comp }, { data: docs }] = await Promise.all([
      supabase.from("tenancies").select("id, property_id, deposit_amount, status, properties(label)").eq("org_id", orgId).eq("status", "active"),
      supabase.from("compliance_items").select("property_id, item_key, expires_at").eq("org_id", orgId),
      supabase.from("property_documents").select("property_id, doc_type").eq("org_id", orgId),
    ]);

    const out: Result[] = (tenancies ?? []).map((t: any) => {
      const pc = (comp ?? []).filter((c: any) => c.property_id === t.property_id);
      const pd = (docs ?? []).filter((d: any) => d.property_id === t.property_id);
      const has = (k: string) => pc.some((c: any) => String(c.item_key).includes(k) && inDate(c.expires_at));
      const checks: Check[] = [
        { label: "Deposit recorded", ok: Number(t.deposit_amount) > 0 },
        { label: "Gas safety in date", ok: has("gas") },
        { label: "EICR / electrical in date", ok: has("eicr") || has("electrical") },
        { label: "EPC on file", ok: pc.some((c: any) => String(c.item_key).includes("epc")) || pd.some((d: any) => d.doc_type === "epc") },
        { label: "Tenancy agreement on file", ok: pd.some((d: any) => d.doc_type === "tenancy_agreement") },
      ];
      const passed = checks.filter((c) => c.ok).length;
      return { tenancyId: t.id, property: t.properties?.label ?? "Tenancy", score: Math.round((passed / checks.length) * 100), checks };
    });
    setResults(out);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Text style={{ fontSize: font.small, color: colors.slate }}>
        How evidence-ready each active tenancy is if you ever needed to go to court. Fix the unchecked items first.
      </Text>
      {results.length === 0 ? (
        <EmptyState title="No active tenancies" body="Active tenancies are scored here." />
      ) : (
        results.map((r) => {
          const tone = r.score >= 80 ? "green" : r.score >= 50 ? "amber" : "red";
          const label = r.score >= 80 ? "Strong" : r.score >= 50 ? "Needs work" : "At risk";
          return (
            <Card key={r.tenancyId}>
              <Row>
                <Text style={{ fontWeight: "700", color: colors.ink, flex: 1 }}>{r.property}</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: font.h2, fontWeight: "800", color: colors.evergreen }}>{r.score}<Text style={{ fontSize: font.small, color: colors.slate }}>/100</Text></Text>
                  <Badge tone={tone as any}>{label}</Badge>
                </View>
              </Row>
              <View style={{ marginTop: 10, gap: 6 }}>
                {r.checks.map((c) => (
                  <Row key={c.label} style={{ justifyContent: "flex-start", gap: 8 }}>
                    <View style={{ width: 18, height: 18, borderRadius: radius.sm, backgroundColor: c.ok ? colors.greenBg : colors.redBg, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: c.ok ? colors.green : colors.red, fontWeight: "800", fontSize: 12 }}>{c.ok ? "✓" : "!"}</Text>
                    </View>
                    <Text style={{ color: c.ok ? colors.ink : colors.slate, fontSize: font.small }}>{c.label}</Text>
                  </Row>
                ))}
              </View>
            </Card>
          );
        })
      )}
      <Text style={{ fontSize: font.tiny, color: colors.slate }}>
        Quick mobile estimate. The web app runs the full jurisdiction-specific scorer.
      </Text>
    </Screen>
  );
}
