import { Link } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'

export default function Header() {
  const setIntroPlaying = useUIStore(s => s.setIntroPlaying)
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-13 sm:h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className="font-display text-lg sm:text-xl font-semibold tracking-tight text-white group-hover:text-zinc-300 transition-colors">
              hear<span className="text-accent">say</span>
            </span>
            <span className="text-xs text-zinc-500 font-normal mt-0.5">beta</span>
          </Link>
          <button
            onClick={() => setIntroPlaying(true)}
            aria-label="Replay the intro"
            title="Why hearsay? Replay the intro"
            className="w-5 h-5 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-500 text-[11px] font-semibold leading-none hover:text-accent hover:border-accent transition-colors"
          >
            ?
          </button>
        </div>

        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/about"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            About
          </Link>
          <a
            href="https://github.com/parisa-singh/hearsay-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
