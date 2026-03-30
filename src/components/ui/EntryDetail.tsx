import { X, Trash2 } from 'lucide-react'
import { CategoryBadge } from './CategoryBadge'
import type { Entry } from '../../types'

interface EntryDetailProps {
  entry: Entry
  onClose: () => void
  onDelete: (id: string) => void
}

export function EntryDetail({ entry, onClose, onDelete }: EntryDetailProps) {
  const date = new Date(entry.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#1a1410]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 border-b border-[#3d3028]" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: '12px' }}>
        <button onClick={onClose} className="p-3 -ml-3 text-[#a89880] hover:text-[#f0e6d3] touch-manipulation">
          <X size={24} />
        </button>
        <span className="text-sm text-[#a89880]">{date}</span>
        <button
          onClick={() => onDelete(entry.id)}
          className="p-3 -mr-3 text-red-400 hover:text-red-300 touch-manipulation"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex items-start gap-3">
          <CategoryBadge category={entry.category} />
          {entry.genres && (
            <span className="text-xs text-[#c8a96e]">
              {entry.genres.icon} {entry.genres.name}
            </span>
          )}
        </div>

        <h2 className="text-[#f0e6d3] text-xl font-semibold leading-snug">{entry.title}</h2>

        {entry.summary && (
          <section>
            <h3 className="text-xs text-[#c8a96e] font-medium uppercase tracking-wider mb-1.5">要約</h3>
            <p className="text-[#d4c5ad] text-sm leading-relaxed">{entry.summary}</p>
          </section>
        )}

        {entry.lesson && (
          <section>
            <h3 className="text-xs text-[#c8a96e] font-medium uppercase tracking-wider mb-1.5">学び</h3>
            <p className="text-[#d4c5ad] text-sm leading-relaxed">{entry.lesson}</p>
          </section>
        )}

        {entry.book_note && (
          <section>
            <h3 className="text-xs text-[#c8a96e] font-medium uppercase tracking-wider mb-1.5">本ネタ</h3>
            <p className="text-[#d4c5ad] text-sm leading-relaxed">{entry.book_note}</p>
          </section>
        )}

        {entry.raw_text && (
          <section>
            <h3 className="text-xs text-[#6b5e4e] font-medium uppercase tracking-wider mb-1.5">元テキスト</h3>
            <p className="text-[#6b5e4e] text-xs leading-relaxed">{entry.raw_text}</p>
          </section>
        )}

        {(entry.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {(entry.tags || []).map(tag => (
              <span key={tag} className="text-sm text-[#c8a96e] bg-[#c8a96e]/10 border border-[#c8a96e]/20 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
