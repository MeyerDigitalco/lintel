import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen, PageTitle, Card, Badge, Stat, Row, Loading, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatMoney, REGION_LABEL, daysUntil } from "@/lib/format";
import { scheduleReminders } from "@/lib/notifications";

function taxYearStartISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const afterApr6 = now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() >= 6);
  return `${afterApr6 ? y : y - 1}-04-06`;
}

export default function Dashboard() {
  const { orgId, orgName, region, currency } = useAuth();
  const gbp = (n: number, d = false) => formatMoney(n, currency, d);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ properties: 0, income: 0, expenses: 0, arrears: 0, dueSoon: 0 });

  const load = useCallback(async () => {
    if (!orgId) return;
    const start = taxYearStartISO();
    const [{ count: propCount }, { data: tx }, { data: arrears }, { data: comp }, { data: docs }] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase.from("transactions").select("direction, amount, occurred_on").eq("org_id", orgId).gte("occurred_on", start),
      supabase.from("rent_ledger").select("id, status").eq("org_id", orgId).eq("status", "overdue"),
      supabase.from("compliance_items").select("id, label, expires_at, properties(label)").eq("org_id", orgId),
      supabase.from("property_documents").select("id, label, expires_at, properties(label)").eq("org_id", orgId).not("expires_at", "is", null),
    ]);
    let income = 0, expenses = 0;
    for (const r of tx ?? []) {
      const a = Number(r.amount) || 0;
      if (r.direction === "income") income += a; else expenses += a;
    }
    const dueSoon = (comp ?? []).filter((c) => {
      const d = daysUntil(c.expires_at as string);
      return d !== null && d <= 60 && d >= 0;
    }).length;
    setStats({ properties: propCount ?? 0, income, expenses, arrears: (arrears ?? []).length, dueSoon });
    scheduleReminders({ compliance: (comp as any) ?? [], documents: (docs as any) ?? [] });
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle
        title="Overview"
        subtitle={orgName ?? "Your portfolio"}
        right={<Badge tone="mint">{REGION_LABEL[region]}</Badge>}
      />
      <Row style={{ flexWrap: "wrap" }}>
        <Stat label="Properties" value={String(stats.properties)} />
        <Stat label="Income (yr)" value={gbp(stats.income)} />
      </Row>
      <Row style={{ flexWrap: "wrap" }}>
        <Stat label="Expenses (yr)" value={gbp(stats.expenses)} />
        <Stat label="Arrears" value={String(stats.arrears)} hint={stats.arrears === 1 ? "overdue payment" : "overdue payments"} />
      </Row>

      <Card>
        <Row>
          <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink }}>MTD for Income Tax</Text>
          <Badge>{stats.income < 20000 ? "Not yet mandated" : "In scope"}</Badge>
        </Row>
        <Text style={{ marginTop: 6, fontSize: font.small, color: colors.slate }}>
          Based on {gbp(stats.income)} property income this year. Keep your digital records ready.
        </Text>
      </Card>

      <Card onPress={() => router.push("/(app)/compliance")}>
        <Row>
          <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink }}>Compliance due soon</Text>
          {stats.dueSoon > 0 ? <Badge tone="amber">{stats.dueSoon} item{stats.dueSoon === 1 ? "" : "s"}</Badge> : <Badge tone="green">All clear</Badge>}
        </Row>
        <Text style={{ marginTop: 6, fontSize: font.small, color: colors.slate }}>
          {stats.dueSoon > 0 ? "Certificates expiring in the next 60 days. Tap to review." : "Nothing due in the next 60 days."}
        </Text>
      </Card>

      <Card onPress={() => router.push("/(app)/court-readiness")}>
        <Row>
          <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink }}>Court-readiness</Text>
          <Badge tone="mint">View score</Badge>
        </Row>
        <Text style={{ marginTop: 6, fontSize: font.small, color: colors.slate }}>
          See how evidence-ready each tenancy is, and exactly what to fix.
        </Text>
      </Card>
    </Screen>
  );
}
