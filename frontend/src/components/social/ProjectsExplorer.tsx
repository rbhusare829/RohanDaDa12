import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Newspaper, Pause, Play, Search, Sparkles, TrendingUp, X } from 'lucide-react'
import { Link } from 'react-router'
import type { Media } from '@/types/cms'
import { useTranslations } from '@/lib/i18n'
import { usePrefersReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { Img } from '../ui/Img'

export type ProjectCard = {
  id: string | number
  href: string
  title: string
  category: string
  categoryLabel: string
  featured?: boolean | null
  stat?: string | null
  text?: string | null
  media?: Media | number | null
  imageAlt?: string
  imageStyle?: CSSProperties
}

type Labels = { all: string; search: string; readMore: string; details: string; empty: string; clear: string; filters: string; featured: string; prev: string; next: string; slide: string }

const DEVANAGARI = '०१२३४५६७८९'

/**
 * "Featured highlight + grid cards" layout for the Lokmangal initiatives:
 * category chips with counts + search → a large slider of the main (featured) initiatives →
 * a grid of cards (photo, key-impact line + category tag, title, short description, Read more).
 * Filters and search apply to both the slider and the grid.
 */
export function ProjectsExplorer({ items, categories, labels, locale }: { items: ProjectCard[]; categories: { value: string; label: string }[]; labels: Labels; locale: 'mr' | 'en' }) {
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')
  const n = (v: number) => (locale === 'mr' ? String(v).replace(/\d/g, (d) => DEVANAGARI[Number(d)]) : String(v))

  const chips = useMemo(
    () => [{ value: '', label: labels.all, count: items.length }, ...categories.map((c) => ({ ...c, count: items.filter((i) => i.category === c.value).length })).filter((c) => c.count > 0)],
    [items, categories, labels.all],
  )

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items.filter((i) => (!cat || i.category === cat) && (!term || [i.title, i.stat, i.text, i.categoryLabel].some((s) => s?.toLowerCase().includes(term))))
  }, [items, cat, q])

  // main initiatives go in the slider (only when there are at least two cards in view, so a single result still shows as a card)
  const featured = shown.length > 1 ? shown.filter((i) => i.featured) : []
  const grid = featured.length ? shown.filter((i) => !i.featured) : shown

  return (
    <div>
      <div className="flex flex-col items-center gap-4">
        <div role="group" aria-label={labels.filters} className="flex flex-wrap justify-center gap-2">
          {chips.map((c) => {
            const on = cat === c.value
            return (
              <button
                key={c.value || 'all'}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c.value)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-1.5 text-sm font-semibold transition',
                  on ? 'border-btn bg-btn text-white' : 'border-field bg-white text-charcoal-900 hover:border-field-hover hover:bg-cream',
                )}
              >
                {c.label}
                <span className={cn('grid min-w-6 place-items-center rounded-full px-1.5 text-xs leading-5', on ? 'bg-white text-saffron-700' : 'bg-cream text-saffron-700')}>{n(c.count)}</span>
              </button>
            )
          })}
        </div>

        <label className="relative block w-full max-w-md">
          <span className="sr-only">{labels.search}</span>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.search}
            className="min-h-11 w-full rounded-full border border-field bg-white py-2.5 pl-10 pr-4 text-sm text-charcoal-900 outline-none transition placeholder:text-muted hover:border-field-hover focus:border-saffron-700 focus:ring-2 focus:ring-saffron-700"
          />
        </label>
      </div>

      {shown.length ? (
        <>
          {featured.length > 0 && <FeaturedSlider key={`${cat}|${q}`} items={featured} labels={labels} n={n} />}
          {grid.length > 0 && (
            <ul className="mt-12 grid grid-cols-1 gap-x-7 gap-y-8 md:mt-14 md:grid-cols-2 md:gap-y-12 lg:grid-cols-3">
              {grid.map((p) => <GridCard key={p.id} p={p} labels={labels} />)}
            </ul>
          )}
        </>
      ) : (
        <div className="mt-10 rounded-2xl bg-cream p-10 text-center">
          <p className="text-muted">{labels.empty}</p>
          <button type="button" onClick={() => { setQ(''); setCat('') }} className="btn btn-light mt-4 px-5 py-2">
            <X aria-hidden className="size-4" /> {labels.clear}
          </button>
        </div>
      )}
    </div>
  )
}

/** Photo, or a soft placeholder with an icon when an initiative has none */
function Photo({ p, sizes, className }: { p: ProjectCard; sizes: string; className?: string }) {
  return p.media && typeof p.media === 'object' ? (
    <Img media={p.media} variant="card" alt={p.imageAlt ?? p.title} fill sizes={sizes} className={cn('object-cover', className)} style={p.imageStyle} />
  ) : (
    <div className="absolute inset-0 grid place-items-center bg-cream">
      <Newspaper aria-hidden className="size-11 text-saffron-600" strokeWidth={1.5} />
    </div>
  )
}

