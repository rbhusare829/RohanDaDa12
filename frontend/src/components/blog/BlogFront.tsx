import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Sparkles, Tag, TrendingUp } from 'lucide-react'
import { Link } from 'react-router'
import type { Category, Post } from '@/types/cms'
import { primaryCategory, readTimeLabel } from '@/lib/blog'
import { mediaAlt, photoFit } from '@/lib/media'
import { cn, formatDate, toMarathiDigits } from '@/lib/utils'
import { Img } from '../ui/Img'
import { Reveal, Stagger, StaggerItem } from '../ui/Motion'

/**
 * Blog front page pieces in Modern Teal + Saffron (Nov 2026): Cloud cards and Modern Teal on the Cloud White page, Saffron Amber accents.
 * Only the blog page uses these — the homepage keeps its own story list (BlogParts).
 */

const n = (i: number, locale: string) => (locale === 'mr' ? toMarathiDigits(String(i).padStart(2, '0')) : String(i).padStart(2, '0'))

/** section heading: kesariya label line + display title, something on the right */
export function FrontHeading({ children, label, aside }: { children: ReactNode; label?: ReactNode; aside?: ReactNode }) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        {label && <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{label}</p>}
        <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-[#182126] sm:text-4xl">{children}</h2>
      </div>
      {aside}
    </Reveal>
  )
}

function Meta({ post, locale, light }: { post: Post; locale: string; light?: boolean }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem]', light ? 'text-paper/80' : 'text-ink')}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5 text-saffron-500" />
        <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt, locale)}</time>
      </span>
      <span aria-hidden className={cn('size-1 rounded-full', light ? 'bg-paper/30' : 'bg-frame')} />
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" />
        {readTimeLabel(post, locale)}
      </span>
    </div>
  )
}

function Chip({ cat, dark }: { cat: Category | null; dark?: boolean }) {
  if (!cat) return null
  return (
    <Link
      to={`/blog?category=${cat.slug}`}
      className={cn(
        // the pill stays small; on a phone an invisible band above and below makes it a 44 px tap area
        'relative z-10 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition max-lg:after:absolute max-lg:after:inset-x-0 max-lg:after:-inset-y-2',
        dark ? 'border border-paper/20 bg-paper/10 text-paper backdrop-blur-md hover:bg-saffron-600 hover:text-ink' : 'bg-paper text-saffron-700 ring-1 ring-saffron-200 hover:bg-saffron-600 hover:text-ink',
      )}
    >
      {cat.title}
    </Link>
  )
}

/** the lead story: a large photo card, its headline on a navy wash (no summary) */
export function FrontLead({ post, locale, badge, readFull }: { post: Post; locale: string; badge: string; readFull: string }) {
  return (
    <Reveal as="article" className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-charcoal-950 shadow-[0_24px_60px_-20px_rgba(24,33,38,0.5)] lg:min-h-[34rem]">
      <Img media={post.coverImage} variant="hero" alt={mediaAlt(post.coverImage, post.title)} fill priority sizes="(max-width:1024px) 100vw, 60vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" style={photoFit(post.coverImage, 1.4, 0.6)} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/55 to-charcoal-950/0" />
      <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-saffron-600 px-3.5 py-1.5 text-xs font-bold text-ink shadow-lg shadow-saffron-600/30">
        <Sparkles className="size-3.5" /> {badge}
      </span>
      <div className="on-dark relative z-10 flex flex-col gap-4 p-6 md:p-9">
        <Chip cat={primaryCategory(post)} dark />
        <h3 className="line-clamp-4 font-display text-xl font-bold leading-snug text-paper md:line-clamp-3 md:text-2xl lg:text-[1.6rem]">
          <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper/15 pt-4">
          <Meta post={post} locale={locale} light />
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gold transition group-hover:text-paper">
            {readFull} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Reveal>
  )
}

