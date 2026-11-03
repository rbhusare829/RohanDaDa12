import type { ReactNode } from 'react'
import { ArrowRight, Award, BookOpen, Building2, Download, FileText, HeartHandshake, Quote, Sparkles, Users } from 'lucide-react'
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
import { m } from 'motion/react'
import { draw, group, inView, photo, rise } from '@/lib/scroll-motion'
import type { PageBlock } from './PageBlocks'

/**
 * The page blocks in the Stitch design (Oct 2026, in Modern Teal + Saffron since Nov 2026) — used on Introduction, Family Background, Lokmangal
 * Foundation and Political Career. Same content as the standard blocks, only the look changes:
 * - Media + text → a "chapter": label chip + heading, the photo (left or right) beside a Cloud text card
 * - Content → Cloud cards with a saffron edge (consecutive ones side by side)
 * - Cards → numbered area cards (text only, a link when they have one) or sand photo cards
 * - Quote → Modern Teal pull-quote; Call to action → the Modern Teal closing block; Stats → Cloud tiles with blue figures
 */

type Content = Extract<PageBlock, { blockType: 'content' }>
type MediaText = Extract<PageBlock, { blockType: 'mediaText' }>

const pad = (n: number) => String(n).padStart(2, '0')

const getCardIcon = (title?: string | null, url?: string | null) => {
  const s = `${title ?? ''} ${url ?? ''}`.toLowerCase()
  if (s.includes('family') || s.includes('biography') || s.includes('कौटुंबिक')) return Users
  if (s.includes('parivar') || s.includes('foundation') || s.includes('संस्था')) return Building2
  if (s.includes('politic') || s.includes('career') || s.includes('राजकीय')) return Award
  if (s.includes('vision') || s.includes('manifesto') || s.includes('व्हिजन')) return BookOpen
  if (s.includes('social') || s.includes('कार्य') || s.includes('सेवा')) return HeartHandshake
  return Sparkles
}

/** label + heading + intro, Stitch style */
export function StitchHead({ eyebrow, heading, intro, as: H = 'h2', className, accent }: { eyebrow?: string | null; heading?: string | null; intro?: string | null; as?: 'h2' | 'h3'; className?: string; /** the saffron underline and teal dot under the heading */ accent?: boolean }) {
  if (!eyebrow && !heading && !intro) return null
  return (
    <Reveal className={cn('mb-6 sm:mb-10 max-w-3xl space-y-2', className)}>
      {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{eyebrow}</p>}
      {heading && <H className="font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-900 sm:text-4xl">{heading}</H>}
      {heading && accent && <div aria-hidden className="mt-3 flex items-center gap-1.5"><span className="h-1.5 w-12 rounded-full bg-gold sm:w-14" /><span className="h-1.5 w-3 rounded-full bg-leaf-600 sm:w-3.5" /></div>}
      {intro && <p className="pt-1 text-base leading-relaxed text-muted">{intro}</p>}
    </Reveal>
  )
}

// Cloud, the palette's surface for cards
const card = 'rounded-3xl border border-line bg-cream shadow-[0_15px_40px_-12px_rgba(24,33,38,0.08)]'

