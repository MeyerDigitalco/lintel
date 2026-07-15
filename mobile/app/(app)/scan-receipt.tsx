import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen, Field, Button, Row, Badge, Card, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, API_URL } from "@/lib/supabase";
import { uploadLocalFile, fileExt } from "@/lib/upload";
import { categoriesForRegion } from "@/lib/tax-categories";

function todayISO() { return new Date().toISOString().slice(0, 10); }

function count2Label(mode: string, count: string) {
  const n = parseInt(count, 10) || 1;
  return `${n} ${mode === "back" ? "backdated" : "recurring"} ${n === 1 ? "entry" : "entries"}`;
}

/** Add n months to a YYYY-MM-DD date, clamping to the end of the target month. */
function addMonthsISO(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, (m - 1) + n, 1));
  const dim = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
  const day = Math.min(d || 1, dim);
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ScanReceipt() {
  const { orgId, country, currency } = useAuth();
  const CATS = categoriesForRegion(country, "expense");
  const router = useRouter();
  const [properties, setProperties] = useState<{ id: string; label: string }[]>([]);
  const [propId, setPropId] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [vendor, setVendor] = useState("");
  const [cat, setCat] = useState(CATS[0]?.key ?? "repairs_maintenance");
  const [repeatMode, setRepeatMode] = useState<"none" | "forward" | "back">("none");
  const [repeatFreq, setRepeatFreq] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [repeatCount, setRepeatCount] = useState("12");
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
      const start = date || todayISO();
      const baseRow = {
        org_id: orgId, property_id: propId, direction: "expense",
        sa105_category: cat, amount: amt, description: vendor || "Receipt (mobile)",
      };
      const step = repeatFreq === "yearly" ? 12 : repeatFreq === "quarterly" ? 3 : 1;
      let count = parseInt(repeatCount, 10);
      if (!isFinite(count) || count < 1) count = 1;
      count = Math.min(count, 60);

      let rows: any[];
      if (repeatMode === "none") {
        rows = [{ ...baseRow, occurred_on: start, receipt_url: receiptPath, recurring: false }];
      } else {
        const sign = repeatMode === "back" ? -1 : 1;
        rows = Array.from({ length: count }, (_, i) => ({
          ...baseRow,
          occurred_on: addMonthsISO(start, sign * i * step),
          receipt_url: i === 0 ? receiptPath : null,
          recurring: true,
        }));
      }

      // Insert; if the optional `recurring` column is missing, retry without it.
      let res = await supabase.from("transactions").insert(rows);
      if (res.error && /recurring/i.test(String(res.error.message ?? ""))) {
        res = await supabase.from("transactions").insert(rows.map(({ recurring, ...r }: any) => r));
      }
      if (res.error) throw new Error(res.error.message);

      Alert.alert("Saved", repeatMode === "none" ? "Expense logged." : `${count2Label(repeatMode, repeatCount)} logged.`, [{ text: "OK", onPress: () => router.back() }]);
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

      <Field label={`Amount (${currency})`} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
      <Field label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <Field label="Vendor / description" value={vendor} onChangeText={setVendor} placeholder="e.g. utilities, repairs" />

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>CATEGORY</Text>
      <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
        {CATS.map((c) => (
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

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>REPEAT OR BACKDATE</Text>
      <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
        {([["none","Just this"],["forward","Repeat forward"],["back","Backdate"]] as const).map(([v, l]) => (
          <TouchableOpacity key={v} onPress={() => setRepeatMode(v)}>
            <View style={{ borderWidth: 1, borderColor: repeatMode === v ? colors.evergreen : colors.hairline, backgroundColor: repeatMode === v ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.ink, fontSize: font.small }}>{l}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Row>
      {repeatMode !== "none" ? (
        <>
          <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
            {([["monthly","Month"],["quarterly","Quarter"],["yearly","Year"]] as const).map(([v, l]) => (
              <TouchableOpacity key={v} onPress={() => setRepeatFreq(v)}>
                <View style={{ borderWidth: 1, borderColor: repeatFreq === v ? colors.evergreen : colors.hairline, backgroundColor: repeatFreq === v ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ color: colors.ink, fontSize: font.small }}>{l}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Row>
          <Field label="How many periods" value={repeatCount} onChangeText={setRepeatCount} placeholder="12" keyboardType="numeric" />
          <Text style={{ fontSize: font.tiny, color: colors.slate }}>
            {repeatMode === "forward"
              ? `Creates ${repeatCount || 0} entries of the same amount going forward, one per ${repeatFreq === "yearly" ? "year" : repeatFreq === "quarterly" ? "quarter" : "month"}.`
              : `Backdates ${repeatCount || 0} entries of the same amount, one per ${repeatFreq === "yearly" ? "year" : repeatFreq === "quarterly" ? "quarter" : "month"}, working back from the date above.`}
          </Text>
        </>
      ) : null}

      <Button title="Save expense" onPress={save} loading={saving} />
    </Screen>
  );
}
