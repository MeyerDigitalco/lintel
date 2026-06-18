import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { Screen, Field, Button, colors, font } from "@/components/ui";
import { useAuth } from "@/providers/AuthProvider";

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null); setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
  };

  return (
    <Screen scroll={false} padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center", padding: 24, gap: 16 }}>
        <View style={{ marginBottom: 8 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.evergreen, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Text style={{ color: colors.mint, fontWeight: "800", fontSize: 22 }}>n</Text>
          </View>
          <Text style={{ fontSize: font.h1, fontWeight: "700", color: colors.ink }}>Welcome back</Text>
          <Text style={{ fontSize: font.small, color: colors.slate, marginTop: 4 }}>Sign in to your Lintel account.</Text>
        </View>
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
        {error ? <Text style={{ color: colors.red, fontSize: font.small }}>{error}</Text> : null}
        <Button title="Sign in" onPress={submit} loading={loading} />
        <Text style={{ fontSize: font.tiny, color: colors.slate, textAlign: "center" }}>
          Use the same email and password as the web app.
        </Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}
