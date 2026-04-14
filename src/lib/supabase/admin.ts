import { createClient } from '@supabase/supabase-js'

// Cliente com service role — bypassa RLS completamente
// NUNCA expor no browser (sem NEXT_PUBLIC_)
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
