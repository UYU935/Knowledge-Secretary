export interface Entry {
  id: string
  title: string
  body: string
  genre: string
  tags: string[]
  created_date: string
  synced_at: string
}

export interface EntryInput {
  title: string
  body: string
  genre: string
  tags: string[]
}

export type TabId = 'record' | 'list' | 'search' | 'research' | 'export' | 'settings'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

// --- 研究ノート（知識ラボ vault → Supabase research_notes） ---

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

/** NotebookLM システムトレード書庫のノートブック名（①〜⑪） */
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
