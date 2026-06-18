import React from "react";
import { View, Text } from "react-native";
import { Screen, Card, Badge, Row, SectionTitle, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { resolveRegion } from "@/lib/rulesets";

export default function RegionRules() {
  const { country, region, currency, regionCode } = useAuth();
  const r = resolveRegion(country, region, regionCode);

  return (
    <Screen>
      <Row>
        <Text style={{ fontSize: font.h2, fontWeight: "700", color: colors.ink }}>{r.subregionName ? `${r.subregionName}, ${r.countryName}` : r.countryName}</Text>
        <Badge tone="mint">{currency}</Badge>
      </Row>

      <Card>
        <Text style={{ fontWeight: "600", color: colors.ink }}>Legal framework</Text>
        <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 4 }}>{r.governingLaw}</Text>
        <Row style={{ justifyContent: "flex-start", gap: 8, marginTop: 8 }}>
          <Badge>{r.tenancyTerm}</Badge>
          <Badge tone="mint">{r.taxLabel}</Badge>
        </Row>
      </Card>

      <View>
        <SectionTitle>Compliance</SectionTitle>
        {r.compliance.map((c) => (
          <Card key={c.label} style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "600", color: colors.ink }}>{c.label}</Text>
            <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>{c.note}</Text>
          </Card>
        ))}
      </View>

      <Card>
        <Text style={{ fontWeight: "600", color: colors.ink }}>{r.depositTerm[0].toUpperCase() + r.depositTerm.slice(1)}</Text>
        <Text style={{ fontSize: font.small, color: colors.ink, marginTop: 4 }}>{r.deposit.cap}</Text>
        <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>{r.deposit.protection}</Text>
      </Card>

      <Card>
        <Text style={{ fontWeight: "600", color: colors.ink }}>Start-of-tenancy checklist</Text>
        <View style={{ marginTop: 6, gap: 4 }}>
          {r.checklist.map((c) => (
            <Text key={c} style={{ fontSize: font.small, color: colors.ink }}>✓ {c}</Text>
          ))}
        </View>
      </Card>

      <SectionTitle>Notices & deadlines</SectionTitle>
      {r.notices.map((n) => (
        <Card key={n.label} style={{ marginBottom: 8 }}>
          <Row>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", color: colors.ink }}>{n.label}</Text>
              <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 2 }}>{n.when}</Text>
            </View>
            <Badge tone="amber">{n.period}</Badge>
          </Row>
        </Card>
      ))}

      <Text style={{ fontSize: font.tiny, color: colors.slate }}>Guidance only — Lintel provides software, not legal or tax advice.</Text>
    </Screen>
  );
}
