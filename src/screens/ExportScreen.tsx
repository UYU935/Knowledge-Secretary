import { useState } from 'react'
import { Download } from 'lucide-react'
import { getSupabaseClient } from '../lib/supabase'
import { Spinner } from '../components/ui/Spinner'
import type { Genre, Entry } from '../types'

type EntryWithGenre = Omit<Entry, 'genres'> & { genres: { name: string; slug: string } | null }

type PeriodType = 'all' | 'this_month' | 'last_month' | 'custom'
type FormatType = 'csv' | 'json'

interface ExportScreenProps {
  genres: Genre[]
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
}

function getPeriodRange(period: PeriodType, from?: string, to?: string): { from: Date | null; to: Date | null } {
  const now = new Date()
  if (period === 'this_month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    }
  }
  if (period === 'last_month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    }
  }
  if (period === 'custom' && from && to) {
    return { from: new Date(from), to: new Date(to + 'T23:59:59') }
  }
  return { from: null, to: null }
}

export function ExportScreen({ genres, onError, onSuccess }: ExportScreenProps) {
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set())
  const [period, setPeriod] = useState<PeriodType>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [format, setFormat] = useState<FormatType>('csv')
  const [isExporting, setIsExporting] = useState(false)

  function toggleGenre(id: string) {
    setSelectedGenres(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const client = getSupabaseClient()
      let query = client.from('entries').select('*, genres(name, slug)').order('created_at', { ascending: false })

      if (selectedGenres.size > 0) {
        query = query.in('genre_id', Array.from(selectedGenres))
      }

      const { from, to } = getPeriodRange(period, customFrom, customTo)
      if (from) query = query.gte('created_at', from.toISOString())
      if (to) query = query.lte('created_at', to.toISOString())

      const { data, error } = await query
      if (error) throw error
      if (!data || data.length === 0) {
        onError('対象データがありません')
        return
      }

      const genreSlug = selectedGenres.size === 1
        ? genres.find(g => selectedGenres.has(g.id))?.slug || 'all'
        : selectedGenres.size > 1 ? 'multiple' : 'all'
      const now = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const filename = `knowledge_${genreSlug}_${now}.${format}`

      if (format === 'csv') {
        const header = '日付,ジャンル,タイトル,カテゴリ,要約,学び,本ネタ,タグ'
        const rows = (data as EntryWithGenre[]).map(e => [
          new Date(e.created_at).toLocaleDateString('ja-JP'),
          e.genres?.name || '',
          e.title, e.category,
          e.summary || '', e.lesson || '', e.book_note || '',
          (e.tags || []).join(' '),
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        const csv = '\uFEFF' + [header, ...rows].join('\n')
        download(filename, csv, 'text/csv;charset=utf-8')
      } else {
        const json = JSON.stringify(data, null, 2)
        download(filename, json, 'application/json')
      }

      onSuccess(`${data.length}件をエクスポートしました`)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-[#c8a96e] text-2xl font-semibold mb-1">エクスポート</h1>
        <p className="text-[#6b5e4e] text-xs">データをCSV/JSONでダウンロード</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
        {/* Genre Selection */}
        <section>
          <h2 className="text-[#a89880] text-sm font-medium mb-3">ジャンル選択（複数可）</h2>
          <div className="space-y-2">
            {genres.map(genre => (
              <label key={genre.id} className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                  ${selectedGenres.has(genre.id) ? 'bg-[#c8a96e] border-[#c8a96e]' : 'border-[#4d4038]'}`}>
                  {selectedGenres.has(genre.id) && <span className="text-[#1a1410] text-xs font-bold">✓</span>}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedGenres.has(genre.id)}
                  onChange={() => toggleGenre(genre.id)}
                />
                <span className="text-sm text-[#d4c5ad]">{genre.icon} {genre.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-[#4d4038] mt-2">未選択の場合はすべてのジャンルが対象</p>
        </section>

        {/* Period */}
        <section>
          <h2 className="text-[#a89880] text-sm font-medium mb-3">期間</h2>
          <div className="grid grid-cols-2 gap-2">
            {([['all', '全期間'], ['this_month', '今月'], ['last_month', '先月'], ['custom', 'カスタム']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setPeriod(val)}
                className={`h-11 rounded-xl text-sm font-medium transition-all
                  ${period === val ? 'bg-[#c8a96e] text-[#1a1410]' : 'bg-[#2a2218] border border-[#3d3028] text-[#a89880]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div className="flex gap-2 mt-3">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="flex-1 h-11 px-3 bg-[#2a2218] border border-[#3d3028] rounded-xl text-[#f0e6d3] text-sm
                  focus:outline-none focus:border-[#c8a96e]/60" />
              <span className="flex items-center text-[#6b5e4e]">〜</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="flex-1 h-11 px-3 bg-[#2a2218] border border-[#3d3028] rounded-xl text-[#f0e6d3] text-sm
                  focus:outline-none focus:border-[#c8a96e]/60" />
            </div>
          )}
        </section>

        {/* Format */}
        <section>
          <h2 className="text-[#a89880] text-sm font-medium mb-3">形式</h2>
          <div className="flex gap-2">
            {(['csv', 'json'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 h-11 rounded-xl text-sm font-medium transition-all uppercase
                  ${format === f ? 'bg-[#c8a96e] text-[#1a1410]' : 'bg-[#2a2218] border border-[#3d3028] text-[#a89880]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Download Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full h-14 flex items-center justify-center gap-2.5 rounded-2xl
            bg-gradient-to-r from-[#c8a96e] to-[#a88b52] text-[#1a1410]
            font-semibold text-base disabled:opacity-40 active:scale-[0.97] transition-all
            shadow-lg shadow-[#c8a96e]/20"
        >
          {isExporting ? <Spinner size="sm" /> : <Download size={20} />}
          <span>ダウンロード</span>
        </button>
      </div>
    </div>
  )
}
