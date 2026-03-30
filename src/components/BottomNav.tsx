import { BookOpen, List, Search, Download, Settings } from 'lucide-react'
import type { TabId } from '../types'

const tabs: { id: TabId; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'record', label: '記録', Icon: BookOpen },
  { id: 'list', label: '一覧', Icon: List },
  { id: 'search', label: '検索', Icon: Search },
  { id: 'export', label: 'エクスポート', Icon: Download },
  { id: 'settings', label: '設定', Icon: Settings },
]

interface BottomNavProps {
  active: TabId
  onChange: (id: TabId) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30
        bg-[#1a1410]/95 backdrop-blur-sm border-t border-[#3d3028]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`
              flex-1 flex flex-col items-center gap-1 py-3 min-h-[56px] transition-colors
              ${active === id ? 'text-[#c8a96e]' : 'text-[#6b5e4e]'}
            `}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
