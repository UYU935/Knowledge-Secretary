import { useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/ui/Toast'
import { RecordScreen } from './screens/RecordScreen'
import { ListScreen } from './screens/ListScreen'
import { SearchScreen } from './screens/SearchScreen'
import { ExportScreen } from './screens/ExportScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useGenres } from './hooks/useGenres'
import { useToast } from './hooks/useToast'
import { getSupabaseClient, isSupabaseConfigured, resetSupabaseClient } from './lib/supabase'
import type { TabId, Genre } from './types'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('record')
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const { genres, allGenres, addGenre, toggleGenre, updateSortOrder } = useGenresWithAll()
  const { toasts, addToast, removeToast } = useToast()

  function handleRecordSuccess() {
    addToast('✅ 記録しました', 'success')
    setListRefreshKey(k => k + 1)
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col" style={{ height: '100svh', background: '#1a1410' }}>
        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative" style={{ paddingBottom: '72px' }}>
          <div className="h-full overflow-y-auto">
            {activeTab === 'record' && (
              <RecordScreen
                genres={genres}
                onSuccess={handleRecordSuccess}
                onError={msg => addToast(msg, 'error')}
              />
            )}
            {activeTab === 'list' && (
              <ListScreen
                genres={genres}
                refreshKey={listRefreshKey}
                onError={msg => addToast(msg, 'error')}
                onSuccess={msg => addToast(msg, 'success')}
              />
            )}
            {activeTab === 'search' && (
              <SearchScreen
                genres={genres}
                onError={msg => addToast(msg, 'error')}
                onSuccess={msg => addToast(msg, 'success')}
              />
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
                onAddGenre={addGenre}
                onToggleGenre={toggleGenre}
                onReorderGenres={updateSortOrder}
                onError={msg => addToast(msg, 'error')}
                onSuccess={(msg) => {
                  resetSupabaseClient()
                  addToast(msg, 'success')
                }}
              />
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav active={activeTab} onChange={setActiveTab} />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ErrorBoundary>
  )
}

function useGenresWithAll() {
  const { genres, loading, refetch, addGenre, toggleGenre, updateSortOrder } = useGenres()
  const [allGenresState, setAllGenresState] = useState<Genre[]>([])

  const fetchAll = async () => {
    if (!isSupabaseConfigured()) return
    try {
      const client = getSupabaseClient()
      const { data } = await client.from('genres').select('*').order('sort_order')
      if (data) setAllGenresState(data as Genre[])
    } catch {
      // ignore
    }
  }

  const wrappedRefetch = async () => {
    await refetch()
    await fetchAll()
  }

  const wrappedAddGenre = async (name: string, icon: string) => {
    const error = await addGenre(name, icon)
    await fetchAll()
    return error
  }

  const wrappedToggle = async (id: string, active: boolean) => {
    const error = await toggleGenre(id, active)
    await fetchAll()
    return error
  }

  const wrappedReorder = async (reordered: Genre[]) => {
    await updateSortOrder(reordered)
    setAllGenresState(reordered)
  }

  if (allGenresState.length === 0 && genres.length > 0) {
    fetchAll()
  }

  return {
    genres,
    allGenres: allGenresState.length > 0 ? allGenresState : genres,
    loading,
    refetch: wrappedRefetch,
    addGenre: wrappedAddGenre,
    toggleGenre: wrappedToggle,
    updateSortOrder: wrappedReorder,
  }
}

export default App
