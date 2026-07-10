import { useState, useEffect } from 'react'
import { ToastContainer } from './components/ui/Toast'
import { RecordScreen } from './screens/RecordScreen'
import { ListScreen } from './screens/ListScreen'
import { SearchScreen } from './screens/SearchScreen'
import { ResearchScreen } from './screens/ResearchScreen'
import { ExportScreen } from './screens/ExportScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useGenres } from './hooks/useGenres'
import { useAllGenres } from './hooks/useAllGenres'
import { BottomNav } from './components/BottomNav'
import { ErrorBoundary } from './components/ErrorBoundary'
import { registerServiceWorker } from './lib/sw'
import { resetSupabaseClient } from './lib/supabase'
import type { Toast, TabId, Genre } from './types'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('record')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [listRefreshKey, setListRefreshKey] = useState(0)

  const { genres, addGenre, toggleGenre, updateSortOrder } = useGenres()
  const { allGenres, refetch: refetchAllGenres } = useAllGenres()

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

  async function handleAddGenre(name: string, icon: string) {
    const err = await addGenre(name, icon)
    await refetchAllGenres()
    return err
  }

  async function handleToggleGenre(id: string, active: boolean) {
    const err = await toggleGenre(id, active)
    await refetchAllGenres()
    return err
  }

  async function handleReorderGenres(reordered: Genre[]) {
    await updateSortOrder(reordered)
    await refetchAllGenres()
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen w-full bg-[#1a1410]">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'record' && (
            <RecordScreen
              genres={genres}
              onSuccess={() => {
                setListRefreshKey(k => k + 1)
                addToast('記録しました', 'success')
              }}
              onError={msg => addToast(msg, 'error')}
            />
          )}
          {activeTab === 'list' && (
            <ListScreen
              genres={genres}
              onError={msg => addToast(msg, 'error')}
              onSuccess={msg => addToast(msg, 'success')}
              refreshKey={listRefreshKey}
            />
          )}
          {activeTab === 'search' && (
            <SearchScreen
              genres={genres}
              onError={msg => addToast(msg, 'error')}
              onSuccess={msg => addToast(msg, 'success')}
            />
          )}
          {activeTab === 'research' && (
            <ResearchScreen onError={msg => addToast(msg, 'error')} />
          )}
          {activeTab === 'export' && (
            <ExportScreen
              genres={genres}
              onError={msg => addToast(msg, 'error')}
              onSuccess={msg => addToast(msg, 'success')}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsScreen
              allGenres={allGenres}
              onAddGenre={handleAddGenre}
              onToggleGenre={handleToggleGenre}
              onReorderGenres={handleReorderGenres}
              onError={msg => addToast(msg, 'error')}
              onSuccess={msg => {
                resetSupabaseClient()
                addToast(msg, 'success')
              }}
            />
          )}
        </main>

        {/* Bottom Nav */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onRemove={id => setToasts(prev => prev.filter(t => t.id !== id))} />
      </div>
    </ErrorBoundary>
  )
}

export default App
