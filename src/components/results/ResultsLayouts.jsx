import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import DivergenceAlert from './DivergenceAlert'
import { ComparisonBlock } from './ComparisonChart'
import ReviewTabs from './ReviewTabs'
import MediaCard from './MediaCard'
import PlatformCard from './PlatformCard'

const SECTION_LABEL = 'text-xs font-semibold text-zinc-500 uppercase tracking-wider'

function Divergence({ divergence, isAnyLoading }) {
  if (!divergence?.detected || isAnyLoading) return null
  return <DivergenceAlert divergence={divergence} />
}

// ─── 1. Dashboard ─────────────────────────────────────────────────────────
export function DashboardLayout({ results, ratedResults, successfulResults, isAnyLoading, divergence, query, location }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-4 self-start space-y-4">
        <Divergence divergence={divergence} isAnyLoading={isAnyLoading} />
        <ComparisonBlock ratedResults={ratedResults} successfulResults={successfulResults} isAnyLoading={isAnyLoading} />
        <MediaCard results={results} />
      </aside>
      <section className="space-y-3 sm:space-y-4 min-w-0">
        <h2 className={SECTION_LABEL}>Reviews by platform</h2>
        <ReviewTabs globalResults={results} localResults={results} query={query} location={location} />
      </section>
    </div>
  )
}

// ─── 2. Tabbed ────────────────────────────────────────────────────────────
const TABS = [['overview', 'Overview'], ['reviews', 'Reviews'], ['media', 'Photos & Videos']]

export function TabbedLayout({ results, ratedResults, successfulResults, isAnyLoading, divergence, query, location }) {
  const [tab, setTab] = useState('overview')
  return (
    <div className="space-y-4">
      <Divergence divergence={divergence} isAnyLoading={isAnyLoading} />
      <div className="flex gap-1 border-b border-zinc-800 overflow-x-auto">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all shrink-0 ${
              tab === id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <ComparisonBlock ratedResults={ratedResults} successfulResults={successfulResults} isAnyLoading={isAnyLoading} />
      )}
      {tab === 'reviews' && (
        <ReviewTabs globalResults={results} localResults={results} query={query} location={location} />
      )}
      {tab === 'media' && <MediaCard results={results} />}
    </div>
  )
}

// ─── 3. Bento ─────────────────────────────────────────────────────────────
// Literal class strings so Tailwind's JIT picks them up (no runtime concat).
const BENTO_GRID = {
  compact: 'grid grid-cols-2 md:grid-cols-4 gap-3 items-start',
  comfy: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start',
  airy: 'grid grid-cols-1 sm:grid-cols-2 gap-6 items-start',
}
const BENTO_HERO = {
  compact: 'col-span-2',
  comfy: 'col-span-full',
  airy: 'col-span-full',
}

function bentoVisible(results) {
  const score = r => (r.isError ? 2 : r.isLoading ? 1 : r.data && (r.data.rating != null || (r.data.reviews?.length ?? 0) > 0) ? 0 : 2)
  return results
    .filter(r => r.isLoading || (!r.isError && (r.data?.rating != null || (r.data?.reviews?.length ?? 0) > 0)))
    .sort((a, b) => score(a) - score(b))
}

export function BentoLayout({ results, ratedResults, successfulResults, isAnyLoading, divergence, query }) {
  const density = useUIStore(s => s.bentoDensity)
  const grid = BENTO_GRID[density] ?? BENTO_GRID.comfy
  const hero = BENTO_HERO[density] ?? BENTO_HERO.comfy
  const cards = bentoVisible(results)

  return (
    <div className={grid}>
      {divergence?.detected && !isAnyLoading && (
        <div className={hero}><DivergenceAlert divergence={divergence} /></div>
      )}

      {(ratedResults.length >= 2 || (!isAnyLoading && successfulResults.length > 0)) && (
        <div className={hero}>
          <ComparisonBlock ratedResults={ratedResults} successfulResults={successfulResults} isAnyLoading={isAnyLoading} />
        </div>
      )}

      {cards.map(({ platform, data, isLoading, isError, error }) => (
        <PlatformCard
          key={platform.id}
          platformId={platform.id}
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
          query={query}
        />
      ))}

      <div className={hero}><MediaCard results={results} /></div>
    </div>
  )
}
