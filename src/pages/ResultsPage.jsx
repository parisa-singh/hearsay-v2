import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import DivergenceAlert from '../components/results/DivergenceAlert'
import ReviewTabs from '../components/results/ReviewTabs'
import ComparisonChart from '../components/results/ComparisonChart'
import MediaCard from '../components/results/MediaCard'
import { useAllPlatforms } from '../hooks/useAllPlatforms'
import { useUIStore } from '../store/uiStore'
import { calculateDivergence } from '../utils/divergence'

export default function ResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? null
  const { location, addToHistory } = useUIStore()

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
    })
  }

  function handleRefresh() {
    setRefreshCount(c => c + 1)
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Compact search bar */}
      <div className="max-w-2xl">
        <SearchBar initialValue={query} initialCategory={category} compact />
      </div>

      {/* Header: query + compact toolbar */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-semibold text-white">
            What people are saying about{' '}
            <span className="text-zinc-400">"{query}"</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isAnyLoading
              ? 'Fetching reviews across platforms…'
              : `${successfulResults.length} platform${successfulResults.length !== 1 ? 's' : ''} returned results`}
          </p>
        </div>

        {/* Toolbar: refresh + share, grouped */}
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

      {/* Divergence alert */}
      {divergence.detected && !isAnyLoading && (
        <DivergenceAlert divergence={divergence} />
      )}

      {/* Platform comparison chart — shows as soon as 2 ratings are in,
          then fills in progressively (not gated on the slowest platform). */}
      {ratedResults.length >= 2 && (
        <ComparisonChart results={ratedResults} />
      )}

      {/* Honest low-coverage note: results exist but too few numeric ratings to compare */}
      {!isAnyLoading && successfulResults.length > 0 && ratedResults.length < 2 && (
        <p className="text-xs text-zinc-500 border border-zinc-800 rounded-lg px-4 py-3">
          Only {ratedResults.length} platform{ratedResults.length !== 1 ? 's' : ''} returned a
          numeric rating — at least 2 are needed to show the comparison. The reviews below still apply.
        </p>
      )}

      {/* Reviews by platform — the evidence */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Reviews by platform
        </h2>
        <ReviewTabs
          globalResults={results}
          localResults={results}
          query={query}
          location={location}
        />
      </section>

      {/* Media — supporting photos & videos, at the bottom */}
      <MediaCard results={results} />
    </main>
  )
}
