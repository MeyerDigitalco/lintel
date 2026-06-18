import React from "react";
import {
  View, Text, TouchableOpacity, TextInput, ActivityIndicator,
  ScrollView, StyleSheet, ViewStyle, TextStyle, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, font } from "@/lib/theme";

export function Screen({
  children, scroll = true, refreshing, onRefresh, padded = true,
}: {
  children: React.ReactNode; scroll?: boolean; refreshing?: boolean;
  onRefresh?: () => void; padded?: boolean;
}) {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.paper }}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[padded ? { padding: 16, gap: 14 } : null, { paddingBottom: 40, flexGrow: 1 }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.evergreen} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, padded ? { padding: 16, gap: 14 } : null]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function PageTitle({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: font.h1, fontWeight: "700", color: colors.ink }}>{title}</Text>
        {subtitle ? <Text style={{ marginTop: 2, fontSize: font.small, color: colors.slate }}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink, marginBottom: 6 }}>{children}</Text>;
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void }) {
  const inner = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <TouchableOpacity activeOpacity={0.7} onPress={onPress}>{inner}</TouchableOpacity> : inner;
}

type BadgeTone = "default" | "mint" | "amber" | "red" | "green";
export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: BadgeTone }) {
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    default: { bg: "#EEF1F6", fg: colors.slate },
    mint: { bg: colors.mintBg, fg: colors.evergreen },
    amber: { bg: colors.amberBg, fg: colors.amber },
    red: { bg: colors.redBg, fg: colors.red },
    green: { bg: colors.greenBg, fg: colors.green },
  };
  const c = map[tone];
  return (
    <View style={{ backgroundColor: c.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" }}>
      <Text style={{ color: c.fg, fontSize: font.tiny, fontWeight: "600" }}>{children}</Text>
    </View>
  );
}

export function Button({
  title, onPress, variant = "primary", loading, disabled, style,
}: {
  title: string; onPress?: () => void; variant?: "primary" | "outline" | "ghost";
  loading?: boolean; disabled?: boolean; style?: ViewStyle;
}) {
  const v = {
    primary: { bg: colors.evergreen, fg: colors.paper, bd: colors.evergreen },
    outline: { bg: colors.surface, fg: colors.ink, bd: colors.hairline },
    ghost: { bg: "transparent", fg: colors.evergreen, bd: "transparent" },
  }[variant];
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[{ backgroundColor: v.bg, borderColor: v.bd, borderWidth: 1, borderRadius: radius.md, height: 48, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : <Text style={{ color: v.fg, fontWeight: "600", fontSize: font.body }}>{title}</Text>}
    </TouchableOpacity>
  );
}

export function Field({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, multiline,
}: {
  label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
  secureTextEntry?: boolean; keyboardType?: "default" | "email-address" | "numeric" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words"; multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={{ fontSize: font.tiny, fontWeight: "600", color: colors.slate }}>{label.toUpperCase()}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA4B2"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        style={{
          backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.hairline,
          borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: multiline ? 12 : 0,
          height: multiline ? 96 : 48, fontSize: font.body, color: colors.ink, textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <View style={[styles.card, { flex: 1, minWidth: 140 }]}>
      <Text style={{ fontSize: font.tiny, color: colors.slate, fontWeight: "600" }}>{label.toUpperCase()}</Text>
      <Text style={{ fontSize: font.h1, fontWeight: "700", color: colors.ink, marginTop: 4 }}>{value}</Text>
      {hint ? <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>{hint}</Text> : null}
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, style]}>{children}</View>;
}

export function Loading() {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}><ActivityIndicator color={colors.evergreen} /></View>;
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={{ borderWidth: 1, borderStyle: "dashed", borderColor: colors.hairline, borderRadius: radius.md, padding: 28, alignItems: "center" }}>
      <Text style={{ fontSize: font.h3, fontWeight: "600", color: colors.ink }}>{title}</Text>
      {body ? <Text style={{ marginTop: 4, fontSize: font.small, color: colors.slate, textAlign: "center" }}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.hairline, padding: 16 } as ViewStyle,
});

export { colors, font, radius };
