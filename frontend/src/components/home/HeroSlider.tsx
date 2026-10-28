import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { usePrefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

export type Slide = {
  image: string
  position?: string
  mobileImage?: string | null
  mobilePosition?: string
  alt: string
  kicker?: string | null
  heading?: string | null
  subheading?: string | null
  buttons?: { label?: string | null; url?: string | null }[]
}

export type HeroSocial = { key: string; url: string; label: string }

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Formats multi-word or newline-separated headings to match the iconic 2-line layout in Image 3:
 * "I Am Rohan" on line 1, "Subhash Deshmukh" on line 2.
 */
function FormattedHeading({ text }: { text?: string | null }) {
  if (!text) return null

  // If explicit newline exists
  if (text.includes('\n')) {
    const lines = text.split('\n')
    return (
      <>
        <span>{lines[0]}</span>
        <span className="block">{lines.slice(1).join(' ')}</span>
      </>
    )
  }

  // Handle "I am Rohan Subhash Deshmukh" / "I Am Rohan Subhash Deshmukh"
  if (/^i\s+am\s+rohan\s+subhash\s+deshmukh/i.test(text.trim())) {
    return (
      <>
        <span>I Am Rohan</span>
        <span className="block">Subhash Deshmukh</span>
      </>
    )
  }

  // Handle Marathi "मी रोहन सुभाष देशमुख"
  if (/^मी\s+रोहन\s+सुभाष\s+देशमुख/i.test(text.trim())) {
    return (
      <>
        <span>मी रोहन</span>
        <span className="block">सुभाष देशमुख</span>
      </>
    )
  }

  return <>{text}</>
}

/**
 * Hero Slider (matching Image 3):
 * Full-width background image with deep dark gradient on the left.
 * Saffron uppercase kicker, huge white bold heading, vertical slide indicators (— 01 / 02) on the right.
 * Responsive across mobile, tablet, and desktop viewports.
 */
export function HeroSlider({
  slides,
  autoplay = 6,
  textOnly = false,
}: {
  slides: Slide[]
  autoplay?: number
  social?: HeroSocial[]
  place?: string
  textOnly?: boolean
  labels?: { prev: string; next: string }
}) {
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState(false) // a mouse pointer or keyboard focus is on the slideshow
  const [hidden, setHidden] = useState(false) // the tab is in the background
  const [onscreen, setOnscreen] = useState(true) // the slideshow is on the screen (it does not keep turning above the visitor's head)
  const reduced = usePrefersReducedMotion()
  const halted = reduced // visitors who ask for less motion get no autoplay
  const running = count > 1 && !halted && !hover && !hidden && onscreen
  const root = useRef<HTMLElement>(null)
  const touch = useRef<number | null>(null)
  const indexRef = useRef(0)

  const show = useCallback((next: number) => {
    if (next === indexRef.current) return
    indexRef.current = next
    setIndex(next)
  }, [])

  const step = useCallback(
    (dir: number) => {
      if (count <= 1) return
      const next = (indexRef.current + dir + count) % count
      show(next)
    },
    [count, show],
  )

  // Autoplay: one timer per slide; it stops while the pointer or focus is on the slideshow, in a background tab, off screen, or after Pause
  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => step(1), autoplay * 1000)
    return () => window.clearTimeout(id)
  }, [index, running, autoplay, step])

  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOnscreen(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [count])

  if (!count) return null

  const activeSlide = slides[index] ?? slides[0]

  return (
    <section
      ref={root}
      className="relative isolate w-full overflow-hidden bg-[#00081c] text-white select-none"
      aria-roledescription="carousel"
      // only a real mouse pointer holds the slideshow: on a phone a tap would otherwise leave it "hovered" (and stopped) for good
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
        touch.current = null
      }}
    >
      {/* 1. Full-Bleed Background Images with Smooth Cross-Fade & Ken-Burns Motion */}
      {!textOnly && (
        <div className="absolute inset-0 size-full overflow-hidden">
          {/* The photo fills the whole band behind the words on every screen; on phones the words sit over its lower part. */}
          {slides.map((s, i) => {
            const active = i === index
            return (
              <m.div
                key={i}
                aria-hidden={!active}
                className="absolute inset-0 size-full"
                initial={false}
                animate={{
                  opacity: active ? 1 : 0,
                  scale: active ? 1.04 : 1,
                }}
                transition={{
                  opacity: { duration: 1.1, ease: [0.25, 1, 0.5, 1] },
                  scale: { duration: active ? 7 : 1.1, ease: 'easeOut' },
                }}
              >
                <img
                  src={s.image}
                  alt={active ? s.alt : ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  decoding="async"
                  className="size-full object-cover"
                  style={{ objectPosition: s.mobilePosition ?? (s.position ?? '75% 15%') }}
                />
              </m.div>
            )
          })}

          {/* Desktop gradient: left-to-right dark overlay for maximum text contrast */}
          <div
            aria-hidden
            className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#00081c]/95 via-[#00081c]/60 via-50% to-[#00081c]/25 pointer-events-none"
          />
          {/* Mobile gradient: bottom-to-top dark overlay so words at bottom are 100% legible and face at top stays clear */}
          <div
            aria-hidden
            className="absolute inset-0 md:hidden bg-gradient-to-t from-[#00081c] via-[#00081c]/80 via-55% to-[#00081c]/15 pointer-events-none"
          />

          {/* Top subtle vignette for seamless header blend */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b from-[#00081c]/80 to-transparent pointer-events-none md:block"
          />

          {/* Bottom vignette for overlapping card integration */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 hidden h-44 bg-gradient-to-t from-[#00081c]/95 via-[#00081c]/60 to-transparent pointer-events-none md:block"
          />
        </div>
      )}

      {/* 2. Hero Content Container */}
      <div className="container-x relative z-20 min-h-[440px] sm:min-h-[500px] md:min-h-[540px] lg:min-h-[600px] xl:min-h-[640px] flex items-end md:items-center justify-between pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
          {/* Words on the Left */}
          <div className="max-w-2xl lg:max-w-3xl py-4 sm:py-6">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {/* Orange/Saffron Uppercase Kicker */}
                {activeSlide.kicker && (
                  <p className="mb-2 sm:mb-2.5 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.16em] text-[#ff7a00] drop-shadow-sm">
                    {activeSlide.kicker}
                  </p>
                )}

                {/* Refined Bold Heading (small and well-balanced) */}
                <h1 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[2.1rem] font-bold leading-relaxed sm:leading-snug tracking-tight text-white drop-shadow-md text-balance">
                  <FormattedHeading text={activeSlide.heading} />
                </h1>

                {/* Subtitle / Description if provided */}
                {activeSlide.subheading && (
                  <p className="mt-2.5 sm:mt-3.5 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-200/90 font-normal">
                    {activeSlide.subheading}
                  </p>
                )}

                {/* Mobile Slide Indicators (horizontal pills below text on phones) */}
                {count > 1 && (
                  <div className="mt-5 flex md:hidden items-center gap-2 select-none" aria-label="Carousel navigation">
                    {slides.map((_, idx) => {
                      const isActive = idx === index
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => show(idx)}
                          aria-label={`Go to slide ${idx + 1}`}
                          className={cn(
                            'h-1 rounded-full transition-all duration-300 cursor-pointer',
                            isActive ? 'w-8 bg-[#ff7a00]' : 'w-2.5 bg-white/40 hover:bg-white/70',
                          )}
                        />
                      )
                    })}
                  </div>
                )}
              </m.div>
            </AnimatePresence>
          </div>

          {/* Right: Vertical Slide Indicators (— 01 / 02) on tablets and desktops */}
          {count > 1 && (
            <div
              className="hidden md:flex shrink-0 flex-col items-start select-none z-30"
              aria-label="Carousel navigation"
            >
              {slides.map((_, idx) => {
                const isActive = idx === index
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => show(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'group flex min-h-11 items-center text-sm sm:text-base md:text-lg font-display tracking-widest transition-all duration-300 cursor-pointer',
                      isActive
                        ? 'text-white font-bold'
                        : 'text-white/50 hover:text-white font-medium pl-8 sm:pl-10',
                    )}
                  >
                    {isActive && (
                      <span aria-hidden className="relative mr-2.5 inline-block h-[2px] w-6 overflow-hidden bg-white/35 sm:w-8">
                        <span
                          key={running ? `run-${index}` : 'still'}
                          className={cn('absolute inset-0 bg-white', running && 'hero-progress')}
                          style={running ? { animationDuration: `${autoplay}s` } : undefined}
                        />
                      </span>
                    )}
                    <span>{pad(idx + 1)}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