/** "latest" beside the lead story: a Cloud card with numbered stories and small photos */
export function FrontLatest({ posts, locale, title, footer }: { posts: Post[]; locale: string; title: string; footer?: string }) {
  return (
    <Reveal delay={0.1} as="article" className="flex h-full flex-col rounded-3xl border border-line bg-cream p-6 shadow-[0_20px_50px_-12px_rgba(24,33,38,0.1)] md:p-7">
      <h3 className="flex items-center gap-3 font-display text-lg font-bold text-[#182126]">
        <span className="grid size-9 place-items-center rounded-xl bg-saffron-500/10 text-saffron-600"><TrendingUp className="size-5" /></span>
        {title}
      </h3>
      <Stagger as="ol" className="mt-4 flex flex-1 flex-col divide-y divide-line">
        {posts.map((p, i) => (
          <StaggerItem as="li" key={p.id} className="group relative grid grid-cols-[auto_1fr_4.5rem] items-center gap-4 py-4">
            <span className={cn('font-display text-2xl font-bold leading-none', i % 2 ? 'text-leaf-700' : 'text-saffron-700')}>{n(i + 1, locale)}</span>
            <div className="min-w-0">
              {primaryCategory(p) && <p className="text-[11px] font-bold uppercase tracking-wider text-saffron-700">{primaryCategory(p)!.title}</p>}
              <h4 className="mt-0.5 line-clamp-2 text-[0.95rem] font-semibold leading-snug text-[#182126] transition group-hover:text-saffron-700">
                <Link to={`/blog/${p.slug}`} className="after:absolute after:inset-0">{p.title}</Link>
              </h4>
              <p className="mt-1 text-xs text-ink">{formatDate(p.publishedAt, locale)}</p>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-cream">
              <Img media={p.coverImage} variant="thumb" alt="" fill sizes="80px" className="object-cover transition duration-500 group-hover:scale-110" style={photoFit(p.coverImage, 1, 0.6)} />
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      {footer && <p className="mt-2 rounded-xl bg-paper px-4 py-2.5 text-center text-xs font-medium text-ink">{footer}</p>}
    </Reveal>
  )
}

/** one article in the list: a Cloud card, photo on the left */
export function FrontRow({ post, locale, readMore, share }: { post: Post; locale: string; readMore: string; share?: ReactNode }) {
  return (
    <article className="group relative grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-cream shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl sm:grid-cols-[15rem_1fr] md:grid-cols-[17rem_1fr]">
      <div className="relative aspect-[16/9] overflow-hidden bg-cream sm:aspect-auto sm:min-h-full">
        <Img media={post.coverImage} variant="card" alt={mediaAlt(post.coverImage, post.title)} fill sizes="(max-width:640px) 100vw, 272px" className="object-cover transition duration-700 group-hover:scale-105" style={photoFit(post.coverImage, 1.5, 0.6)} />
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-saffron-500 transition-transform duration-300 group-hover:scale-y-100" />
      </div>
      <div className="flex min-w-0 flex-col gap-3 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Chip cat={primaryCategory(post)} />
          <Meta post={post} locale={locale} />
        </div>
        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug text-[#182126] transition-colors group-hover:text-saffron-700 md:text-xl">
          <Link to={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
        </h3>
        {post.excerpt && <p className="line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{post.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-saffron-700">
            {readMore} <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
          {share && <div className="relative z-10">{share}</div>}
        </div>
      </div>
    </article>
  )
}

/** sidebar: topics as pills in a Cloud card */
export function FrontTopics({ cats, active, title, allLabel }: { cats: Category[]; active?: string | null; title: string; allLabel: string }) {
  const items = [{ slug: '', title: allLabel }, ...cats.map((c) => ({ slug: c.slug, title: c.title }))]
  return (
    <Reveal as="article" className="rounded-2xl border border-line bg-cream p-6 shadow-sm">
      <h3 className="flex items-center gap-3 font-display text-lg font-bold text-[#182126]">
        <span className="grid size-9 place-items-center rounded-xl bg-leaf-600/10 text-leaf-700"><Tag className="size-5" /></span>
        {title}
      </h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((c) => {
          const on = (active ?? '') === c.slug
          return (
            <Link key={c.slug || 'all'} to={c.slug ? `/blog?category=${c.slug}` : '/blog'} aria-current={on ? 'true' : undefined}
              className={cn('inline-flex min-h-11 items-center rounded-full px-4 py-1.5 text-sm font-semibold transition', on ? 'bg-charcoal-900 text-paper shadow-md' : 'bg-paper text-charcoal-900 ring-1 ring-line hover:bg-saffron-50 hover:text-saffron-700 hover:ring-gold')}>
              {c.title}
            </Link>
          )
        })}
      </div>
    </Reveal>
  )
}

/** sidebar: recent articles, numbered, on a navy card */
export function FrontRecent({ posts, locale, title }: { posts: Post[]; locale: string; title: string }) {
  return (
    <Reveal as="article" className="on-dark relative overflow-hidden rounded-2xl border-t-4 border-gold bg-charcoal-900 p-6 text-paper shadow-xl">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-saffron-600/20 blur-3xl" />
      <h3 className="relative flex items-center gap-3 font-display text-lg font-bold text-paper">
        <span className="grid size-9 place-items-center rounded-xl bg-paper/10 text-gold"><TrendingUp className="size-5" /></span>
        {title}
      </h3>
      <ol className="relative mt-4 divide-y divide-paper/10">
        {posts.map((p, i) => (
          <li key={p.id} className="group relative flex gap-4 py-4">
            <span className={cn('font-display text-xl font-bold leading-none', i % 2 ? 'text-paper' : 'text-gold')}>{n(i + 1, locale)}</span>
            <div className="min-w-0">
              <h4 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-paper underline-offset-4 transition group-hover:underline">
                <Link to={`/blog/${p.slug}`} className="after:absolute after:inset-0">{p.title}</Link>
              </h4>
              <p className="mt-1 text-xs text-paper/85">{primaryCategory(p)?.title ? `${primaryCategory(p)!.title} • ` : ''}{formatDate(p.publishedAt, locale)}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
