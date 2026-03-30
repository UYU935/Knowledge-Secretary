import { useState, useCallback } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import type { Entry } from '../types'

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEntries = useCallback(async (genreId?: string | null) => {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    setLoading(true)
    try {
      const client = getSupabaseClient()
      let query = client
        .from('entries')
        .select('*, genres(id, name, icon, slug)')
        .order('created_at', { ascending: false })
      if (genreId) query = query.eq('genre_id', genreId)
      const { data, error } = await query
      if (!error && data) setEntries(data as Entry[])
      setLoading(false)
      return { data, error }
    } catch (e) {
      setLoading(false)
      return { data: [], error: e }
    }
  }, [])

  const deleteEntry = useCallback(async (id: string) => {
    if (!isSupabaseConfigured()) return new Error('Supabase未設定')
    const client = getSupabaseClient()
    const { error } = await client.from('entries').delete().eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return error
  }, [])

  const searchEntries = useCallback(async (keyword: string) => {
    if (!isSupabaseConfigured()) return { data: [], error: null }
    try {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from('entries')
        .select('*, genres(id, name, icon, slug)')
        .or(`title.ilike.%${keyword}%,summary.ilike.%${keyword}%,lesson.ilike.%${keyword}%,book_note.ilike.%${keyword}%`)
        .order('created_at', { ascending: false })
        .limit(20)
      return { data: (data as Entry[]) || [], error }
    } catch (e) {
      return { data: [], error: e }
    }
  }, [])

  return { entries, loading, fetchEntries, deleteEntry, searchEntries }
}
