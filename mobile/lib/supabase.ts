import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True when this build was compiled with its Supabase credentials.
 * EXPO_PUBLIC_* values are inlined at build time, so a build made without them
 * can never recover at runtime. We surface that instead of crashing on launch.
 */
export const isSupabaseConfigured = Boolean(url && anon);

if (!isSupabaseConfigured) {
  console.error(
    "Supabase is not configured. EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY were missing when this build was compiled. Set them in mobile/.env locally, and on EAS with: eas env:create --environment production"
  );
}

// createClient throws on an empty url, which crashes the app at module load
// before any screen renders. Fall back to a valid placeholder so the app boots
// and can show a readable message rather than dying on the splash screen.
export const supabase = createClient(url || "https://placeholder.supabase.co", anon || "placeholder", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: isSupabaseConfigured,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
