import { useState, useEffect } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import type { Genre } from '../types'

async function loadAllGenres(): Promise<Genre[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const { data, error } = await getSupabaseClient()
      .from('genres')
      .select('*')
      .order('sort_order')
    return (!error && data) ? data : []
  } catch {
    return []
  }
}

export function useAllGenres() {
  const [allGenres, setAllGenres] = useState<Genre[]>([])

  useEffect(() => {
    loadAllGenres().then(setAllGenres).catch(() => {})
  }, [])

  async function refetch() {
    const data = await loadAllGenres()
    setAllGenres(data)
  }

  return { allGenres, refetch }
}
