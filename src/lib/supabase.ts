import { createClient } from "@supabase/supabase-js";

export function createServerSupabaseClient() {
  // Server-only client. Prefer non-public names so the values are read at
  // runtime from the container env — NEXT_PUBLIC_* names get inlined/frozen at
  // build time and cannot be supplied at run time. The NEXT_PUBLIC_* fallback
  // keeps local `next dev` working from .env.local.
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
