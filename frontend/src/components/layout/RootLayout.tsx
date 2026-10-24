import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, m } from 'motion/react'
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router'
import { initAnalytics, trackPage } from '@/lib/analytics'
import { getLocale, useTranslations } from '@/lib/i18n'
import { Footer } from './Footer'
import { FloatingButtons, SitePopup } from './Floating'
import { FloatingSocialBar } from './FloatingSocialBar'
import { Header } from './Header'
import { PersonSchema } from './Seo'

/** A thin saffron bar at the top of the screen while the next page is loading (appears only if it takes a moment) */
function TopLoader() {
  const navigation = useNavigation()
  const busy = navigation.state !== 'idle'
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!busy) return
    const id = setTimeout(() => setShow(true), 120)
    return () => {
      clearTimeout(id)
      setShow(false)
    }
  }, [busy])
  return (
    <AnimatePresence>
      {show && (
        <m.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-saffron-500 shadow-[0_0_10px_#FF7A00,0_0_5px_#FF7A00]"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, transition: { duration: 6, ease: 'easeOut' } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.35 } }}
        />
      )}
    </AnimatePresence>
  )
}

/** After a page change: tell screen readers the new page's title, move keyboard focus to the content, report the page view */
function RouteEffects() {
  const { pathname, search } = useLocation()
  const [announcement, setAnnouncement] = useState('')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      initAnalytics()
      trackPage(pathname + search, document.title)
      return
    }
    // wait for the new page's <title> (react-helmet-async sets it just after rendering)
    const id = setTimeout(() => {
      setAnnouncement(document.title)
      trackPage(pathname + search, document.title)
      if (!window.location.hash) document.getElementById('main')?.focus({ preventScroll: true })
    }, 80)
    return () => clearTimeout(id)
  }, [pathname, search])

  return <div aria-live="polite" role="status" className="sr-only">{announcement}</div>
}

/** The animation features load after the first paint (see motion-features.ts) */
const loadMotion = () => import('@/lib/motion-features').then((m) => m.default)

/** Every public page: header, the page, footer — plus the popup, the back-to-top button and the Person data for search engines */
export function RootLayout() {
  const tn = useTranslations('nav')

  useEffect(() => {
    document.documentElement.lang = getLocale()
  }, [])

  return (
    <LazyMotion features={loadMotion} strict>
      <MotionConfig reducedMotion="user">
        <TopLoader />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-btn focus:px-5 focus:py-2 focus:text-white">
          {tn('skip')}
        </a>
        <Header />
        <FloatingSocialBar />
        <main id="main" tabIndex={-1} className="outline-none">
          <Outlet />
        </main>
        <Footer />
        <FloatingButtons />
        <SitePopup />
        <RouteEffects />
        <ScrollRestoration />
        <PersonSchema />
      </MotionConfig>
    </LazyMotion>
  )
}
