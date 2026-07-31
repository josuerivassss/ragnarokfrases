import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en tu .env')
}

// This is the public anon key — it's meant to be exposed in the browser.
// It can only read frases/autores and call the RPC functions defined in
// supabase/schema.sql. It can never touch the admins table directly.
export const supabase = createClient(url, anonKey)
