import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Screen, Field, Button, Card, Badge, Row, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { REGION_LABEL } from "@/lib/format";
import { autocomplete, placeDetails, placesEnabled, type Suggestion } from "@/lib/places";

export default function AddProperty() {
  const { orgId, region } = useAuth();
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [isHmo, setIsHmo] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLine1Change = (t: string) => {
    setLine1(t);
    if (!placesEnabled) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => setSuggestions(await autocomplete(t)), 300);
  };

  const choose = async (s: Suggestion) => {
    setSuggestions([]);
    const parsed = await placeDetails(s.placeId);
    if (parsed) {
      setLine1(parsed.line1 || s.text);
      setCity(parsed.city);
      setPostcode(parsed.postcode);
      if (!label) setLabel(parsed.line1 || s.text);
    } else {
      setLine1(s.text);
    }
  };

  const save = async () => {
    if (!orgId || !label.trim()) { Alert.alert("Add a name", "Give the property a label, e.g. '12 Oak Street'."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("properties").insert({
        org_id: orgId, jurisdiction: region, label: label.trim(),
        address_line1: line1.trim() || null, city: city.trim() || null,
        postcode: postcode.trim() || null, is_hmo: isHmo,
      });
      if (error) throw new Error(error.message);
      Alert.alert("Added", "Property created.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Could not save", e.message ?? "Try again.");
    } finally { setSaving(false); }
  };

  return (
    <Screen>
      <Row>
        <Text style={{ fontSize: font.small, color: colors.slate }}>Nation</Text>
        <Badge tone="mint">{REGION_LABEL[region]}</Badge>
      </Row>
      <Field label="Property name" value={label} onChangeText={setLabel} placeholder="e.g. 12 Oak Street" />
      <Field label="Address line 1" value={line1} onChangeText={onLine1Change} placeholder={placesEnabled ? "Start typing to search…" : "Street address"} />
      {suggestions.length > 0 ? (
        <Card style={{ padding: 0 }}>
          {suggestions.map((s, i) => (
            <TouchableOpacity key={s.placeId} onPress={() => choose(s)} style={{ padding: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.hairline }}>
              <Text style={{ color: colors.ink, fontSize: font.small }}>{s.text}</Text>
            </TouchableOpacity>
          ))}
        </Card>
      ) : null}
      <Field label="Town / city" value={city} onChangeText={setCity} placeholder="City" />
      <Field label="Postcode" value={postcode} onChangeText={setPostcode} placeholder="e.g. SW1A 1AA" autoCapitalize="words" />

      <TouchableOpacity onPress={() => setIsHmo((h) => !h)}>
        <Row>
          <Text style={{ color: colors.ink, fontSize: font.body }}>House in multiple occupation (HMO)</Text>
          <Badge tone={isHmo ? "amber" : "default"}>{isHmo ? "Yes" : "No"}</Badge>
        </Row>
      </TouchableOpacity>

      {!placesEnabled ? (
        <Text style={{ fontSize: font.tiny, color: colors.slate }}>
          Tip: set EXPO_PUBLIC_GOOGLE_PLACES_KEY in .env to enable address search.
        </Text>
      ) : null}

      <Button title="Add property" onPress={save} loading={saving} />
    </Screen>
  );
}
