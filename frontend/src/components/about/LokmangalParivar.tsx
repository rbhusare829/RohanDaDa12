import { useRef, useState, useEffect, type ReactNode } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'
import { AccentBar } from '@/components/ui/Motion'
import {
  ArrowUpRight,
  Sparkles,
  HeartHandshake,
  TrendingUp,
  Users,
  Compass,
  Landmark,
  Factory,
  Sprout,
  GraduationCap,
  Building2,
  ShieldCheck,
  Calendar,
  Briefcase,
  Award,
  Layers,
  LayoutGrid,
} from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn } from '@/lib/utils'
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

/** 5 Sector Color & Icon Themes matching Lokmangal Core Sectors */
const SECTOR_THEMES = [
  {
    icon: Landmark,
    accentGradient: 'from-amber-500 to-saffron-600',
    lightBg: 'bg-amber-50/80',
    badge: 'bg-amber-100/90 text-amber-900 border-amber-300/80',
    border: 'border-amber-200/90',
    cardBorderHover: 'hover:border-amber-400/90',
    glow: 'rgba(245, 158, 11, 0.2)',
    bar: 'bg-gradient-to-r from-saffron-600 via-amber-500 to-yellow-500',
    tileText: 'text-amber-400',
    tileActive: 'border-amber-400/90 bg-gradient-to-b from-amber-500/25 to-amber-950/40 text-white shadow-[0_12px_28px_-6px_rgba(245,158,11,0.35)]',
    tagBg: 'bg-amber-50/80 text-amber-900 border-amber-200/80',
    iconBg: 'bg-amber-500/15 text-amber-600',
  },
  {
    icon: Factory,
    accentGradient: 'from-orange-600 to-amber-600',
    lightBg: 'bg-orange-50/80',
    badge: 'bg-orange-100/90 text-orange-900 border-orange-300/80',
    border: 'border-orange-200/90',
    cardBorderHover: 'hover:border-orange-400/90',
    glow: 'rgba(234, 88, 12, 0.2)',
    bar: 'bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500',
    tileText: 'text-orange-400',
    tileActive: 'border-orange-400/90 bg-gradient-to-b from-orange-500/25 to-orange-950/40 text-white shadow-[0_12px_28px_-6px_rgba(234,88,12,0.35)]',
    tagBg: 'bg-orange-50/80 text-orange-900 border-orange-200/80',
    iconBg: 'bg-orange-500/15 text-orange-600',
  },
  {
    icon: Sprout,
    accentGradient: 'from-emerald-600 to-teal-500',
    lightBg: 'bg-emerald-50/80',
    badge: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/80',
    border: 'border-emerald-200/90',
    cardBorderHover: 'hover:border-emerald-400/90',
    glow: 'rgba(16, 185, 129, 0.2)',
    bar: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500',
    tileText: 'text-emerald-300',
    tileActive: 'border-emerald-400/90 bg-gradient-to-b from-emerald-500/25 to-emerald-950/40 text-white shadow-[0_12px_28px_-6px_rgba(16,185,129,0.35)]',
    tagBg: 'bg-emerald-50/80 text-emerald-900 border-emerald-200/80',
    iconBg: 'bg-emerald-500/15 text-emerald-600',
  },
  {
    icon: GraduationCap,
    accentGradient: 'from-blue-600 to-indigo-600',
    lightBg: 'bg-blue-50/80',
    badge: 'bg-blue-100/90 text-blue-900 border-blue-300/80',
    border: 'border-blue-200/90',
    cardBorderHover: 'hover:border-blue-400/90',
    glow: 'rgba(37, 99, 235, 0.2)',
    bar: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500',
    tileText: 'text-blue-300',
    tileActive: 'border-blue-400/90 bg-gradient-to-b from-blue-500/25 to-blue-950/40 text-white shadow-[0_12px_28px_-6px_rgba(37,99,235,0.35)]',
    tagBg: 'bg-blue-50/80 text-blue-900 border-blue-200/80',
    iconBg: 'bg-blue-500/15 text-blue-600',
  },
  {
    icon: HeartHandshake,
    accentGradient: 'from-purple-600 to-pink-600',
    lightBg: 'bg-purple-50/80',
    badge: 'bg-purple-100/90 text-purple-900 border-purple-300/80',
    border: 'border-purple-200/90',
    cardBorderHover: 'hover:border-purple-400/90',
    glow: 'rgba(147, 51, 234, 0.2)',
    bar: 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500',
    tileText: 'text-purple-300',
    tileActive: 'border-purple-400/90 bg-gradient-to-b from-purple-500/25 to-purple-950/40 text-white shadow-[0_12px_28px_-6px_rgba(147,51,234,0.35)]',
    tagBg: 'bg-purple-50/80 text-purple-900 border-purple-200/80',
    iconBg: 'bg-purple-500/15 text-purple-600',
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

/** Extracts bullet points/chips from item.meta string by splitting on • */
function parseMetaChips(meta?: string | null) {
  if (!meta) return []
  return meta
    .split('•')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Determines micro-chip icon based on text */
function getChipIcon(chip: string) {
  if (chip.includes('स्थापना') || chip.includes('Est') || chip.includes('सप्टेंबर') || chip.includes('एप्रिल')) {
    return Calendar
  }
  if (chip.includes('शाखा') || chip.includes('Branch') || chip.includes('कॅम्पस') || chip.includes('एक')) {
    return Building2
  }
  if (chip.includes('व्यवसाय') || chip.includes('ठेवी') || chip.includes('कोटी') || chip.includes('Cr')) {
    return Briefcase
  }
  if (chip.includes('रेकॉर्ड') || chip.includes('मानांकन') || chip.includes('मान्यता') || chip.includes('Record')) {
    return Award
  }
  return Sparkles
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

/**
 * लोकमंगल परिवार page (Premium, responsive & interactive layout for Mobile & PC):
 * - Hero & Conglomerate Scale: 4 Key Metrics (₹5,600 Cr Turnover, ₹3,401 Cr Deposits, 143+ Branches, 25+ Years)
 * - 4 Core Pillars of Lokmangal Group with elegant glassmorphic cards
 * - 5 Sectors Navigation: Responsive touch-friendly tabs on mobile + 5-col royal card grid on PC
 * - Active Sector Showcase or All-17 Institutions View: Clean 3-col responsive grid of institutions
 */
export function LokmangalParivar({ blocks, locale }: { blocks?: Block[] | null; locale: 'mr' | 'en' }) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const sectorContentRef = useRef<HTMLDivElement>(null)

  // 'all' or sector index (0 to 4)
  const [activeView, setActiveView] = useState<number | 'all'>(0)

  const list = (blocks ?? []).filter((b) => !('hidden' in b && b.hidden))
  const intro = list[0]?.blockType === 'content' ? (list[0] as Content) : null
  const sectors = list.filter(
    (b): b is Cards => b.blockType === 'cards' && !b.items?.some((c) => mediaUrl(c.image, 'card')) && (b.items?.length ?? 0) > 0,
  )
  const rest = list.filter((b) => b !== intro && !sectors.includes(b as Cards))
  const parts = splitIntro(intro?.body)
  const isMr = locale !== 'en'

  const totalInstitutions = sectors.reduce((acc, s) => acc + (s.items?.length ?? 0), 0)

  const selectedSectorIdx = typeof activeView === 'number' ? activeView : 0
  const currentSector = sectors[selectedSectorIdx] ?? sectors[0]
  const currentTheme = SECTOR_THEMES[selectedSectorIdx % SECTOR_THEMES.length]
  const currentItems = currentSector?.items ?? []

  const handleSelectSector = (idx: number | 'all', scrollDown = true) => {
    setActiveView(idx)
    if (scrollDown && sectorContentRef.current) {
      sectorContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Smooth scroll active sector tile into view on mobile
  useEffect(() => {
    if (typeof activeView !== 'number') return
    const el = scrollRef.current
    if (!el) return
    const card = el.children[activeView] as HTMLElement | undefined
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeView])

  // 4 Big Conglomerate Statistics
  const conglomerateStats = [
    {
      value: isMr ? '₹५,६००+ कोटी' : '₹5,600+ Cr',
      label: isMr ? 'एकत्रित वार्षिक व्यवसाय' : 'Combined Turnover',
      sub: isMr ? '४ प्रमुख वित्तीय व उद्योग संस्था' : '4 Major Business Entities',
      icon: TrendingUp,
    },
    {
      value: isMr ? '३,४०१+ कोटी' : '₹3,401+ Cr',
      label: isMr ? 'विश्वासार्ह सार्वजनिक ठेवी' : 'Public Deposits',
      sub: isMr ? 'लाखो समाधानी खातेदार' : 'Millions of Satisfied Members',
      icon: Landmark,
    },
    {
      value: isMr ? '१४३+ शाखा' : '143+ Branches',
      label: isMr ? 'विस्तृत सेवा नेटवर्क' : 'Service Network',
      sub: isMr ? 'महाराष्ट्र व कर्नाटक कार्यक्षेत्र' : 'Maharashtra & Karnataka',
      icon: Building2,
    },
    {
      value: isMr ? '२५+ वर्षे' : '25+ Years',
      label: isMr ? 'अखंड लोकसेवेचा वारसा' : 'Legacy of Public Service',
      sub: isMr ? '१९९८ गुढीपाडव्यापासून अविरत' : 'Since Gudi Padwa 1998',
      icon: Sparkles,
    },
  ]

  return (
    <div className="relative isolate space-y-12 sm:space-y-16 md:space-y-20">
      {/* Ambient Atmospheric Lighting */}
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 -z-10 size-96 rounded-full bg-saffron-500/10 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute top-[600px] left-0 -z-10 size-96 rounded-full bg-emerald-500/10 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute top-[1400px] right-0 -z-10 size-96 rounded-full bg-blue-500/10 blur-[140px]" />

      {/* =========================================================================
          1. Hero & Introduction Section
          ========================================================================= */}
      {intro && (
        <section className="space-y-8 sm:space-y-10">
          <div className="grid grid-cols-1 items-stretch gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Narrative Card */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 bg-gradient-to-br from-white via-white/95 to-amber-50/30 p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_-15px_rgba(14,30,52,0.08),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-xl lg:col-span-7">
              {/* Top Accent Gradient Bar */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-saffron-500 to-amber-500 shadow-xs"
              />

              <div className="relative">
                {intro.eyebrow && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-saffron-300/80 bg-saffron-50/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-saffron-700 shadow-xs backdrop-blur-sm">
                    <Sparkles className="size-3.5 text-saffron-600" />
                    {intro.eyebrow}
                  </span>
                )}

                {intro.heading && (
                  <h2 className="mb-4 mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-charcoal-950 sm:text-3xl md:text-4xl">
                    {intro.heading}
                  </h2>
                )}

                {/* Saffron & Crimson Divider */}
                <AccentBar className="mb-5" bar="h-1.5 w-16" dot="h-1.5 w-3.5" />

                {/* Narrative Text */}
                <div className="leading-relaxed text-stone-700 font-normal text-base sm:text-[1.05rem]">
                  <RichText html={parts ? parts.lead : intro.body} className="leading-relaxed text-stone-700" />
                </div>
              </div>

              {/* Verified Trust Badge at bottom of card */}
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-4 text-xs font-semibold text-stone-500">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  {isMr ? '२५+ वर्षांची अखंड सेवा परंपरा' : '25+ Years Legacy of Trust'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1.5 text-saffron-700">
                  <Building2 className="size-4 text-saffron-600" />
                  {isMr ? 'महाराष्ट्र व कर्नाटकातील अग्रगण्य समूह' : 'Leading Maharashtra-Karnataka Conglomerate'}
                </span>
              </div>
            </div>

            {/* Right: 4 Core Value Pillars */}
            {parts && (
              <div id="hero-values" className="flex flex-col justify-between gap-3.5 lg:col-span-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                  {parts.items.map((it, i) => {
                    const IconComponent = VALUE_ICONS[i % VALUE_ICONS.length]
                    const isEven = i % 2 === 0
                    return (
                      <div
                        key={i}
                        className="group relative flex items-start gap-3.5 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-4 sm:p-4.5 shadow-[0_4px_16px_-4px_rgba(14,30,52,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-saffron-300 hover:shadow-[0_16px_32px_-10px_rgba(14,30,52,0.1)]"
                      >

                        {/* Icon Box */}
                        <div
                          className={cn(
                            'grid size-10 shrink-0 place-items-center rounded-xl shadow-xs transition-transform duration-300 group-hover:scale-105',
                            isEven
                              ? 'border border-amber-200 bg-amber-50 text-amber-700'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700',
                          )}
                        >
                          <IconComponent className="size-5" />
                        </div>

                        <div className="flex-1 min-w-0 pl-0.5">
                          {it.title && (
                            <h3 className="font-display text-base font-bold text-charcoal-950 transition-colors group-hover:text-saffron-700">
                              {it.title}
                            </h3>
                          )}
                          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-stone-600">
                            {it.body.replace(/^[–—: -]+/, '')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4 Big Conglomerate Scale Metrics Ribbon */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-r from-[#000d3d] via-[#091b4f] to-[#000d3d] p-6 sm:p-8 shadow-[0_20px_45px_-12px_rgba(0,13,61,0.35)] text-white">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 size-60 rounded-full bg-saffron-500/20 blur-[90px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-emerald-500/20 blur-[90px]" />

            <div className="relative grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
              {conglomerateStats.map((st, idx) => {
                const StatIcon = st.icon
                return (
                  <div
                    key={idx}
                    className="flex flex-col border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0 last:border-none pl-2 sm:pl-4 group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="grid size-7 place-items-center rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 shadow-xs">
                        <StatIcon className="size-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                        {isMr ? 'अधिकृत सांख्यिकी' : 'Official Metric'}
                      </span>
                    </div>
                    <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-amber-400 drop-shadow-sm transition-transform duration-300 group-hover:translate-x-1">
                      {st.value}
                    </span>
                    <span className="mt-1 text-sm sm:text-base font-bold text-white">
                      {st.label}
                    </span>
                    <span className="mt-0.5 text-xs text-slate-300">
                      {st.sub}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          2. The 5 Core Sectors Navigation Hub (Interactive Selector)
          ========================================================================= */}
      {sectors.length > 0 && (
        <section className="space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-saffron-600">
                  {isMr ? 'लोकमंगल परिवार कार्यक्षेत्रे' : 'Conglomerate Sectors'}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-950 mt-1">
                  {isMr ? 'प्रमुख ५ कार्यक्षेत्रे आणि संस्था समूह' : '5 Core Pillars & Institutions'}
                </h2>
              </div>

              {/* View Switcher (By Sector vs All 17 Institutions) - Desktop/Tablet Only */}
              <div className="hidden sm:inline-flex rounded-xl border border-stone-200/90 bg-stone-100/80 p-1 shadow-xs backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => handleSelectSector(typeof activeView === 'number' ? activeView : 0, false)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                    typeof activeView === 'number'
                      ? 'bg-white text-charcoal-950 shadow-xs border border-stone-200/60'
                      : 'text-stone-600 hover:text-charcoal-950',
                  )}
                >
                  <LayoutGrid className="size-3.5 text-saffron-600" />
                  <span>{isMr ? 'विभागानुसार' : 'By Sector'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSector('all', true)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                    activeView === 'all'
                      ? 'bg-white text-charcoal-950 shadow-xs border border-stone-200/60'
                      : 'text-stone-600 hover:text-charcoal-950',
                  )}
                >
                  <Layers className="size-3.5 text-saffron-600" />
                  <span>{isMr ? `सर्व ${num(totalInstitutions, locale)} संस्था` : `All ${totalInstitutions} Units`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5 Sector Interactive Tiles (Responsive: Swipe on mobile, 5-col grid on PC) */}
          <div className="relative">
            <ul
              ref={scrollRef}
              className={cn(
                'no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0 sm:grid sm:gap-3.5 md:overflow-visible',
                sectors.length >= 5 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3',
              )}
            >
              {sectors.map((s, i) => {
                const isSelected = activeView === i
                const theme = SECTOR_THEMES[i % SECTOR_THEMES.length]
                const SectorIcon = theme.icon

                return (
                  <li
                    key={s.id ?? i}
                    className={cn(
                      'w-[74vw] max-w-[270px] shrink-0 snap-center sm:w-auto sm:shrink sm:snap-align-none',
                      sectors.length % 2 === 1 && i === sectors.length - 1 && 'sm:max-md:col-span-2',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectSector(i, true)}
                      className={cn(
                        'group relative flex w-full h-full flex-col justify-between gap-4 rounded-2xl border p-4 text-left transition-all duration-300 select-none cursor-pointer',
                        isSelected
                          ? 'border-saffron-500 bg-white shadow-[0_16px_36px_-8px_rgba(245,158,11,0.28)] ring-2 ring-saffron-400/40 -translate-y-1'
                          : 'border-stone-200/90 bg-white/95 hover:border-saffron-300 hover:shadow-md hover:-translate-y-0.5',
                        'active:scale-95',
                      )}
                    >
                      {/* Active Top Bar Indicator */}
                      {isSelected && (
                        <span
                          aria-hidden
                          className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-red-600 via-saffron-500 to-amber-500"
                        />
                      )}

                      {/* Header row: Icon & Units Count Pill */}
                      <div className="flex items-center justify-between w-full">
                        <div
                          className={cn(
                            'grid size-10 place-items-center rounded-xl transition-all duration-300',
                            isSelected ? 'bg-saffron-500 text-white shadow-xs scale-105' : theme.iconBg,
                          )}
                        >
                          <SectorIcon className="size-5" />
                        </div>

                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-colors',
                            isSelected
                              ? 'bg-saffron-100 text-saffron-900 border border-saffron-300'
                              : 'bg-stone-100 text-stone-600 border border-stone-200/60',
                          )}
                        >
                          {num(s.items?.length ?? 0, locale)} {isMr ? 'संस्था' : 'Units'}
                        </span>
                      </div>

                      {/* Sector Title */}
                      <div>
                        <span
                          className={cn(
                            'block text-sm sm:text-base font-bold leading-snug transition-colors line-clamp-2',
                            isSelected ? 'text-charcoal-950 font-extrabold' : 'text-stone-700 group-hover:text-charcoal-950',
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

            {/* Mobile swipe hint dots */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2">
              {sectors.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  aria-label={`Go to sector ${dotIdx + 1}`}
                  onClick={() => handleSelectSector(dotIdx, true)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                    activeView === dotIdx ? 'w-6 bg-saffron-600' : 'w-1.5 bg-stone-300',
                  )}
                />
              ))}
            </div>
          </div>

          {/* =========================================================================
              3. Institutions Showcase
              ========================================================================= */}
          <div ref={sectorContentRef} className="scroll-mt-24 space-y-8 pt-2">
            {activeView === 'all' ? (
              /* Display ALL 5 Sectors in a Comprehensive Sequence */
              <div className="space-y-12">
                {sectors.map((sec, secIdx) => {
                  const secTheme = SECTOR_THEMES[secIdx % SECTOR_THEMES.length]
                  const secItems = sec.items ?? []
                  return (
                    <div key={sec.id ?? secIdx} className="space-y-6">
                      {/* Sector Banner */}
                      <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white via-white to-amber-50/20 p-5 sm:p-7 shadow-[0_10px_30px_-10px_rgba(14,30,52,0.06)] backdrop-blur-md">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={cn('rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider', secTheme.badge)}>
                            {sec.eyebrow || `${num(secItems.length, locale)} ${isMr ? 'संस्था' : 'Institutions'}`}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-charcoal-950">
                          {sec.heading}
                        </h3>

                        {sec.intro && (
                          <p className="mt-2 text-sm sm:text-base leading-relaxed text-stone-600 max-w-3xl">
                            {sec.intro}
                          </p>
                        )}

                        <span aria-hidden className={cn('mt-3.5 block h-1 w-20 rounded-full shadow-xs', secTheme.bar)} />
                      </div>

                      {/* Institutions Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {secItems.map((c, k) => (
                          <InstitutionCard
                            key={c.id ?? k}
                            item={c}
                            theme={secTheme}
                            locale={locale}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Display Single Active Sector with Staggered Motion */
              <AnimatePresence mode="wait">
                <m.div
                  key={selectedSectorIdx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="space-y-6"
                >
                  {/* Sector Header Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white via-white to-amber-50/20 p-5 sm:p-7 shadow-[0_10px_30px_-10px_rgba(14,30,52,0.06)] backdrop-blur-md">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cn('rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider', currentTheme.badge)}>
                        {currentSector?.eyebrow || `${num(currentItems.length, locale)} ${isMr ? 'संस्था' : 'Institutions'}`}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-charcoal-950">
                      {currentSector?.heading}
                    </h3>

                    {currentSector?.intro && (
                      <p className="mt-2 text-sm sm:text-base leading-relaxed text-stone-600 max-w-3xl">
                        {currentSector.intro}
                      </p>
                    )}

                    <span aria-hidden className={cn('mt-3.5 block h-1 w-20 rounded-full shadow-xs', currentTheme.bar)} />
                  </div>

                  {/* Institutions View: 3-Column Responsive Grid on PC, 1-Col on Phone */}
                  <m.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {currentItems.map((c, k) => (
                      <m.div key={c.id ?? k} variants={itemVariants} className="h-full">
                        <InstitutionCard
                          item={c}
                          theme={currentTheme}
                          locale={locale}
                        />
                      </m.div>
                    ))}
                  </m.div>
                </m.div>
              </AnimatePresence>
            )}
          </div>
        </section>
      )}

      {/* Optional extra blocks */}
      {rest.length > 0 && (
        <div className="mt-12 md:mt-16">
          <PageBlocks blocks={rest} design="stitch" />
        </div>
      )}
    </div>
  )
}

/**
 * 3D High-Impact Institution Card:
 * - Structured title and external link indicator
 * - Clean micro-chips for metadata (स्थापना, शाखा, व्यवसाय) with contextual icons
 * - Readable description text
 * - Tag badges
 * - Prominent website button with hover animations
 */
function InstitutionCard({
  item,
  theme,
  locale,
}: {
  item: NonNullable<Cards['items']>[number]
  theme: (typeof SECTOR_THEMES)[number]
  locale: string
}) {
  const isMr = locale !== 'en'
  const metaChips = parseMetaChips(item.meta)

  return (
    <CardBox
      url={item.url}
      className={cn(
        'group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 p-5 sm:p-6',
        'bg-white/95',
        'shadow-[0_4px_16px_-4px_rgba(14,30,52,0.06),inset_0_1px_1px_rgba(255,255,255,1)]',
        'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_35px_-10px_rgba(14,30,52,0.12)]',
        theme.cardBorderHover,
      )}
    >
      <div className="relative">
        {/* Top Header: Title & Link Arrow */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h4 className="font-display text-lg font-bold leading-snug text-charcoal-950 transition-colors group-hover:text-saffron-700">
            {item.title}
          </h4>
          {item.url && (
            <span className="grid size-7.5 shrink-0 place-items-center rounded-full border border-stone-200 bg-stone-50 text-stone-500 shadow-xs transition-all group-hover:border-saffron-400 group-hover:bg-saffron-500 group-hover:text-white group-hover:scale-105">
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          )}
        </div>

        {/* Structured Metadata Micro-Chips (Splits on • with Smart Icons) */}
        {metaChips.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5 pt-1">
            {metaChips.map((chip, ci) => {
              const ChipIcon = getChipIcon(chip)
              return (
                <span
                  key={ci}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-tight',
                    theme.badge,
                  )}
                >
                  <ChipIcon className="size-3 shrink-0 opacity-75" />
                  <span>{chip}</span>
                </span>
              )
            })}
          </div>
        )}

        {/* Main Body Text */}
        {item.text && (
          <p className="mt-2 whitespace-pre-line text-xs sm:text-sm leading-relaxed text-stone-600">
            {item.text}
          </p>
        )}

        {/* Feature Tags List */}
        {!!item.tags?.length && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {item.tags.map((t, ti) => (
              <span
                key={ti}
                className="rounded-md border border-stone-200/70 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-stone-400 text-[11px]">
          <span className={cn('size-1.5 rounded-full', item.url ? 'bg-saffron-500' : 'bg-stone-300')} />
          <span>{item.url ? (isMr ? 'अधिकृत संकेतस्थळ' : 'Official Portal') : (isMr ? 'लोकमंगल परिवार संलग्न' : 'Lokmangal Group')}</span>
        </span>

        {item.url && (
          <span className="flex items-center gap-1 text-saffron-600 group-hover:text-saffron-700 group-hover:underline">
            <span>{isMr ? 'संकेतस्थळ पहा' : 'Visit Website'}</span>
            <ArrowUpRight className="size-3.5" />
          </span>
        )}
      </div>
    </CardBox>
  )
}

/** an institution card is a link when the admin gives it one */
const CardBox = ({ url, className, children }: { url?: string | null; className?: string; children: ReactNode }) =>
  url ? (
    <CMSLink url={url} className={cn(className, 'cursor-pointer')} newTab>
      {children}
    </CMSLink>
  ) : (
    <div className={className}>{children}</div>
  )
