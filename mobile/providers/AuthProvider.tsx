import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { availableLanguages } from "@/lib/i18n";

export type Region = "england" | "wales" | "scotland" | "northern_ireland";

interface Ctx {
  loading: boolean;
  session: Session | null;
  user: User | null;
  orgId: string | null;
  orgName: string | null;
  role: string | null;
  region: Region;
  currency: string;
  country: string;
  regionCode: string | null;
  lang: string;
  setLang: (l: string) => void;
  isWriter: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const WRITER_ROLES = ["owner", "admin", "landlord"];

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>("england");
  const [currency, setCurrency] = useState<string>("GBP");
  const [country, setCountry] = useState<string>("GB");
  const [regionCode, setRegionCode] = useState<string | null>(null);
  const [lang, setLangState] = useState<string>("en");

  const loadContext = useCallback(async (s: Session | null) => {
    if (!s?.user) {
      setOrgId(null); setRole(null); setOrgName(null); setRegion("england"); setCurrency("GBP"); setCountry("GB"); setRegionCode(null);
      return;
    }
    const { data: membership } = await supabase
      .from("memberships")
      .select("org_id, role")
      .eq("user_id", s.user.id)
      .limit(1)
      .maybeSingle();
    if (membership) {
      setOrgId(membership.org_id);
      setRole(membership.role);
      const { data: org } = await supabase
        .from("orgs")
        .select("name, region, currency, country, region_code")
        .eq("id", membership.org_id)
        .maybeSingle();
      setOrgName(org?.name ?? null);
      setRegion(((org?.region as Region) ?? "england"));
      setCurrency(((org as any)?.currency as string) ?? "GBP");
      setCountry(((org as any)?.country as string) ?? "GB");
      setRegionCode(((org as any)?.region_code as string) ?? null);
      const availLangs = availableLanguages(((org as any)?.country as string) ?? "GB");
      setLangState((cur) => (availLangs.includes(cur) ? cur : availLangs[0]));
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadContext(data.session);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await loadContext(s);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadContext]);

  useEffect(() => {
    AsyncStorage.getItem("lintel_lang").then((v) => { if (v) setLangState(v); });
  }, []);

  const setLang = useCallback((l: string) => {
    setLangState(l);
    AsyncStorage.setItem("lintel_lang", l).catch(() => {});
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadContext(data.session);
  }, [loadContext]);

  const value: Ctx = {
    loading,
    session,
    user: session?.user ?? null,
    orgId,
    orgName,
    role,
    region,
    currency,
    country,
    regionCode,
    isWriter: role ? WRITER_ROLES.includes(role) : false,
    signIn,
    signOut,
    refresh,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
