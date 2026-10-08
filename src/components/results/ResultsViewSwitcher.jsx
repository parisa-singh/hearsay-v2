import { useUIStore } from '../../store/uiStore'

const VIEWS = [
  ['dashboard', 'Dashboard', 'At a glance'],
  ['bento', 'Bento', 'All on one page'],
  ['tabbed', 'Tabbed', 'Split into tabs'],
]

export default function ResultsViewSwitcher() {
  const layout = useUIStore(s => s.resultsLayout)
  const setLayout = useUIStore(s => s.setResultsLayout)

  return (
    <div className="flex flex-row lg:flex-col gap-4 lg:gap-5">
      {VIEWS.map(([id, name, desc]) => (
        <button
          key={id}
          onClick={() => setLayout(id)}
          aria-pressed={layout === id}
          className={`hsview text-left whitespace-nowrap ${layout === id ? 'on' : ''}`}
        >
          <div className="text-sm font-semibold">{name}</div>
          <div className="hidden lg:block font-mono text-[10px] mt-0.5 opacity-70">{desc}</div>
        </button>
      ))}
    </div>
  )
}
