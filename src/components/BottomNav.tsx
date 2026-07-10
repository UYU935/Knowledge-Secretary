import { BookOpen, List, Search, FlaskConical, Download, Settings } from 'lucide-react'
import type { TabId } from '../types'

const tabs: { id: TabId; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'record', label: '記録', Icon: BookOpen },
  { id: 'list', label: '一覧', Icon: List },
  { id: 'search', label: '検索', Icon: Search },
  { id: 'research', label: '研究', Icon: FlaskConical },
  { id: 'export', label: 'エクスポート', Icon: Download },
  { id: 'settings', label: '設定', Icon: Settings },
]

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around h-16 border-t border-[#3d3028] bg-[#1a1410]">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
            activeTab === id
              ? 'text-[#c8a96e]'
              : 'text-[#6b5e4e] hover:text-[#a89880]'
          }`}
        >
          <Icon size={24} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
