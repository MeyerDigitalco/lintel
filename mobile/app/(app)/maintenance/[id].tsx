import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, Alert, TouchableOpacity, Modal, Dimensions, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Screen, Card, Badge, Button, Field, Row, SectionTitle, Loading, EmptyState, colors, font, radius } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { fmtDate } from "@/lib/format";

const STATUSES = ["raised", "triaged", "assigned", "scheduled", "in_progress", "completed", "closed"] as const;
const TONE: Record<string, "default" | "mint" | "amber" | "red" | "green"> = {
  raised: "amber", triaged: "mint", assigned: "mint", scheduled: "mint", in_progress: "mint", completed: "green", closed: "default",
};

export default function MaintenanceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isWriter } = useAuth();
  const [loading, setLoading] = useState(true);
  const [req, setReq] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [photos, setPhotos] = useState<{ id: string; storage_path: string; url: string | null }[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [viewer, setViewer] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [{ data: r }, { data: ev }, { data: ph }] = await Promise.all([
      supabase.from("maintenance_requests").select("*, properties(label)").eq("id", id).maybeSingle(),
      supabase.from("maintenance_events").select("*").eq("request_id", id).order("created_at", { ascending: false }),
      supabase.from("maintenance_photos").select("id, storage_path").eq("request_id", id),
    ]);
    setReq(r); setEvents(ev ?? []);
    const urls = await Promise.all(((ph ?? []) as any[]).map(async (p) => {
      const { data } = await supabase.storage.from("maintenance").createSignedUrl(p.storage_path, 600);
      return { id: p.id as string, storage_path: p.storage_path as string, url: data?.signedUrl ?? null };
    }));
    setPhotos(urls);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const removePhoto = (ph: { id: string; storage_path: string }) => {
    Alert.alert("Delete photo", "Remove this photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            if (ph.storage_path) await supabase.storage.from("maintenance").remove([ph.storage_path]);
            await supabase.from("maintenance_photos").delete().eq("id", ph.id);
            await load();
          } catch (e: any) { Alert.alert("Could not delete", e.message); }
        } },
    ]);
  };

  const setStatus = async (status: string) => {
    if (!req) return;
    setBusy(true);
    try {
      const patch: any = { status };
      if (status === "completed") patch.completed_at = new Date().toISOString();
      const { error } = await supabase.from("maintenance_requests").update(patch).eq("id", req.id);
      if (error) throw new Error(error.message);
      await supabase.from("maintenance_events").insert({ request_id: req.id, actor_role: "landlord", kind: "status_change", new_status: status, body: `Status set to ${status.replace(/_/g, " ")}.` });
      await load();
    } catch (e: any) { Alert.alert("Could not update", e.message); } finally { setBusy(false); }
  };

  const addNote = async () => {
    if (!req || !note.trim()) return;
    setBusy(true);
    try {
      await supabase.from("maintenance_events").insert({ request_id: req.id, actor_role: "landlord", kind: "note", body: note.trim() });
      setNote(""); await load();
    } catch (e: any) { Alert.alert("Could not save note", e.message); } finally { setBusy(false); }
  };

  if (loading) return <Loading />;
  if (!req) return <Screen><EmptyState title="Not found" /></Screen>;

  return (
    <Screen>
      <Stack.Screen options={{ title: req.title }} />
      <Card>
        <Row>
          <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink, flex: 1 }}>{req.title}</Text>
          <Badge tone={TONE[req.status] ?? "default"}>{req.status.replace(/_/g, " ")}</Badge>
        </Row>
        <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 4 }}>
          {req.properties?.label ?? "—"} · {fmtDate(req.created_at)}
        </Text>
        {req.description ? <Text style={{ marginTop: 10, color: colors.ink, fontSize: font.small }}>{req.description}</Text> : null}
        <Row style={{ justifyContent: "flex-start", gap: 8, marginTop: 10 }}>
          <Badge tone={req.priority === "emergency" ? "red" : req.priority === "urgent" ? "amber" : "default"}>{req.priority}</Badge>
          {req.is_hazard ? <Badge tone="red">Hazard</Badge> : null}
        </Row>
      </Card>

      {photos.length > 0 ? (
        <View>
          <SectionTitle>Photos</SectionTitle>
          <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
            {photos.map((p, i) => p.url ? (
              <View key={p.id} style={{ width: 100 }}>
                <TouchableOpacity onPress={() => setViewer(p.url)}>
                  <Image source={{ uri: p.url }} style={{ width: 100, height: 100, borderRadius: radius.md }} />
                </TouchableOpacity>
                {isWriter ? (
                  <TouchableOpacity onPress={() => removePhoto(p)} style={{ alignItems: "center", paddingVertical: 4 }}>
                    <Text style={{ fontSize: font.tiny, color: colors.slate }}>Delete</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null)}
          </Row>
        </View>
      ) : null}

      <View>
        <SectionTitle>Update status</SectionTitle>
        <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
          {STATUSES.map((s) => (
            <TouchableOpacity key={s} disabled={busy} onPress={() => setStatus(s)}>
              <View style={{ borderWidth: 1, borderColor: req.status === s ? colors.evergreen : colors.hairline, backgroundColor: req.status === s ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: colors.ink, fontSize: font.small, textTransform: "capitalize" }}>{s.replace(/_/g, " ")}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Row>
      </View>

      <View>
        <SectionTitle>Add a note</SectionTitle>
        <Field value={note} onChangeText={setNote} placeholder="Add an update to the timeline" multiline />
        <Button title="Add note" variant="outline" onPress={addNote} loading={busy} style={{ marginTop: 8 }} />
      </View>

      <View>
        <SectionTitle>Timeline</SectionTitle>
        {events.length === 0 ? <EmptyState title="No activity yet" /> : events.map((ev) => (
          <Card key={ev.id} style={{ marginBottom: 8 }}>
            <Row>
              <Text style={{ fontSize: font.tiny, color: colors.slate, textTransform: "capitalize" }}>{ev.actor_role} · {ev.kind.replace(/_/g, " ")}</Text>
              <Text style={{ fontSize: font.tiny, color: colors.slate }}>{fmtDate(ev.created_at)}</Text>
            </Row>
            {ev.body ? <Text style={{ marginTop: 4, color: colors.ink, fontSize: font.small }}>{ev.body}</Text> : null}
          </Card>
        ))}
      </View>

      <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <Pressable onPress={() => setViewer(null)} style={{ flex: 1, backgroundColor: "rgba(14,20,31,0.94)", alignItems: "center", justifyContent: "center" }}>
          {viewer ? <Image source={{ uri: viewer }} style={{ width: Dimensions.get("window").width - 24, height: Dimensions.get("window").height * 0.7, resizeMode: "contain" }} /> : null}
          <Text style={{ color: colors.paper, marginTop: 16, fontSize: font.small }}>Tap to close</Text>
        </Pressable>
      </Modal>
    </Screen>
  );
}