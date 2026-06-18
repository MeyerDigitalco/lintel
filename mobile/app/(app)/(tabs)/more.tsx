import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, PageTitle, Card, Row, Button, Badge, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { REGION_LABEL } from "@/lib/format";
import { t, availableLanguages, LANGUAGES } from "@/lib/i18n";

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
  const { orgName, role, region, country, user, signOut, lang, setLang } = useAuth();
  const langs = availableLanguages(country);

  return (
    <Screen>
      <PageTitle title={t(lang, "more")} subtitle={orgName ?? undefined} right={<Badge tone="mint">{REGION_LABEL[region]}</Badge>} />
      {langs.length > 1 ? (
        <Card>
          <Text style={{ fontSize: font.tiny, color: colors.slate, fontWeight: "600" }}>{t(lang, "language").toUpperCase()}</Text>
          <Row style={{ flexWrap: "wrap", justifyContent: "flex-start", gap: 8, marginTop: 8 }}>
            {langs.map((l) => (
              <TouchableOpacity key={l} onPress={() => setLang(l)}>
                <View style={{ borderWidth: 1, borderColor: lang === l ? colors.evergreen : colors.hairline, backgroundColor: lang === l ? colors.mintBg : colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ color: colors.ink, fontSize: font.small }}>{LANGUAGES[l]?.nativeName ?? l}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Row>
        </Card>
      ) : null}
      <LinkRow icon="shield-checkmark-outline" label={t(lang, "compliance")} hint="Certificates & expiry reminders" onPress={() => router.push("/(app)/compliance")} />
      <LinkRow icon="document-text-outline" label={t(lang, "documents")} hint="Per-property document vault" onPress={() => router.push("/(app)/documents")} />
      <LinkRow icon="ribbon-outline" label={t(lang, "court")} hint="Evidence score per tenancy" onPress={() => router.push("/(app)/court-readiness")} />
      <LinkRow icon="checkbox-outline" label={t(lang, "tasks")} hint="Reminders & to-dos" onPress={() => router.push("/(app)/tasks")} />
      <LinkRow icon="map-outline" label={t(lang, "region")} hint="Your country\u2019s rules" onPress={() => router.push("/(app)/region-rules")} />
      <LinkRow icon="receipt-outline" label={t(lang, "scan")} hint="Snap to log an expense" onPress={() => router.push("/(app)/scan-receipt")} />
      <LinkRow icon="sparkles-outline" label={t(lang, "assistant")} hint="Log & ask by text" onPress={() => router.push("/(app)/assistant")} />

      <Card>
        <Text style={{ fontSize: font.tiny, color: colors.slate, fontWeight: "600" }}>SIGNED IN AS</Text>
        <Text style={{ color: colors.ink, marginTop: 4 }}>{user?.email}</Text>
        <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2, textTransform: "capitalize" }}>{role ?? ""}</Text>
      </Card>
      <Button title={t(lang, "signout")} variant="outline" onPress={signOut} />
    </Screen>
  );
}
