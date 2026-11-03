import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, type Variants } from 'motion/react'
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
  desktopTheme?: 'light' | 'dark'
}

export type HeroSocial = { key: string; url: string; label: string }

const pad = (n: number) => String(n).padStart(2, '0')

const slideContentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22, ease: 'easeIn' },
  },
}

const slideItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

/**
 * Formats multi-word or newline-separated headings to match the iconic 2-line layout in Image 3:
 * "I Am Rohan" on line 1, "Subhash Deshmukh" on line 2.
 */
function FormattedHeading({ text, accent = '' }: { text?: string | null; accent?: string }) {
  if (!text) return null

  // If explicit newline exists
  if (text.includes('\n')) {
    const lines = text.split('\n')
    return (
      <>
        <span>{lines[0]}</span>
        <span className={cn('block', accent)}>{lines.slice(1).join(' ')}</span>
      </>
    )
  }

  // Handle "I am Rohan Subhash Deshmukh" / "I Am Rohan Subhash Deshmukh"
  if (/^i\s+am\s+rohan\s+subhash\s+deshmukh/i.test(text.trim())) {
    return (
      <>
        <span>I Am Rohan</span>
        <span className={cn('block', accent)}>Subhash Deshmukh</span>
      </>
    )
  }

  // Handle Marathi "मी रोहन सुभाष देशमुख"
  if (/^मी\s+रोहन\s+सुभाष\s+देशमुख/i.test(text.trim())) {
    return (
      <>
        <span>मी रोहन</span>
        <span className={cn('block', accent)}>सुभाष देशमुख</span>
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
        <span className={cn('block', accent)}>{words.slice(mid).join(' ')}</span>
      </>
    )
  }

  return <>{text}</>
}

