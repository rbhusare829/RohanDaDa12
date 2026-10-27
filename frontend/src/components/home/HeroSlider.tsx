import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, type Variants } from 'motion/react'
import { Pause, Play } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'
import { EASE_OUT, usePrefersReducedMotion } from '@/lib/motion'
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

/** The words of a slide arrive one after another (kicker, heading, line); when the slide changes they leave together, quicker than they came */
const words: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } },
}
const word: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
}

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
  const t = useTranslations('common')
  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState(false) // a mouse pointer or keyboard focus is on the slideshow
  const [hidden, setHidden] = useState(false) // the tab is in the background
  const [onscreen, setOnscreen] = useState(true) // the slideshow is on the screen (it does not keep turning above the visitor's head)
  const [choice, setChoice] = useState<boolean | null>(null) // true = the visitor pressed Pause, false = pressed Play
  const reduced = usePrefersReducedMotion()
  const halted = choice ?? reduced // visitors who ask for less motion get no autoplay unless they press Play (WCAG 2.2.2: a way to stop it)
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
        <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden md:inset-0 md:h-full">
          {/* phones: the photo fills the top part, clear (no shading over the face); the words sit below it on navy.
              Tablets and desktops: the photo fills the whole band behind the words. */}
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
            className="absolute inset-0 hidden md:block bg-gradient-to-r from-[#00081c]/95 via-[#00081c]/65 via-50% to-[#00081c]/30 pointer-events-none"
          />
          {/* phones: only a short fade at the photo's lower edge into the navy below (Oct 2026) */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/4 md:hidden bg-gradient-to-t from-[#00081c] to-transparent pointer-events-none"
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
      <div className="container-x relative z-20 min-h-[620px] sm:min-h-[660px] md:min-h-[580px] lg:min-h-[640px] xl:min-h-[700px] flex items-end md:items-center justify-between pt-16 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-30">
        <div className="w-full flex items-end md:items-center justify-between gap-8">
          {/* Words on the Left (Matching Image 3); on mobile they sit at the bottom, below the face */}
          <div className="max-w-3xl lg:max-w-4xl py-6">
            <AnimatePresence mode="wait">
              <m.div key={index} variants={words} initial="hidden" animate="show" exit="exit">
                {/* Orange/Saffron Uppercase Kicker */}
                {activeSlide.kicker && (
                  <m.p variants={word} className="mb-2.5 sm:mb-3.5 text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.16em] text-[#ff7a00] drop-shadow-sm">
                    {activeSlide.kicker}
                  </m.p>
                )}

                {/* Big White Bold Heading (2-Line Poster Layout) */}
                <m.h1 variants={word} className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-[2.9rem] font-bold leading-[1.18] tracking-tight text-white drop-shadow-md">
                  <FormattedHeading text={activeSlide.heading} />
                </m.h1>

                {/* Subtitle / Description if provided */}
                {activeSlide.subheading && (
                  <m.p variants={word} className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-200/90 font-normal">
                    {activeSlide.subheading}
                  </m.p>
                )}
              </m.div>
            </AnimatePresence>
          </div>

          {/* Right: Vertical Slide Indicators (— 01 / 02) exactly like Image 3 */}
          {count > 1 && (
            <div
              className="shrink-0 flex flex-col items-start select-none z-30"
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
                      // each number is a 44 px tap target (the rows touch, so a thumb never lands between two)
                      'group flex min-h-11 items-center text-sm sm:text-base md:text-lg font-display tracking-widest transition-all duration-300 cursor-pointer',
                      isActive
                        ? 'text-white font-bold'
                        : 'text-white/50 hover:text-white font-medium pl-8 sm:pl-10',
                    )}
                  >
                    {isActive && (
                      /* the line fills while this slide is on screen, so the visitor sees how long is left; it stands still, full, whenever the slideshow is held or stopped */
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
              <button
                type="button"
                // Play must start the slideshow at once, even though the pointer (or focus) is still on the button that was pressed
                onClick={() => {
                  setChoice(!halted)
                  setHover(false)
                }}
                aria-label={halted ? t('playSlides') : t('pauseSlides')}
                title={halted ? t('playSlides') : t('pauseSlides')}
                className="group -ml-2 mt-1 grid size-11 cursor-pointer place-items-center rounded-full text-white/70 transition-colors hover:text-white"
              >
                <span className="grid size-7 place-items-center rounded-full border border-white/40 transition-colors group-hover:border-white">
                  {halted ? <Play aria-hidden className="size-3 translate-x-px fill-current" /> : <Pause aria-hidden className="size-3 fill-current" />}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
