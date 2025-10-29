import { createClient } from '@supabase/supabase-js'

// Admin client with service role key for server-side operations
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl === 'your_supabase_url' || supabaseServiceKey === 'your_service_role_key') {
    // Return a dummy client that will handle errors gracefully
    return createClient(
      supabaseUrl || 'http://localhost',
      supabaseServiceKey || 'dummy-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

