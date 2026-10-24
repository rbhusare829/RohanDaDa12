import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { m } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePrefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

export type Slide = {
  image: string
  position?: string
  mobileImage?: string | null
  mobilePosition?: string
  /** width ÷ height of the photos (kept for callers; the layout no longer depends on it) */
  ratio?: number
  mobileRatio?: number
  alt: string
  kicker?: string | null
  heading?: string | null
  subheading?: string | null
  buttons: { label?: string | null; url?: string | null }[]
}

export type HeroSocial = { key: string; url: string; label: string }

const pad = (n: number) => String(n).padStart(2, '0')

/** the last two words of a headline get the kesariya gradient (Stitch: "… is a *big one*", "… at the *grassroots*") */
function Headline({ text }: { text?: string | null }) {
  if (!text) return null
  const words = text.trim().split(/\s+/)
  if (words.length < 3) return <>{text}</>
  const cut = words.length - 2
  return (
    <>
      {words.slice(0, cut).join(' ')}{' '}
      <span className="bg-gradient-to-r from-saffron-500 to-[#ffa726] bg-clip-text text-transparent">{words.slice(cut).join(' ')}</span>
    </>
  )
}

/**
 * Home hero (Stitch design, Oct 2026): a deep navy band with soft kesariya and green glows.
 * Left: a small badge row (kicker · place · slide counter), the headline with its last words in kesariya, an italic
 * subheading, then the controls (dots, previous / next and a place line). Right: the slide photo (4:3, so the cover photos are not cut down) in a frame with a
 * kesariya ring. Photos cross-fade with a slow zoom; text rises in.
 * Phones show the text first, then the photo (each slide's "mobile image" when there is one).
 * Autoplay pauses on hover, on focus and when the tab is hidden; swipe left / right on phones.
 * No buttons in the carousel (Oct 2026); no autoplay for visitors who ask for reduced motion; the "Text only" hero style
 * (admin) leaves the photo out.
 */
