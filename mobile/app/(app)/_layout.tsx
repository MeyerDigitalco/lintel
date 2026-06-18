import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="property/[id]" options={{ title: "Property" }} />
      <Stack.Screen name="report-fault" options={{ title: "Report a repair", presentation: "modal" }} />
      <Stack.Screen name="compliance" options={{ title: "Compliance" }} />
      <Stack.Screen name="documents" options={{ title: "Documents" }} />
      <Stack.Screen name="court-readiness" options={{ title: "Court-readiness" }} />
      <Stack.Screen name="scan-receipt" options={{ title: "Scan a receipt", presentation: "modal" }} />
      <Stack.Screen name="assistant" options={{ title: "Assistant" }} />
      <Stack.Screen name="add-property" options={{ title: "Add property", presentation: "modal" }} />
      <Stack.Screen name="maintenance/[id]" options={{ title: "Repair" }} />
      <Stack.Screen name="tasks" options={{ title: "Tasks" }} />
      <Stack.Screen name="region-rules" options={{ title: "Region rules" }} />
    </Stack>
  );
}
