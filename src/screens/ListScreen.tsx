import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { GenreTabs } from '../components/ui/GenreTabs'
import { EntryCard } from '../components/ui/EntryCard'
import { EntryDetail } from '../components/ui/EntryDetail'
import { LoadingOverlay } from '../components/ui/Spinner'
import { useEntries } from '../hooks/useEntries'
import type { Genre, Entry } from '../types'

interface ListScreenProps {
  genres: Genre[]
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
  refreshKey: number
}

function entriesToCsv(entries: Entry[], _genreName: string): string {
  const header = '日付,タイトル,カテゴリ,要約,学び,本ネタ,タグ'
  const rows = entries.map(e => [
    new Date(e.created_at).toLocaleDateString('ja-JP'),
    e.title,
    e.category,
    e.summary || '',
    e.lesson || '',
    e.book_note || '',
    (e.tags || []).join(' '),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  return '\uFEFF' + [header, ...rows].join('\n')
}

export function ListScreen({ genres, onError, onSuccess, refreshKey }: ListScreenProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null)
  const { entries, loading, fetchEntries, deleteEntry } = useEntries()

  useEffect(() => {
    fetchEntries(selectedGenre)
  }, [selectedGenre, refreshKey, fetchEntries])

  async function handleDelete(id: string) {
    if (!confirm('この記録を削除しますか？')) return
    const error = await deleteEntry(id)
    if (error) onError('削除に失敗しました')
    else {
      onSuccess('削除しました')
      setDetailEntry(null)
    }
  }

  function downloadCsv() {
    const csv = entriesToCsv(entries, selectedGenre ? (genres.find(g => g.id === selectedGenre)?.name || '') : 'all')
    const now = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const genreSlug = selectedGenre ? (genres.find(g => g.id === selectedGenre)?.slug || 'all') : 'all'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${genreSlug}_${now}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onSuccess('CSVをダウンロードしました')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-[#c8a96e] text-2xl font-semibold">記録一覧</h1>
          <p className="text-[#6b5e4e] text-xs mt-0.5">{entries.length}件</p>
        </div>
      </div>

      {/* Genre Tabs */}
      <div className="mb-3">
        <GenreTabs genres={genres} selected={selectedGenre} onSelect={setSelectedGenre} />
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <LoadingOverlay text="読み込み中..." />
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#4d4038]">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm">まだ記録がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => (
              <EntryCard key={entry.id} entry={entry} onClick={() => setDetailEntry(entry)} />
            ))}
          </div>
        )}

        {/* CSV Download */}
        {entries.length > 0 && (
          <button
            onClick={downloadCsv}
            className="w-full mt-4 h-12 flex items-center justify-center gap-2 rounded-xl
              border border-[#3d3028] text-[#a89880] hover:border-[#c8a96e]/50 hover:text-[#c8a96e]
              transition-all text-sm"
          >
            <Download size={16} />
            <span>📥 CSVダウンロード</span>
          </button>
        )}
      </div>

      {/* Detail Modal */}
      {detailEntry && (
        <EntryDetail
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
