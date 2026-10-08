import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ErrorBoundary from './ErrorBoundary'
import HearsayIntro from '../intro/HearsayIntro'
import { useUIStore } from '../../store/uiStore'
import { trackPageView } from '../../utils/analytics'

export default function Layout() {
  const { pathname, search } = useLocation()
  const introPlaying = useUIStore(s => s.introPlaying)
  const setIntroPlaying = useUIStore(s => s.setIntroPlaying)

  // One page_view per client-side navigation (query string included so
  // /results?q=… shows up as distinct searches in GA).
  useEffect(() => {
    trackPageView(pathname + search)
  }, [pathname, search])

  // Auto-play the intro once per browser session (first visit).
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('hs-intro-seen')) setIntroPlaying(true)
    } catch {
      setIntroPlaying(true)
    }
  }, [setIntroPlaying])

  function endIntro() {
    setIntroPlaying(false)
    try { sessionStorage.setItem('hs-intro-seen', '1') } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {introPlaying && <HearsayIntro onDone={endIntro} />}
      <Header />
      {/* key={pathname} remounts the subtree on navigation, which also resets
          the ErrorBoundary so a crash on one page doesn't persist to the next */}
      <div key={pathname} className="flex-1 flex flex-col animate-fade-in">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  )
}
