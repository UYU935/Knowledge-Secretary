import { useState, useCallback } from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import type { ResearchNote } from '../types'

interface FetchFilters {
  notebook?: string | null
  noteType?: string | null
  tag?: string | null
}

export function useResearchNotes() {
  const [notes, setNotes] = useState<ResearchNote[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotes = useCallback(async (filters: FetchFilters = {}) => {
    if (!isSupabaseConfigured()) return { data: [] as ResearchNote[], error: null }
    setLoading(true)
    try {
      const client = getSupabaseClient()
      let query = client
        .from('research_notes')
        .select('*')
        .neq('note_type', 'moc')
        .order('created_date', { ascending: false })
      if (filters.notebook) query = query.contains('notebook', [filters.notebook])
      if (filters.noteType) query = query.eq('note_type', filters.noteType)
      if (filters.tag) query = query.contains('tags', [filters.tag])
      const { data, error } = await query
      if (!error && data) setNotes(data as ResearchNote[])
      setLoading(false)
      return { data: (data as ResearchNote[]) || [], error }
    } catch (e) {
      setLoading(false)
      return { data: [] as ResearchNote[], error: e }
    }
  }, [])

  const searchNotes = useCallback(async (keyword: string) => {
    if (!isSupabaseConfigured()) return { data: [] as ResearchNote[], error: null }
    try {
      const client = getSupabaseClient()
      // PostgRESTのor構文を壊す文字を除去（既存entriesの検索と同方針）
      const safe = keyword.replace(/[,()]/g, ' ').trim()
      const { data, error } = await client
        .from('research_notes')
        .select('*')
        .neq('note_type', 'moc')
        .or(`title.ilike.%${safe}%,body_md.ilike.%${safe}%`)
        .order('created_date', { ascending: false })
        .limit(20)
      return { data: (data as ResearchNote[]) || [], error }
    } catch (e) {
      return { data: [] as ResearchNote[], error: e }
    }
  }, [])

  /**
   * vault内の [[リンク]] を解決する。
   * リンク先は「ファイル名（拡張子なし）」または title。
   */
  const resolveWikiLink = useCallback(async (target: string): Promise<ResearchNote | null> => {
    if (!isSupabaseConfigured()) return null
    try {
      const client = getSupabaseClient()
      const safe = target.replace(/[,()%]/g, ' ').trim()
      const byPath = await client
        .from('research_notes')
        .select('*')
        .ilike('file_path', `%/${safe}.md`)
        .limit(1)
      if (byPath.data && byPath.data.length > 0) return byPath.data[0] as ResearchNote
      const byTitle = await client
        .from('research_notes')
        .select('*')
        .eq('title', target.trim())
        .limit(1)
      if (byTitle.data && byTitle.data.length > 0) return byTitle.data[0] as ResearchNote
      return null
    } catch {
      return null
    }
  }, [])

  return { notes, loading, fetchNotes, searchNotes, resolveWikiLink }
}
