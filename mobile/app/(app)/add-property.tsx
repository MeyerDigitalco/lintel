import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen, Field, Button, Card, Badge, Row, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { REGION_LABEL } from "@/lib/format";
import { autocomplete, placeDetails, placesEnabled, type Suggestion } from "@/lib/places";
import { resolveRegion } from "@/lib/rulesets";
import { uploadLocalFile, fileExt } from "@/lib/upload";

const slug = (l: string) => l.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join("_").slice(0, 40);
const SUBTYPES = ["House", "Flat", "Bungalow", "Maisonette", "Studio", "Room", "Other"];
const STATUSES = ["vacant", "rented", "unoccupied"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ borderWidth: 1, borderColor: active ? colors.evergreen : colors.hairline, backgroundColor: active ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text style={{ color: colors.ink, fontSize: font.small, textTransform: "capitalize" }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AddProperty() {
  const { orgId, region, country, regionCode } = useAuth();
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [isHmo, setIsHmo] = useState(false);
  const [subtype, setSubtype] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [status, setStatus] = useState("vacant");
  const [allElectric, setAllElectric] = useState(false);
  const [ownership, setOwnership] = useState<"personal" | "company">("personal");
  const [companyName, setCompanyName] = useState("");
  const [companyNo, setCompanyNo] = useState("");
  const [yearEnd, setYearEnd] = useState("March");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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
    if (parsed) { setLine1(parsed.line1 || s.text); setCity(parsed.city); setPostcode(parsed.postcode); if (!label) setLabel(parsed.line1 || s.text); }
    else setLine1(s.text);
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed"); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const save = async () => {
    if (!orgId || !label.trim()) { Alert.alert("Add a name", "Give the property a label, e.g. '12 Oak Street'."); return; }
    setSaving(true);
    try {
      const { data: created, error } = await supabase.from("properties").insert({
        org_id: orgId, jurisdiction: region, label: label.trim(),
        address_line1: line1.trim() || null, address_line2: line2.trim() || null,
        city: city.trim() || null, postcode: postcode.trim() || null, is_hmo: isHmo,
        subtype: subtype || null, bedrooms: bedrooms ? Number(bedrooms) : null, status,
        all_electric: allElectric, ownership,
        company_name: ownership === "company" ? (companyName.trim() || null) : null,
        company_no: ownership === "company" ? (companyNo.trim() || null) : null,
        year_end_month: ownership === "company" ? yearEnd : null,
      }).select("id").single();
      if (error) throw new Error(error.message);

      if (created?.id && photoUri) {
        try {
          const path = `${created.id}/photo-${Date.now()}.${fileExt(photoUri)}`;
          await uploadLocalFile("property-docs", path, photoUri);
          await supabase.from("properties").update({ photo_path: path }).eq("id", created.id);
        } catch { /* non-fatal */ }
      }

      if (created?.id) {
        try {
          const ruleset = resolveRegion(country, region, regionCode);
          const rows = ruleset.compliance
            .filter((c) => !(allElectric && /gas/i.test(c.label)))
            .map((c) => ({ org_id: orgId, property_id: created.id, item_key: slug(c.label), label: c.label, statutory_basis: c.note, expires_at: null }));
          if (rows.length) await supabase.from("compliance_items").insert(rows);
        } catch { /* non-fatal */ }
      }

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

      {photoUri ? <Image source={{ uri: photoUri }} style={{ width: "100%", height: 160, borderRadius: radius.md }} /> : null}
      <Button title={photoUri ? "Change photo" : "Add a photo"} variant="outline" onPress={pickPhoto} />

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
      <Field label="Address line 2" value={line2} onChangeText={setLine2} placeholder="Apartment, suite, etc." />
      <Field label="Town / city" value={city} onChangeText={setCity} placeholder="City" />
      <Field label="Postcode" value={postcode} onChangeText={setPostcode} placeholder="e.g. SW1A 1AA" autoCapitalize="words" />

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>PROPERTY TYPE</Text>
      <Row style={{ justifyContent: "flex-start", gap: 8 }}>
        <Chip label="Single household" active={!isHmo} onPress={() => setIsHmo(false)} />
        <Chip label="Multi-unit / HMO" active={isHmo} onPress={() => setIsHmo(true)} />
      </Row>

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>SUB-TYPE</Text>
      <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
        {SUBTYPES.map((x) => <Chip key={x} label={x} active={subtype === x.toLowerCase()} onPress={() => setSubtype(x.toLowerCase())} />)}
      </Row>

      <Field label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} placeholder="e.g. 2" keyboardType="numeric" />

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>STATUS</Text>
      <Row style={{ justifyContent: "flex-start", gap: 8 }}>
        {STATUSES.map((x) => <Chip key={x} label={x} active={status === x} onPress={() => setStatus(x)} />)}
      </Row>

      <TouchableOpacity onPress={() => setAllElectric((v) => !v)}>
        <Card>
          <Row>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.ink, fontWeight: "500" }}>All-electric (no gas supply)</Text>
              <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>Skips the gas safety certificate in compliance.</Text>
            </View>
            <Badge tone={allElectric ? "mint" : "default"}>{allElectric ? "Yes" : "No"}</Badge>
          </Row>
        </Card>
      </TouchableOpacity>

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>OWNED BY</Text>
      <Row style={{ justifyContent: "flex-start", gap: 8 }}>
        <Chip label="Personal" active={ownership === "personal"} onPress={() => setOwnership("personal")} />
        <Chip label="Limited company" active={ownership === "company"} onPress={() => setOwnership("company")} />
      </Row>
      {ownership === "company" ? (
        <>
          <Field label="Company name" value={companyName} onChangeText={setCompanyName} placeholder="Blake Properties Ltd" />
          <Field label="Company number" value={companyNo} onChangeText={setCompanyNo} placeholder="12345678" />
          <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>YEAR-END MONTH</Text>
          <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
            {MONTHS.map((m) => <Chip key={m} label={m} active={yearEnd === m} onPress={() => setYearEnd(m)} />)}
          </Row>
        </>
      ) : null}

      {!placesEnabled ? (
        <Text style={{ fontSize: font.tiny, color: colors.slate }}>Tip: set EXPO_PUBLIC_GOOGLE_PLACES_KEY in .env to enable address search.</Text>
      ) : null}

      <Button title="Add property" onPress={save} loading={saving} />
    </Screen>
  );
}
