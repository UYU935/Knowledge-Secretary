import { X, ArrowLeft, ExternalLink } from 'lucide-react'
import { ResearchMarkdown } from './ResearchMarkdown'
import type { ResearchNote } from '../../types'
import { RESEARCH_NOTE_TYPE_LABELS } from '../../types'

interface ResearchNoteDetailProps {
  note: ResearchNote
  canGoBack: boolean
  onBack: () => void
  onClose: () => void
  onWikiLink: (target: string) => void
}

export function ResearchNoteDetail({ note, canGoBack, onBack, onClose, onWikiLink }: ResearchNoteDetailProps) {
  const date = note.created_date
    ? new Date(note.created_date + 'T00:00:00').toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
      })
    : ''
  const typeLabel =
    note.note_type && note.note_type !== 'moc' ? RESEARCH_NOTE_TYPE_LABELS[note.note_type] : null

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#1a1410]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 border-b border-[#3d3028]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)', paddingBottom: '12px' }}
      >
        {canGoBack ? (
          <button onClick={onBack} className="p-3 -ml-3 text-[#a89880] hover:text-[#f0e6d3] touch-manipulation">
            <ArrowLeft size={24} />
          </button>
        ) : (
          <span className="w-6" />
        )}
        <span className="text-sm text-[#a89880]">{date}</span>
        <button onClick={onClose} className="p-3 -mr-3 text-[#a89880] hover:text-[#f0e6d3] touch-manipulation">
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {typeLabel && (
            <span className="text-[10px] text-[#c8a96e] bg-[#c8a96e]/10 border border-[#c8a96e]/20 px-2 py-0.5 rounded-full">
              {typeLabel}
            </span>
          )}
          {(note.notebook || []).map(nb => (
            <span key={nb} className="text-xs text-[#c8a96e]">{nb}</span>
          ))}
        </div>

        <h2 className="text-[#f0e6d3] text-xl font-semibold leading-snug">{note.title}</h2>

        {note.body_md && <ResearchMarkdown markdown={note.body_md} onWikiLink={onWikiLink} />}

        {(note.sources || []).length > 0 && (
          <section className="pt-2 border-t border-[#3d3028]">
            <h3 className="text-xs text-[#6b5e4e] font-medium uppercase tracking-wider mb-2">出典</h3>
            <ul className="space-y-1.5">
              {(note.sources || []).map(src => (
                <li key={src}>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-xs text-[#a89880] hover:text-[#c8a96e] break-all"
                  >
                    <ExternalLink size={12} className="flex-shrink-0 mt-0.5" />
                    <span>{src}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(note.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 pb-4">
            {(note.tags || []).map(tag => (
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
