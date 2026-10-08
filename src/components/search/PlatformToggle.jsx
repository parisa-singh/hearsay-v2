import { useState, useEffect, useRef } from 'react'
import { useUIStore } from '../../store/uiStore'
import { PLATFORM_MAP, PLATFORMS } from '../../constants/platforms'
import { getPlatformTiers } from '../../utils/platformRegions'

function IntegratedChip({ p, enabled, onToggle, animIndex }) {
  return (
    <button
      onClick={() => onToggle(p.id)}
      style={{ animationDelay: `${animIndex * 60}ms` }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 animate-slide-up ${
        enabled
          ? 'border-green-700/50 bg-green-950/40 text-green-300'
          : 'border-zinc-800 bg-zinc-900/50 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
      }`}
    >
      <img
        src={p.logo}
        alt=""
        width={13}
        height={13}
        className={`rounded-sm ${enabled ? 'opacity-100' : 'opacity-30'}`}
        onError={e => { e.target.style.display = 'none' }}
      />
      <span>{p.displayName}</span>
    </button>
  )
}

function ComingSoonChip({ p, animIndex }) {
  return (
    <div
      style={{ animationDelay: `${animIndex * 60}ms` }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-zinc-800 bg-zinc-900/30 text-zinc-700 opacity-60 cursor-not-allowed animate-slide-up"
      title={`${p.displayName} — coming soon`}
    >
      <img
        src={p.logo}
        alt=""
        width={13}
        height={13}
        className="rounded-sm opacity-20"
        onError={e => { e.target.style.display = 'none' }}
      />
      <span>{p.displayName}</span>
      <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded font-normal leading-none">
        Soon
      </span>
    </div>
  )
}

export default function PlatformToggle() {
  const { isPlatformEnabled, togglePlatform, location } = useUIStore()

  const countryCode = location?.countryCode ?? null
  const city = location?.city ?? null

  const [showBanner, setShowBanner] = useState(false)
  const [isFading, setIsFading] = useState(false)
  const prevCountryCode = useRef(null)

  useEffect(() => {
    if (countryCode && countryCode !== prevCountryCode.current) {
      prevCountryCode.current = countryCode
      setShowBanner(true)
      setIsFading(false)
      const fadeTimer = setTimeout(() => setIsFading(true), 2500)
      const hideTimer = setTimeout(() => { setShowBanner(false); setIsFading(false) }, 3100)
      return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
    }
  }, [countryCode])

  // No location: working platforms, then a greyed "coming soon" line (3 + more)
  if (!countryCode) {
    const integrated = PLATFORMS.filter(p => p.integrated)
    const allSoon = PLATFORMS.filter(p => !p.integrated)
    const soonShown = allSoon.slice(0, 3)
    const soonRest = allSoon.slice(3)
    return (
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-2 justify-center">
          {integrated.map(p => (
            <IntegratedChip
              key={p.id}
              p={p}
              enabled={isPlatformEnabled(p.id)}
              onToggle={togglePlatform}
              animIndex={0}
            />
          ))}
        </div>

        {allSoon.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--mut)' }}>
              Soon
            </span>
            {soonShown.map((p, i) => (
              <ComingSoonChip key={p.id} p={p} animIndex={i} />
            ))}
            {soonRest.length > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors cursor-default"
                  aria-label={`${soonRest.length} more coming soon`}
                >
                  +{soonRest.length} more
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block group-focus-within:block z-20 w-56 rounded-xl border p-3 shadow-2xl"
                  style={{ background: 'linear-gradient(180deg,#0a0c13,#06070b)', borderColor: 'var(--line)' }}
                >
                  <div className="font-mono text-[9px] uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--mut)' }}>Also coming soon</div>
                  <div className="flex flex-wrap gap-1.5">
                    {soonRest.map(p => (
                      <span key={p.id} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
                        {p.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const { platforms: regionalIds } = getPlatformTiers(countryCode)
  const regionalPlatforms = (regionalIds ?? []).map(id => PLATFORM_MAP[id]).filter(Boolean)

  const integrated = regionalPlatforms.filter(p => p.integrated)
  const comingSoon = regionalPlatforms.filter(p => !p.integrated)

  return (
    <div className="space-y-3">
      {/* Region banner — shown first so it's seen immediately */}
      {showBanner && (
        <button
          onClick={() => { setShowBanner(false); setIsFading(false) }}
          className="w-full text-center text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg px-2 sm:px-3 py-2 animate-fade-in hover:border-zinc-700 transition-colors leading-relaxed"
          style={{ opacity: isFading ? 0 : 1, transition: 'opacity 600ms ease-out' }}
        >
          Showing platforms popular in {city ?? location.country}
          {' · '}<span className="text-green-400">{integrated.length} available now</span>
          {comingSoon.length > 0 && (
            <>{' · '}<span className="text-zinc-600">{comingSoon.length} coming soon</span></>
          )}
        </button>
      )}

      <div>
        <p className="text-xs text-zinc-500 text-center mb-2">
          Popular in {city ?? location.country}
        </p>

        {/* Integrated platforms row */}
        <div key={countryCode} className="flex flex-wrap gap-2 justify-center">
          {integrated.map((p, i) => (
            <IntegratedChip
              key={p.id}
              p={p}
              enabled={isPlatformEnabled(p.id)}
              onToggle={togglePlatform}
              animIndex={i}
            />
          ))}
        </div>

        {/* Coming-soon row */}
        {comingSoon.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {comingSoon.map((p, i) => (
              <ComingSoonChip key={p.id} p={p} animIndex={integrated.length + i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
