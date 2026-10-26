import { useRef, useState, useEffect, type ReactNode } from 'react'
import { m, AnimatePresence } from 'motion/react'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  HeartHandshake,
  TrendingUp,
  Users,
  Compass,
} from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn } from '@/lib/utils'
import { LOCALE } from '@/lib/i18n'
import { mediaUrl } from '@/lib/media'
import { PageBlocks } from '@/components/blocks/PageBlocks'
import { RichText } from '@/components/ui/RichText'
import { CMSLink } from '@/components/ui/CMSLink'

type Block = NonNullable<Page['layout']>[number]
type Content = Extract<Block, { blockType: 'content' }>
type Cards = Extract<Block, { blockType: 'cards' }>

const DEVANAGARI = '०१२३४५६७८९'
const num = (n: number, locale: string, width = 1) => {
  const s = String(n).padStart(width, '0')
  return locale === 'mr' ? s.replace(/\d/g, (d) => DEVANAGARI[Number(d)]) : s
}

/** Kesariya Gold, Emerald Leaf, Midnight Navy — Stitch dynamic accents */
const ACCENTS = [
  {
    text: 'text-saffron-600',
    badge: 'bg-saffron-50/90 border-saffron-200/90 text-saffron-800 shadow-xs',
    bar: 'bg-gradient-to-r from-saffron-600 via-saffron-500 to-amber-500',
    border: 'border-saffron-500',
    ring: 'hover:border-saffron-300 hover:shadow-[0_16px_32px_-10px_rgba(245,158,11,0.22)]',
    cardAccent: 'from-saffron-500 to-amber-500',
    cardBg: 'hover:border-saffron-300/80',
    tile: 'text-amber-400',
    tileActive: 'border-saffron-400/90 bg-white/[0.14] shadow-[0_16px_36px_-10px_rgba(245,158,11,0.4)]',
    tileBorder: 'border-white/15 bg-white/[0.04] hover:border-saffron-400/50 hover:bg-white/[0.08]',
  },
  {
    text: 'text-leaf-600',
    badge: 'bg-emerald-50/90 border-emerald-200/90 text-emerald-800 shadow-xs',
    bar: 'bg-gradient-to-r from-leaf-600 via-emerald-500 to-teal-500',
    border: 'border-leaf-500',
    ring: 'hover:border-leaf-300 hover:shadow-[0_16px_32px_-10px_rgba(16,185,129,0.22)]',
    cardAccent: 'from-leaf-600 to-emerald-500',
    cardBg: 'hover:border-leaf-300/80',
    tile: 'text-emerald-300',
    tileActive: 'border-emerald-400/90 bg-white/[0.14] shadow-[0_16px_36px_-10px_rgba(16,185,129,0.4)]',
    tileBorder: 'border-white/15 bg-white/[0.04] hover:border-leaf-400/50 hover:bg-white/[0.08]',
  },
  {
    text: 'text-charcoal-900',
    badge: 'bg-slate-100/90 border-slate-200/90 text-charcoal-900 shadow-xs',
    bar: 'bg-gradient-to-r from-charcoal-950 via-slate-800 to-slate-700',
    border: 'border-slate-800',
    ring: 'hover:border-slate-300 hover:shadow-[0_16px_32px_-10px_rgba(14,30,52,0.22)]',
    cardAccent: 'from-charcoal-900 to-slate-700',
    cardBg: 'hover:border-slate-300/80',
    tile: 'text-white',
    tileActive: 'border-slate-300/90 bg-white/[0.14] shadow-[0_16px_36px_-10px_rgba(255,255,255,0.25)]',
    tileBorder: 'border-white/15 bg-white/[0.04] hover:border-slate-300/50 hover:bg-white/[0.08]',
  },
] as const

const VALUE_ICONS = [HeartHandshake, TrendingUp, Users, Compass]

/** splits the intro's rich text into its paragraphs and its list items */
function splitIntro(html?: string | null) {
  if (!html) return null
  const items = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => {
    const t = m[1].match(/^\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*)$/)
    return t ? { title: t[1].replace(/[:：]\s*$/, ''), body: t[2] } : { title: '', body: m[1] }
  })
  if (!items.length) return null
  const lead = html.replace(/<(ul|ol)>[\s\S]*?<\/\1>/g, '').trim()
  return { lead, items }
}

/**
 * लोकमंगल परिवार page (Interactive 3D Sector Hub with Horizontal 3D Slider):
 * - Hero section: Ultra-frosted glass card + sleek value cards with elegant micro-icons (NO bulky 01,02,03 badges)
 * - Ecosystem metric strip: Full-width navy band with 3D frosted glass tiles that act as an interactive sector switcher
 * - 3D Horizontal Slider OR Grid View: Eliminates infinite vertical scrolling, allows 1-tap browsing of institutions
 */
