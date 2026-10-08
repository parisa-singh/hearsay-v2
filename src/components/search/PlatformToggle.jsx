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

  // No location: working platforms, then a greyed "coming soon" line
  if (!countryCode) {
    const integrated = PLATFORMS.filter(p => p.integrated)
    const comingSoon = PLATFORMS.filter(p => !p.integrated).slice(0, 8)
    return (
      <div className="space-y-3">
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

        {comingSoon.length > 0 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-center mb-2" style={{ color: 'var(--mut)' }}>
              Coming soon
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {comingSoon.map((p, i) => (
                <ComingSoonChip key={p.id} p={p} animIndex={i} />
              ))}
            </div>
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
