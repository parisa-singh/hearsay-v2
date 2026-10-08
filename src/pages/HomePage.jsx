import { useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import PlatformToggle from '../components/search/PlatformToggle'
import LocationBadge from '../components/search/LocationBadge'
import SearchHistorySidebar from '../components/layout/SearchHistorySidebar'
import { useUIStore } from '../store/uiStore'
import { PLATFORMS } from '../constants/platforms'

const EXAMPLE_SEARCHES = [
  { q: 'Nobu NYC', category: 'restaurant' },
  { q: 'Sony WH-1000XM5', category: 'product' },
  { q: 'Airbnb', category: 'business' },
  { q: 'ChatGPT', category: 'product' },
  { q: 'Sweetgreen', category: 'restaurant' },
]

function normalizeItem(item) {
  if (typeof item === 'string') return { q: item, category: null }
  return item
}

function itemHref(item) {
  const norm = normalizeItem(item)
  const base = `${import.meta.env.BASE_URL}results?q=${encodeURIComponent(norm.q)}`
  return norm.category ? `${base}&category=${encodeURIComponent(norm.category)}` : base
}

export default function HomePage() {
  const { searchHistory, setHistoryOpen, clearHistory } = useUIStore()
  const [confirmClear, setConfirmClear] = useState(false)
  const integratedPlatforms = PLATFORMS.filter(p => p.integrated)
  const normalizedHistory = searchHistory.map(normalizeItem)

  function handleClearHistory() {
    clearHistory()
    setConfirmClear(false)
  }

  return (
    <>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-16">
      <SearchHistorySidebar />

      {/* Hero */}
      <div className="text-center mb-6 sm:mb-10 max-w-2xl">
        <p className="font-mono text-[11px] font-medium tracking-[0.22em] text-accent uppercase mb-5">
          Cross-platform review truth
        </p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-5" style={{ letterSpacing: '-0.02em' }}>
          What are people{' '}
          <span className="italic font-medium text-accent">really</span>{' '}
          saying?
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
          Search any restaurant, product, or place. Hearsay pulls real reviews from the platforms
          people actually use in your part of the world, not just one algorithm's version.
        </p>
      </div>

      {/* Search block */}
      <div className="w-full max-w-2xl space-y-4">
        {/* Location — above search bar */}
        <div className="flex justify-center">
          <LocationBadge />
        </div>

        {/* Search bar with category pills */}
        <SearchBar />

        {/* Platform toggles — below search bar */}
        <div className="pt-1">
          <p className="text-xs text-zinc-500 text-center mb-2">Pull from</p>
          <PlatformToggle />
        </div>
      </div>

      {/* Example / recent searches */}
      {normalizedHistory.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 mb-3">Try searching for</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_SEARCHES.map(ex => (
              <a
                key={ex.q}
                href={itemHref(ex)}
                className="px-3 py-1.5 rounded-full text-sm text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all"
              >
                {ex.q}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center w-full max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-3">
            <p className="text-sm font-medium text-zinc-300">Recent searches</p>
            <button
              onClick={() => setHistoryOpen(true)}
              className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
            >
              View all →
            </button>
            {confirmClear ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="text-zinc-400">Delete all?</span>
                <button onClick={handleClearHistory} className="text-red-400 hover:text-red-300 font-medium transition-colors">Yes</button>
                <button onClick={() => setConfirmClear(false)} className="text-zinc-400 hover:text-zinc-200 transition-colors">No</button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {normalizedHistory.slice(0, 5).map(item => (
              <a
                key={item.q}
                href={itemHref(item)}
                className="px-3 py-1.5 rounded-full text-sm text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all"
              >
                {item.q}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Available platforms strip */}
      <div className="mt-6 sm:mt-12 w-full max-w-2xl">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-6 py-4">
          <p className="text-xs text-zinc-500 text-center mb-3 uppercase tracking-wider">Sources</p>
          <div className="flex items-center justify-center gap-5 flex-wrap">
            {integratedPlatforms.map(p => (
              <div key={p.id} className="flex items-center gap-1.5 opacity-50">
                <img
                  src={p.logo}
                  alt={p.displayName}
                  width={16}
                  height={16}
                  className="grayscale"
                  onError={e => { e.target.style.display = 'none' }}
                />
                <span className="text-xs text-zinc-500">{p.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </main>
    </>
  )
}
