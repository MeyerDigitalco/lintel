import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Screen, PageTitle, Card, Badge, Row, Stat, EmptyState, Loading, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatMoney, fmtDate } from "@/lib/format";

type Ledger = {
  id: string; period: string | null; due_on: string | null; amount_due: number | string;
  status: string; tenancies: { properties: { label: string } | null } | null;
};

const STATUS_TONE: Record<string, "default" | "mint" | "amber" | "red" | "green"> = {
  due: "default", marked: "mint", confirmed: "green", overdue: "red",
};

export default function Rent() {
  const { orgId, currency } = useAuth();
  const gbp = (n: number, d = false) => formatMoney(n, currency, d);
  const [rows, setRows] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("rent_ledger")
      .select("id, period, due_on, amount_due, status, tenancies(properties(label))")
      .eq("org_id", orgId)
      .order("due_on", { ascending: false })
      .limit(100);
    setRows((data as any as Ledger[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loading />;

  const overdue = rows.filter((r) => r.status === "overdue");
  const overdueTotal = overdue.reduce((s, r) => s + (Number(r.amount_due) || 0), 0);

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle title="Rent ledger" subtitle="Charges and payments across your tenancies." />
      <Row style={{ flexWrap: "wrap" }}>
        <Stat label="Overdue" value={String(overdue.length)} />
        <Stat label="Overdue total" value={gbp(overdueTotal)} />
      </Row>
      {rows.length === 0 ? (
        <EmptyState title="No rent records" body="Rent charges logged in the web app appear here." />
      ) : (
        rows.map((r) => (
          <Card key={r.id}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: colors.ink }}>{r.tenancies?.properties?.label ?? "Tenancy"}</Text>
                <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>
                  {r.period ?? ""}{r.due_on ? ` · due ${fmtDate(r.due_on)}` : ""}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={{ fontWeight: "700", color: colors.ink }}>{gbp(r.amount_due, true)}</Text>
                <Badge tone={STATUS_TONE[r.status] ?? "default"}>{r.status}</Badge>
              </View>
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