export function HeroSlider({
  slides, autoplay = 7, social: _social, place, labels, textOnly = false,
}: {
  slides: Slide[]; autoplay?: number; social?: HeroSocial[]; place?: string; textOnly?: boolean
  labels?: { prev: string; next: string }
}) {
  const count = slides.length
  const mobileList = useMemo(() => slides.map((s, i) => (s.mobileImage ? i : -1)).filter((i) => i >= 0), [slides])
  const hasMobile = mobileList.length > 0

  const line = { in: { opacity: 1, y: 0, x: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as const } }, out: { opacity: 0, x: -24 } }
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false) // held by hover, focus or a hidden tab
  // visitors who ask their device for reduced motion get no autoplay (the arrows and dots still work)
  const stopped = usePrefersReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const touch = useRef<number | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    const on = () => setIsMobile(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  const order = useMemo(() => (isMobile && hasMobile ? mobileList : slides.map((_, i) => i)), [isMobile, hasMobile, mobileList, slides])

  const show = useCallback((next: number) => {
    if (next === indexRef.current) return
    indexRef.current = next
    setIndex(next)
  }, [])
  const step = useCallback(
    (dir: number) => {
      const pos = Math.max(0, order.indexOf(indexRef.current))
      show(order[(pos + dir + order.length) % order.length])
    },
    [order, show],
  )
  useEffect(() => {
    if (!order.includes(indexRef.current)) show(order[0])
  }, [order, show])

  useEffect(() => {
    if (order.length < 2 || paused || stopped) return
    const id = window.setTimeout(() => step(1), autoplay * 1000)
    return () => window.clearTimeout(id)
  }, [index, paused, stopped, autoplay, order, step])

  useEffect(() => {
    const onVis = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!count) return null
  const pos = Math.max(0, order.indexOf(index))

  /* dots, previous / next and the place line — under the words on desktop, under the photo on phones */
  const controls = (className: string) =>
    order.length > 1 && (
      <div className={cn('flex items-center gap-6', className)}>
        <div className="flex items-center gap-2">
          {order.map((i, n) => (
            <button
              key={i}
              type="button"
              onClick={() => show(i)}
              aria-label={`Slide ${n + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className="grid h-6 place-items-center"
            >
              <span className={cn('block h-2 rounded-full transition-all', i === index ? 'w-10 bg-gradient-to-r from-saffron-600 to-saffron-500 shadow-lg shadow-saffron-500/40' : 'w-3 bg-white/30 hover:bg-white/60')} />
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label={labels?.prev ?? 'Previous slide'} className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-white transition-colors hover:bg-saffron-500">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label={labels?.next ?? 'Next slide'} className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/10 text-white transition-colors hover:bg-saffron-500">
            <ChevronRight className="size-5" />
          </button>
        </div>
        {place && <span className="hidden text-xs font-bold uppercase tracking-wider text-saffron-200 sm:inline-block">{place.replace(/,\s*/g, ' • ')} • New India</span>}
      </div>
    )

  return (
    <section
      className="relative isolate w-full overflow-hidden border-b-4 border-red-600 bg-gradient-to-r from-[#000d3d] via-[#081944] to-[#12295a] text-white"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      <div aria-hidden className="glow-tl" />
      <div aria-hidden className="glow-br" />

      <div className="container-x relative z-10 pb-20 pt-12 lg:pb-24 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* words */}
          <div className={cn('flex min-w-0 flex-col justify-center', textOnly ? 'lg:col-span-8' : 'lg:col-span-6 lg:pr-4')}>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {place && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-saffron-200 backdrop-blur-md">
                  <span className="size-2 animate-pulse rounded-full bg-saffron-500" />
                  {place}
                </span>
              )}
              {order.length > 1 && (
                <span className="font-display text-xs tracking-widest text-slate-300" aria-live="polite">
                  <span className="font-bold text-saffron-500">{pad(pos + 1)}</span> / {pad(order.length)}
                </span>
              )}
            </div>

            {/* all slides share one grid cell, so the block keeps the height of the longest and nothing jumps */}
            <div className="grid">
              {slides.map((s, i) => {
                const active = i === index
                return (
                  <m.div
                    key={i}
                    aria-hidden={!active}
                    className={cn('[grid-area:1/1]', !active && 'pointer-events-none', hasMobile && !s.mobileImage && 'max-lg:hidden')}
                    initial={false}
                    animate={active ? 'in' : 'out'}
                    variants={{ in: { opacity: 1, y: 0, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }, out: { opacity: 0, y: 16, transition: { duration: 0.4 } } }}
                  >
                    {s.kicker && <m.p variants={line} className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-saffron-300">{s.kicker}</m.p>}
                    {i === 0 ? (
                      <m.h1 variants={line} className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        <Headline text={s.heading} />
                      </m.h1>
                    ) : (
                      <m.p variants={line} className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        <Headline text={s.heading} />
                      </m.p>
                    )}
                    {s.subheading && <m.p variants={line} className="font-quote max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl">{s.subheading}</m.p>}
                  </m.div>
                )
              })}
            </div>

            {/* desktop: the controls under the words */}
            {controls(cn('mt-10 border-t border-white/10 pt-6', !textOnly && 'max-lg:hidden'))}
          </div>

          {/* photo (desktop only — phones show the photo alone) */}
          {!textOnly && (
          <div className="relative flex items-center justify-center lg:col-span-6">
            <m.div
              className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border-2 border-white/10 bg-charcoal-900 shadow-2xl ring-4 ring-saffron-500/30"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 }}
            >
              {slides.map((s, i) => {
                const active = i === index
                const mobile = s.mobileImage && s.mobileImage !== s.image ? s.mobileImage : null
                return (
                  <m.div
                    key={i}
                    aria-hidden={!active}
                    className="absolute inset-0"
                    initial={false}
                    animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 1.06 }}
                    transition={{ opacity: { duration: 1.1, ease: 'easeInOut' }, scale: { duration: active ? 7 : 1.1, ease: [0.2, 0.7, 0.2, 1] } }}
                  >
                    <img src={s.image} alt={active ? s.alt : ''} loading="eager" fetchPriority={i === 0 ? 'high' : 'low'} decoding="async" className={cn('absolute inset-0 size-full object-cover', mobile && 'max-lg:hidden')} style={{ objectPosition: s.position }} />
                    {mobile && <img src={mobile} alt={active ? s.alt : ''} loading="eager" decoding="async" className="absolute inset-0 size-full object-cover lg:hidden" style={{ objectPosition: s.mobilePosition }} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent" />
                  </m.div>
                )
              })}
              <span aria-hidden className="absolute bottom-5 right-6 size-2.5 rounded-full bg-saffron-500 shadow-[0_0_8px_#FF7A00]" />
            </m.div>
          </div>
          )}

          {/* phones: the controls under the photo */}
          {!textOnly && controls('-mt-4 justify-center lg:hidden')}
        </div>
      </div>
    </section>
  )
}
