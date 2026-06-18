import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen, Field, Button, Row, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, API_URL } from "@/lib/supabase";
import { uploadLocalFile, fileExt } from "@/lib/upload";

const EXPENSE_CATS = [
  { key: "repairs_maintenance", label: "Repairs & maintenance" },
  { key: "rent_rates_insurance", label: "Rent, rates, insurance" },
  { key: "legal_management_other", label: "Legal & management" },
  { key: "services_provided", label: "Services & wages" },
  { key: "finance_costs", label: "Finance costs" },
  { key: "other_expenses", label: "Other" },
];

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function ScanReceipt() {
  const { orgId } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<{ id: string; label: string }[]>([]);
  const [propId, setPropId] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [vendor, setVendor] = useState("");
  const [cat, setCat] = useState("repairs_maintenance");
  const [saving, setSaving] = useState(false);

  const loadProps = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase.from("properties").select("id, label").eq("org_id", orgId).order("label");
    setProperties(data ?? []);
    if (data && data.length) setPropId((p) => p ?? data[0].id);
  }, [orgId]);
  useEffect(() => { loadProps(); }, [loadProps]);

  const capture = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed"); return; }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
    if (res.canceled || !res.assets[0]) return;
    const uri = res.assets[0].uri;
    setPhotoUri(uri);
    runOcr(uri);
  };

  const runOcr = async (uri: string) => {
    if (!API_URL) return;
    setOcrLoading(true);
    try {
      const form = new FormData();
      form.append("file", { uri, name: `receipt.${fileExt(uri)}`, type: "image/jpeg" } as any);
      const res = await fetch(`${API_URL}/api/ocr`, { method: "POST", body: form });
      const data = await res.json();
      if (data.amount) setAmount(String(data.amount));
      if (data.date) setDate(String(data.date).slice(0, 10));
      if (data.vendor) setVendor(String(data.vendor));
    } catch {
      // OCR is best-effort; user can type the values.
    } finally {
      setOcrLoading(false);
    }
  };

  const save = async () => {
    const amt = Number(amount);
    if (!orgId || !amt) { Alert.alert("Add an amount", "Enter the receipt total."); return; }
    setSaving(true);
    try {
      let receiptPath: string | null = null;
      if (photoUri) {
        receiptPath = `${orgId}/${Date.now()}.${fileExt(photoUri)}`;
        await uploadLocalFile("receipts", receiptPath, photoUri);
      }
      const { error } = await supabase.from("transactions").insert({
        org_id: orgId, property_id: propId, direction: "expense",
        sa105_category: cat, amount: amt, occurred_on: date || todayISO(),
        description: vendor || "Receipt (mobile)", receipt_url: receiptPath,
      });
      if (error) throw new Error(error.message);
      Alert.alert("Saved", "Expense logged.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Could not save", e.message ?? "Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      {photoUri ? <Image source={{ uri: photoUri }} style={{ width: "100%", height: 200, borderRadius: radius.md }} /> : null}
      <Row style={{ gap: 10 }}>
        <Button title="Photograph receipt" variant="outline" onPress={() => capture(true)} style={{ flex: 1 }} />
        <Button title="From library" variant="outline" onPress={() => capture(false)} style={{ flex: 1 }} />
      </Row>
      {ocrLoading ? (
        <Row style={{ justifyContent: "flex-start", gap: 8 }}>
          <ActivityIndicator color={colors.evergreen} />
          <Text style={{ color: colors.slate, fontSize: font.small }}>Reading the receipt…</Text>
        </Row>
      ) : null}

      <Field label="Amount (£)" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      <Field label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <Field label="Vendor / description" value={vendor} onChangeText={setVendor} placeholder="e.g. British Gas" />

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>CATEGORY</Text>
      <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
        {EXPENSE_CATS.map((c) => (
          <TouchableOpacity key={c.key} onPress={() => setCat(c.key)}>
            <View style={{ borderWidth: 1, borderColor: cat === c.key ? colors.evergreen : colors.hairline, backgroundColor: cat === c.key ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.ink, fontSize: font.small }}>{c.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Row>

      {properties.length > 0 ? (
        <>
          <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>PROPERTY</Text>
          <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
            {properties.map((p) => (
              <TouchableOpacity key={p.id} onPress={() => setPropId(p.id)}>
                <View style={{ borderWidth: 1, borderColor: propId === p.id ? colors.evergreen : colors.hairline, backgroundColor: propId === p.id ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ color: colors.ink, fontSize: font.small }}>{p.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Row>
        </>
      ) : null}

      <Button title="Save expense" onPress={save} loading={saving} />
    </Screen>
  );
}
