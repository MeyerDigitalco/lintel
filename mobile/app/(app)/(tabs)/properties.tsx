import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { Screen, PageTitle, Card, Badge, Button, Row, EmptyState, Loading, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { REGION_LABEL } from "@/lib/format";
import { streetViewUrl } from "@/lib/streetview";

type Property = {
  id: string; label: string; address_line1: string | null; city: string | null; postcode: string | null;
  jurisdiction: string; is_hmo: boolean;
};

export default function Properties() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("properties")
      .select("id, label, address_line1, city, postcode, jurisdiction, is_hmo")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    setItems((data as Property[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle title="Properties" subtitle="Each property loads its nation's rules." />
      <Button title="Add property" onPress={() => router.push("/(app)/add-property")} />
      {items.length === 0 ? (
        <EmptyState title="No properties yet" body="Add your first property in the web app to see it here." />
      ) : (
        items.map((p) => (
          <Card key={p.id} onPress={() => router.push(`/(app)/property/${p.id}`)}>
            {streetViewUrl(p) ? <Image source={{ uri: streetViewUrl(p)! }} style={{ width: "100%", height: 140, borderRadius: 10, marginBottom: 10 }} /> : null}
            <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink }}>{p.label}</Text>
            <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 2 }}>
              {[p.city, p.postcode].filter(Boolean).join(", ") || "No address"}
            </Text>
            <Row style={{ marginTop: 10, justifyContent: "flex-start", gap: 8 }}>
              <Badge tone="mint">{REGION_LABEL[p.jurisdiction] ?? p.jurisdiction}</Badge>
              {p.is_hmo ? <Badge tone="amber">HMO</Badge> : null}
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
