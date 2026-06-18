import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Alert, Share, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Screen, Card, Badge, Button, Field, Row, SectionTitle, Loading, EmptyState, colors, font } from "@/components/ui";
import { supabase, API_URL } from "@/lib/supabase";
import { gbp, fmtDate, daysUntil, REGION_LABEL } from "@/lib/format";
import { streetViewUrl } from "@/lib/streetview";

const SCHEME_LABEL: Record<string, string> = {
  england: "PRS Database",
  wales: "Rent Smart Wales",
  scotland: "Scottish Landlord Registration",
  northern_ireland: "NI Landlord Registration",
};

function genToken(): string {
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  ).slice(0, 32);
}

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [prop, setProp] = useState<any>(null);
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [comp, setComp] = useState<any[]>([]);
  const [regs, setRegs] = useState<any[]>([]);
  const [showRegForm, setShowRegForm] = useState(false);
  const [ref, setRef] = useState("");
  const [issued, setIssued] = useState("");
  const [renews, setRenews] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [{ data: p }, { data: t }, { data: c }, { data: r }] = await Promise.all([
      supabase.from("properties").select("*").eq("id", id).maybeSingle(),
      supabase.from("tenancies").select("id, type, status, rent_amount, rent_period, start_date, portal_token").eq("property_id", id),
      supabase.from("compliance_items").select("id, item_key, label, expires_at").eq("property_id", id),
      supabase.from("registrations").select("id, scheme, reference, issued_at, renews_at").eq("property_id", id).order("created_at", { ascending: false }),
    ]);
    setProp(p); setTenancies(t ?? []); setComp(c ?? []); setRegs(r ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const addRegistration = async () => {
    if (!prop || !ref.trim()) { Alert.alert("Add a reference", "Enter the registration number."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("registrations").insert({
        property_id: prop.id,
        scheme: SCHEME_LABEL[prop.jurisdiction] ?? "Registration",
        reference: ref.trim(),
        issued_at: issued || null,
        renews_at: renews || null,
      });
      if (error) throw new Error(error.message);
      setRef(""); setIssued(""); setRenews(""); setShowRegForm(false);
      await load();
    } catch (e: any) { Alert.alert("Could not save", e.message); } finally { setSaving(false); }
  };

  const shareTenantLink = async (tenancy: any) => {
    try {
      let token = tenancy.portal_token;
      if (!token) {
        token = genToken();
        const { error } = await supabase.from("tenancies").update({ portal_token: token }).eq("id", tenancy.id);
        if (error) throw new Error(error.message);
        await load();
      }
      const url = `${API_URL}/t/${token}`;
      await Share.share({ message: `Your tenant portal for this home: ${url}`, url });
    } catch (e: any) {
      Alert.alert("Could not share", e.message ?? "Try again.");
    }
  };

  if (loading) return <Loading />;
  if (!prop) return <Screen><EmptyState title="Not found" /></Screen>;

  return (
    <Screen>
      <Stack.Screen options={{ title: prop.label }} />
      <Card>
        {streetViewUrl(prop) ? <Image source={{ uri: streetViewUrl(prop)! }} style={{ width: "100%", height: 160, borderRadius: 10, marginBottom: 12 }} /> : null}
        <Text style={{ fontSize: font.h2, fontWeight: "700", color: colors.ink }}>{prop.label}</Text>
        <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 2 }}>
          {[prop.address_line1, prop.city, prop.postcode].filter(Boolean).join(", ") || "No address"}
        </Text>
        <Row style={{ marginTop: 10, justifyContent: "flex-start", gap: 8 }}>
          <Badge tone="mint">{REGION_LABEL[prop.jurisdiction] ?? prop.jurisdiction}</Badge>
          {prop.is_hmo ? <Badge tone="amber">HMO</Badge> : null}
        </Row>
      </Card>

      <View>
        <SectionTitle>Tenancies</SectionTitle>
        {tenancies.length === 0 ? <EmptyState title="No tenancies" body="Set one up in the web app." /> : tenancies.map((t) => (
          <Card key={t.id} style={{ marginBottom: 10 }}>
            <Row>
              <Text style={{ fontWeight: "600", color: colors.ink }}>{t.type?.replace(/_/g, " ")}</Text>
              <Badge tone={t.status === "active" ? "green" : "default"}>{t.status}</Badge>
            </Row>
            <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 6 }}>
              {gbp(t.rent_amount, true)} / {t.rent_period} · from {fmtDate(t.start_date)}
            </Text>
            <Button title={t.portal_token ? "Share tenant link" : "Create & share tenant link"} variant="outline" onPress={() => shareTenantLink(t)} style={{ marginTop: 10 }} />
          </Card>
        ))}
      </View>

      <View>
        <Row>
          <SectionTitle>Registration</SectionTitle>
          <TouchableOpacity onPress={() => setShowRegForm((v) => !v)}>
            <Text style={{ color: colors.mint, fontWeight: "600", fontSize: font.small }}>{showRegForm ? "Cancel" : "Add"}</Text>
          </TouchableOpacity>
        </Row>
        <Text style={{ fontSize: font.tiny, color: colors.slate, marginBottom: 8 }}>
          {SCHEME_LABEL[prop.jurisdiction] ?? "Registration"} for this nation.
        </Text>
        {showRegForm ? (
          <Card style={{ marginBottom: 10, gap: 10 }}>
            <Field label="Reference number" value={ref} onChangeText={setRef} placeholder="e.g. RSW-123456" autoCapitalize="words" />
            <Field label="Issued (YYYY-MM-DD)" value={issued} onChangeText={setIssued} placeholder="2025-01-15" />
            <Field label="Renews (YYYY-MM-DD)" value={renews} onChangeText={setRenews} placeholder="2030-01-15" />
            <Button title="Save registration" onPress={addRegistration} loading={saving} />
          </Card>
        ) : null}
        {regs.length === 0 ? <EmptyState title="No registration recorded" /> : regs.map((r) => {
          const d = daysUntil(r.renews_at);
          const tone = d === null ? "default" : d < 0 ? "red" : d <= 60 ? "amber" : "green";
          return (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              <Row>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: colors.ink }}>{r.scheme}</Text>
                  <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>{r.reference}</Text>
                </View>
                <Badge tone={tone as any}>{d === null ? "—" : d < 0 ? "Expired" : `${d}d`}</Badge>
              </Row>
              {r.renews_at ? <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 6 }}>Renews {fmtDate(r.renews_at)}</Text> : null}
            </Card>
          );
        })}
      </View>

      <View>
        <SectionTitle>Compliance</SectionTitle>
        {comp.length === 0 ? <EmptyState title="No compliance items" /> : comp.map((c) => {
          const d = daysUntil(c.expires_at);
          const tone = d === null ? "default" : d < 0 ? "red" : d <= 30 ? "amber" : "green";
          return (
            <Card key={c.id} style={{ marginBottom: 10 }}>
              <Row>
                <Text style={{ fontWeight: "600", color: colors.ink }}>{c.label ?? String(c.item_key)}</Text>
                <Badge tone={tone as any}>{d === null ? "—" : d < 0 ? "Expired" : `${d}d left`}</Badge>
              </Row>
              <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 6 }}>Expires {fmtDate(c.expires_at)}</Text>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
