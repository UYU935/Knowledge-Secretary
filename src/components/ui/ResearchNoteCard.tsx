import type { ResearchNote } from '../../types'
import { RESEARCH_NOTE_TYPE_LABELS } from '../../types'

interface ResearchNoteCardProps {
  note: ResearchNote
  onClick: () => void
}

function excerpt(md: string | null): string {
  if (!md) return ''
  return md
    .replace(/^#+\s.*$/gm, '') // 見出し除去
    .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_m, dest, _p, label) => label || dest)
    .replace(/[*_`>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120)
}

export function ResearchNoteCard({ note, onClick }: ResearchNoteCardProps) {
  const date = note.created_date
    ? new Date(note.created_date + 'T00:00:00').toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : ''
  const typeLabel =
    note.note_type && note.note_type !== 'moc' ? RESEARCH_NOTE_TYPE_LABELS[note.note_type] : null

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#2a2218] border border-[#3d3028] rounded-2xl p-4 hover:border-[#c8a96e]/50 active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[#f0e6d3] font-medium text-sm leading-snug flex-1">
          {note.title}
        </span>
        {typeLabel && (
          <span className="flex-shrink-0 text-[10px] text-[#c8a96e] bg-[#c8a96e]/10 border border-[#c8a96e]/20 px-2 py-0.5 rounded-full">
            {typeLabel}
          </span>
        )}
      </div>
      {note.body_md && (
        <p className="text-[#a89880] text-xs leading-relaxed line-clamp-2 mb-2">
          {excerpt(note.body_md)}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 min-w-0">
          {(note.notebook || []).map(nb => (
            <span key={nb} className="text-xs text-[#c8a96e]/70 bg-[#c8a96e]/10 px-1.5 py-0.5 rounded">
              {nb}
            </span>
          ))}
          {(note.tags || []).slice(0, 2).map(tag => (
            <span key={tag} className="text-xs text-[#6b5e4e] bg-[#2a2218] border border-[#3d3028] px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-[#6b5e4e] flex-shrink-0">{date}</span>
      </div>
    </button>
  )
}
