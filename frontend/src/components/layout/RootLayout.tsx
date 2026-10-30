import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, m } from 'motion/react'
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router'
import { initAnalytics, trackPage } from '@/lib/analytics'
import { getLocale, useTranslations } from '@/lib/i18n'
import { Footer } from './Footer'
import { FloatingButtons, SitePopup } from './Floating'
import { FloatingSocialBar } from './FloatingSocialBar'
import { Header } from './Header'
import { PersonSchema } from './Seo'
import { ReadingProgress } from '../ui/Motion'

/**
 * While the next page is loading (only if it takes a moment): the thin saffron bar at the top, and a preloader over the page — the
 * name in the site's navy with a red-and-saffron ring turning around it — so a click on a link (the footer's, say) never shows the old
 * page sliding about. The new page then simply appears at its top (see InstantPageJump).
 */
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
        <>
          <m.div
            key="bar"
            aria-hidden
            className="fixed inset-x-0 top-0 z-[91] h-[3px] origin-left bg-saffron-500 shadow-[0_0_10px_#FF7A00,0_0_5px_#FF7A00]"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 0.85, transition: { duration: 6, ease: 'easeOut' } }}
            exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.35 } }}
          />
          <m.div
            key="preloader"
            role="status"
            aria-label={getLocale() === 'en' ? 'Loading' : 'लोड होत आहे'}
            className="fixed inset-0 z-[90] grid place-items-center bg-white/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <div className="flex flex-col items-center gap-5">
              <span aria-hidden className="relative grid size-20 place-items-center">
                <span className="absolute inset-0 rounded-full border-4 border-stone-200" />
                <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-red-600 border-r-saffron-500" />
                <span className="size-3 rounded-full bg-[#000d3d]" />
              </span>
              <img src="/brand/logo-name.svg" alt="" aria-hidden width={180} height={46} className="h-9 w-auto [filter:brightness(0)_saturate(100%)_invert(8%)_sepia(60%)_saturate(4000%)_hue-rotate(225deg)]" />
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * The site scrolls smoothly (html { scroll-behavior: smooth }) for jumps within a page. A page change must not: the new page starts
 * at its top at once instead of gliding up from where the old one was. So while a page is loading and just after, the smooth scroll
 * is turned off; the jump to a #part of the new page still lands where it should.
 */
function InstantPageJump() {
  const navigation = useNavigation()
  const { pathname } = useLocation()
  const busy = navigation.state !== 'idle'
  useEffect(() => {
    if (busy) document.documentElement.style.scrollBehavior = 'auto'
  }, [busy])
  useLayoutEffect(() => {
    const html = document.documentElement
    html.style.scrollBehavior = 'auto'
    const id = window.setTimeout(() => (html.style.scrollBehavior = ''), 400)
    return () => window.clearTimeout(id)
  }, [pathname])
  return null
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

/**
 * The page itself. After a click the new page settles in (a short fade and rise, 0.38 s, never blocking the click: the page is already
 * loaded when it shows). The page a visit starts with just appears — it is what the visitor came for, and it must not wait for an animation.
 * Changing only the query (filters, tabs, pages of a list) is not a new page, so it does not replay.
 */
function PageStage() {
  const { pathname } = useLocation()
  const [shown, setShown] = useState(pathname)
  const [navigated, setNavigated] = useState(false)
  if (shown !== pathname) {
    setShown(pathname)
    setNavigated(true)
  }
  return (
    <div key={pathname} className={navigated ? 'page-enter' : undefined}>
      <Outlet />
    </div>
  )
}

/** The animation features load after the first paint (see motion-features.ts) */
const loadMotion = () => import('@/lib/motion-features').then((m) => m.default)

/** Every public page: header, the page, footer — plus the popup, the back-to-top button and the Person data for search engines */
export function RootLayout() {
  const tn = useTranslations('nav')

  useEffect(() => {
    const loc = getLocale()
    document.documentElement.lang = loc
    if (loc === 'mr') {
      document.documentElement.classList.add('lang-mr')
      document.documentElement.classList.remove('lang-en')
    } else {
      document.documentElement.classList.add('lang-en')
      document.documentElement.classList.remove('lang-mr')
    }
  }, [])

  return (
    <LazyMotion features={loadMotion} strict>
      <MotionConfig reducedMotion="user">
        <TopLoader />
        <ReadingProgress />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-btn focus:px-5 focus:py-2 focus:text-white">
          {tn('skip')}
        </a>
        <Header />
        <FloatingSocialBar />
        <main id="main" tabIndex={-1} className="outline-none">
          <PageStage />
        </main>
        <Footer />
        <FloatingButtons />
        <SitePopup />
        <RouteEffects />
        {/* before ScrollRestoration, so the smooth scroll is off by the time it puts the new page at its top */}
        <InstantPageJump />
        <ScrollRestoration />
        <PersonSchema />
      </MotionConfig>
    </LazyMotion>
  )
}
