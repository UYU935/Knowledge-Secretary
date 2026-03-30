import { CategoryBadge } from './CategoryBadge'
import type { Entry } from '../../types'

interface EntryCardProps {
  entry: Entry
  onClick: () => void
}

export function EntryCard({ entry, onClick }: EntryCardProps) {
  const date = new Date(entry.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#2a2218] border border-[#3d3028] rounded-2xl p-4 hover:border-[#c8a96e]/50 active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[#f0e6d3] font-medium text-sm leading-snug flex-1">
          {entry.title}
        </span>
        <CategoryBadge category={entry.category} />
      </div>
      {entry.summary && (
        <p className="text-[#a89880] text-xs leading-relaxed line-clamp-2 mb-2">
          {entry.summary}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {(entry.tags || []).slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-[#c8a96e]/70 bg-[#c8a96e]/10 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-[#6b5e4e]">{date}</span>
      </div>
    </button>
  )
}
