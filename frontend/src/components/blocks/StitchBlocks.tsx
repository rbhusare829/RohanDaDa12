import type { ReactNode } from 'react'
import { ArrowRight, BookOpen, Download, FileText, HeartHandshake, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOCALE } from '@/lib/i18n'
import { mediaAlt, mediaPosition, mediaUrl, photoFit, toGallery } from '@/lib/media'
import { RichText } from '../ui/RichText'
import { CMSLink } from '../ui/CMSLink'
import { Gallery } from '../ui/Gallery'
import { Img } from '../ui/Img'
import { YouTube } from '../ui/YouTube'
import { FaqAccordion } from '../home/FaqAccordion'
import { CountUp } from '../ui/CountUp'
import { Reveal, Stagger, StaggerItem } from '../ui/Motion'
import type { PageBlock } from './PageBlocks'

/**
 * The page blocks in the Stitch design (Oct 2026) — used on Introduction, Family Background, Lokmangal Foundation and
 * Political Career. Same content as the standard blocks, only the look changes:
 * - Media + text → a "chapter": label chip + heading, the photo (left or right) beside a warm ivory text card
 * - Content → white cards with a kesariya edge (consecutive ones side by side)
 * - Cards → numbered area cards (text only, a link when they have one) or white photo cards
 * - Quote → navy pull-quote; Call to action → navy banner; Stats → white tiles
 */

type Content = Extract<PageBlock, { blockType: 'content' }>
type MediaText = Extract<PageBlock, { blockType: 'mediaText' }>

const pad = (n: number) => String(n).padStart(2, '0')

/** label + heading + intro, Stitch style */
export function StitchHead({ eyebrow, heading, intro, as: H = 'h2', className }: { eyebrow?: string | null; heading?: string | null; intro?: string | null; as?: 'h2' | 'h3'; className?: string }) {
  if (!eyebrow && !heading && !intro) return null
  return (
    <Reveal className={cn('mb-6 sm:mb-10 max-w-3xl space-y-2', className)}>
      {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{eyebrow}</p>}
      {heading && <H className="font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-4xl">{heading}</H>}
      {intro && <p className="pt-1 text-base leading-relaxed text-gray-600">{intro}</p>}
    </Reveal>
  )
}

const card = 'rounded-3xl border border-stone-200/90 bg-white shadow-[0_15px_40px_-10px_rgba(9,20,34,0.07)]'

