import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Screen, Card, Badge, Row, SectionTitle, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";
import { resolveRegion } from "@/lib/rulesets";

function Expandable({ title, subtitle, detail, badge }: { title: string; subtitle?: string; detail?: string; badge?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ marginBottom: 8 }}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => setOpen((o) => !o)}>
        <Row>
          <Text style={{ fontWeight: "600", color: colors.ink, flex: 1 }}>{title}</Text>
          {badge ? <Badge tone="amber">{badge}</Badge> : <Text style={{ fontSize: font.tiny, color: colors.slate }}>{open ? "Hide" : "Details"}</Text>}
        </Row>
      </TouchableOpacity>
      <Text style={{ fontSize: font.tiny, color: colors.slate, marginTop: 6 }}>{open ? (detail ?? subtitle ?? "") : (subtitle ?? "")}</Text>
    </Card>
  );
}

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

      <SectionTitle>{r.tenancyTerm[0].toUpperCase() + r.tenancyTerm.slice(1)} types</SectionTitle>
      {r.tenancyTypes.map((t) => (
        <Expandable key={t.label} title={t.label} detail={t.description} subtitle={t.description.length > 60 ? t.description.slice(0, 57) + "…" : t.description} />
      ))}

      <SectionTitle>Compliance</SectionTitle>
      {r.compliance.map((c) => (
        <Expandable key={c.label} title={c.label} subtitle={c.note} detail={(c as any).detail ?? c.note} />
      ))}

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
        <Expandable key={n.label} title={n.label} badge={n.period} subtitle={n.when} detail={(n as any).detail ?? n.when} />
      ))}

      <Text style={{ fontSize: font.tiny, color: colors.slate }}>Guidance only — Lintel provides software, not legal or tax advice.</Text>
    </Screen>
  );
}
