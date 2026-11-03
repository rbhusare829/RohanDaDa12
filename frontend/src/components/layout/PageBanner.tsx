import { type ReactNode } from 'react'
import { ChevronRight, Home, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslations } from '@/lib/i18n'

export type Crumb = { label: string; href?: string }
export type BannerTab = { label: string; href: string; active?: boolean }

const BANNER_PORTRAITS: { match: RegExp; src: string; position: string }[] = [
  { match: /^\/about\/introduction/, src: '/images/portraits/rohan-bandhgala-formal-banner.webp', position: 'center bottom' },
  { match: /^\/about\/biography/, src: '/images/portraits/rohan-peach-kurta-namaskar-banner.webp', position: 'center bottom' },
  { match: /^\/about/, src: '/images/portraits/rohan-bandhgala-formal-banner.webp', position: 'center bottom' },
  { match: /^\/political-career/, src: '/images/portraits/rohan-flag-tiranga-banner.webp', position: 'center bottom' },
  { match: /^\/vision/, src: '/images/portraits/rohan-blue-jacket-balcony-banner.webp', position: 'center bottom' },
  { match: /^\/lokmangal/, src: '/images/portraits/rohan-executive-desk.webp', position: 'center bottom' },
  { match: /^\/appeal/, src: '/images/portraits/rohan-blue-suit-magazine.webp', position: 'center bottom' },
  { match: /^\/contact/, src: '/images/portraits/rohan-white-linen-casual.webp', position: 'center bottom' },
  { match: /^\/media/, src: '/images/portraits/rohan-executive-desk.webp', position: 'center bottom' },
  { match: /.*/, src: '/images/portraits/rohan-executive-desk.webp', position: 'center bottom' },
]

/**
 * Breadcrumbs bar under the banner: Home › Section › Current page. Every label is in the visitor's language — "मुख्य पृष्ठ / Home" from
 * the translations, the section and page names from the menu and the page itself (both kept in Marathi and English in the admin).
 */
function BreadcrumbsBar({ crumbs }: { crumbs?: Crumb[] }) {
  const t = useTranslations('nav')
  if (!crumbs?.length) return null
  return (
    <nav aria-label="Breadcrumb" className="border-b border-line bg-paper py-2.5 text-xs text-ink">
      <ol className="container-x pl-12 sm:pl-14 lg:pl-16 xl:pl-12 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
        <li>
          <Link to="/" className="inline-flex items-center gap-1.5 font-bold text-charcoal-900 transition-colors hover:text-saffron-700">
            <Home aria-hidden className="size-3.5" />
            <span>{t('home')}</span>
          </Link>
        </li>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1
          return (
            <li key={idx} className="flex items-center gap-2">
              <ChevronRight aria-hidden className="size-3 text-muted" />
              {isLast || !crumb.href ? (
                <span aria-current={isLast ? 'page' : undefined} className="line-clamp-1 font-semibold text-charcoal-900">{crumb.label}</span>
              ) : (
                <Link to={crumb.href} className="font-medium text-ink transition-colors hover:text-saffron-700">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * The top of every inner page (Modern Teal + Saffron): a Cloud band with Rohan's photo melting in from the right edge
 * - Large Modern Teal title with the saffron underline + jade dot
 * - Breadcrumb row (Home › Section › Current)
 * - Sibling pages as horizontal tab bar
 */
export function PageBanner({
  title, subtitle, image, imagePosition, eyebrow, path, variant, crumbs,
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
  return <StitchBanner title={title} subtitle={subtitle} eyebrow={eyebrow} variant={variant || 'navy'} crumbs={crumbs} path={path} image={image} imagePosition={imagePosition} />
}

/**
 * Stitch page header (Oct 2026): the eyebrow, the page title and its subtitle — on deep navy with soft kesariya / green glows ('navy'), or on warm ivory ('light', where the subtitle sits in
 * a card beside the title). The section's sibling pages follow as a row of pills.
 */
function StitchBanner({
  title, subtitle: _subtitle, eyebrow, variant: _variant, crumbs, path, image, imagePosition,
}: {
  title: string; subtitle?: string | null; eyebrow?: string | null; variant: 'navy' | 'light'; crumbs?: Crumb[]
  path?: string; image?: string | null; imagePosition?: string
}) {
  const matched = BANNER_PORTRAITS.find((b) => b.match.test(path || '/')) || BANNER_PORTRAITS[BANNER_PORTRAITS.length - 1]
  const portraitSrc = matched?.src || image
  const portraitPos = matched?.position || imagePosition || '60% 10%'

  return (
    <>
      {/* Modern Teal + Saffron banner: a Cloud band (the palette's surface for alternating sections) under the header's saffron line,
          strip, with the leader's photo melting in from the right edge */}
      <section className="relative isolate w-full overflow-hidden bg-cream text-charcoal-900">
        {/* one soft gold warmth behind the title (decorative) */}
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/4 -z-10 size-96 rounded-full bg-gold/10 blur-[100px]" />

        {/* Leader Photo - Visible on all screens: full height on right edge, melting naturally on left */}
        {portraitSrc && (
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 flex justify-end overflow-hidden">
            <div
              className="relative h-full overflow-hidden"
              style={{
                width: 'clamp(180px, 48vw, 550px)',
                height: '100%',
              }}
            >
              <img
                src={portraitSrc}
                alt=""
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: portraitPos || 'center bottom',
                }}
              />
              {/* the photo's left edge feathers into the Cloud band */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 lg:w-44 bg-gradient-to-r from-cream via-cream/70 to-transparent" />
              {/* a soft grounding fade along the bottom edge */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-4 sm:h-6 bg-gradient-to-t from-cream/50 to-transparent" />
            </div>
          </div>
        )}

        <div className="container-x relative flex min-h-[220px] sm:min-h-[280px] lg:min-h-[310px] flex-col justify-center py-8 sm:py-12 lg:py-14">
          <div className="max-w-[54%] sm:max-w-2xl lg:max-w-3xl space-y-2.5 sm:space-y-3.5">
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-paper/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-saffron-700">
                <Sparkles className="size-3.5 text-saffron-600" />
                {eyebrow}
              </span>
            )}
            <h1 className="animate-fade-up text-2xl font-bold leading-[1.2] tracking-tight text-[#0F5C63] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <div aria-hidden className="mt-3 mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-12 sm:w-14 rounded-full bg-gold" />
              <span className="h-1.5 w-3 sm:w-3.5 rounded-full bg-leaf-600" />
            </div>
            {/* Subtitle removed per request: banner keeps clean title + accent line + photo */}
          </div>
        </div>
      </section>

      <BreadcrumbsBar crumbs={crumbs} />
    </>
  )
}
