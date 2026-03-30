import type { Genre } from '../../types'

interface GenreTabsProps {
  genres: Genre[]
  selected: string | null
  onSelect: (id: string | null) => void
  showAll?: boolean
}

export function GenreTabs({ genres, selected, onSelect, showAll = true }: GenreTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-4 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      {showAll && (
        <button
          onClick={() => onSelect(null)}
          className={`
            flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${selected === null
              ? 'bg-[#c8a96e] text-[#1a1410]'
              : 'bg-[#2a2218] text-[#a89880] border border-[#3d3028]'
            }
          `}
        >
          すべて
        </button>
      )}
      {genres.map(genre => (
        <button
          key={genre.id}
          onClick={() => onSelect(genre.id)}
          className={`
            flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${selected === genre.id
              ? 'bg-[#c8a96e] text-[#1a1410]'
              : 'bg-[#2a2218] text-[#a89880] border border-[#3d3028]'
            }
          `}
        >
          {genre.icon && <span>{genre.icon}</span>}
          <span>{genre.name}</span>
        </button>
      ))}
    </div>
  )
}
