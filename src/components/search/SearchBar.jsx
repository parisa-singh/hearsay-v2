import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { trackEvent } from '../../utils/analytics'

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurant / Café' },
  { id: 'product', label: 'Product' },
  { id: 'place', label: 'Place / Hotel' },
  { id: 'business', label: 'Business / Service' },
]

export default function SearchBar({ initialValue = '', initialCategory = null, compact = false }) {
  const [value, setValue] = useState(initialValue)
  const [category, setCategory] = useState(initialCategory)
  const navigate = useNavigate()
  const addToHistory = useUIStore(s => s.addToHistory)

  const canSubmit = value.trim() !== '' && category !== null

  function handleSubmit(e) {
    e.preventDefault()
    const q = value.trim()
    if (!q || !category) return
    addToHistory(q, category)
    // GA4 custom event — this is the "how many searches" number.
    trackEvent('search', { search_term: q, category, compact })
    navigate(`/results?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex flex-col gap-3 ${compact ? '' : 'max-w-2xl mx-auto'}`}>
        {/* Category pills — 2×2 grid on mobile, flex-wrap on sm+ */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(prev => prev === c.id ? null : c.id)}
              className={`
                px-3 py-1.5 text-xs sm:text-sm rounded-full border font-medium transition-all duration-150
                ${category === c.id
                  ? 'border-transparent bg-accent text-[#04110f] font-semibold shadow-[0_0_24px_-8px_var(--glow)]'
                  : 'border-zinc-700 bg-[var(--panel)] text-[var(--ink-2)] hover:border-zinc-500 hover:text-white'
                }
              `}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Input + submit */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={compact ? 'Search again…' : 'Search for a restaurant, product, or place…'}
              className={`
                w-full pl-9 sm:pl-11 pr-3 sm:pr-4 bg-[var(--bg-3)] border border-[var(--line)] rounded-xl text-zinc-100
                placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent/50
                focus:border-transparent transition-all text-sm sm:text-base
                ${compact ? 'py-2.5' : 'py-3 sm:py-4'}
              `}
              autoComplete="off"
              autoFocus={!compact}
            />
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`
              flex-shrink-0 bg-accent text-[#04110f] font-semibold rounded-xl
              hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed
              shadow-[0_0_30px_-8px_var(--glow)] transition-all text-sm sm:text-base
              ${compact ? 'px-3 sm:px-4 py-2.5' : 'px-4 sm:px-6 py-3 sm:py-4'}
            `}
          >
            Search
          </button>
        </div>

        {/* Category required notification */}
        {value.trim() && !category && (
          <div className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-amber-950/70 border border-amber-700/70">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-amber-400">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="text-xs sm:text-sm font-medium text-amber-300">
              Select a category above to enable search
            </span>
          </div>
        )}
      </div>
    </form>
  )
}
