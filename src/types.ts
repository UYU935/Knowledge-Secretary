export type Category = '成功' | '失敗' | '気づき' | 'その他'

export interface Genre {
  id: string
  name: string
  slug: string
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Entry {
  id: string
  genre_id: string | null
  title: string
  category: Category
  summary: string | null
  lesson: string | null
  book_note: string | null
  tags: string[] | null
  raw_text: string | null
  created_at: string
  updated_at: string
  genres?: Genre
}

export interface EntryInput {
  title: string
  category: Category
  summary: string
  lesson: string
  book_note: string
  tags: string[]
}

export type TabId = 'record' | 'list' | 'search' | 'research' | 'export' | 'settings'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// --- 研究ノート（知識ラボ vault → Supabase research_notes）---

export type ResearchNoteType = 'weekly-digest' | 'on-demand' | 'insight' | 'moc'

export interface ResearchNote {
  id: string
  file_path: string
  title: string
  notebook: string[] | null
  note_type: ResearchNoteType | null
  tags: string[] | null
  sources: string[] | null
  body_md: string | null
  created_date: string | null
  synced_at: string
}

/** NotebookLM システムトレード書籍のノートブック名（①〜⑪） */
export const NOTEBOOKS = [
  '①基礎',
  '②トレンドフォロー',
  '③レンジ戦略',
  '④ブレイクアウト',
  '⑤資金管理',
  '⑥バックテスト',
  '⑦心理学',
  '⑧CTA・ヘッジファンド',
  '⑨有名トレーダー',
  '⑩実運用事例',
  '⑪AI・機械学習',
] as const

export const RESEARCH_NOTE_TYPE_LABELS: Record<Exclude<ResearchNoteType, 'moc'>, string> = {
  'weekly-digest': '週次蒸留',
  'on-demand': '合成',
  insight: '知見メモ',
}