/** one or more consecutive Content blocks: Cloud cards with a saffron edge, two per row when there are several */
export function StitchContent({ blocks }: { blocks: Content[] }) {
  if (blocks.length === 1) {
    const b = blocks[0]
    return (
      <Reveal className={cn(card, 'relative overflow-hidden border-l-4 border-l-saffron-500 p-8 md:p-10 lg:p-12')}>
        <span aria-hidden className="pointer-events-none absolute right-0 top-0 size-32 rounded-bl-full bg-gradient-to-bl from-saffron-100/60 to-transparent" />
        <div className="relative max-w-4xl">
          {b.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{b.eyebrow}</p>}
          {b.heading && <h2 className="mb-5 mt-1 font-display text-2xl font-bold leading-tight text-charcoal-900 md:text-3xl">{b.heading}</h2>}
          <RichText html={b.body} readMore />
        </div>
      </Reveal>
    )
  }
  return (
    <Stagger className="grid gap-8 md:grid-cols-2">
      {blocks.map((b, i) => {
        const isSocial = `${b.eyebrow ?? ''} ${b.heading ?? ''}`.toLowerCase().includes('social') || `${b.eyebrow ?? ''} ${b.heading ?? ''}`.toLowerCase().includes('lokmangal')
        const Icon = isSocial ? HeartHandshake : BookOpen
        // social work is development work: Jade; the rest Saffron Amber
        const accent = isSocial ? 'bg-leaf-600' : 'bg-saffron-600'
        const ctaUrl = isSocial ? '/lokmangal/foundation' : '/vision'
        const ctaLabel = isSocial ? 'लोकमंगल फाऊंडेशन' : 'व्हिजन व संकल्प'

        return (
          <StaggerItem
            key={b.id ?? i}
            className={cn(
              card,
              'group relative flex flex-col justify-between overflow-hidden p-8 transition-all duration-300 hover:border-gold hover:shadow-2xl hover:-translate-y-1.5 lg:p-10',
            )}
          >
            {/* Top accent bar */}
            <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1.5', accent)} />

            {/* Ambient corner light */}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute right-0 top-0 size-36 rounded-bl-full bg-gradient-to-bl opacity-40',
                isSocial ? 'from-leaf-50 to-transparent' : 'from-saffron-100/60 to-transparent',
              )}
            />

            <div className="relative flex flex-col gap-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid size-12 shrink-0 place-items-center rounded-xl font-display text-base font-bold shadow-sm',
                      accent,
                      // Cloud White icon on jade, Charcoal icon on saffron (Cloud White there would be 2.1:1)
                      isSocial ? 'text-white' : 'text-ink',
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <div className="min-w-0">
                    {b.eyebrow && <p className={cn('text-[11px] font-bold uppercase tracking-[0.2em]', isSocial ? 'text-leaf-700' : 'text-saffron-700')}>{b.eyebrow}</p>}
                    {b.heading && <h2 className="font-display text-xl font-bold leading-snug text-charcoal-900 md:text-2xl">{b.heading}</h2>}
                  </div>
                </div>
                <span aria-hidden className="font-display text-xs font-bold text-gold">{pad(i + 1)}</span>
              </div>
              <div className="text-[0.98rem] leading-relaxed text-ink">
                <RichText html={b.body} readMore />
              </div>
            </div>

            <div className="relative mt-8 border-t border-line pt-5">
              <CMSLink url={ctaUrl} className="group/btn inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-saffron-700 transition-colors hover:text-charcoal-900">
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

/**
 * The Political Career chapters (Oct 2026): just the title with the saffron underline and teal dot under it (no number or label), then the photo
 * beside the words — in the Social Activities animations: the title rises, the bars draw themselves, the photo slides in from its own
 * side and the words rise after it, once, as the chapter scrolls into view.
 */
function LivelyChapter({ b, hasImg, fit, right }: { b: MediaText; hasImg: boolean; fit: ReturnType<typeof photoFit>; right: boolean }) {
  return (
    <m.section {...inView} variants={group} className="flex flex-col gap-8 md:gap-10">
      {b.heading && (
        <div className="relative">
          {/* the timeline node of this chapter (the rail is drawn by the list, see PageBlocks) */}
          <span aria-hidden className="absolute -left-14 top-2.5 hidden size-4 rounded-full border-[3px] border-paper bg-gold shadow-[0_0_0_2px_rgba(15,92,99,0.5)] lg:block" />
          <m.h2 variants={rise} className="max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-900 sm:text-4xl">{b.heading}</m.h2>
          <m.div variants={draw} aria-hidden className="mt-3 flex origin-left items-center gap-1.5">
            <span className="h-1.5 w-12 rounded-full bg-gold sm:w-14" />
            <span className="h-1.5 w-3 rounded-full bg-leaf-600 sm:w-3.5" />
          </m.div>
        </div>
      )}
      <div className={cn('grid grid-cols-1 items-stretch gap-8', hasImg && 'lg:grid-cols-12')}>
        {hasImg && (
          <m.div variants={photo(right)} className={cn('lg:col-span-7', right && 'lg:order-2')}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-cream shadow-md lg:aspect-auto lg:h-full lg:min-h-[400px]">
              <Img media={b.image} variant="card" alt={mediaAlt(b.image, b.heading ?? '')} fill sizes="(max-width:1024px) 100vw, 680px" className="h-full w-full transition-transform duration-[1.2s] ease-out hover:scale-[1.03]" style={{ ...fit, objectPosition: '50% 6%' }} />
            </div>
          </m.div>
        )}
        <m.div variants={rise} className={cn('flex flex-col gap-6 lg:justify-center', hasImg && 'lg:col-span-5')}>
          <RichText html={b.body} readMore />
          {!!b.buttons?.length && (
            <div className="flex flex-wrap gap-3 border-t border-line pt-6">
              {b.buttons.map((l, i) => (
                <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={cn('btn', i > 0 && 'btn-ghost')}>
                  {l.label} <ArrowRight className="size-4" />
                </CMSLink>
              ))}
            </div>
          )}
        </m.div>
      </div>
    </m.section>
  )
}

/** Media + text as a Stitch chapter: chip + heading, then the photo beside a text card (`plain`: the text straight on the page, no card) */
export function StitchChapter({ b, n, plain, accent, lively }: { b: MediaText; n?: number; plain?: boolean; /** the saffron underline and teal dot under the heading */ accent?: boolean; lively?: boolean }) {
  const hasImg = Boolean(mediaUrl(b.image, 'card'))
  const fit = photoFit(b.image, 1.5, 0.45)
  const right = b.imagePosition === 'right'
  if (lively) return <LivelyChapter b={b} hasImg={hasImg} fit={fit} right={right} />
  return (
    <section className="flex flex-col gap-8 md:gap-10">
      <Reveal className="flex flex-col gap-3">
        {(b.eyebrow || n) && (
          <div className="flex flex-wrap items-center gap-3">
            {n && <span aria-hidden className="font-display text-sm font-bold tracking-widest text-saffron-700">{pad(n)}</span>}
            {n && b.eyebrow && <span aria-hidden className="h-0.5 w-8 bg-gold" />}
            {b.eyebrow && <span className="rounded bg-saffron-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-saffron-700">{b.eyebrow}</span>}
          </div>
        )}
        {b.heading && <h2 className="max-w-4xl font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-900 sm:text-4xl">{b.heading}</h2>}
        {b.heading && accent && <div aria-hidden className="mt-3 flex items-center gap-1.5"><span className="h-1.5 w-12 rounded-full bg-gold sm:w-14" /><span className="h-1.5 w-3 rounded-full bg-leaf-600 sm:w-3.5" /></div>}
      </Reveal>

      <div className={cn('grid grid-cols-1 items-stretch gap-8', hasImg && 'lg:grid-cols-12')}>
        {hasImg && (
          <Reveal className={cn('lg:col-span-7', right && 'lg:order-2')}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl shadow-md sm:aspect-[16/10] lg:aspect-auto lg:min-h-[400px] lg:h-full bg-cream">
              <Img media={b.image} variant="card" alt={mediaAlt(b.image, b.heading ?? '')} fill sizes="(max-width:1024px) 100vw, 680px" className="h-full w-full transition-transform duration-[1.2s] ease-out hover:scale-[1.03]" style={{ ...fit, objectPosition: '50% 6%' }} />
            </div>
          </Reveal>
        )}
        <Reveal delay={0.1} className={cn('flex flex-col gap-6', !plain && 'rounded-2xl bg-cream p-8 shadow-sm ring-1 ring-line md:p-10', plain && 'lg:justify-center', hasImg && 'lg:col-span-5')}>
          <RichText html={b.body} readMore />
          {!!b.buttons?.length && (
            <div className="flex flex-wrap gap-3 border-t border-line pt-6">
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

function Cards({ b, accent }: { b: Extract<PageBlock, { blockType: 'cards' }>; accent?: boolean }) {
  const items = b.items ?? []
  const withImages = items.some((c) => mediaUrl(c.image, 'card'))
  const CardTitle = b.heading ? 'h3' : 'h2'
  const cols = b.columns === '2' ? 'md:grid-cols-2' : b.columns === '4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
  return (
    <>
      <StitchHead eyebrow={b.eyebrow} heading={b.heading} intro={b.intro} accent={accent} />
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
                  <CardTitle className="font-display text-xl font-bold leading-snug text-charcoal-900 transition-colors group-hover:text-saffron-700">{c.title}</CardTitle>
                  {c.text && <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{c.text}</p>}
                </div>
              </>
            )
            const cls = cn(card, 'group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl')
            return <StaggerItem key={c.id}>{c.url ? <CMSLink url={c.url} className={cls}>{inner}</CMSLink> : <div className={cls}>{inner}</div>}</StaggerItem>
          }
          // text-only cards: Stitch "area" cards with a numbered icon box (the whole card is the link when it has one)
          const green = i % 3 === 1
          const Icon = getCardIcon(c.title, c.url)
          return (
            <StaggerItem key={c.id} className="h-full">
              <Box url={c.url} className={cn('group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-cream p-7 shadow-xs ring-1 ring-line transition-all duration-300 hover:shadow-xl sm:p-8', c.url && 'hover:-translate-y-1.5 hover:ring-gold')}>
                {/* Top accent line */}
                <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', green ? 'bg-leaf-600' : 'bg-saffron-600')} />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span
                      aria-hidden
                      className={cn(
                        'grid size-12 place-items-center rounded-xl font-display text-base font-bold transition-all duration-300',
                        green ? 'bg-leaf-600/10 text-leaf-700 group-hover:bg-leaf-600 group-hover:text-white' : 'bg-saffron-500/10 text-saffron-600 group-hover:bg-saffron-600 group-hover:text-ink',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span aria-hidden className="font-display text-xs font-bold text-gold">{pad(i + 1)}</span>
                  </div>
                  <CardTitle className="font-display text-xl font-bold leading-snug text-charcoal-900 transition-colors group-hover:text-saffron-700">{c.title}</CardTitle>
                  {c.text && <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-muted">{c.text}</p>}
                  {!!c.tags?.length && (
                    <ul className="flex flex-wrap gap-1.5 pt-1">
                      {c.tags.map((t, k) => <li key={k} className="rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-charcoal-900">{t}</li>)}
                    </ul>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5 text-xs font-bold tracking-wider uppercase text-saffron-700">
                  <span>{c.meta || (c.url ? (LOCALE === 'en' ? 'Learn more' : 'अधिक जाणून घ्या') : '')}</span>
                  <ArrowRight aria-hidden className={cn('size-4 transition-transform duration-300 group-hover:translate-x-1.5', green ? 'text-leaf-700' : 'text-saffron-600')} />
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
export function StitchBlock({ b, accent }: { b: PageBlock; accent?: boolean }): ReactNode {
  switch (b.blockType) {
    case 'cards':
      return <Cards b={b} accent={accent} />
    case 'stats':
      return (
        <>
          <StitchHead eyebrow={b.eyebrow} heading={b.heading} />
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {b.items?.map((s, i) => (
              <StaggerItem key={s.id} className="group relative overflow-hidden rounded-2xl border border-line bg-cream p-6 shadow-sm transition-all hover:border-gold hover:shadow-md">
                <span aria-hidden className={cn('absolute inset-x-0 top-0 h-1', i % 2 ? 'bg-leaf-600' : 'bg-saffron-600')} />
                <p className="font-display text-3xl font-bold text-charcoal-900 lg:text-4xl"><CountUp value={s.value} /></p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ink">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )
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
        <Reveal as="figure" className="on-dark relative overflow-hidden rounded-3xl border border-gold/30 bg-charcoal-900 p-8 text-paper shadow-2xl sm:p-12 lg:p-16">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gold" />
          <Quote aria-hidden className="pointer-events-none absolute -bottom-10 -right-6 size-64 text-paper opacity-[0.05]" />
          <span aria-hidden className="pointer-events-none absolute -top-24 right-1/4 size-80 bg-saffron-600/20 blur-3xl" />
          <div className="relative z-10 max-w-4xl space-y-6">
            <span className="grid size-12 place-items-center rounded-2xl border border-gold/30 bg-gold/15 text-gold shadow-sm">
              <Quote aria-hidden className="size-6 text-gold" />
            </span>
            <blockquote className="font-quote text-xl font-light italic leading-relaxed text-paper sm:text-2xl lg:text-3xl">{b.text}</blockquote>
            <figcaption className="flex items-center gap-4 border-t border-paper/15 pt-5">
              <span aria-hidden className="h-0.5 w-10 bg-gold" />
              <span className="font-display text-sm font-bold tracking-wider uppercase text-paper">
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
                  <a href={url ?? '#'} download className={cn(card, 'group flex items-center gap-4 p-5 transition-all hover:border-gold hover:shadow-md')}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-saffron-50 text-saffron-600 transition-colors group-hover:bg-saffron-600 group-hover:text-ink"><FileText className="size-5" /></span>
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
        <Reveal className="on-dark relative grid overflow-hidden rounded-3xl border-t-4 border-gold bg-charcoal-900 text-paper shadow-2xl md:grid-cols-[1.3fr_1fr]">
          <div aria-hidden className="glow-tl" />
          <div aria-hidden className="glow-br" />
          <div className="relative z-10 p-8 md:p-12 lg:p-14">
            {b.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-paper">{b.eyebrow}</p>}
            {b.heading && <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-paper md:text-4xl">{b.heading}</h2>}
            {b.text && <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-paper/80">{b.text}</p>}
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
