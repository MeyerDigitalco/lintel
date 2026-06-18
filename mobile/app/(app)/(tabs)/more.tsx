import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, PageTitle, Card, Row, Button, Badge, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { REGION_LABEL } from "@/lib/format";

function LinkRow({ icon, label, hint, onPress }: { icon: any; label: string; hint?: string; onPress: () => void }) {
  return (
    <Card onPress={onPress}>
      <Row>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <Ionicons name={icon} size={22} color={colors.evergreen} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", color: colors.ink }}>{label}</Text>
            {hint ? <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 1 }}>{hint}</Text> : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.slate} />
      </Row>
    </Card>
  );
}

export default function More() {
  const router = useRouter();
  const { orgName, role, region, user, signOut } = useAuth();

  return (
    <Screen>
      <PageTitle title="More" subtitle={orgName ?? undefined} right={<Badge tone="mint">{REGION_LABEL[region]}</Badge>} />
      <LinkRow icon="shield-checkmark-outline" label="Compliance" hint="Certificates & expiry reminders" onPress={() => router.push("/(app)/compliance")} />
      <LinkRow icon="document-text-outline" label="Documents" hint="Per-property document vault" onPress={() => router.push("/(app)/documents")} />
      <LinkRow icon="ribbon-outline" label="Court-readiness" hint="Evidence score per tenancy" onPress={() => router.push("/(app)/court-readiness")} />
      <LinkRow icon="checkbox-outline" label="Tasks" hint="Reminders & to-dos" onPress={() => router.push("/(app)/tasks")} />
      <LinkRow icon="map-outline" label="Region rules" hint="Your country\u2019s rules" onPress={() => router.push("/(app)/region-rules")} />
      <LinkRow icon="receipt-outline" label="Scan a receipt" hint="Snap to log an expense" onPress={() => router.push("/(app)/scan-receipt")} />
      <LinkRow icon="sparkles-outline" label="Assistant" hint="Log & ask by text" onPress={() => router.push("/(app)/assistant")} />

      <Card>
        <Text style={{ fontSize: font.tiny, color: colors.slate, fontWeight: "600" }}>SIGNED IN AS</Text>
        <Text style={{ color: colors.ink, marginTop: 4 }}>{user?.email}</Text>
        <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2, textTransform: "capitalize" }}>{role ?? ""}</Text>
      </Card>
      <Button title="Sign out" variant="outline" onPress={signOut} />
    </Screen>
  );
}
