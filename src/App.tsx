import { useState, useEffect } from 'react'
import { ToastContainer } from './components/ui/Toast'
import { RecordScreen } from './screens/RecordScreen'
import { ListScreen } from './screens/ListScreen'
import { SearchScreen } from './screens/SearchScreen'
import { ResearchScreen } from './screens/ResearchScreen'
import { ExportScreen } from './screens/ExportScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useGenres } from './hooks/useGenres'
import { BottomNav } from './components/BottomNav'
import { registerServiceWorker } from './lib/sw'
import type { Toast, TabId } from './types'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('record')
  const [toasts, setToasts] = useState<Toast[]>([])
  const genres = useGenres()

  useEffect(() => {
    registerServiceWorker()
  }, [])

  function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#1a1410]">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'record' && (
          <RecordScreen
            genres={genres}
            onSuccess={msg => addToast(msg, 'success')}
          />
        )}
        {activeTab === 'list' && <ListScreen />}
        {activeTab === 'search' && (
          <SearchScreen
            onSuccess={msg => addToast(msg, 'success')}
          />
        )}
        {activeTab === 'research' && (
          <ResearchScreen onError={msg => addToast(msg, 'error')} />
        )}
        {activeTab === 'export' && (
          <ExportScreen
            genres={genres}
            onSuccess={msg => addToast(msg, 'success')}
          />
        )}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App
