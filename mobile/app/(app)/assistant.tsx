import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Card, Field, Button, Row, Badge, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase, API_URL } from "@/lib/supabase";
import { formatMoney } from "@/lib/format";

type Parsed = { amount: number; description: string } | null;

// Lightweight on-device intent parse: pulls a £amount + leftover description.
function parseExpense(text: string): Parsed {
  const m = text.match(/£?\s*(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const amount = Number(m[1]);
  const description = text.replace(m[0], "").replace(/\b(spent|paid|for|on|at|the|a)\b/gi, " ").replace(/\s+/g, " ").trim();
  return { amount, description: description || "Logged via assistant" };
}

export default function Assistant() {
  const { orgId, currency } = useAuth();
  const gbp = (n: number, d = false) => formatMoney(n, currency, d);
  const router = useRouter();

  // Ask-anything
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  // Quick-log expense
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Parsed>(null);
  const [properties, setProperties] = useState<{ id: string; label: string }[]>([]);
  const [propId, setPropId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProps = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase.from("properties").select("id, label").eq("org_id", orgId).order("label");
    setProperties(data ?? []);
    if (data && data.length) setPropId((p) => p ?? data[0].id);
  }, [orgId]);
  useEffect(() => { loadProps(); }, [loadProps]);

  const ask = async () => {
    if (!question.trim()) return;
    if (!API_URL) { Alert.alert("Set EXPO_PUBLIC_API_URL", "The assistant needs your web app URL to answer questions."); return; }
    setAsking(true);
    setAnswer(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const resp = await fetch(`${API_URL}/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sess.session?.access_token ?? ""}` },
        body: JSON.stringify({ question: question.trim() }),
      });
      const json = await resp.json();
      setAnswer(json?.answer ?? json?.error ?? "Couldn't get an answer, please try again.");
    } catch {
      setAnswer("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setAsking(false);
    }
  };

  const interpret = () => {
    const p = parseExpense(text);
    if (!p) { Alert.alert("Couldn't find an amount", "Try e.g. 'Paid £60 for boiler repair'."); return; }
    setParsed(p);
  };

  const confirm = async () => {
    if (!orgId || !parsed) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        org_id: orgId, property_id: propId, direction: "expense",
        sa105_category: "repairs_maintenance", amount: parsed.amount,
        occurred_on: new Date().toISOString().slice(0, 10), description: parsed.description,
      });
      if (error) throw new Error(error.message);
      setParsed(null); setText("");
      Alert.alert("Logged", `${gbp(parsed.amount, true)} expense saved.`);
    } catch (e: any) {
      Alert.alert("Could not save", e.message ?? "Try again.");
    } finally { setSaving(false); }
  };

  return (
    <Screen>
      {/* Ask anything */}
      <Text style={{ fontSize: font.h3, fontWeight: "700", color: colors.ink }}>Ask anything</Text>
      <Text style={{ fontSize: font.small, color: colors.slate }}>
        Questions about your properties, tenants, rent, compliance, or the rules in your region.
      </Text>
      <Field label="Your question" value={question} onChangeText={setQuestion} placeholder="e.g. How much deposit can I take?" multiline />
      <Button title={asking ? "Thinking…" : "Ask"} onPress={ask} loading={asking} />
      {answer ? (
        <Card>
          <Row>
            <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate, flex: 1 }}>ASSISTANT</Text>
            <Badge tone="mint">AI</Badge>
          </Row>
          <Text style={{ color: colors.ink, marginTop: 8 }}>{answer}</Text>
          <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 8 }}>Information only, not formal legal or tax advice.</Text>
        </Card>
      ) : null}

      {/* Quick-log expense */}
      <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink, marginTop: 8 }}>Quick-log an expense</Text>
      <Text style={{ fontSize: font.small, color: colors.slate }}>Nothing is saved until you confirm.</Text>
      <Field label="Tell me what happened" value={text} onChangeText={setText} placeholder="e.g. Paid £60 for boiler repair" multiline />
      <Button title="Interpret" variant="outline" onPress={interpret} />

      {parsed ? (
        <Card style={{ borderColor: colors.mint }}>
          <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>I'LL LOG THIS EXPENSE</Text>
          <Row style={{ marginTop: 8 }}>
            <Text style={{ color: colors.ink, flex: 1 }}>{parsed.description}</Text>
            <Text style={{ fontWeight: "700", color: colors.ink }}>{gbp(parsed.amount, true)}</Text>
          </Row>
          <Badge tone="mint">Repairs & maintenance</Badge>
          {properties.length > 0 ? (
            <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8, marginTop: 10 }}>
              {properties.map((p) => (
                <TouchableOpacity key={p.id} onPress={() => setPropId(p.id)}>
                  <View style={{ borderWidth: 1, borderColor: propId === p.id ? colors.evergreen : colors.hairline, backgroundColor: propId === p.id ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ color: colors.ink, fontSize: font.small }}>{p.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Row>
          ) : null}
          <Button title="Confirm & save" onPress={confirm} loading={saving} style={{ marginTop: 12 }} />
        </Card>
      ) : null}

      <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink, marginTop: 8 }}>Quick actions</Text>
      <Card onPress={() => router.push("/(app)/scan-receipt")}>
        <Row>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name="receipt-outline" size={22} color={colors.evergreen} />
            <Text style={{ color: colors.ink, fontWeight: "600" }}>Scan a receipt instead</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.slate} />
        </Row>
      </Card>
    </Screen>
  );
}
