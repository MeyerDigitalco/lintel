import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Image, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Screen, Field, Button, Card, Badge, Row, colors, font, radius } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { uploadLocalFile, fileExt } from "@/lib/upload";

const PRIORITIES = ["routine", "urgent", "emergency"] as const;

export default function ReportFault() {
  const { orgId, role } = useAuth();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const router = useRouter();
  const [properties, setProperties] = useState<{ id: string; label: string }[]>([]);
  const [selectedProp, setSelectedProp] = useState<string | null>(propertyId ?? null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("routine");
  const [hazard, setHazard] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProps = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase.from("properties").select("id, label").eq("org_id", orgId).order("label");
    setProperties(data ?? []);
    if (!selectedProp && data && data.length) setSelectedProp(data[0].id);
  }, [orgId]);
  useEffect(() => { loadProps(); }, [loadProps]);

  const pickPhoto = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Please allow access to add a photo."); return; }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.6, mediaTypes: ['images'] });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const submit = async () => {
    if (!orgId || !title.trim()) { Alert.alert("Add a title", "Briefly describe the fault."); return; }
    setSaving(true);
    try {
      const { data: req, error } = await supabase
        .from("maintenance_requests")
        .insert({
          org_id: orgId,
          property_id: selectedProp,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          is_hazard: hazard,
          status: "raised",
          raised_by_role: role === "tenant" ? "tenant" : "landlord",
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);

      if (photoUri && req) {
        const path = `${req.id}/${Date.now()}.${fileExt(photoUri)}`;
        await uploadLocalFile("maintenance", path, photoUri);
        await supabase.from("maintenance_photos").insert({
          request_id: req.id, storage_path: path, uploaded_by_role: role === "tenant" ? "tenant" : "landlord",
        });
      }
      if (req) {
        await supabase.from("maintenance_events").insert({
          request_id: req.id, actor_role: "landlord", kind: "status_change", new_status: "raised", body: "Repair reported via mobile.",
        });
      }
      router.back();
    } catch (e: any) {
      Alert.alert("Could not save", e.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>PROPERTY</Text>
      <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8 }}>
        {properties.map((p) => (
          <TouchableOpacity key={p.id} onPress={() => setSelectedProp(p.id)}>
            <View style={{ borderWidth: 1, borderColor: selectedProp === p.id ? colors.evergreen : colors.hairline, backgroundColor: selectedProp === p.id ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ color: colors.ink, fontSize: font.small }}>{p.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Row>

      <Field label="What's wrong?" value={title} onChangeText={setTitle} placeholder="e.g. Boiler not heating" />
      <Field label="Details" value={description} onChangeText={setDescription} placeholder="Anything the contractor should know" multiline />

      <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>PRIORITY</Text>
      <Row style={{ justifyContent: "flex-start", gap: 8 }}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity key={p} onPress={() => setPriority(p)}>
            <View style={{ borderWidth: 1, borderColor: priority === p ? colors.evergreen : colors.hairline, backgroundColor: priority === p ? colors.mintBg : colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ color: colors.ink, fontSize: font.small, textTransform: "capitalize" }}>{p}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Row>

      <TouchableOpacity onPress={() => setHazard((h) => !h)}>
        <Row>
          <Text style={{ color: colors.ink, fontSize: font.body }}>Safety hazard</Text>
          <Badge tone={hazard ? "red" : "default"}>{hazard ? "Yes" : "No"}</Badge>
        </Row>
      </TouchableOpacity>

      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: "100%", height: 200, borderRadius: radius.md }} />
      ) : null}
      <Row style={{ gap: 10 }}>
        <Button title="Take photo" variant="outline" onPress={() => pickPhoto(true)} style={{ flex: 1 }} />
        <Button title="From library" variant="outline" onPress={() => pickPhoto(false)} style={{ flex: 1 }} />
      </Row>

      <Button title="Submit repair" onPress={submit} loading={saving} />
    </Screen>
  );
}
