import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Region = "england" | "wales" | "scotland" | "northern_ireland";

interface Ctx {
  loading: boolean;
  session: Session | null;
  user: User | null;
  orgId: string | null;
  orgName: string | null;
  role: string | null;
  region: Region;
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

  const loadContext = useCallback(async (s: Session | null) => {
    if (!s?.user) {
      setOrgId(null); setRole(null); setOrgName(null); setRegion("england");
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
        .select("name, region")
        .eq("id", membership.org_id)
        .maybeSingle();
      setOrgName(org?.name ?? null);
      setRegion(((org?.region as Region) ?? "england"));
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
