import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getCredentials() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '',
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getCredentials()
  return !!(url && key)
}

export function getSupabaseClient(): SupabaseClient {
  const { url, key } = getCredentials()
  if (!url || !key) {
    throw new Error('Supabase接続情報が設定されていません。設定画面でURLとAnon Keyを入力してください。')
  }
  // Reset client if credentials changed
  if (!_client) {
    _client = createClient(url, key)
  }
  return _client
}

export function resetSupabaseClient() {
  _client = null
}
