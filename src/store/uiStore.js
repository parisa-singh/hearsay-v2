import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PLATFORMS } from '../constants/platforms'

const defaultEnabled = new Set(
  PLATFORMS.filter(p => p.defaultEnabled).map(p => p.id)
)

// Handles old string format from v0 storage
function normalizeHistoryItem(item) {
  if (typeof item === 'string') return { q: item, category: null }
  return item
}

export const useUIStore = create(
  persist(
    (set, get) => ({
      // Platform toggles
      selectedPlatforms: defaultEnabled,
      togglePlatform: (id) => {
        const current = new Set(get().selectedPlatforms)
        if (current.has(id)) {
          current.delete(id)
        } else {
          current.add(id)
        }
        set({ selectedPlatforms: current })
      },
      isPlatformEnabled: (id) => get().selectedPlatforms.has(id),

      // Search history (last 20) — items are {q, category}
      searchHistory: [],
      addToHistory: (q, category = null) => {
        const history = get().searchHistory
          .map(normalizeHistoryItem)
          .filter(item => item.q !== q)
        set({ searchHistory: [{ q, category }, ...history].slice(0, 20) })
      },
      removeFromHistory: (q) => {
        set({ searchHistory: get().searchHistory.filter(item => normalizeHistoryItem(item).q !== q) })
      },
      clearHistory: () => set({ searchHistory: [] }),

      // History sidebar
      historyOpen: false,
      setHistoryOpen: (open) => set({ historyOpen: open }),

      // Theme (kept for persistence compatibility — toggle removed from UI)
      theme: 'dark',

      // Location
      location: null,
      setLocation: (loc) => set({ location: loc }),
      clearLocation: () => set({ location: null }),

      // Results view preference (per-visitor, persisted)
      resultsLayout: 'tabbed',   // 'dashboard' | 'tabbed' | 'bento'
      setResultsLayout: (layout) => set({ resultsLayout: layout }),
      bentoDensity: 'comfy',     // 'compact' | 'comfy' | 'airy'
      setBentoDensity: (density) => set({ bentoDensity: density }),

      // Intro animation playback (not persisted) — replayable from the header
      introPlaying: false,
      setIntroPlaying: (v) => set({ introPlaying: v }),
    }),
    {
      name: 'hearsay-ui',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          persistedState.searchHistory = (persistedState.searchHistory ?? []).map(normalizeHistoryItem)
        }
        return persistedState
      },
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        theme: state.theme,
        location: state.location,
        resultsLayout: state.resultsLayout,
        bentoDensity: state.bentoDensity,
      }),
    }
  )
)
