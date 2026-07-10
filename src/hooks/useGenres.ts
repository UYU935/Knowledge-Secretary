import { useState, useEffect } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import type { Genre } from '../types'

export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchGenres() {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }
    try {
      const client = getSupabaseClient()
      const { data, error } = await client
        .from('genres')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      if (!error && data) setGenres(data)
    } catch {
      // Supabase not configured yet
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchGenres() }, [])

  async function addGenre(name: string, icon: string) {
    if (!isSupabaseConfigured()) return new Error('Supabase未設定')
    const client = getSupabaseClient()
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()
    const maxOrder = genres.reduce((m, g) => Math.max(m, g.sort_order), 0)
    const { error } = await client.from('genres').insert({
      name, icon, slug, sort_order: maxOrder + 1,
    })
    if (!error) await fetchGenres()
    return error
  }

  async function toggleGenre(id: string, is_active: boolean) {
    if (!isSupabaseConfigured()) return new Error('Supabase未設定')
    const client = getSupabaseClient()
    const { error } = await client.from('genres').update({ is_active }).eq('id', id)
    if (!error) await fetchGenres()
    return error
  }

  async function updateSortOrder(reordered: Genre[]) {
    if (!isSupabaseConfigured()) return
    const client = getSupabaseClient()
    const updates = reordered.map((g, i) =>
      client.from('genres').update({ sort_order: i + 1 }).eq('id', g.id)
    )
    await Promise.all(updates)
    setGenres(reordered)
  }

  return { genres, loading, refetch: fetchGenres, addGenre, toggleGenre, updateSortOrder }
}
