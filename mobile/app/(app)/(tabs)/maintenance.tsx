import React, { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Screen, PageTitle, Card, Badge, Button, Row, EmptyState, Loading, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fmtDate } from "@/lib/format";

type Req = {
  id: string; title: string; status: string; priority: string; is_hazard: boolean;
  created_at: string; properties: { label: string } | null;
};

const STATUS_TONE: Record<string, "default" | "mint" | "amber" | "red" | "green"> = {
  raised: "amber", triaged: "mint", assigned: "mint", scheduled: "mint",
  in_progress: "mint", completed: "green", closed: "default",
};

export default function Maintenance() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("maintenance_requests")
      .select("id, title, status, priority, is_hazard, created_at, properties(label)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data as any as Req[]) ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading) return <Loading />;
  const open = rows.filter((r) => r.status !== "completed" && r.status !== "closed");

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <PageTitle title="Repairs" subtitle={`${open.length} open`} right={undefined} />
      <Button title="Report a repair" onPress={() => router.push("/(app)/report-fault")} />
      {rows.length === 0 ? (
        <EmptyState title="No repairs logged" body="Report your first repair above." />
      ) : (
        rows.map((r) => (
          <Card key={r.id} onPress={() => router.push(`/(app)/maintenance/${r.id}`)}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: colors.ink }}>{r.title}</Text>
                <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>
                  {r.properties?.label ?? "-"} · {fmtDate(r.created_at)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Badge tone={STATUS_TONE[r.status] ?? "default"}>{r.status.replace(/_/g, " ")}</Badge>
                {r.is_hazard ? <Badge tone="red">Hazard</Badge> : null}
              </View>
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
