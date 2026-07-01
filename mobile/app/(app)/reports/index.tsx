import React, { useEffect, useState, useCallback } from "react";
import { View, Text } from "react-native";
import { Screen, Card, Badge, Row, Loading, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatMoney } from "@/lib/format";
import { categoriesForRegion, categoryLabelForRegion } from "@/lib/tax-categories";

type Tx = { direction: string; sa105_category: string | null; amount: number; description: string | null };
type Contact = { name: string; company: string | null };

export default function Reports() {
  const { orgId, country, currency } = useAuth();
  const money = (n: number) => formatMoney(n, currency, true);
  const [tx, setTx] = useState<Tx[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!orgId) return;
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("transactions").select("direction, sa105_category, amount, description").eq("org_id", orgId),
      supabase.from("contacts").select("name, company").eq("org_id", orgId).in("kind", ["supplier", "contractor"]),
    ]);
    setTx((t as Tx[]) ?? []); setContacts((c as Contact[]) ?? []); setLoading(false);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading />;

  const income = tx.filter((t) => t.direction === "income").reduce((s, t) => s + Number(t.amount), 0);
  const finance = tx.filter((t) => t.direction === "expense" && t.sa105_category === "finance_costs").reduce((s, t) => s + Number(t.amount), 0);
  const operating = tx.filter((t) => t.direction === "expense" && t.sa105_category !== "finance_costs").reduce((s, t) => s + Number(t.amount), 0);
  const net = income - operating - finance;

  const sumCat = (dir: string, key: string) => tx.filter((t) => t.direction === dir && (t.sa105_category ?? "") === key).reduce((s, t) => s + Number(t.amount), 0);
  const incomeCats = categoriesForRegion(country, "income");
  const expenseCats = categoriesForRegion(country, "expense");

  // Supplier expenses, match description to a saved supplier/contractor.
  const suppliers = contacts.map((c) => ({ label: c.company || c.name, needles: [c.name, c.company].filter(Boolean).map((x) => String(x).toLowerCase()) }));
  const buckets: Record<string, number> = {};
  for (const t of tx) {
    if (t.direction !== "expense") continue;
    const d = String(t.description ?? "").toLowerCase();
    const m = suppliers.find((s) => s.needles.some((n) => n && d.includes(n)));
    const key = m?.label ?? "Unattributed / other";
    buckets[key] = (buckets[key] ?? 0) + Number(t.amount);
  }
  const supplierRows = Object.entries(buckets).sort((a, b) => b[1] - a[1]);

  const Line = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
    <Row style={{ marginTop: 6 }}>
      <Text style={{ color: colors.ink, fontWeight: bold ? "700" : "400", flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.ink, fontWeight: bold ? "700" : "400" }}>{value}</Text>
    </Row>
  );

  return (
    <Screen>
      <Row>
        <Text style={{ fontSize: font.h2, fontWeight: "700", color: colors.ink }}>Reports</Text>
        <Badge tone="mint">{currency}</Badge>
      </Row>

      <Card>
        <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink }}>Profit &amp; loss</Text>
        <Line label="Total income" value={money(income)} />
        <Line label="Operating expenses" value={money(operating)} />
        <Line label={country === "GB" ? "Finance costs (Section 24)" : "Finance costs"} value={money(finance)} />
        <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline, marginTop: 8, paddingTop: 4 }}>
          <Line label={net >= 0 ? "Net profit" : "Net loss"} value={money(Math.abs(net))} bold />
        </View>
      </Card>

      <Card>
        <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink }}>Income &amp; expenses</Text>
        {incomeCats.map((c) => { const v = sumCat("income", c.key); return v ? <Line key={c.key} label={c.label} value={money(v)} /> : null; })}
        <View style={{ height: 8 }} />
        {expenseCats.map((c) => { const v = sumCat("expense", c.key); return v ? <Line key={c.key} label={c.label} value={money(v)} /> : null; })}
      </Card>

      <Card>
        <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink }}>Supplier expenses</Text>
        {supplierRows.length === 0 ? (
          <Text style={{ color: colors.slate, marginTop: 6, fontSize: font.small }}>No expenses recorded.</Text>
        ) : supplierRows.map(([name, total]) => <Line key={name} label={name} value={money(total)} />)}
      </Card>

      <Text style={{ fontSize: font.tiny, color: colors.slate }}>Guidance only, Lintel provides software, not tax advice.</Text>
    </Screen>
  );
}
