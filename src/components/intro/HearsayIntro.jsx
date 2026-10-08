import { useEffect, useRef } from 'react'
import './intro.css'

const HOLD = [5200, 4400, 4600, 6200]
const ICON_PAUSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
const ICON_PLAY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'

/**
 * Full-screen narrative that plays once, then expands away to reveal the homepage.
 * Calls onDone() when it finishes (or is skipped).
 */
export default function HearsayIntro({ onDone }) {
  const rootRef = useRef(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const track = root.querySelector('.track')
    const bubbles = [...root.querySelectorAll('.bubble')]
    const opening = root.querySelector('.opening')
    const prev = root.querySelector('.nav.prev')
    const next = root.querySelector('.nav.next')
    const pp = root.querySelector('.pp')
    const dotBtns = [...root.querySelectorAll('.dots button')]
    const skip = root.querySelector('.skip')
    const LAST = bubbles.length - 1

    let current = -1, playing = true, token = 0, advTimer = 0, done = false
    const timers = new Set()
    const T = (fn, ms) => { const id = setTimeout(fn, ms); timers.add(id); return id }
    const clearAll = () => { timers.forEach(clearTimeout); timers.clear(); clearTimeout(advTimer) }
    const wait = ms => new Promise(r => T(r, ms))

    function setCam(S, cx, cy) {
      const tx = root.clientWidth / 2 - S * cx, ty = root.clientHeight / 2 - S * cy
      track.style.transform = `translate(${tx}px,${ty}px) scale(${S})`
    }
    const overviewScale = () => Math.min(root.clientWidth / track.offsetWidth, root.clientHeight / track.offsetHeight) * 0.86
    const applyOverview = () => setCam(overviewScale(), track.offsetWidth / 2, track.offsetHeight / 2)
    function focus(i) {
      const b = bubbles[i]
      let S = Math.min((root.clientWidth * 0.82) / b.offsetWidth, (root.clientHeight * 0.82) / b.offsetHeight)
      S = Math.max(0.9, Math.min(S, 2))
      setCam(S, b.offsetLeft + b.offsetWidth / 2, b.offsetTop + b.offsetHeight / 2)
    }
    const setActive = i => bubbles.forEach((b, idx) => { b.classList.toggle('active', idx === i); if (idx !== i) b.classList.remove('doubt') })
    const updateDots = i => dotBtns.forEach((d, idx) => d.classList.toggle('on', idx === i))

    function finish() {
      if (done) return
      done = true
      clearAll()
      root.classList.add('leaving')
      setTimeout(() => onDoneRef.current && onDoneRef.current(), 850)
    }

    async function go(i) {
      clearTimeout(advTimer)
      if (i > LAST) { finish(); return }
      i = Math.max(0, i)
      current = i
      const me = ++token
      updateDots(i)
      next.textContent = i >= LAST ? '→' : '›'
      applyOverview()
      setActive(-1)
      await wait(650); if (me !== token) return
      focus(i); setActive(i)
      if (i === 0) T(() => { if (me === token) bubbles[0].classList.add('doubt') }, 3200)
      await wait(1150); if (me !== token) return
      if (playing) advTimer = T(() => go(i + 1), HOLD[i])
    }

    function setPlaying(p) {
      playing = p
      pp.innerHTML = p ? ICON_PAUSE : ICON_PLAY
      pp.setAttribute('aria-label', p ? 'Pause' : 'Play')
      clearTimeout(advTimer)
      if (p && current >= 0 && current <= LAST) advTimer = T(() => go(current + 1), HOLD[current])
    }

    const onPP = e => { e.stopPropagation(); setPlaying(!playing) }
    const onPrev = e => { e.stopPropagation(); go(current <= 0 ? 0 : current - 1) }
    const onNext = e => { e.stopPropagation(); current >= LAST ? finish() : go(current + 1) }
    const onKey = e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); current >= LAST ? finish() : go(current + 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current <= 0 ? 0 : current - 1) }
      else if (e.key === ' ') { e.preventDefault(); setPlaying(!playing) }
    }
    const onResize = () => { if (current >= 0) focus(current) }
    const onOpeningClick = e => { e.stopPropagation(); clearAll(); opening.classList.add('hide'); startTour() }
    const onSkip = e => { e.stopPropagation(); finish() }

    pp.addEventListener('click', onPP)
    prev.addEventListener('click', onPrev)
    next.addEventListener('click', onNext)
    skip.addEventListener('click', onSkip)
    opening.addEventListener('click', onOpeningClick)
    dotBtns.forEach((d, idx) => d.addEventListener('click', e => { e.stopPropagation(); go(idx) }))
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)

    function startTour() {
      track.classList.add('instant')
      setCam(1.7, track.offsetWidth / 2, track.offsetHeight / 2)
      void track.offsetWidth
      track.classList.remove('instant')
      applyOverview()
      T(() => go(0), 1300)
    }
    function runIntro() {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { opening.classList.add('hide'); startTour(); return }
      requestAnimationFrame(() => opening.classList.add('in'))
      T(() => opening.classList.add('split'), 1500)
      T(() => opening.classList.add('why-on'), 2400)
      T(() => { opening.classList.add('hide'); startTour() }, 4300)
    }

    pp.innerHTML = ICON_PAUSE
    applyOverview()
    runIntro()

    return () => {
      clearAll()
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      root.classList.remove('leaving')
    }
  }, [])

  return (
    <div className="hs-intro" ref={rootRef}>
      <div className="wordmark">hear<b>say</b></div>
      <button className="skip">skip intro</button>

      <div className="track">
        <div className="bubble" data-i="0">
          <div className="step"><span className="num">01</span> You hear it</div>
          <div className="main">
            <div className="reviewbox">
              <div className="src"><span className="live"></span>a review you saw online</div>
              <div className="quote">“<span className="typed">Best brunch ever, 5 stars!</span>”</div>
              <div className="stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
            </div>
          </div>
          <p className="narr">Someone raves online. Five glowing stars. You take it at face value, and you go.</p>
        </div>

        <div className="bubble" data-i="1">
          <div className="step"><span className="num">02</span> But it's only hearsay</div>
          <div className="main">
            <div>
              <div className="term">hearsay<span className="ph">/ˈhɪəseɪ/</span></div>
              <div className="pos">noun · law</div>
            </div>
            <div className="mean">information from other people that <em>cannot be substantiated</em>.</div>
          </div>
          <p className="narr">One rave proves nothing. A rating is easy to fake, and impossible to trust on its own.</p>
        </div>

        <div className="bubble" data-i="2">
          <div className="step"><span className="num">03</span> So you cross-check</div>
          <div className="main">
            <div className="label">pulling the same place from every platform…</div>
            <div className="dotsrow">
              <div className="scanline"></div>
              <div className="pf"><i style={{ background: '#4285F4' }}></i></div>
              <div className="pf"><i style={{ background: '#FF1A1A' }}></i></div>
              <div className="pf"><i style={{ background: '#FF4500' }}></i></div>
              <div className="pf"><i style={{ background: '#34E0A1' }}></i></div>
              <div className="pf"><i style={{ background: '#FF0000' }}></i></div>
            </div>
          </div>
          <p className="narr">Hearsay fetches the reviews from all of them at once and lines the real ratings up side by side.</p>
        </div>

        <div className="bubble" data-i="3">
          <div className="step"><span className="num">04</span> The truth cracks through</div>
          <div className="main">
            <div className="verdict">◆ the platforms don't agree</div>
            <div className="fake">★★★★★</div>
            <div className="realrow">
              <div className="rchip" style={{ borderColor: '#4285F440' }}><span className="d" style={{ background: '#4285F4' }}></span>Google <span className="n" style={{ color: '#8ab4ff' }}>4.3</span></div>
              <div className="rchip" style={{ borderColor: '#FF1A1A40' }}><span className="d" style={{ background: '#FF1A1A' }}></span>Yelp <span className="n" style={{ color: '#ff8a8a' }}>2.8</span></div>
            </div>
            <div className="gapline">a 1.5★ gap they hoped you'd never notice.</div>
          </div>
          <p className="narr">The glowing five stars fall apart. Now you can see what people <b>really</b> think.</p>
        </div>
      </div>

      <div className="opening">
        <div className="bigword"><span className="h">hear</span><span className="s">say</span></div>
        <div className="why">why <b>hearsay</b>?</div>
      </div>

      <button className="nav prev" aria-label="Previous step">‹</button>
      <button className="nav next" aria-label="Next step">›</button>

      <div className="controls">
        <button className="pp" aria-label="Pause"></button>
        <div className="dots">
          <button aria-label="Step 1"></button>
          <button aria-label="Step 2"></button>
          <button aria-label="Step 3"></button>
          <button aria-label="Step 4"></button>
        </div>
      </div>
    </div>
  )
}
