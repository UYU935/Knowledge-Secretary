import { useState, useEffect, useCallback } from 'react'
import { Search, Sparkles, X } from 'lucide-react'
import { ResearchNoteCard } from '../components/ui/ResearchNoteCard'
import { ResearchNoteDetail } from '../components/ui/ResearchNoteDetail'
import { Spinner, LoadingOverlay } from '../components/ui/Spinner'
import { useResearchNotes } from '../hooks/useResearchNotes'
import { summarizeResearchNotes } from '../lib/claude'
import type { ResearchNote } from '../types'
import { NOTEBOOKS, RESEARCH_NOTE_TYPE_LABELS } from '../types'

interface ResearchScreenProps {
  onError: (msg: string) => void
}

const TYPE_FILTERS = Object.entries(RESEARCH_NOTE_TYPE_LABELS) as [string, string][]

export function ResearchScreen({ onError }: ResearchScreenProps) {
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<ResearchNote[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [aiSummary, setAiSummary] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  // 詳細表示は [[リンク]] でノート間を移動できるようスタック管理
  const [detailStack, setDetailStack] = useState<ResearchNote[]>([])
  const { notes, loading, fetchNotes, searchNotes, resolveWikiLink } = useResearchNotes()

  useEffect(() => {
    fetchNotes({ notebook: selectedNotebook, noteType: selectedType })
  }, [selectedNotebook, selectedType, fetchNotes])

  async function handleSearch() {
    if (!keyword.trim()) return
    setIsSearching(true)
    setAiSummary('')
    const { data, error } = await searchNotes(keyword)
    if (error) onError('検索に失敗しました')
    else setSearchResults(data)
    setIsSearching(false)
  }

  function clearSearch() {
    setKeyword('')
    setSearchResults(null)
    setAiSummary('')
  }

  async function handleAiSummary() {
    if (!searchResults || searchResults.length === 0) {
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
      const summary = await summarizeResearchNotes(keyword, searchResults)
      setAiSummary(summary)
    } catch {
      onError('AI処理に失敗しました')
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleWikiLink = useCallback(
    async (target: string) => {
      const found = await resolveWikiLink(target)
      if (found) setDetailStack(prev => [...prev, found])
      else onError('リンク先のノートが見つかりません')
    },
    [resolveWikiLink, onError]
  )

  const detailNote = detailStack.length > 0 ? detailStack[detailStack.length - 1] : null
  const displayedNotes = searchResults ?? notes
  const isSearchMode = searchResults !== null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-[#c8a96e] text-2xl font-semibold mb-1">研究</h1>
        <p className="text-[#6b5e4e] text-xs">システムトレード書庫から蒸留した知見ノート</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b5e4e]" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="知見を全文検索..."
              className="w-full h-12 pl-9 pr-9 bg-[#2a2218] border border-[#3d3028] rounded-xl
                text-[#f0e6d3] text-sm focus:outline-none focus:border-[#c8a96e]/60
                placeholder:text-[#4d4038]"
            />
            {isSearchMode && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#6b5e4e] hover:text-[#f0e6d3]"
              >
                <X size={16} />
              </button>
            )}
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

      {/* Notebook Tabs（検索中は非表示） */}
      {!isSearchMode && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 px-4 mb-2" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedNotebook(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedNotebook === null
                  ? 'bg-[#c8a96e] text-[#1a1410]'
                  : 'bg-[#2a2218] text-[#a89880] border border-[#3d3028]'}`}
            >
              すべて
            </button>
            {NOTEBOOKS.map(nb => (
              <button
                key={nb}
                onClick={() => setSelectedNotebook(nb)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedNotebook === nb
                    ? 'bg-[#c8a96e] text-[#1a1410]'
                    : 'bg-[#2a2218] text-[#a89880] border border-[#3d3028]'}`}
              >
                {nb}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex gap-2 px-4 mb-3">
            {TYPE_FILTERS.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSelectedType(prev => (prev === value ? null : value))}
                className={`px-2.5 py-1 rounded-full text-xs transition-all
                  ${selectedType === value
                    ? 'bg-[#c8a96e]/20 text-[#c8a96e] border border-[#c8a96e]/40'
                    : 'bg-transparent text-[#6b5e4e] border border-[#3d3028]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Notes */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* AI Summary Button */}
        {isSearchMode && displayedNotes.length > 0 && (
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
            <p className="text-[#f0e6d3] text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
          </div>
        )}

        {/* Results Count */}
        {isSearchMode && (
          <p className="text-xs text-[#6b5e4e]">
            「{keyword}」 — {displayedNotes.length}件ヒット
          </p>
        )}

        {loading || isSearching ? (
          <LoadingOverlay text="読み込み中..." />
        ) : displayedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#4d4038]">
            <p className="text-4xl mb-3">🔬</p>
            <p className="text-sm">
              {isSearchMode ? '該当する知見が見つかりません' : 'まだ知見ノートがありません'}
            </p>
          </div>
        ) : (
          displayedNotes.map(note => (
            <ResearchNoteCard
              key={note.id}
              note={note}
              onClick={() => setDetailStack([note])}
            />
          ))
        )}
      </div>

      {/* Detail Modal */}
      {detailNote && (
        <ResearchNoteDetail
          note={detailNote}
          canGoBack={detailStack.length > 1}
          onBack={() => setDetailStack(prev => prev.slice(0, -1))}
          onClose={() => setDetailStack([])}
          onWikiLink={handleWikiLink}
        />
      )}
    </div>
  )
}