export function LokmangalParivar({ blocks, locale }: { blocks?: Block[] | null; locale: 'mr' | 'en' }) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const sectorContentRef = useRef<HTMLDivElement>(null)
  const carouselTrackRef = useRef<HTMLDivElement>(null)

  const [selectedSector, setSelectedSector] = useState(0)
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider')
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  const list = (blocks ?? []).filter((b) => !('hidden' in b && b.hidden))
  const intro = list[0]?.blockType === 'content' ? (list[0] as Content) : null
  const sectors = list.filter(
    (b): b is Cards => b.blockType === 'cards' && !b.items?.some((c) => mediaUrl(c.image, 'card')) && (b.items?.length ?? 0) > 0,
  )
  const rest = list.filter((b) => b !== intro && !sectors.includes(b as Cards))
  const parts = splitIntro(intro?.body)
  const isMr = locale !== 'en'

  const currentSector = sectors[selectedSector] ?? sectors[0]
  const currentAccent = ACCENTS[selectedSector % ACCENTS.length]
  const currentItems = currentSector?.items ?? []

  const handleSelectSector = (idx: number, scrollDown = true) => {
    setSelectedSector(idx)
    setActiveCardIndex(0)
    if (scrollDown && sectorContentRef.current) {
      sectorContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  // Smooth scroll metric tile into center on mobile
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const card = el.children[selectedSector] as HTMLElement | undefined
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedSector])

  // Reset carousel scroll when sector changes
  useEffect(() => {
    if (carouselTrackRef.current) {
      carouselTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
    setActiveCardIndex(0)
  }, [selectedSector])

  // Track active slide on carousel scroll
  const handleCarouselScroll = () => {
    const el = carouselTrackRef.current
    if (!el || !el.children.length) return
    const cardWidth = (el.children[0] as HTMLElement).offsetWidth + 16 // width + gap
    const index = Math.round(el.scrollLeft / cardWidth)
    setActiveCardIndex(Math.min(Math.max(0, index), currentItems.length - 1))
  }

  const scrollCarousel = (direction: 'prev' | 'next') => {
    const el = carouselTrackRef.current
    if (!el || !el.children.length) return
    const cardWidth = (el.children[0] as HTMLElement).offsetWidth + 16
    const nextIdx = direction === 'next' ? Math.min(activeCardIndex + 1, currentItems.length - 1) : Math.max(activeCardIndex - 1, 0)
    el.scrollTo({ left: nextIdx * cardWidth, behavior: 'smooth' })
    setActiveCardIndex(nextIdx)
  }

  return (
    <div className="relative isolate space-y-10 sm:space-y-14 md:space-y-16">
      {/* Soft atmospheric background lighting */}
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 -z-10 size-80 rounded-full bg-saffron-500/10 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute top-96 left-0 -z-10 size-80 rounded-full bg-leaf-500/10 blur-[140px]" />

      {intro && (
        <section className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/95 via-white/85 to-cream/75 p-6 shadow-[0_20px_50px_-15px_rgba(14,30,52,0.1),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-xl sm:p-8 md:p-10 lg:col-span-7">
            {/* 3D Top Accent Bar */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-saffron-600 via-saffron-500 to-leaf-600 shadow-xs"
            />
            {/* Shimmer Light Reflection */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 size-48 rounded-bl-full bg-gradient-to-bl from-saffron-200/35 via-amber-100/20 to-transparent"
            />

            <div className="relative">
              {intro.eyebrow && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-saffron-500/30 bg-saffron-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700 shadow-xs backdrop-blur-sm">
                  <Sparkles className="size-3 text-saffron-600" />
                  {intro.eyebrow}
                </span>
              )}
              {intro.heading && (
                <h2 className="mb-4 mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-3xl md:text-4xl">
                  {intro.heading}
                </h2>
              )}
              <RichText html={parts ? parts.lead : intro.body} readMore className="leading-relaxed text-slate-600" />
            </div>
          </div>

          {/* 3D Value Cards (Horizontal swipe track on mobile, vertical stack on desktop — NO bulky 01, 02, 03 badges!) */}
          {parts && (
            <div id="hero-values" className="flex flex-col justify-between gap-3 lg:col-span-5">
              <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 py-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:py-0">
                {parts.items.map((it, i) => {
                  const IconComponent = VALUE_ICONS[i % VALUE_ICONS.length]
                  const isEven = i % 2 === 0
                  return (
                    <div
                      key={i}
                      className="group relative flex w-[82vw] max-w-[320px] shrink-0 snap-center items-start gap-3.5 overflow-hidden rounded-2xl border border-white/90 bg-white/90 p-4 sm:p-4.5 shadow-[0_6px_20px_-6px_rgba(14,30,52,0.07),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-10px_rgba(14,30,52,0.12)] active:scale-[0.99] lg:w-auto lg:shrink"
                    >
                      {/* Left vertical 3D accent indicator */}
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-y-0 left-0 w-1.5 transition-transform duration-300 group-hover:scale-y-110',
                          isEven
                            ? 'bg-gradient-to-b from-saffron-500 to-amber-500'
                            : 'bg-gradient-to-b from-leaf-600 to-emerald-500',
                        )}
                      />

                      {/* Elegant 3D micro-icon box */}
                      <div
                        className={cn(
                          'grid size-9.5 shrink-0 place-items-center rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-110',
                          isEven
                            ? 'border border-saffron-200/80 bg-gradient-to-br from-saffron-50 to-amber-100/60 text-saffron-600'
                            : 'border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-100/60 text-emerald-600',
                        )}
                      >
                        <IconComponent className="size-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {it.title && (
                          <h3 className="font-display text-[0.95rem] sm:text-base font-bold leading-snug text-charcoal-950 group-hover:text-saffron-700 transition-colors">
                            {it.title}
                          </h3>
                        )}
                        <RichText html={it.body} className="mt-1 !text-[0.85rem] !leading-relaxed text-slate-600 [&_p]:!m-0" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {sectors.length > 0 && (
        <>
          {/* Navy Ecosystem Overview: 3D Frosted Glass Selector Strip (No "At A Glance" badge) */}
          <section className="on-dark relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y-2 border-y-saffron-500/80 bg-gradient-to-b from-charcoal-950 via-[#0a1728] to-[#0e1e34] py-7 text-white md:py-9">
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 right-10 size-96 rounded-full bg-saffron-500/15 blur-[120px]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-10 size-96 rounded-full bg-leaf-500/10 blur-[120px]" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.035] [background-size:24px_24px]"
            />

            <div className="container-x relative">
              {/* Interactive 3D Sector Selector Strip: Swipeable on mobile / 5-col on desktop */}
              <div className="relative">
                <ul
                  ref={scrollRef}
                  className={cn(
                    'no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0 sm:grid sm:gap-3.5 md:overflow-visible',
                    sectors.length >= 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : sectors.length === 4 ? 'sm:grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-3',
                  )}
                >
                  {sectors.map((s, i) => {
                    const isSelected = selectedSector === i
                    const a = ACCENTS[i % ACCENTS.length]
                    return (
                      <li
                        key={s.id ?? i}
                        className={cn(
                          'w-[70vw] max-w-[250px] shrink-0 snap-center sm:w-auto sm:shrink sm:snap-align-none',
                          sectors.length % 2 === 1 && i === sectors.length - 1 && 'sm:max-md:col-span-2',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectSector(i, true)}
                          className={cn(
                            'group relative flex w-full h-full flex-col justify-between gap-3 rounded-2xl border p-4 text-left backdrop-blur-xl transition-all duration-300 select-none',
                            isSelected
                              ? a.tileActive
                              : a.tileBorder,
                            'hover:-translate-y-1 active:scale-95',
                          )}
                        >
                          {/* Active glowing indicator pill */}
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
                                isSelected ? 'bg-saffron-500 text-white shadow-xs' : 'bg-white/10 text-slate-300 group-hover:bg-white/20',
                              )}
                            >
                              {num(s.items?.length ?? 0, locale)} {isMr ? 'संस्था' : 'Units'}
                            </span>
                            <ArrowUpRight
                              className={cn(
                                'size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
                                isSelected ? 'text-saffron-400' : 'text-white/40 group-hover:text-white',
                              )}
                            />
                          </div>

                          <div>
                            <span className={cn('block font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl drop-shadow-sm', a.tile)}>
                              {num(s.items?.length ?? 0, locale)}
                            </span>
                            <span
                              className={cn(
                                'mt-2 block text-sm sm:text-base font-semibold leading-snug transition-colors',
                                isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white',
                              )}
                            >
                              {s.heading}
                            </span>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </section>

          {/* Active Sector Display Area: Clean layout, NO bulky 01/02 badges, NO endless scrolling! */}
          <div ref={sectorContentRef} className="scroll-mt-28 space-y-6 pt-1">
            {/* Sector Switcher & View Mode Toolbar (1-tap fast switching on mobile & desktop) */}
            <div className="flex flex-col gap-3.5 border-b border-stone-200/80 pb-4">
              {/* Top Row: Horizontal Sector Pill Tabs */}
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
                {sectors.map((s, idx) => {
                  const isActive = selectedSector === idx
                  return (
                    <button
                      key={s.id ?? idx}
                      type="button"
                      onClick={() => handleSelectSector(idx, false)}
                      className={cn(
                        'group flex items-center gap-2 rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 select-none',
                        isActive
                          ? 'bg-gradient-to-r from-saffron-600 via-saffron-500 to-amber-500 text-white shadow-md shadow-saffron-600/25 scale-[1.02]'
                          : 'bg-white border border-stone-200 text-charcoal-700 hover:bg-stone-50 hover:text-charcoal-950 active:scale-95',
                      )}
                    >
                      <span>{s.heading}</span>
                      <span
                        className={cn(
                          'grid size-5 place-items-center rounded-full text-[10px] font-bold',
                          isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600',
                        )}
                      >
                        {num(s.items?.length ?? 0, locale)}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Bottom Row: Controls bar with View Mode Toggle (3D Slider vs Grid) & Sector Prev/Next */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 3D Slider / Grid View Option Toggle */}
                <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100/80 p-0.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setViewMode('slider')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 select-none',
                      viewMode === 'slider'
                        ? 'bg-white text-saffron-700 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900',
                    )}
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span>{isMr ? '3D स्लायडर' : '3D Slider'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 select-none',
                      viewMode === 'grid'
                        ? 'bg-white text-saffron-700 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900',
                    )}
                  >
                    <LayoutGrid className="size-3.5" />
                    <span>{isMr ? 'ग्रिड' : 'Grid'}</span>
                  </button>
                </div>

                {/* Sector Prev / Next Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectSector(selectedSector > 0 ? selectedSector - 1 : sectors.length - 1, false)}
                    aria-label={isMr ? 'मागील विभाग' : 'Previous Sector'}
                    className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-700 shadow-xs transition-all hover:bg-stone-50 active:scale-95"
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden xs:inline">{isMr ? 'मागील' : 'Prev'}</span>
                  </button>
                  <span className="text-xs font-bold text-stone-500 px-1">
                    {num(selectedSector + 1, locale)} / {num(sectors.length, locale)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectSector(selectedSector < sectors.length - 1 ? selectedSector + 1 : 0, false)}
                    aria-label={isMr ? 'पुढील विभाग' : 'Next Sector'}
                    className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-700 shadow-xs transition-all hover:bg-stone-50 active:scale-95"
                  >
                    <span className="hidden xs:inline">{isMr ? 'पुढील' : 'Next'}</span>
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Sector Content (Animated Transition) */}
            <AnimatePresence mode="wait">
              <m.div
                key={selectedSector}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Sector Header (Clean modern look — NO bulky square icon box!) */}
                <div className="relative overflow-hidden rounded-2xl border border-white/90 bg-gradient-to-br from-white/95 via-cream/60 to-white/90 p-5 sm:p-6 shadow-[0_8px_25px_-8px_rgba(14,30,52,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-md">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Non-redundant single badge */}
                    <span className={cn('rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider', currentAccent.badge)}>
                      {currentSector?.eyebrow || `${num(currentItems.length, locale)} ${isMr ? 'संस्था' : 'Institutions'}`}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-charcoal-950">
                    {currentSector?.heading}
                  </h2>

                  {currentSector?.intro && (
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 max-w-3xl">
                      {currentSector.intro}
                    </p>
                  )}

                  <span aria-hidden className={cn('mt-3 block h-1 w-16 rounded-full shadow-xs', currentAccent.bar)} />
                </div>

                {/* Institutions View: 3D Slider Mode OR Responsive Grid Mode */}
                {viewMode === 'slider' ? (
                  /* Horizontal 3D Slider Container */
                  <div className="space-y-4">
                    {/* Swipeable Track */}
                    <div
                      ref={carouselTrackRef}
                      onScroll={handleCarouselScroll}
                      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0"
                    >
                      {currentItems.map((c, k) => (
                        <div
                          key={c.id ?? k}
                          className="w-[84vw] max-w-[340px] shrink-0 snap-center sm:w-[320px]"
                        >
                          <InstitutionCard
                            item={c}
                            accent={currentAccent}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Slider Navigation & Counter */}
                    <div className="flex items-center justify-between px-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        {currentItems.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => {
                              const el = carouselTrackRef.current
                              if (el && el.children[dotIdx]) {
                                (el.children[dotIdx] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                                setActiveCardIndex(dotIdx)
                              }
                            }}
                            aria-label={`Go to card ${dotIdx + 1}`}
                            className={cn(
                              'h-2 rounded-full transition-all duration-300',
                              activeCardIndex === dotIdx
                                ? 'w-6 bg-saffron-500 shadow-xs'
                                : 'w-2 bg-stone-300 hover:bg-stone-400',
                            )}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500">
                          {num(activeCardIndex + 1, locale)} / {num(currentItems.length, locale)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => scrollCarousel('prev')}
                            disabled={activeCardIndex === 0}
                            aria-label={isMr ? 'मागील कार्ड' : 'Previous Card'}
                            className="grid size-8 place-items-center rounded-full border border-stone-200 bg-white text-charcoal-700 shadow-xs transition-all hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                          >
                            <ChevronLeft className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollCarousel('next')}
                            disabled={activeCardIndex === currentItems.length - 1}
                            aria-label={isMr ? 'पुढील कार्ड' : 'Next Card'}
                            className="grid size-8 place-items-center rounded-full border border-stone-200 bg-white text-charcoal-700 shadow-xs transition-all hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                          >
                            <ChevronRight className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Responsive Grid Mode (Clean modern look — NO bulky 01, 02 number boxes!) */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentItems.map((c, k) => (
                      <InstitutionCard
                        key={c.id ?? k}
                        item={c}
                        accent={currentAccent}
                      />
                    ))}
                  </div>
                )}
              </m.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {rest.length > 0 && (
        <div className="mt-12 md:mt-16">
          <PageBlocks blocks={rest} design="stitch" />
        </div>
      )}
    </div>
  )
}

/** 3D Glassmorphic Institution Card (Clean modern look — NO bulky 01/02 boxes!) */
function InstitutionCard({
  item,
  accent,
}: {
  item: NonNullable<Cards['items']>[number]
  accent: (typeof ACCENTS)[number]
}) {
  return (
    <CardBox
      url={item.url}
      className={cn(
        'group relative flex h-full min-h-[140px] flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 p-5',
        'bg-gradient-to-br from-white via-white/95 to-amber-50/20',
        'shadow-[0_4px_16px_-4px_rgba(14,30,52,0.06),inset_0_1px_1px_rgba(255,255,255,1)]',
        'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_35px_-10px_rgba(14,30,52,0.12)] active:scale-[0.99]',
        accent.ring,
      )}
    >
      {/* 3D Vertical Accent Glow Line */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b transition-all duration-300',
          accent.cardAccent,
          'group-hover:w-2',
        )}
      />

      {/* Shimmer light effect on top right */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 size-24 rounded-bl-full bg-gradient-to-bl from-amber-100/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative pl-1">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.05rem] font-bold leading-snug text-charcoal-950 transition-colors group-hover:text-saffron-700">
            {item.title}
          </h3>
          {item.url && (
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-stone-200/70 bg-stone-100/80 text-stone-500 shadow-xs transition-all group-hover:border-saffron-300 group-hover:bg-saffron-500 group-hover:text-white group-hover:shadow-sm">
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          )}
        </div>

        {item.meta && (
          <span
            className={cn(
              'inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs',
              accent.badge,
            )}
          >
            {item.meta}
          </span>
        )}
        {item.text && (
          <p className="mt-2.5 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-slate-600">
            {item.text}
          </p>
        )}
        {!!item.tags?.length && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((t, ti) => (
              <span key={ti} className="rounded-md border border-stone-200/60 bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom subtle indicator line */}
      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-[11px] font-medium text-stone-400">
        <span className="flex items-center gap-1.5">
          <span className={cn('size-1.5 rounded-full', item.url ? 'bg-saffron-500' : 'bg-stone-300')} />
          <span>{LOCALE === 'en' ? (item.url ? 'More info' : 'Lokmangal Parivar') : item.url ? 'अधिक माहिती' : 'लोकमंगल परिवार'}</span>
        </span>
        {item.url && (
          <span className="text-saffron-600 font-semibold group-hover:underline">
            {LOCALE === 'en' ? 'View' : 'पहा'} &rarr;
          </span>
        )}
      </div>
    </CardBox>
  )
}

/** an institution card is a link when the admin gives it one */
const CardBox = ({ url, className, children }: { url?: string | null; className?: string; children: ReactNode }) =>
  url ? <CMSLink url={url} className={className}>{children}</CMSLink> : <div className={className}>{children}</div>