/**
 * Hero Slider (Modern Teal + Saffron, Nov 2026): each slide is the leader's portrait on deep Modern Teal with the Saffron Amber shape
 * behind him (the slide art), the words on the left in Cloud White — a small kicker after a saffron bar, the heading with its second line in
 * saffron from tablets up (large there: 20px+ bold, 3.2:1) — and the slide numbers (— 01 / 02) on the right with a saffron bar on the open one.
 * Slides marked desktopTheme 'light' keep the older look (art with a light wall, teal words).
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
  const isLight = activeSlide.desktopTheme === 'light'

  /** the slide numbers (— 01 / 02 / 03): a saffron bar before the open one; a column on phones, a row from tablets up */
  const indicators = (vertical: boolean) => (
    <div className={cn('select-none z-30 flex', vertical ? 'shrink-0 flex-col items-start gap-2.5 sm:gap-4' : 'items-center gap-5 lg:gap-7')} aria-label="Carousel navigation">
      {slides.map((_, idx) => {
        const isActive = idx === index
        return (
          <button
            key={idx}
            type="button"
            onClick={() => show(idx)}
            aria-label={`Go to slide ${pad(idx + 1)}`}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'group flex items-center font-display tracking-widest transition-all duration-300 cursor-pointer',
              vertical ? 'text-xs sm:text-base' : 'min-h-11 text-base lg:text-lg',
              isActive
                ? isLight ? 'text-charcoal-900 font-bold' : 'text-paper font-bold'
                : cn(isLight ? 'text-muted hover:text-charcoal-900' : 'text-paper/80 hover:text-paper', 'font-medium', vertical && 'pl-5 sm:pl-8'),
            )}
          >
            {isActive && <span aria-hidden className={cn('inline-block h-[2px] mr-1.5 sm:mr-2.5 transition-all duration-300', vertical ? 'w-4 sm:w-6' : 'w-8 lg:w-10', isLight ? 'bg-saffron-600' : 'bg-gold')} />}
            <span>{pad(idx + 1)}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <section
      // behind the photos: Modern Teal for the teal slides (their Cloud White words stay readable while a photo loads), Cloud White for a light one
      className={cn('relative isolate w-full overflow-hidden select-none', activeSlide.desktopTheme === 'light' ? 'bg-paper text-charcoal-900' : 'teal-depth text-paper')}
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
                  scale: active && count > 1 ? 1.04 : 1,
                }}
                transition={{
                  opacity: { duration: 1.1, ease: [0.25, 1, 0.5, 1] },
                  scale: { duration: active && count > 1 ? 7 : 0.2, ease: 'easeOut' },
                }}
              >
                <picture className="size-full">
                  {s.mobileImage && (
                    <source media="(max-width: 767px)" srcSet={s.mobileImage} />
                  )}
                  <img
                    src={s.image}
                    alt={active ? s.alt : ''}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'low'}
                    decoding="async"
                    className="size-full object-cover object-[var(--pos-mob)] md:object-[75%_50%] lg:object-[var(--pos-desk)]"
                    style={{
                      ['--pos-mob' as string]: s.mobilePosition ?? 'center top',
                      ['--pos-desk' as string]: s.position ?? 'right center',
                    }}
                  />
                </picture>
              </m.div>
            )
          })}

          {/* phones: the words sit on the teal lower part of the art; a soft teal fade under them keeps them clear of the portrait */}
          {activeSlide.desktopTheme !== 'light' && (
            <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-charcoal-900 via-charcoal-900/75 to-transparent md:hidden z-10 pointer-events-none" />
          )}
          {/* tablets and up: the teal deepens a little toward the left edge, under the words (charcoal over teal = a deeper teal), so the saffron
              line of the heading keeps 3:1 or better on the paper grain of the art */}
          {activeSlide.desktopTheme !== 'light' && (
            <div className="absolute inset-y-0 left-0 hidden w-[70%] bg-gradient-to-r from-charcoal-950/45 via-charcoal-950/25 via-45% to-transparent md:block z-10 pointer-events-none" />
          )}
        </div>
      )}

      {/* 2. Hero Content Container */}
      {/* On mobile (<md): items-end places text over the bottom wall area. */}
      {/* On desktop (>=md): items-center centers text vertically on the left beside Rohan sir. */}
      <div className="container-x relative z-20 min-h-[520px] sm:min-h-[560px] md:min-h-[580px] lg:min-h-[640px] xl:min-h-[700px] flex items-end md:items-center justify-between pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 lg:pt-28 lg:pb-30">
        <div className="w-full flex items-end md:items-center justify-between gap-4 sm:gap-6 md:gap-8">
          {/* Words on the Left: at the bottom on mobile, vertically centered on desktop */}
          <div className="flex-1 max-w-3xl md:max-w-[42%] lg:max-w-3xl xl:max-w-4xl py-2 md:py-6">
            <AnimatePresence mode="wait">
              <m.div
                key={index}
                variants={slideContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* small capitals after a short saffron bar (teal words on a light slide, Cloud White on teal — small saffron words would be
                    only 3.2:1 there) */}
                {activeSlide.kicker && (
                  <m.p
                    variants={slideItemVariants}
                    className={cn(
                      'mb-2 sm:mb-3 inline-flex items-center gap-2 text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.14em]',
                      activeSlide.desktopTheme === 'light' ? 'text-saffron-700' : 'text-paper',
                    )}
                  >
                    <span aria-hidden className="h-0.5 w-6 rounded-full bg-gold sm:w-8" />
                    {activeSlide.kicker}
                  </m.p>
                )}

                {/* Heading (Responsive across Dark & Light Themes) */}
                <m.h1
                  variants={slideItemVariants}
                  className={cn(
                    'font-display text-sm sm:text-base md:text-xl lg:text-2xl xl:text-[1.75rem] font-bold leading-relaxed sm:leading-snug lg:leading-[1.28] tracking-tight',
                    activeSlide.desktopTheme === 'light'
                      ? 'text-charcoal-900'
                      : 'text-paper drop-shadow-[0_2px_12px_rgba(8,44,48,0.55)]',
                  )}
                >
                  <FormattedHeading text={activeSlide.heading} accent={activeSlide.desktopTheme === 'light' ? '' : 'md:text-gold'} />
                </m.h1>

                {/* Subtitle / Description if provided */}
                {activeSlide.subheading && (
                  <m.p
                    variants={slideItemVariants}
                    className={cn(
                      'mt-3 sm:mt-4 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed font-normal',
                      activeSlide.desktopTheme === 'light'
                        ? 'text-ink'
                        : 'text-paper/85',
                    )}
                  >
                    {activeSlide.subheading}
                  </m.p>
                )}
              </m.div>
            </AnimatePresence>
            {count > 1 && <div className="hidden md:block mt-8 lg:mt-10">{indicators(false)}</div>}
          </div>

          {/* Right on phones: the slide numbers in a column (— 01 / 02); from tablets up they sit in a row under the words (the right side is the portrait) */}
          {count > 1 && <div className="md:hidden">{indicators(true)}</div>}
        </div>
      </div>
    </section>
  )
}
