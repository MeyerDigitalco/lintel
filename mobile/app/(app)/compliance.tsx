import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Screen, Card, Badge, Row, EmptyState, Loading, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fmtDate, daysUntil } from "@/lib/format";

type Item = {
  id: string; label: string; item_key: string; issued_at: string | null; expires_at: string | null;
  properties: { label: string } | null;
};

export default function Compliance() {
  const { orgId } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("compliance_items")
      .select("id, label, item_key, issued_at, expires_at, properties(label)")
      .eq("org_id", orgId)
      .order("expires_at", { ascending: true });
    setItems((data as any as Item[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      {items.length === 0 ? (
        <EmptyState title="No compliance items" body="Certificates added in the web app appear here with expiry reminders." />
      ) : (
        items.map((c) => {
          const d = daysUntil(c.expires_at);
          const tone = d === null ? "default" : d < 0 ? "red" : d <= 30 ? "amber" : d <= 60 ? "amber" : "green";
          return (
            <Card key={c.id}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: colors.ink }}>{c.label}</Text>
                  <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>{c.properties?.label ?? "-"}</Text>
                </View>
                <Badge tone={tone as any}>{d === null ? "No date" : d < 0 ? "Expired" : `${d}d left`}</Badge>
              </Row>
              <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 8 }}>Expires {fmtDate(c.expires_at)}</Text>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
