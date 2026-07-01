import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, Linking, ScrollView, RefreshControl } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Screen, Field, Button, Card, Badge, Row, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, API_URL } from "@/lib/supabase";

type Contact = { id: string; kind: string; name: string; company: string | null; email: string | null; phone: string | null };
const KINDS = ["contractor", "supplier", "agent", "tenant", "other"];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ borderWidth: 1, borderColor: active ? colors.evergreen : colors.hairline, backgroundColor: active ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text style={{ color: colors.ink, fontSize: font.small, textTransform: "capitalize" }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Contacts() {
  const { orgId } = useAuth();
  const [rows, setRows] = useState<Contact[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState("contractor");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase.from("contacts").select("id, kind, name, company, email, phone").eq("org_id", orgId).eq("archived", false).order("name");
    setRows((data as Contact[]) ?? []);
  }, [orgId]);
  useEffect(() => { load(); }, [load]);

  const reset = () => { setName(""); setKind("contractor"); setCompany(""); setPhone(""); setEmail(""); setAiNote(""); };

  const snapCard = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("Camera permission needed"); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (res.canceled || !res.assets[0]) return;
    if (!API_URL) { Alert.alert("Set EXPO_PUBLIC_API_URL to enable card reading."); return; }
    setReading(true); setAiNote("");
    try {
      const { data: sess } = await supabase.auth.getSession();
      const fd = new FormData();
      fd.append("file", { uri: res.assets[0].uri, name: "card.jpg", type: "image/jpeg" } as any);
      const resp = await fetch(`${API_URL}/api/extract-contact`, { method: "POST", headers: { Authorization: `Bearer ${sess.session?.access_token ?? ""}` }, body: fd });
      const json = await resp.json();
      const f = (json?.fields ?? {}) as Record<string, string>;
      if (f.name) setName(f.name); else if (f.company) setName(f.company);
      if (f.company) setCompany(f.company);
      if (f.phone) setPhone(f.phone);
      if (f.email) setEmail(f.email);
      if (f.kind) setKind(f.kind);
      const got = Object.keys(f).length;
      setAiNote(got ? `Read ${got} field${got > 1 ? "s" : ""}, check below.` : "Couldn't read the photo, enter manually.");
    } catch {
      setAiNote("Couldn't read the photo, enter manually.");
    } finally { setReading(false); }
  };

  const save = async () => {
    if (!orgId || !name.trim()) { Alert.alert("Add a name"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("contacts").insert({
        org_id: orgId, kind, name: name.trim(), company: company.trim() || null,
        email: email.trim() || null, phone: phone.trim() || null,
      });
      if (error) throw new Error(error.message);
      setOpen(false); reset(); load();
    } catch (e: any) { Alert.alert("Could not save", e.message ?? "Try again."); }
    finally { setSaving(false); }
  };

  return (
    <Screen>
      <Row>
        <Text style={{ fontSize: font.h2, fontWeight: "700", color: colors.ink }}>Contacts</Text>
        <Button title={open ? "Close" : "New contact"} onPress={() => setOpen((v) => !v)} />
      </Row>

      {open ? (
        <Card style={{ marginBottom: 8 }}>
          <View style={{ borderWidth: 1, borderColor: colors.evergreen, backgroundColor: colors.mintBg, borderRadius: radius.md, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontWeight: "600", color: colors.ink }}>Snap a card or van</Text>
            <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>Photograph a business card or vehicle signage, we&apos;ll fill in the details.</Text>
            <Button title={reading ? "Reading…" : "Take a photo"} variant="outline" onPress={snapCard} disabled={reading} style={{ marginTop: 8 }} />
            {aiNote ? <Text style={{ fontSize: font.tiny, color: colors.evergreen, marginTop: 6 }}>{aiNote}</Text> : null}
          </View>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Full name" />
          <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>TYPE</Text>
          <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
            {KINDS.map((k) => <Chip key={k} label={k} active={kind === k} onPress={() => setKind(k)} />)}
          </Row>
          <Field label="Company" value={company} onChangeText={setCompany} placeholder="Company" />
          <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" autoCapitalize="none" keyboardType="email-address" />
          <Button title="Save contact" onPress={save} loading={saving} />
        </Card>
      ) : null}

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
        {rows.length === 0 ? (
          <Text style={{ color: colors.slate, marginTop: 12 }}>No contacts yet.</Text>
        ) : rows.map((c) => (
          <Card key={c.id} style={{ marginBottom: 8 }}>
            <Row>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontWeight: "600" }}>{c.name}</Text>
                {c.company ? <Text style={{ fontSize: font.tiny, color: colors.slate }}>{c.company}</Text> : null}
              </View>
              <Badge tone="default">{c.kind}</Badge>
            </Row>
            <View style={{ marginTop: 6, gap: 4 }}>
              {c.phone ? <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.phone}`)}><Text style={{ color: colors.evergreen, fontSize: font.small }}>{c.phone}</Text></TouchableOpacity> : null}
              {c.email ? <TouchableOpacity onPress={() => Linking.openURL(`mailto:${c.email}`)}><Text style={{ color: colors.evergreen, fontSize: font.small }}>{c.email}</Text></TouchableOpacity> : null}
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
