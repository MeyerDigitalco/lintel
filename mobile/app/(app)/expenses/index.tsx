import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Linking, Alert, RefreshControl, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Card, Button, Row, Badge, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { formatMoney } from "@/lib/format";
import { categoryLabelForRegion } from "@/lib/tax-categories";

type Tx = {
  id: string; direction: string; sa105_category: string | null; amount: number;
  occurred_on: string; description: string | null; receipt_url: string | null; recurring?: boolean;
};

export default function Expenses() {
  const { orgId, country, currency } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("transactions")
      .select("id, direction, sa105_category, amount, occurred_on, description, receipt_url, recurring")
      .eq("org_id", orgId)
      .order("occurred_on", { ascending: false })
      .limit(100);
    setRows((data as Tx[]) ?? []);
    setLoading(false);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  const viewReceipt = async (path: string) => {
    try {
      const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 3600);
      if (data?.signedUrl) Linking.openURL(data.signedUrl);
      else Alert.alert("Receipt unavailable");
    } catch {
      Alert.alert("Could not open receipt");
    }
  };

  return (
    <Screen>
      <Row>
        <Text style={{ fontSize: font.h2, fontWeight: "700", color: colors.ink }}>Income & expenses</Text>
        <Button title="Add" onPress={() => router.push("/(app)/scan-receipt")} />
      </Row>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        {loading ? (
          <Text style={{ color: colors.slate, marginTop: 12 }}>Loading…</Text>
        ) : rows.length === 0 ? (
          <Text style={{ color: colors.slate, marginTop: 12 }}>No entries yet. Tap Add to log a receipt or expense.</Text>
        ) : (
          rows.map((t) => (
            <Card key={t.id} style={{ marginBottom: 8 }}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.ink, fontWeight: "600" }}>{t.description || categoryLabelForRegion(country, t.sa105_category)}</Text>
                  <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>
                    {t.occurred_on} · {categoryLabelForRegion(country, t.sa105_category)}
                  </Text>
                  <Row style={{ justifyContent: "flex-start", gap: 6, marginTop: 6 }}>
                    {t.recurring ? <Badge tone="default">Monthly</Badge> : null}
                    {t.receipt_url ? (
                      <TouchableOpacity onPress={() => viewReceipt(t.receipt_url as string)}>
                        <Badge tone="mint">View receipt</Badge>
                      </TouchableOpacity>
                    ) : null}
                  </Row>
                </View>
                <Text style={{ fontWeight: "700", color: t.direction === "income" ? colors.evergreen : colors.ink }}>
                  {t.direction === "income" ? "+" : "−"}{formatMoney(Number(t.amount), currency, true)}
                </Text>
              </Row>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
