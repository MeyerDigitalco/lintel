import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/lib/theme";
import { useAuth } from "@/providers/AuthProvider";
import { t } from "@/lib/i18n";

export default function TabsLayout() {
  const { lang } = useAuth();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.evergreen,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.hairline },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: t(lang, "home"), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="properties" options={{ title: t(lang, "properties"), tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="rent" options={{ title: t(lang, "rent"), tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="maintenance" options={{ title: t(lang, "repairs"), tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="more" options={{ title: t(lang, "more"), tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" color={color} size={size} /> }} />
    </Tabs>
  );
}
