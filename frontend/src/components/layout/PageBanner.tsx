import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Award, Building2, ChevronRight, Home, Sparkles, User, Users } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { Img } from '../ui/Img'

export type Crumb = { label: string; href?: string }
export type BannerTab = { label: string; href: string; active?: boolean }

const getTabIcon = (href: string) => {
  if (href.includes('introduction')) return User
  if (href.includes('biography') || href.includes('family')) return Users
  if (href.includes('parivar') || href.includes('foundation')) return Building2
  if (href.includes('political-career')) return Award
  return null
}

/**
 * Real photos of Rohan among people, used behind the page title when a page has no banner photo of its own.
 * Each section of the site keeps its own photo, so moving between sibling pages never changes the picture.
 */
const DEFAULT_BANNERS: { match: RegExp; src: string; position: string }[] = [
  { match: /^\/about/, src: '/images/portraits/rohan-deshmukh-office.webp', position: '60% 12%' },
  { match: /^\/(political-career|appeal|vision)/, src: '/images/gallery/political/rd-political-26.webp', position: '50% 22%' },
  { match: /^\/(lokmangal|social-work)/, src: '/images/gallery/political/rd-political-12.webp', position: '50% 20%' },
  { match: /^\/(media|events)/, src: '/images/gallery/political/rd-political-03.webp', position: '50% 22%' },
  { match: /.*/, src: '/images/gallery/political/rd-political-04.webp', position: '50% 14%' },
]

function defaultBanner(path?: string) {
  const p = path || '/'
  return DEFAULT_BANNERS.find((b) => b.match.test(p))!
}

