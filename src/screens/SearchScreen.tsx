import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { EntryCard } from '../components/ui/EntryCard'
import { EntryDetail } from '../components/ui/EntryDetail'
import { Spinner } from '../components/ui/Spinner'
import { useEntries } from '../hooks/useEntries'
import { summarizeSearchResults } from '../lib/claude'
import type { Genre, Entry } from '../types'

interface SearchScreenProps {
  genres: Genre[]
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
}

export function SearchScreen({ onError, onSuccess }: SearchScreenProps) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Entry[]>([])
  const [aiSummary, setAiSummary] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null)
  const { searchEntries, deleteEntry } = useEntries()

  async function handleSearch() {
    if (!keyword.trim()) return
    setIsSearching(true)
    setAiSummary('')
    setHasSearched(true)
    const { data, error } = await searchEntries(keyword)
    if (error) onError('検索に失敗しました')
    else setResults(data)
    setIsSearching(false)
  }

  async function handleAiSummary() {
    if (results.length === 0) {
      onError('検索結果がありません')
      return
    }
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key')
    if (!apiKey) {
      onError('Claude API Keyが設定されていません')
      return
    }
    setIsSummarizing(true)
    try {
      const summary = await summarizeSearchResults(keyword, results.map(e => ({ title: e.title, body: e.summary || e.raw_text || '' })))
      setAiSummary(summary)
    } catch {
      onError('AI処理に失敗しました')
    } finally {
      setIsSummarizing(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この記録を削除しますか？')) return
    const error = await deleteEntry(id)
    if (error) onError('削除に失敗しました')
    else {
      onSuccess('削除しました')
      setDetailEntry(null)
      setResults(prev => prev.filter(e => e.id !== id))
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-[#c8a96e] text-2xl font-semibold mb-1">知識を検索</h1>
        <p className="text-[#6b5e4e] text-xs">AIが過去の経験をまとめます</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b5e4e]" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="キーワードを入力..."
              className="w-full h-12 pl-9 pr-4 bg-[#2a2218] border border-[#3d3028] rounded-xl
                text-[#f0e6d3] text-sm focus:outline-none focus:border-[#c8a96e]/60
                placeholder:text-[#4d4038]"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !keyword.trim()}
            className="h-12 px-5 bg-[#c8a96e] text-[#1a1410] rounded-xl font-semibold text-sm
              disabled:opacity-40 active:scale-[0.97] transition-all"
          >
            {isSearching ? <Spinner size="sm" /> : '検索'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* AI Summary Button */}
        {hasSearched && results.length > 0 && (
          <button
            onClick={handleAiSummary}
            disabled={isSummarizing}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl
              bg-[#c8a96e]/10 border border-[#c8a96e]/30 text-[#c8a96e]
              hover:bg-[#c8a96e]/20 disabled:opacity-40 transition-all text-sm font-medium"
          >
            {isSummarizing ? <Spinner size="sm" /> : <Sparkles size={16} />}
            <span>AIにまとめさせる</span>
          </button>
        )}

        {/* AI Summary */}
        {aiSummary && (
          <div className="border border-[#c8a96e]/50 rounded-2xl p-4 bg-[#c8a96e]/5">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={14} className="text-[#c8a96e]" />
              <span className="text-xs text-[#c8a96e] font-medium">AIサマリー</span>
            </div>
            <p className="text-[#f0e6d3] text-sm leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {/* Results Count */}
        {hasSearched && (
          <p className="text-xs text-[#6b5e4e]">
            「{keyword}」 — {results.length}件ヒット
          </p>
        )}

        {/* Entry Cards */}
        {isSearching ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : results.length === 0 && hasSearched ? (
          <div className="flex flex-col items-center py-12 text-[#4d4038]">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm">該当する記録が見つかりません</p>
          </div>
        ) : (
          results.map(entry => (
            <EntryCard key={entry.id} entry={entry} onClick={() => setDetailEntry(entry)} />
          ))
        )}
      </div>

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