/** Large highlight card: photo left, story right; arrows, dots and a gentle auto-advance with a Pause button (WCAG 2.2.2) */
function FeaturedSlider({ items, labels, n }: { items: ProjectCard[]; labels: Labels; n: (v: number) => string }) {
  const tc = useTranslations('common')
  const [i, setI] = useState(0)
  const [hold, setHold] = useState(false) // pointer or focus is inside
  const [choice, setChoice] = useState<boolean | null>(null) // true = the visitor pressed Pause, false = Play
  const reduced = usePrefersReducedMotion()
  const paused = choice ?? reduced // people who ask for less motion get no auto-advance unless they press Play
  const count = items.length
  const go = useCallback((to: number) => setI(((to % count) + count) % count), [count])

  useEffect(() => {
    if (count < 2 || paused || hold) return
    const id = window.setInterval(() => setI((v) => (v + 1) % count), 6500)
    return () => window.clearInterval(id)
  }, [count, paused, hold])

  const p = items[Math.min(i, count - 1)]
  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.featured}
      className="mt-8 md:mt-10"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocusCapture={() => setHold(true)}
      onBlurCapture={() => setHold(false)}
    >
      <div className="overflow-hidden rounded-[1.6rem] bg-surface shadow-[0_24px_60px_-34px_rgb(20_33_61/0.35)] ring-1 ring-charcoal-900/[0.06]">
        <div key={p.id} aria-roledescription="slide" aria-label={`${n(i + 1)} / ${n(count)}`} className="grid animate-fade-up md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[340px]">
            <Photo p={p} sizes="(max-width:768px) 100vw, 640px" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-saffron-600 px-3 py-1 text-xs text-white shadow-lg">
              <Sparkles aria-hidden className="size-3.5" /> {labels.featured}
            </span>
          </div>

          <div className="relative flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {p.stat && <span className="inline-flex items-center gap-1.5 text-saffron-700"><TrendingUp aria-hidden className="size-4" /> {p.stat}</span>}
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs text-charcoal-800">{p.categoryLabel}</span>
            </div>
            <h3 className="mt-3 text-[1.45rem] leading-snug text-charcoal-900 md:text-[1.75rem]">{p.title}</h3>
            {p.text && <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-muted md:line-clamp-4">{p.text}</p>}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 md:mt-auto md:pt-6">
              <Link to={p.href} className="btn btn-primary px-5 py-2.5">
                {labels.readMore} <ArrowRight aria-hidden className="size-4" />
              </Link>
              {count > 1 && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => go(i - 1)} aria-label={labels.prev} className="btn-icon size-11">
                    <ChevronLeft aria-hidden className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setChoice(!paused)}
                    aria-label={paused ? tc('playSlides') : tc('pauseSlides')}
                    title={paused ? tc('playSlides') : tc('pauseSlides')}
                    className="btn-icon size-11"
                  >
                    {paused ? <Play aria-hidden className="size-4 fill-current" /> : <Pause aria-hidden className="size-4 fill-current" />}
                  </button>
                  <button type="button" onClick={() => go(i + 1)} aria-label={labels.next} className="btn-icon size-11">
                    <ChevronRight aria-hidden className="size-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-2 flex flex-wrap justify-center">
          {items.map((it, k) => (
            <button
              key={it.id}
              type="button"
              onClick={() => go(k)}
              aria-label={`${labels.slide} ${n(k + 1)}`}
              aria-current={k === i ? 'true' : undefined}
              className="group grid h-11 min-w-11 place-items-center"
            >
              {/* the dot stays small; the button around it is a full 44px tap area */}
              <span className={cn('block h-2 rounded-full transition-all', k === i ? 'w-7 bg-saffron-500' : 'w-2 bg-frame group-hover:bg-saffron-400')} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

/** Grid card: photo on top (thumbnail beside the text on phones), key impact + category, title, text, Read more */
function GridCard({ p, labels }: { p: ProjectCard; labels: Labels }) {
  return (
    <li className="tile group flex-row gap-4 md:flex-col md:gap-0">
      <div className="tile-media w-28 shrink-0 self-start aspect-square sm:w-36 md:aspect-[16/10] md:w-full">
        <Photo p={p} sizes="(max-width:768px) 144px, (max-width:1024px) 50vw, 400px" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col md:pt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="tile-kicker">{p.categoryLabel}</span>
          {p.stat && (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted">
              <TrendingUp aria-hidden className="size-3.5 shrink-0 text-saffron-600" /> <span className="line-clamp-1">{p.stat}</span>
            </span>
          )}
        </div>
        <h3 className="tile-title mt-1.5 text-[1rem] font-semibold md:mt-2 md:text-[1.15rem]">
          <Link to={p.href} className="after:absolute after:inset-0 focus-visible:outline-none">{p.title}</Link>
        </h3>
        {p.text && <p className="tile-text hidden !text-sm sm:line-clamp-2 md:line-clamp-3">{p.text}</p>}
        <span className="more-link mt-auto pt-3 text-sm md:pt-4">
          {labels.readMore} <ArrowRight aria-hidden className="size-4" />
        </span>
      </div>
    </li>
  )
}
