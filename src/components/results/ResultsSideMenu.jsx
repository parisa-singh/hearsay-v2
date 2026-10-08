import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

const VIEWS = [
  ['dashboard', 'Dashboard', 'Compact index + links'],
  ['tabbed', 'Tabbed', 'One section at a time'],
  ['bento', 'Bento', 'Modular tiles'],
]
const DENS = [['compact', 'Compact'], ['comfy', 'Comfortable'], ['airy', 'Airy']]

export default function ResultsSideMenu() {
  const [open, setOpen] = useState(false)
  const layout = useUIStore(s => s.resultsLayout)
  const setLayout = useUIStore(s => s.setResultsLayout)
  const density = useUIStore(s => s.bentoDensity)
  const setDensity = useUIStore(s => s.setBentoDensity)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex items-center gap-2 h-8 px-3 rounded-lg border text-xs font-medium transition-colors hover:text-white"
        style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Views
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: 'rgba(4,5,9,.6)' }} onClick={() => setOpen(false)} />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-64 max-w-[82vw] p-5 overflow-y-auto"
            style={{ background: 'linear-gradient(180deg,#0a0c13,#06070b)', borderRight: '1px solid var(--line)', animation: 'slideInLeft .25s ease' }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-lg font-semibold" style={{ color: 'var(--ink)' }}>
                hear<span style={{ color: 'var(--accent)' }}>say</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-lg leading-none" style={{ color: 'var(--mut)' }}>✕</button>
            </div>

            <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--mut)' }}>View</div>
            <div className="flex flex-col gap-1 mb-6">
              {VIEWS.map(([id, name, desc]) => (
                <button
                  key={id}
                  onClick={() => setLayout(id)}
                  className="text-left rounded-lg px-3 py-2 transition-colors"
                  style={layout === id ? { background: '#4df0d014', border: '1px solid #4df0d040' } : { border: '1px solid transparent' }}
                >
                  <div className="text-sm font-medium" style={{ color: layout === id ? 'var(--ink)' : 'var(--ink-2)' }}>{name}</div>
                  <div className="text-[11px]" style={{ color: 'var(--mut)' }}>{desc}</div>
                </button>
              ))}
            </div>

            {layout === 'bento' && (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--mut)' }}>Density</div>
                <div className="flex gap-1.5 mb-6">
                  {DENS.map(([id, name]) => (
                    <button
                      key={id}
                      onClick={() => setDensity(id)}
                      className="flex-1 text-xs rounded-md py-1.5 transition-colors"
                      style={density === id ? { background: 'var(--accent)', color: '#04110f', fontWeight: 600 } : { border: '1px solid var(--line)', color: 'var(--ink-2)' }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--mut)' }}>Navigate</div>
            <nav className="flex flex-col gap-0.5">
              <Link to="/" onClick={() => setOpen(false)} className="text-sm rounded-lg px-3 py-2 hover:text-white" style={{ color: 'var(--ink-2)' }}>Home</Link>
              <Link to="/about" onClick={() => setOpen(false)} className="text-sm rounded-lg px-3 py-2 hover:text-white" style={{ color: 'var(--ink-2)' }}>About</Link>
              <a href="https://github.com/parisa-singh/hearsay-v2" target="_blank" rel="noopener noreferrer" className="text-sm rounded-lg px-3 py-2 hover:text-white" style={{ color: 'var(--ink-2)' }}>GitHub ↗</a>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}
