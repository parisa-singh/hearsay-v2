import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import ResultsViewSwitcher from '../components/results/ResultsViewSwitcher'
import { DashboardLayout, TabbedLayout, BentoLayout } from '../components/results/ResultsLayouts'
import { useAllPlatforms } from '../hooks/useAllPlatforms'
import { useUIStore } from '../store/uiStore'
import { calculateDivergence } from '../utils/divergence'

export default function ResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? null
  const location = useUIStore(s => s.location)
  const addToHistory = useUIStore(s => s.addToHistory)
  const resultsLayout = useUIStore(s => s.resultsLayout)

  const [refreshCount, setRefreshCount] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (query) addToHistory(query, category)
  }, [query, category, addToHistory])

  const { results, isAnyLoading, successfulResults } = useAllPlatforms(query, category, refreshCount)
  const ratedResults = successfulResults.filter(r => r.data?.rating != null)
  const divergence = calculateDivergence(successfulResults)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }
  function handleRefresh() {
    setRefreshCount(c => c + 1)
  }

  const layoutProps = { results, ratedResults, successfulResults, isAnyLoading, divergence, query, location }
  const Layout = resultsLayout === 'tabbed' ? TabbedLayout
    : resultsLayout === 'bento' ? BentoLayout
    : DashboardLayout

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 sm:py-8">
      <div className="lg:flex lg:gap-6">
        {/* Floating view switcher — dropped down to line up with the view content */}
        <div className="mb-4 lg:mb-0 lg:w-40 lg:shrink-0 lg:sticky lg:top-28 lg:self-start lg:mt-[200px]">
          <ResultsViewSwitcher />
        </div>

        <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          {/* Search */}
          <div className="max-w-2xl">
            <SearchBar initialValue={query} initialCategory={category} compact />
          </div>

          {/* Header + toolbar */}
          <header className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold text-white break-words">
                What people are saying about{' '}
                <span className="text-zinc-400">"{query}"</span>
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {isAnyLoading
                  ? 'Fetching reviews across platforms…'
                  : `${successfulResults.length} platform${successfulResults.length !== 1 ? 's' : ''} returned results`}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {!isAnyLoading && (
                <button
                  onClick={handleRefresh}
                  title="Refresh all platforms"
                  aria-label="Refresh all platforms"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
              )}

              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-lg border transition-all ${
                  copied
                    ? 'border-green-700/50 bg-green-950/30 text-green-400'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                    Share
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Selected view — animates in on each switch */}
          <div key={resultsLayout} className="view-enter min-w-0">
            <Layout {...layoutProps} />
          </div>
        </div>
      </div>
    </main>
  )
}
