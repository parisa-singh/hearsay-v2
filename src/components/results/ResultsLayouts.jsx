import { useState } from 'react'
import DivergenceAlert from './DivergenceAlert'
import { ComparisonBlock } from './ComparisonChart'
import ReviewTabs from './ReviewTabs'
import MediaCard from './MediaCard'
import PlatformCard from './PlatformCard'

function Divergence({ divergence, isAnyLoading }) {
  if (!divergence?.detected || isAnyLoading) return null
  return <DivergenceAlert divergence={divergence} />
}

function visibleSorted(results) {
  const score = r => (r.isError ? 2 : r.isLoading ? 1 : r.data && (r.data.rating != null || (r.data.reviews?.length ?? 0) > 0) ? 0 : 2)
  return results
    .filter(r => r.isLoading || (!r.isError && (r.data?.rating != null || (r.data?.reviews?.length ?? 0) > 0)))
    .sort((a, b) => score(a) - score(b))
}

// Balanced columns so the last row never has a lone card:
// 2 -> 2, 3 -> 3, 4 -> 2 (2+2), 5 -> 3 (3+2), 6+ -> 3.
function reviewCols(n) {
  if (n <= 1) return 1
  if (n === 2) return 2
  if (n === 3) return 3
  if (n === 4) return 2
  return 3
}

// ─── 1. Dashboard — overview, all the details at a glance ───────────────────
export function DashboardLayout({ ratedResults, successfulResults, isAnyLoading, divergence }) {
  const rows = successfulResults
    .filter(r => r.data && (r.data.rating != null || (r.data.reviews?.length ?? 0) > 0))
    .sort((a, b) => (b.data?.rating ?? -1) - (a.data?.rating ?? -1))

  return (
    <div className="space-y-4 min-w-0">
      <Divergence divergence={divergence} isAnyLoading={isAnyLoading} />
      <ComparisonBlock ratedResults={ratedResults} successfulResults={successfulResults} isAnyLoading={isAnyLoading} />

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        {rows.length === 0 && !isAnyLoading && (
          <p className="px-4 py-4 text-sm" style={{ color: 'var(--mut)' }}>No results yet.</p>
        )}
        {rows.map(({ platform, data }) => {
          const rating = data?.rating
          const link = data?.sourceUrl || null
          return (
            <div key={platform.id} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b last:border-b-0 min-w-0" style={{ borderColor: 'var(--line)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: platform.brandColor }} />
              <span className="text-sm font-medium truncate min-w-0" style={{ color: 'var(--ink)' }}>{platform.displayName}</span>
              {rating != null ? (
                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <div className="w-16 sm:w-28 h-1.5 rounded-full overflow-hidden" style={{ background: '#ffffff14' }}>
                    <div className="h-full rounded-full" style={{ width: `${(rating / 5) * 100}%`, background: platform.brandColor }} />
                  </div>
                  <span className="font-mono text-xs w-7 text-right tabular-nums" style={{ color: 'var(--ink)' }}>{Number(rating).toFixed(1)}</span>
                </div>
              ) : (
                <span className="ml-auto text-xs shrink-0" style={{ color: 'var(--mut)' }}>mentions</span>
              )}
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-medium whitespace-nowrap" style={{ color: 'var(--accent)' }}>View ↗</a>
              ) : (
                <span className="shrink-0 w-[42px]" aria-hidden="true" />
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center pt-1" style={{ color: 'var(--mut)' }}>
        This is the quick overview — switch to{' '}
        <span style={{ color: 'var(--accent)' }}>Bento</span> or{' '}
        <span style={{ color: 'var(--accent)' }}>Tabbed</span> for full reviews and more detail.
      </p>
    </div>
  )
}

// ─── 2. Tabbed — split into tabs ────────────────────────────────────────────
const TABS = [['overview', 'Overview'], ['reviews', 'Reviews'], ['media', 'Photos & Videos']]

export function TabbedLayout({ results, ratedResults, successfulResults, isAnyLoading, divergence, query, location }) {
  const [tab, setTab] = useState('overview')
  return (
    <div className="space-y-4 min-w-0">
      <Divergence divergence={divergence} isAnyLoading={isAnyLoading} />
      <div className="flex gap-1 border-b overflow-x-auto" style={{ borderColor: 'var(--line)' }}>
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all shrink-0 ${
              tab === id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            style={{ borderColor: tab === id ? 'var(--accent)' : 'transparent' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div key={tab} className="view-enter min-w-0">
        {tab === 'overview' && <ComparisonBlock ratedResults={ratedResults} successfulResults={successfulResults} isAnyLoading={isAnyLoading} />}
        {tab === 'reviews' && <ReviewTabs globalResults={results} localResults={results} query={query} location={location} />}
        {tab === 'media' && <MediaCard results={results} />}
      </div>
    </div>
  )
}

// ─── 3. Bento — all the details on one scrollable page, balanced cards ──────
export function BentoLayout({ results, ratedResults, successfulResults, isAnyLoading, divergence, query }) {
  const cards = visibleSorted(results)
  const cols = reviewCols(cards.length)

  return (
    <div className="space-y-4 min-w-0">
      <Divergence divergence={divergence} isAnyLoading={isAnyLoading} />
      <ComparisonBlock ratedResults={ratedResults} successfulResults={successfulResults} isAnyLoading={isAnyLoading} />

      <div className="hs-cards" style={{ '--cols': cols, '--cols-sm': Math.min(cols, 2) }}>
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
      </div>

      <MediaCard results={results} />
    </div>
  )
}
