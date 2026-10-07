import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// The radar is a single comparison shape, so it gets one accent color.
// Per-platform brand colors live in the bar comparison beside it.
const RADAR_COLOR = '#34d399' // emerald-400

function fmtCount(n) {
  if (n == null) return null
  return `${Number(n).toLocaleString()} reviews`
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-zinc-200 font-medium">{d.platform}</div>
      <div className="text-zinc-400">
        {Number(d.rating).toFixed(1)} / 5{d.count ? ` · ${d.count}` : ''}
      </div>
    </div>
  )
}

export default function ComparisonChart({ results }) {
  const [open, setOpen] = useState(true)
  const [infoOpen, setInfoOpen] = useState(false)

  const rated = results.filter(r => r.data?.rating != null && !r.isError)
  if (rated.length < 2) return null

  const sorted = [...rated].sort((a, b) => b.data.rating - a.data.rating)
  const showRadar = rated.length >= 3 // a radar needs >=3 axes to read as a shape
  const radarData = rated.map(r => ({
    platform: r.platform.displayName,
    rating: Number(r.data.rating),
    count: fmtCount(r.data.reviewCount),
  }))

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="w-full flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setOpen(o => !o)}
            className="text-sm font-semibold text-zinc-400 uppercase tracking-wider text-left hover:text-zinc-200 transition-colors"
          >
            Platform Comparison
          </button>

          {/* Info popover */}
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setInfoOpen(v => !v)}
              aria-label="What does this comparison show?"
              aria-expanded={infoOpen}
              className="text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
            {infoOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setInfoOpen(false)} />
                <div
                  role="tooltip"
                  className="absolute left-0 top-7 z-20 w-64 sm:w-72 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs leading-relaxed text-zinc-300 shadow-xl normal-case tracking-normal font-normal"
                >
                  Each bar is a platform's <span className="text-zinc-100 font-medium">average rating</span> for
                  this search, side by side. The gaps are the point: the same place can score very
                  differently across platforms because each has a different audience and review style —
                  tourists vs. locals, curated vs. candid. When two platforms differ by{' '}
                  <span className="text-zinc-100 font-medium">1.5★ or more</span>, Hearsay flags it as a
                  divergence. Only platforms that report a numeric rating appear here.
                </div>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Collapse comparison' : 'Expand comparison'}
          className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

      {open && (
        <div className="px-3 sm:px-6 pb-5 sm:pb-6 pt-1">
          {/* Balanced pair: capped bars + radar, side by side, wrap when narrow */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            {/* Bars — interactive */}
            <div className="flex-1 min-w-[200px] max-w-[340px] flex flex-col gap-2.5">
              {sorted.map(r => (
                <div
                  key={r.platform.id}
                  tabIndex={0}
                  title={`${r.platform.displayName} · ${Number(r.data.rating).toFixed(1)}★${r.data.reviewCount ? ` · ${fmtCount(r.data.reviewCount)}` : ''}`}
                  className="group relative flex items-center gap-3 rounded-md outline-none"
                >
                  <span className="w-16 sm:w-24 text-right text-xs text-zinc-400 truncate group-hover:text-zinc-100 group-focus:text-zinc-100 transition-colors">
                    {r.platform.displayName}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 group-hover:brightness-125 group-focus:brightness-125"
                      style={{ width: `${(r.data.rating / 5) * 100}%`, backgroundColor: r.platform.brandColor }}
                    />
                  </div>
                  <span className="w-8 text-xs font-semibold text-zinc-200 tabular-nums">
                    {Number(r.data.rating).toFixed(1)}
                  </span>

                  {/* hover tooltip */}
                  <div className="pointer-events-none absolute right-0 bottom-full mb-1.5 hidden group-hover:block group-focus:block z-20">
                    <div className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap shadow-xl">
                      {r.platform.displayName} · {Number(r.data.rating).toFixed(1)}★
                      {r.data.reviewCount ? ` · ${fmtCount(r.data.reviewCount)}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Radar — interactive (only at >=3 platforms) */}
            {showRadar && (
              <div className="w-[200px] shrink-0">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 16, bottom: 10, left: 16 }}>
                    <PolarGrid stroke="#3f3f46" />
                    <PolarAngleAxis dataKey="platform" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke={RADAR_COLOR}
                      fill={RADAR_COLOR}
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={{ r: 3.5, strokeWidth: 0, fill: RADAR_COLOR }}
                      activeDot={{ r: 5, stroke: '#09090b', strokeWidth: 2 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Low-coverage note, shown when results exist but fewer than 2 have a numeric rating.
export function LowCoverageNote({ count }) {
  return (
    <p className="text-xs text-zinc-500 border border-zinc-800 rounded-lg px-4 py-3">
      Only {count} platform{count !== 1 ? 's' : ''} returned a numeric rating — at least 2 are needed
      to show the comparison. The reviews below still apply.
    </p>
  )
}

// Shared block: the comparison when it qualifies, otherwise the honest note.
export function ComparisonBlock({ ratedResults, successfulResults, isAnyLoading }) {
  if (ratedResults.length >= 2) return <ComparisonChart results={ratedResults} />
  if (!isAnyLoading && successfulResults.length > 0) {
    return <LowCoverageNote count={ratedResults.length} />
  }
  return null
}
