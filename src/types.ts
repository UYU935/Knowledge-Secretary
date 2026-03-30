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

export type TabId = 'record' | 'list' | 'search' | 'export' | 'settings'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
