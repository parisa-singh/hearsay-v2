import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'

const LAYOUTS = [
  ['dashboard', 'Dashboard'],
  ['tabbed', 'Tabbed'],
  ['bento', 'Bento grid'],
]
const DENSITIES = [
  ['compact', 'Compact'],
  ['comfy', 'Comfortable'],
  ['airy', 'Airy'],
]

function Check() {
  return (
    <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function ResultsViewMenu() {
  const [open, setOpen] = useState(false)
  const resultsLayout = useUIStore(s => s.resultsLayout)
  const setResultsLayout = useUIStore(s => s.setResultsLayout)
  const bentoDensity = useUIStore(s => s.bentoDensity)
  const setBentoDensity = useUIStore(s => s.setBentoDensity)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="View settings"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-40 w-52 rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl">
            <div className="px-2 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              View as
            </div>
            {LAYOUTS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setResultsLayout(id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-left transition-colors ${
                  resultsLayout === id ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {label}
                {resultsLayout === id && <Check />}
              </button>
            ))}

            {resultsLayout === 'bento' && (
              <>
                <div className="my-1 border-t border-zinc-800" />
                <div className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Density
                </div>
                {DENSITIES.map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setBentoDensity(id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-left transition-colors ${
                      bentoDensity === id ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    {label}
                    {bentoDensity === id && <Check />}
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
