import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Screen, Card, Field, Button, Badge, Row, SectionTitle, EmptyState, Loading, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { fmtDate, daysUntil } from "@/lib/format";

type Task = {
  id: string; title: string; due_on: string | null; status: string;
  property_id: string | null; properties: { label: string } | null;
};

export default function Tasks() {
  const { orgId, user, isWriter } = useAuth();
  const [rows, setRows] = useState<Task[]>([]);
  const [properties, setProperties] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [propId, setPropId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from("tasks").select("id, title, due_on, status, property_id, properties(label)").eq("org_id", orgId).order("due_on", { ascending: true }),
      supabase.from("properties").select("id, label").eq("org_id", orgId).order("label"),
    ]);
    setRows((t as any as Task[]) ?? []);
    setProperties(p ?? []);
    setLoading(false);
  }, [orgId]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const add = async () => {
    if (!orgId || !title.trim()) { Alert.alert("Add a title"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        org_id: orgId, title: title.trim(), due_on: due || null, property_id: propId, created_by: user?.id ?? null,
      });
      if (error) throw new Error(error.message);
      setTitle(""); setDue(""); setPropId(null);
      await load();
    } catch (e: any) { Alert.alert("Could not save", e.message); } finally { setSaving(false); }
  };

  const toggle = async (t: Task) => {
    const done = t.status !== "done";
    await supabase.from("tasks").update({ status: done ? "done" : "open", completed_at: done ? new Date().toISOString() : null }).eq("id", t.id);
    await load();
  };
  const remove = async (t: Task) => {
    await supabase.from("tasks").delete().eq("id", t.id);
    await load();
  };

  if (loading) return <Loading />;
  const open = rows.filter((t) => t.status !== "done");
  const done = rows.filter((t) => t.status === "done");

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      {isWriter && (
        <Card style={{ gap: 10 }}>
          <Field label="New task" value={title} onChangeText={setTitle} placeholder="e.g. Chase gas certificate" />
          <Field label="Due date (YYYY-MM-DD)" value={due} onChangeText={setDue} placeholder="2026-07-01" />
          {properties.length > 0 ? (
            <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
              {properties.map((p) => (
                <TouchableOpacity key={p.id} onPress={() => setPropId(propId === p.id ? null : p.id)}>
                  <View style={{ borderWidth: 1, borderColor: propId === p.id ? colors.evergreen : colors.hairline, backgroundColor: propId === p.id ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ color: colors.ink, fontSize: font.small }}>{p.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Row>
          ) : null}
          <Button title="Add task" onPress={add} loading={saving} />
        </Card>
      )}

      {open.length === 0 && done.length === 0 ? (
        <EmptyState title="No tasks yet" body="Add reminders for renewals, inspections and chasing references." />
      ) : (
        <>
          <SectionTitle>Open ({open.length})</SectionTitle>
          {open.map((t) => {
            const d = daysUntil(t.due_on);
            return (
              <Card key={t.id} style={{ marginBottom: 8 }}>
                <Row>
                  <TouchableOpacity onPress={() => isWriter && toggle(t)} style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.hairline }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.ink, fontWeight: "500" }}>{t.title}</Text>
                      {t.properties?.label ? <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>{t.properties.label}</Text> : null}
                    </View>
                  </TouchableOpacity>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    {t.due_on ? <Badge tone={d !== null && d < 0 ? "red" : d !== null && d <= 7 ? "amber" : "default"}>{d !== null && d < 0 ? "Overdue" : `due ${fmtDate(t.due_on)}`}</Badge> : null}
                    {isWriter ? <TouchableOpacity onPress={() => remove(t)}><Text style={{ fontSize: font.tiny, color: colors.slate }}>Delete</Text></TouchableOpacity> : null}
                  </View>
                </Row>
              </Card>
            );
          })}

          {done.length > 0 ? (
            <>
              <SectionTitle>Done</SectionTitle>
              {done.map((t) => (
                <Card key={t.id} style={{ marginBottom: 8, opacity: 0.6 }}>
                  <Row>
                    <TouchableOpacity onPress={() => isWriter && toggle(t)} style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.evergreen, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: colors.paper, fontWeight: "800", fontSize: 12 }}>✓</Text>
                      </View>
                      <Text style={{ color: colors.slate, textDecorationLine: "line-through", flex: 1 }}>{t.title}</Text>
                    </TouchableOpacity>
                    {isWriter ? <TouchableOpacity onPress={() => remove(t)}><Text style={{ fontSize: font.tiny, color: colors.slate }}>Delete</Text></TouchableOpacity> : null}
                  </Row>
                </Card>
              ))}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