/** one or more consecutive Content blocks: displayed directly on the page in Stitch style */
export function StitchContent({ blocks }: { blocks: Content[] }) {
  if (blocks.length === 1) {
    const b = blocks[0]
    return (
      <Reveal className="max-w-4xl pt-2">
        {b.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{b.eyebrow}</p>}
        {b.heading && <h2 className="mb-4 font-display text-2xl font-bold leading-tight text-charcoal-950 md:text-3xl">{b.heading}</h2>}
        <div className="text-base sm:text-lg leading-relaxed text-charcoal-900 font-normal">
          <RichText html={b.body} />
        </div>
      </Reveal>
    )
  }
  return (
    <Stagger className="grid gap-8 md:grid-cols-2">
      {blocks.map((b, i) => {
        const isSocial = `${b.eyebrow ?? ''} ${b.heading ?? ''}`.toLowerCase().includes('social') || `${b.eyebrow ?? ''} ${b.heading ?? ''}`.toLowerCase().includes('lokmangal')
        const Icon = isSocial ? HeartHandshake : BookOpen
        const accentGradient = isSocial ? 'from-leaf-600 to-emerald-500' : 'from-saffron-600 to-amber-500'
        const ctaUrl = isSocial ? '/lokmangal/foundation' : '/vision'
        const ctaLabel = isSocial ? 'लोकमंगल फाऊंडेशन' : 'व्हिजन व संकल्प'

        return (
          <StaggerItem
            key={b.id ?? i}
            className={cn(
              card,
              'group relative flex flex-col justify-between overflow-hidden p-8 transition-all duration-300 hover:border-saffron-300 hover:shadow-2xl hover:-translate-y-1.5 lg:p-10',
            )}
          >
            {/* Top accent bar */}
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', accentGradient)} />

            {/* Ambient corner light */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute right-0 top-0 size-36 rounded-bl-full bg-gradient-to-bl opacity-40',
                isSocial ? 'from-leaf-100/60 to-transparent' : 'from-saffron-100/60 to-transparent',
              )}
            />

            <div className="relative flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid size-12 shrink-0 place-items-center rounded-xl font-display text-base font-bold text-white shadow-sm',
                      isSocial ? 'bg-gradient-to-br from-leaf-600 to-emerald-500' : 'bg-gradient-to-br from-saffron-600 to-amber-500',
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <div className="min-w-0">
                    {b.eyebrow && <p className={cn('text-[11px] font-bold uppercase tracking-[0.2em]', isSocial ? 'text-leaf-600' : 'text-saffron-700')}>{b.eyebrow}</p>}
                    {b.heading && <h2 className="font-display text-xl font-bold leading-snug text-charcoal-950 md:text-2xl">{b.heading}</h2>}
                  </div>
                </div>
                <span className="font-display text-xs font-bold text-stone-300">{pad(i + 1)}</span>
              </div>
              <div className="text-[0.98rem] leading-relaxed text-charcoal-900/85">
                <RichText html={b.body} readMore />
              </div>
            </div>

            <div className="relative mt-8 border-t border-stone-100 pt-5">
              <CMSLink url={ctaUrl} className="group/btn inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-saffron-700 transition-colors hover:text-saffron-800">
                <span>{ctaLabel}</span>
                <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
              </CMSLink>
            </div>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}

/** Media + text as a Stitch chapter: chip + heading, then the photo beside a text card */
export function StitchChapter({ b, n }: { b: MediaText; n?: number }) {
  const hasImg = Boolean(mediaUrl(b.image, 'card'))
  const fit = photoFit(b.image, 1.5, 0.45)
  const right = b.imagePosition === 'right'
  return (
    <section className="flex flex-col gap-8 md:gap-10">
      <Reveal className="flex flex-col gap-3">
        {(b.eyebrow || n) && (
          <div className="flex flex-wrap items-center gap-3">
            {n && <span aria-hidden className="font-display text-sm font-bold tracking-widest text-saffron-700">{pad(n)}</span>}
            {n && b.eyebrow && <span aria-hidden className="h-0.5 w-8 bg-saffron-500" />}
            {b.eyebrow && <span className="rounded bg-saffron-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-saffron-700">{b.eyebrow}</span>}
          </div>
        )}
        {b.heading && <h2 className="max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-4xl">{b.heading}</h2>}
      </Reveal>

      <div className={cn('grid grid-cols-1 items-start gap-8 lg:gap-12', hasImg && 'lg:grid-cols-12')}>
        {hasImg && (
          <Reveal className={cn('lg:col-span-6', right && 'lg:order-2')}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-md sm:aspect-[16/10] lg:aspect-[4/3] bg-stone-100">
              <Img media={b.image} variant="card" alt={mediaAlt(b.image, b.heading ?? '')} fill sizes="(max-width:1024px) 100vw, 680px" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.03]" style={{ ...fit, objectPosition: '50% 6%' }} />
            </div>
          </Reveal>
        )}
        <Reveal delay={0.1} className={cn('flex flex-col gap-6 text-charcoal-900', hasImg ? 'lg:col-span-6' : 'max-w-3xl')}>
          <RichText html={b.body} readMore />
          {!!b.buttons?.length && (
            <div className="flex flex-wrap gap-3 border-t border-stone-200/80 pt-6">
              {b.buttons.map((l, i) => (
                <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={cn('btn', i > 0 && 'btn-ghost')}>
                  {l.label} <ArrowRight className="size-4" />
                </CMSLink>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}

/** a card that is a link when it has a url */
const Box = ({ url, className, children }: { url?: string | null; className?: string; children: ReactNode }) =>
  url ? <CMSLink url={url} className={className}>{children}</CMSLink> : <div className={className}>{children}</div>

function Cards({ b }: { b: Extract<PageBlock, { blockType: 'cards' }> }) {
  const items = b.items ?? []
  const withImages = items.some((c) => mediaUrl(c.image, 'card'))
  const CardTitle = b.heading ? 'h3' : 'h2'
  const cols = b.columns === '2' ? 'md:grid-cols-2' : b.columns === '4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
  return (
    <>
      <StitchHead eyebrow={b.eyebrow} heading={b.heading} intro={b.intro} />
      <Stagger className={cn('grid grid-cols-1 gap-6 lg:gap-8', cols)}>
        {items.map((c, i) => {
          if (withImages) {
            const inner = (
              <>
                {mediaUrl(c.image, 'card') && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                    <Img media={c.image} variant="card" alt={mediaAlt(c.image, c.title)} fill sizes="(max-width:768px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-105" style={photoFit(c.image, 1.6)} />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-6">
                  {c.meta && <p className="text-[11px] font-bold uppercase tracking-wider text-saffron-700">{c.meta}</p>}
                  <CardTitle className="font-display text-xl font-bold leading-snug text-charcoal-950 transition-colors group-hover:text-saffron-700">{c.title}</CardTitle>
                  {c.text && <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{c.text}</p>}
                </div>
              </>
            )
            const cls = cn(card, 'group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl')
            return <StaggerItem key={c.id}>{c.url ? <CMSLink url={c.url} className={cls}>{inner}</CMSLink> : <div className={cls}>{inner}</div>}</StaggerItem>
          }
          // text-only cards: Stitch "area" cards with a numbered icon box (the whole card is the link when it has one)
          // text-only cards: clean cards with title, index, description and link
          return (
            <StaggerItem key={c.id} className="h-full">
              <Box
                url={c.url}
                className={cn(
                  'group relative flex h-full flex-col justify-between rounded-2xl bg-white p-7 shadow-xs ring-1 ring-stone-200/80 transition-all duration-300 hover:shadow-xl sm:p-8',
                  c.url && 'hover:-translate-y-1.5 hover:ring-saffron-300',
                )}
              >
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="font-display text-xl font-bold leading-snug text-[#000d3d] transition-colors group-hover:text-red-600">
                      {c.title}
                    </CardTitle>
                    <span className="font-display text-sm font-bold text-stone-300 transition-colors group-hover:text-saffron-600 shrink-0 pt-0.5 select-none">
                      {pad(i + 1)}
                    </span>
                  </div>
                  {c.text && <p className="whitespace-pre-line text-sm sm:text-[0.95rem] leading-relaxed text-slate-600">{c.text}</p>}
                  {!!c.tags?.length && (
                    <ul className="flex flex-wrap gap-1.5 pt-1">
                      {c.tags.map((t, k) => (
                        <li key={k} className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-charcoal-800">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-100 pt-5 text-xs font-bold tracking-wider uppercase text-red-600">
                  <span>{c.meta || (c.url ? (LOCALE === 'en' ? 'Learn more' : 'अधिक जाणून घ्या') : '')}</span>
                  <ArrowRight aria-hidden className="size-4 text-red-600 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </Box>
            </StaggerItem>
          )
        })}
      </Stagger>
    </>
  )
}

/** every block type except Content / Media + text (handled above, they need their neighbours) */
export function StitchBlock({ b }: { b: PageBlock }): ReactNode {
  switch (b.blockType) {
    case 'cards':
      return <Cards b={b} />
    case 'stats': {
      const count = b.items?.length ?? 0
      const gridCols = count === 3 ? 'grid-cols-1 sm:grid-cols-3' : count === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'
      return (
        <div className="py-2">
          <StitchHead eyebrow={b.eyebrow} heading={b.heading} />
          <Stagger className={cn('grid gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80', gridCols)}>
            {b.items?.map((s, idx) => (
              <StaggerItem key={s.id} className={cn('flex flex-col', idx > 0 && 'pt-4 sm:pt-0 sm:pl-8')}>
                <p className="font-display text-3xl font-bold text-[#000d3d] sm:text-4xl lg:text-[2.6rem] leading-none">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-600">
                  {s.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      )
    }
    case 'gallery':
      return (
        <>
          <StitchHead eyebrow={b.eyebrow} heading={b.heading} />
          <Reveal>
            <Gallery images={toGallery(b.images, b.heading ?? '')} layout={(b.layout as 'grid' | 'masonry') ?? 'grid'} />
          </Reveal>
        </>
      )
    case 'faq':
      return (
        <div className="max-w-4xl">
          <StitchHead eyebrow={b.eyebrow} heading={b.heading} />
          <FaqAccordion items={(b.items ?? []).map((f) => ({ q: f.question, a: <RichText html={f.answer} className="!text-base !text-muted" /> }))} />
        </div>
      )
    case 'video':
      return (
        <div className="max-w-4xl">
          <StitchHead eyebrow={b.eyebrow} heading={b.heading} />
          <Reveal className="overflow-hidden rounded-2xl shadow-xl ring-4 ring-saffron-500/20">
            <YouTube url={b.youtubeUrl} title={b.caption ?? b.heading} />
          </Reveal>
          {b.caption && <p className="mt-3 text-sm text-muted">{b.caption}</p>}
        </div>
      )
    case 'quote':
      return (
        <Reveal as="figure" className="on-dark relative overflow-hidden rounded-3xl border border-saffron-500/30 bg-gradient-to-r from-charcoal-950 via-[#0a1728] to-[#10233d] p-8 text-white shadow-2xl sm:p-12 lg:p-16">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-saffron-500 via-amber-400 to-leaf-500" />
          <Quote aria-hidden className="pointer-events-none absolute -bottom-10 -right-6 size-64 text-white opacity-[0.05]" />
          <span aria-hidden className="pointer-events-none absolute -top-24 right-1/4 size-80 bg-saffron-600/20 blur-3xl" />
          <div className="relative z-10 max-w-4xl space-y-6">
            <span className="grid size-12 place-items-center rounded-2xl border border-saffron-500/30 bg-saffron-500/20 text-saffron-400 shadow-sm">
              <Quote aria-hidden className="size-6 text-saffron-400" />
            </span>
            <blockquote className="font-quote text-xl font-light italic leading-relaxed text-stone-100 sm:text-2xl lg:text-3xl">{b.text}</blockquote>
            <figcaption className="flex items-center gap-4 border-t border-white/15 pt-5">
              <span aria-hidden className="h-0.5 w-10 bg-gradient-to-r from-saffron-500 to-amber-400" />
              <span className="font-display text-sm font-bold tracking-wider uppercase text-saffron-200">
                {b.author || 'रोहन सुभाष देशमुख'}
              </span>
            </figcaption>
          </div>
        </Reveal>
      )
    case 'downloads':
      return (
        <div className="max-w-4xl">
          <StitchHead eyebrow={b.eyebrow} heading={b.heading} />
          <Stagger as="ul" className="grid gap-3">
            {b.files?.map((f) => {
              const url = typeof f.file === 'object' && f.file ? f.file.url : null
              return (
                <StaggerItem as="li" key={f.id}>
                  <a href={url ?? '#'} download className={cn(card, 'group flex items-center gap-4 p-5 transition-all hover:border-saffron-300 hover:shadow-md')}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-saffron-50 text-saffron-600 transition-colors group-hover:bg-saffron-600 group-hover:text-white"><FileText className="size-5" /></span>
                    <span className="flex-1 font-semibold text-charcoal-900 transition group-hover:text-saffron-700">{f.label}</span>
                    <Download className="size-5 text-muted transition group-hover:translate-y-0.5 group-hover:text-saffron-700" />
                  </a>
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      )
    case 'cta':
      return (
        <Reveal className="on-dark relative grid overflow-hidden rounded-3xl border-t-4 border-saffron-500 bg-gradient-to-br from-charcoal-950 via-[#0c1a2e] to-[#10233d] text-white shadow-2xl md:grid-cols-[1.3fr_1fr]">
          <div aria-hidden className="glow-tl" />
          <div aria-hidden className="glow-br" />
          <div className="relative z-10 p-8 md:p-12 lg:p-14">
            {b.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-300">{b.eyebrow}</p>}
            {b.heading && <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-white md:text-4xl">{b.heading}</h2>}
            {b.text && <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-slate-300">{b.text}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              {b.buttons?.map((l, i) => (
                <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={cn('btn', i > 0 && 'btn-ghost')}>
                  {l.label} <ArrowRight className="size-4" />
                </CMSLink>
              ))}
            </div>
          </div>
          {mediaUrl(b.image, 'card') && (
            <div className="relative min-h-60">
              <Img media={b.image} variant="card" alt={mediaAlt(b.image)} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" style={{ objectPosition: mediaPosition(b.image) }} />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-charcoal-950/60 to-transparent max-md:bg-gradient-to-t" />
            </div>
          )}
        </Reveal>
      )
    default:
      return null
  }
}
