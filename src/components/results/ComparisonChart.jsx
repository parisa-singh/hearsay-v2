import { useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// The radar is a single comparison shape, so it gets one accent color.
// Per-platform brand colors live in the bar comparison below it.
const RADAR_COLOR = '#34d399' // emerald-400

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-zinc-400">{label}</div>
      <div className="text-zinc-200 font-medium">{Number(payload[0].value).toFixed(1)} / 5</div>
    </div>
  )
}

export default function ComparisonChart({ results }) {
  // Expanded by default — the comparison is the point of the page.
  const [open, setOpen] = useState(true)

  const rated = results.filter(r => r.data?.rating != null && !r.isError)
  if (rated.length < 2) return null

  const sorted = [...rated].sort((a, b) => b.data.rating - a.data.rating)
  // A radar needs >=3 axes to read as a shape; with 2 it degenerates to a sliver.
  const showRadar = rated.length >= 3
  const radarData = rated.map(r => ({
    platform: r.platform.displayName,
    rating: Number(r.data.rating),
  }))

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Platform Comparison
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-1">
          {/* Bar comparison — primary visual, correct at any count >= 2 */}
          <div className="space-y-2">
            {sorted.map(r => (
              <div key={r.platform.id} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-16 sm:w-24 text-right truncate">
                  {r.platform.displayName}
                </span>
                <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(r.data.rating / 5) * 100}%`,
                      backgroundColor: r.platform.brandColor,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-200 w-8">
                  {Number(r.data.rating).toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          {/* Radar — secondary, only when >=3 platforms, as ONE series */}
          {showRadar && (
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis
                    dataKey="platform"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 5]}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                  />
                  <Radar
                    name="Rating"
                    dataKey="rating"
                    stroke={RADAR_COLOR}
                    fill={RADAR_COLOR}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
