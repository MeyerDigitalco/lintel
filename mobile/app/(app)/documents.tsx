import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Linking } from "react-native";
import { Screen, Card, Badge, Row, EmptyState, Loading, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fmtDate } from "@/lib/format";

type Doc = {
  id: string; label: string; doc_type: string | null; storage_path: string; expires_at: string | null;
  properties: { label: string } | null; url?: string | null;
};

function docStat(expires_at: string | null): { tone: "default" | "mint" | "amber" | "red" | "green"; label: string } | null {
  if (!expires_at) return null;
  const d = daysUntil(expires_at);
  if (d === null) return null;
  if (d < 0) return { tone: "red", label: "Expired" };
  if (d <= 60) return { tone: "amber", label: `${d}d left` };
  return { tone: "green", label: "Valid" };
}

export default function Documents() {
  const { orgId } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("property_documents")
      .select("id, label, doc_type, storage_path, expires_at, properties(label)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    const withUrls = await Promise.all(
      ((data as any as Doc[]) ?? []).map(async (d) => {
        const { data: signed } = await supabase.storage.from("property-docs").createSignedUrl(d.storage_path, 600);
        return { ...d, url: signed?.signedUrl ?? null };
      })
    );
    setDocs(withUrls);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      {docs.length === 0 ? (
        <EmptyState title="No documents" body="Your per-property document vault from the web app shows here." />
      ) : (
        docs.map((d) => (
          <Card key={d.id} onPress={() => d.url && Linking.openURL(d.url)}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: colors.ink }}>{d.label}</Text>
                <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>
                  {d.properties?.label ?? "—"}{d.expires_at ? ` · expires ${fmtDate(d.expires_at)}` : ""}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                {docStat(d.expires_at) ? <Badge tone={docStat(d.expires_at)!.tone}>{docStat(d.expires_at)!.label}</Badge> : null}
                {d.doc_type ? <Badge tone="mint">{d.doc_type.replace(/_/g, " ")}</Badge> : null}
              </View>
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
