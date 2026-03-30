import { useState } from 'react'
import { Plus, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import type { Genre } from '../types'

interface SettingsScreenProps {
  onAddGenre: (name: string, icon: string) => Promise<any>
  onToggleGenre: (id: string, active: boolean) => Promise<any>
  onReorderGenres: (genres: Genre[]) => Promise<void>
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
  allGenres: Genre[]
  genres?: Genre[]
}

export function SettingsScreen({
  onAddGenre,
  onToggleGenre,
  onReorderGenres,
  onError,
  onSuccess,
  allGenres,
}: SettingsScreenProps) {
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📁')
  const [isAdding, setIsAdding] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '')
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('supabase_url') || '')
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('supabase_anon_key') || '')

  async function handleAddGenre() {
    if (!newName.trim()) {
      onError('ジャンル名を入力してください')
      return
    }
    setIsAdding(true)
    const error = await onAddGenre(newName.trim(), newIcon)
    if (error) onError('追加に失敗しました: ' + error.message)
    else {
      onSuccess('ジャンルを追加しました')
      setNewName('')
      setNewIcon('📁')
    }
    setIsAdding(false)
  }

  async function handleToggle(genre: Genre) {
    const error = await onToggleGenre(genre.id, !genre.is_active)
    if (error) onError('更新に失敗しました')
    else onSuccess(genre.is_active ? '非表示にしました' : '表示しました')
  }

  function moveGenre(index: number, direction: 'up' | 'down') {
    const newGenres = [...allGenres]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newGenres.length) return
    ;[newGenres[index], newGenres[target]] = [newGenres[target], newGenres[index]]
    onReorderGenres(newGenres)
  }

  function saveApiKey() {
    if (apiKey) localStorage.setItem('anthropic_api_key', apiKey)
    else localStorage.removeItem('anthropic_api_key')
    if (supabaseUrl) localStorage.setItem('supabase_url', supabaseUrl)
    else localStorage.removeItem('supabase_url')
    if (supabaseKey) localStorage.setItem('supabase_anon_key', supabaseKey)
    else localStorage.removeItem('supabase_anon_key')
    onSuccess('設定を保存しました（ページを再読み込みすると反映されます）')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-[#c8a96e] text-2xl font-semibold">設定</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-8">
        {/* Genre Management */}
        <section>
          <h2 className="text-[#a89880] text-sm font-medium uppercase tracking-wider mb-4">ジャンル管理</h2>

          {/* Add Genre */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
              maxLength={2}
              className="w-14 h-12 text-center bg-[#2a2218] border border-[#3d3028] rounded-xl text-xl
                focus:outline-none focus:border-[#c8a96e]/60"
            />
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="新しいジャンル名"
              className="flex-1 h-12 px-3 bg-[#2a2218] border border-[#3d3028] rounded-xl text-[#f0e6d3] text-sm
                focus:outline-none focus:border-[#c8a96e]/60 placeholder:text-[#4d4038]"
            />
            <button
              onClick={handleAddGenre}
              disabled={isAdding || !newName.trim()}
              className="w-12 h-12 flex items-center justify-center bg-[#c8a96e] text-[#1a1410] rounded-xl
                disabled:opacity-40 active:scale-95 transition-all"
            >
              {isAdding ? <Spinner size="sm" /> : <Plus size={20} />}
            </button>
          </div>

          {/* Genre List */}
          <div className="space-y-2">
            {allGenres.map((genre, i) => (
              <div
                key={genre.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${genre.is_active ? 'bg-[#2a2218] border-[#3d3028]' : 'bg-[#1e1810] border-[#2a2218] opacity-50'}`}
              >
                <span className="text-xl">{genre.icon}</span>
                <span className={`flex-1 text-sm ${genre.is_active ? 'text-[#d4c5ad]' : 'text-[#6b5e4e]'}`}>
                  {genre.name}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveGenre(i, 'up')}
                    disabled={i === 0}
                    className="p-1.5 text-[#6b5e4e] hover:text-[#a89880] disabled:opacity-20"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveGenre(i, 'down')}
                    disabled={i === allGenres.length - 1}
                    className="p-1.5 text-[#6b5e4e] hover:text-[#a89880] disabled:opacity-20"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => handleToggle(genre)}
                    className="p-1.5 text-[#6b5e4e] hover:text-[#c8a96e]"
                  >
                    {genre.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Keys */}
        <section>
          <h2 className="text-[#a89880] text-sm font-medium uppercase tracking-wider mb-4">接続設定</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#6b5e4e] mb-1.5">Claude API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full h-12 px-3 pr-10 bg-[#2a2218] border border-[#3d3028] rounded-xl text-[#f0e6d3] text-sm
                    focus:outline-none focus:border-[#c8a96e]/60 placeholder:text-[#4d4038]"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5e4e]"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#6b5e4e] mb-1.5">Supabase URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="w-full h-12 px-3 bg-[#2a2218] border border-[#3d3028] rounded-xl text-[#f0e6d3] text-sm
                  focus:outline-none focus:border-[#c8a96e]/60 placeholder:text-[#4d4038]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6b5e4e] mb-1.5">Supabase Anon Key</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                placeholder="eyJxxx..."
                className="w-full h-12 px-3 bg-[#2a2218] border border-[#3d3028] rounded-xl text-[#f0e6d3] text-sm
                  focus:outline-none focus:border-[#c8a96e]/60 placeholder:text-[#4d4038]"
              />
            </div>

            <p className="text-xs text-[#4d4038]">
              ※ .envファイルに設定している場合は入力不要です。
              ここで入力した値はlocalStorageに保存されます。
            </p>

            <button
              onClick={saveApiKey}
              className="w-full h-12 bg-[#c8a96e]/20 border border-[#c8a96e]/30 text-[#c8a96e]
                rounded-xl text-sm font-medium hover:bg-[#c8a96e]/30 active:scale-[0.97] transition-all"
            >
              設定を保存
            </button>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center py-4">
          <p className="text-[#4d4038] text-xs">経験知識帳 v1.0.0</p>
          <p className="text-[#4d4038] text-xs mt-1">Powered by Claude API + Supabase</p>
        </section>
      </div>
    </div>
  )
}
