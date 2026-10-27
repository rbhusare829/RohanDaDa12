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

  // Default: if words > 4, split into two balanced lines for a poster look
  const words = text.trim().split(/\s+/)
  if (words.length >= 4) {
    const mid = Math.ceil(words.length / 2)
    return (
      <>
        <span>{words.slice(0, mid).join(' ')}</span>
        <span className="block">{words.slice(mid).join(' ')}</span>
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
  const [paused, setPaused] = useState(false)
  const stopped = usePrefersReducedMotion()
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

  // Autoplay
  useEffect(() => {
    if (count < 2 || paused || stopped) return
    const id = window.setTimeout(() => step(1), autoplay * 1000)
    return () => window.clearTimeout(id)
  }, [index, paused, stopped, autoplay, count, step])

  // Pause on hidden tab
  useEffect(() => {
    const onVis = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!count) return null

  const activeSlide = slides[index] ?? slides[0]

  return (
    <section
      className="relative isolate w-full overflow-hidden bg-[#00081c] text-white select-none"
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
      {/* 1. Full-Bleed Background Images with Smooth Cross-Fade & Ken-Burns Motion */}
      {!textOnly && (
        <div className="absolute inset-0 size-full overflow-hidden">
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
                  style={{ objectPosition: s.position ?? 'center 20%' }}
                />
              </m.div>
            )
          })}

          {/* Dark Gradient Overlay for Maximum Text Contrast (matching Image 3) */}
          {/* Left-to-right gradient: dark navy/black on the left, translucent on the right */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#00081c]/95 via-[#00081c]/80 via-40% md:via-[#00081c]/65 md:via-50% to-[#00081c]/30 pointer-events-none"
          />

          {/* Top subtle vignette for seamless header blend */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#00081c]/80 to-transparent pointer-events-none"
          />

          {/* Bottom vignette for overlapping card integration */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-80 md:h-44 bg-gradient-to-t from-[#00081c]/95 via-[#00081c]/60 to-transparent pointer-events-none"
          />
        </div>
      )}

      {/* 2. Hero Content Container */}
      <div className="container-x relative z-20 min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] xl:min-h-[700px] flex items-end md:items-center justify-between pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-30">
        <div className="w-full flex items-end md:items-center justify-between gap-8">
          {/* Words on the Left (Matching Image 3); on mobile they sit at the bottom, below the face */}
          <div className="max-w-3xl lg:max-w-4xl py-6">
            <AnimatePresence mode="wait">
              <m.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Orange/Saffron Uppercase Kicker */}
                {activeSlide.kicker && (
                  <p className="mb-2.5 sm:mb-3.5 text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.16em] text-[#ff7a00] drop-shadow-sm">
                    {activeSlide.kicker}
                  </p>
                )}

                {/* Big White Bold Heading (2-Line Poster Layout) */}
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-[2.9rem] font-bold leading-[1.18] tracking-tight text-white drop-shadow-md">
                  <FormattedHeading text={activeSlide.heading} />
                </h1>

                {/* Subtitle / Description if provided */}
                {activeSlide.subheading && (
                  <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-200/90 font-normal">
                    {activeSlide.subheading}
                  </p>
                )}
              </m.div>
            </AnimatePresence>
          </div>

          {/* Right: Vertical Slide Indicators (— 01 / 02) exactly like Image 3 */}
          {count > 1 && (
            <div
              className="shrink-0 flex flex-col items-start gap-4 select-none z-30"
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
                      'group flex items-center text-sm sm:text-base md:text-lg font-display tracking-widest transition-all duration-300 cursor-pointer',
                      isActive
                        ? 'text-white font-bold'
                        : 'text-white/50 hover:text-white font-medium pl-8 sm:pl-10',
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="inline-block w-6 sm:w-8 h-[2px] bg-white mr-2.5 transition-all duration-300"
                      />
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