/** Breadcrumbs bar (100% Supriya Sule mubase-breadcrumb layout) */
function BreadcrumbsBar({ crumbs }: { crumbs?: Crumb[] }) {
  if (!crumbs || crumbs.length === 0) return null
  return (
    <div className="border-b border-stone-200 bg-[#f8fafc] py-2.5 text-xs text-slate-600">
      <div className="container-x flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-[#000d3d] hover:text-red-600 transition-colors">
          <Home className="size-3.5" />
          <span>मुख्यपृष्ठ</span>
        </Link>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1
          return (
            <div key={idx} className="flex items-center gap-2">
              <ChevronRight className="size-3 text-slate-400" />
              {isLast || !crumb.href ? (
                <span className="font-semibold text-slate-900 line-clamp-1">{crumb.label}</span>
              ) : (
                <Link to={crumb.href} className="font-medium text-slate-600 hover:text-red-600 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The top of every inner page — 100% Supriya Sule ja-masthead layout:
 * - Photographic banner with deep navy overlay
 * - Large title with signature red & saffron accent line
 * - Breadcrumb row (Home > Section > Current)
 * - Sibling pages as horizontal tab bar
 */
export function PageBanner({
  title, subtitle, image, imagePosition, tabs, tabsLabel, compact, eyebrow, children, path, light, variant, crumbs,
}: {
  title: string; eyebrow?: string | null; subtitle?: string | null
  crumbs?: Crumb[]; image?: string | null; imagePosition?: string
  tabs?: BannerTab[]; tabsLabel?: string
  /** article pages: long headline in a smaller size */
  compact?: boolean
  /** extra line under the title (e.g. article byline) */
  children?: ReactNode
  /** page path — picks the section's default photo when the page has none */
  path?: string
  /** no photo: full-width title */
  light?: boolean
  /** Stitch page header (Oct 2026): 'navy' = deep navy band with kesariya & green glows, 'light' = warm ivory band */
  variant?: 'navy' | 'light'
}) {
  const fallback = defaultBanner(path)
  const photo = light ? null : (image ?? fallback.src)
  const position = image ? imagePosition : fallback.position

  if (variant) return <StitchBanner title={title} subtitle={subtitle} eyebrow={eyebrow} tabs={tabs} tabsLabel={tabsLabel} variant={variant} path={path} crumbs={crumbs} />

  return (
    <>
      <section className="relative isolate overflow-hidden bg-cream text-charcoal-900">
        {photo && (
          <div aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-[46%] md:block">
            <Img src={photo} alt="" fill priority className="object-cover" style={{ objectPosition: position }} sizes="46vw" />
            {/* the photo melts into the band on its left edge */}
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/40 to-transparent" />
          </div>
        )}
        <div className={cn('container-x flex flex-col justify-center py-10 md:py-12', photo ? 'min-h-[12rem] md:min-h-[16rem]' : 'min-h-[11rem] md:min-h-[13rem]')}>
          <div className={cn(photo && 'md:max-w-[52%]')}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1
              className={cn(
                'animate-fade-up h-section !mt-1 text-charcoal-900',
                compact ? '!text-[1.75rem] !leading-[1.35] md:!text-[2.4rem]' : '!text-[2rem] md:!text-[2.85rem]',
              )}
            >
              {title}
            </h1>
            <div className="mt-3 mb-3 flex items-center gap-1.5">
              <span className="h-1.5 w-14 rounded-full bg-red-600" />
              <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
            </div>
            {subtitle && <p className="mt-3 max-w-2xl text-[1.08rem] leading-relaxed text-muted md:text-[1.15rem]">{subtitle}</p>}
            {children}
          </div>
        </div>
      </section>

      {/* Breadcrumbs Row (100% Supriya Sule layout) */}
      <BreadcrumbsBar crumbs={crumbs} />

      {/* the section's pages as pills under the header (the current page in kesariya) */}
      {!!tabs?.length && <SubNavTabs tabs={tabs} tabsLabel={tabsLabel} path={path} />}
    </>
  )
}

/**
 * Stitch page header (Oct 2026): the eyebrow, the page title and its subtitle — on deep navy with soft kesariya / green glows ('navy'), or on warm ivory ('light', where the subtitle sits in
 * a card beside the title). The section's sibling pages follow as a row of pills.
 */
function StitchBanner({
  title, subtitle, eyebrow, tabs, tabsLabel, variant, path, crumbs,
}: {
  title: string; subtitle?: string | null; eyebrow?: string | null; tabs?: BannerTab[]; tabsLabel?: string; variant: 'navy' | 'light'; path?: string; crumbs?: Crumb[]
}) {
  const navy = variant === 'navy'
  return (
    <>
      <section className={cn('relative isolate w-full overflow-hidden', navy ? 'bg-gradient-to-r from-[#000d3d] via-[#091b4a] to-[#122858] text-white' : 'bg-ivory text-charcoal-950')}>
        <div aria-hidden className={cn('pointer-events-none absolute -top-40 right-0 -z-10 size-[36rem] rounded-full blur-[140px]', navy ? 'bg-saffron-600/25' : 'bg-saffron-500/10')} />
        <div aria-hidden className={cn('pointer-events-none absolute bottom-0 left-10 -z-10 size-[28rem] rounded-full blur-[150px]', navy ? 'bg-leaf-600/15' : 'bg-leaf-600/5')} />
        {navy && <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.04] [background-size:24px_24px]" />}
        
        {/* subtle atmospheric saffron line at top */}
        <div aria-hidden className="h-[2px] w-full bg-gradient-to-r from-transparent via-saffron-500/50 to-transparent" />

        <div className={cn('container-x relative', navy ? 'pb-14 pt-9 lg:pb-18 lg:pt-12' : 'pb-12 pt-8 lg:pb-16')}>
          {navy ? (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="max-w-4xl space-y-4 lg:col-span-7 xl:col-span-8">
                {eyebrow ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-saffron-500/30 bg-saffron-500/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-saffron-300 backdrop-blur-md">
                    <Sparkles className="size-3.5 text-saffron-400" />
                    {eyebrow}
                  </span>
                ) : null}
                <h1 className="animate-fade-up text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-sm">{title}</h1>
                <div className="mt-3.5 mb-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-16 rounded-full bg-red-600" />
                  <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
                </div>
                {subtitle && <p className="max-w-3xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-slate-200">{subtitle}</p>}
              </div>
              <div className="hidden lg:col-span-5 xl:col-span-4 lg:flex lg:justify-end">
                {/* Prominent Original Layout Photo Card with Deep Elevated Shadow */}
                <div className="group relative overflow-hidden rounded-2xl border-4 border-white/95 bg-white p-1 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.7),0_12px_24px_-6px_rgba(0,0,0,0.5)] ring-1 ring-black/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_75px_-12px_rgba(0,0,0,0.85)]">
                  <div className="relative aspect-[4/3] w-72 xl:w-84 overflow-hidden rounded-xl bg-charcoal-950">
                    <Img
                      src="/images/portraits/rohan-deshmukh-office.webp"
                      alt={title}
                      fill
                      priority
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-102"
                      sizes="(max-width:1280px) 290px, 340px"
                    />
                    {/* Bottom gradient nameplate */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-2.5 text-white">
                      <p className="font-display text-sm font-bold text-white drop-shadow-md">
                        रोहन सुभाष देशमुख
                      </p>
                      <p className="text-[11px] font-medium text-saffron-300">
                        सोलापूर
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="flex flex-col gap-4 lg:col-span-8">
                {eyebrow && <p className="text-sm font-bold uppercase tracking-wider text-saffron-600">{eyebrow}</p>}
                <h1 className="animate-fade-up text-3xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-5xl">{title}</h1>
                <div className="mt-3 mb-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-14 rounded-full bg-red-600" />
                  <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
                </div>
              </div>
              {subtitle && (
                <div className="rounded-2xl border-l-4 border-saffron-500 bg-cream p-6 shadow-sm lg:col-span-4">
                  <p className="leading-relaxed text-gray-700">{subtitle}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Breadcrumbs Row (100% Supriya Sule layout) */}
      <BreadcrumbsBar crumbs={crumbs} />

      {/* Floating Segmented Capsule Dock with Edge Fade Gradient & Auto-centering */}
      {!!tabs?.length && <SubNavTabs tabs={tabs} tabsLabel={tabsLabel} path={path} />}
    </>
  )
}

/**
 * Dynamic Expanding Island Sub-Navigation (Concept 1):
 * - Mobile: Inactive tabs are sleek circular icon buttons; active tab expands into a full radiant pill with icon + label.
 * - Fits all 4 buttons on mobile simultaneously without crowding or clipping!
 * - Desktop: Spacious segmented capsule dock with icon + full label on all tabs.
 * - Auto-centering & edge-fade protection included.
 */
function SubNavTabs({ tabs, tabsLabel, path }: { tabs: BannerTab[]; tabsLabel?: string; path?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const tolerance = 4
    const room = el.scrollWidth - el.clientWidth
    setCanScrollLeft(room > tolerance && el.scrollLeft > tolerance)
    setCanScrollRight(room > tolerance && el.scrollLeft < room - tolerance)
  }, [])

  // Auto-center the active tab smoothly into view whenever route / tabs change
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeEl = el.querySelector<HTMLElement>('[aria-current="page"]')
    if (activeEl) {
      const left = activeEl.offsetLeft - el.clientWidth / 2 + activeEl.offsetWidth / 2
      el.scrollTo({ left, behavior: 'smooth' })
    }
    const t = setTimeout(checkScroll, 120)
    return () => clearTimeout(t)
  }, [path, tabs, checkScroll])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  return (
    <nav
      aria-label={tabsLabel}
      className="sticky top-16 sm:top-[4.5rem] lg:top-20 z-40 relative border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(14,30,52,0.06)] py-2 sm:py-2.5"
    >
      {/* Left edge fade gradient (appears only if overflow occurs on narrow screen) */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-8 sm:w-12',
          'bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-300 md:hidden',
          canScrollLeft ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Right edge fade gradient (appears only if overflow occurs on narrow screen) */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-8 sm:w-12',
          'bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity duration-300 md:hidden',
          canScrollRight ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div className="container-x">
        {/* Dynamic Expanding Island Dock */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="no-scrollbar flex items-center justify-center md:justify-start overflow-x-auto scroll-smooth py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          <ul className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-stone-200/90 bg-stone-100/90 p-1.5 shadow-[0_2px_12px_-3px_rgba(14,30,52,0.08)] backdrop-blur-md shrink-0">
            {tabs.map((tab) => {
              const Icon = getTabIcon(tab.href)
              return (
                <li key={tab.href} className="shrink-0">
                  <Link
                    to={tab.href}
                    title={tab.label}
                    aria-label={tab.label}
                    aria-current={tab.active ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center justify-center transition-all duration-300 ease-out select-none',
                      tab.active
                        ? 'h-10 px-3.5 sm:px-4 gap-2 rounded-full bg-gradient-to-r from-saffron-600 via-saffron-500 to-[#f97316] text-white shadow-md shadow-saffron-600/30 scale-[1.02]'
                        : 'size-10 rounded-full text-charcoal-700 hover:text-charcoal-950 hover:bg-white active:scale-90 md:w-auto md:h-10 md:px-4 md:gap-2',
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'size-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                          tab.active ? 'text-white' : 'text-saffron-600 group-hover:text-saffron-700',
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'font-semibold text-xs sm:text-sm whitespace-nowrap tracking-wide transition-all duration-300',
                        tab.active ? 'inline-block opacity-100 max-w-[200px]' : 'hidden md:inline-block md:opacity-100',
                      )}
                    >
                      {tab.label}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </nav>
  )
}
