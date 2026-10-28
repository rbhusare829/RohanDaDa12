import type { ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, Download, FileText, Quote } from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn } from '@/lib/utils'
import { mediaAlt, mediaPosition, mediaSize, mediaUrl, photoFit, toGallery } from '@/lib/media'
import { RichText } from '../ui/RichText'
import { CMSLink } from '../ui/CMSLink'
import { Gallery } from '../ui/Gallery'
import { Img } from '../ui/Img'
import { YouTube } from '../ui/YouTube'
import { FaqAccordion } from '../home/FaqAccordion'
import { CountUp } from '../ui/CountUp'
import { StitchBlock, StitchChapter, StitchContent } from './StitchBlocks'

export type PageBlock = NonNullable<Page['layout']>[number]

const Heading = ({ eyebrow, heading }: { eyebrow?: string | null; heading?: string | null }) =>
  eyebrow || heading ? (
    <div className="mb-7 max-w-3xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {heading && <h2 className="mt-2 text-[1.7rem] leading-tight text-charcoal-900 md:text-[2.2rem]">{heading}</h2>}
    </div>
  ) : null

type Content = Extract<PageBlock, { blockType: 'content' }>

/** Stitch design: consecutive Content blocks share one row of cards; Media + text blocks become numbered chapters when there are two or more */
function StitchList({ blocks, plainChapters }: { blocks: PageBlock[]; plainChapters?: boolean }) {
  const list = blocks.filter((b) => !('hidden' in b && b.hidden))
  const chapters = list.filter((b) => b.blockType === 'mediaText').length
  const groups: { key: string; node: ReactNode; anchor?: string }[] = []
  let chapter = 0
  for (let i = 0; i < list.length; i++) {
    const b = list[i]
    const key = b.id ?? String(i)
    if (b.blockType === 'content') {
      const run: Content[] = [b]
      while (list[i + 1]?.blockType === 'content') run.push(list[++i] as Content)
      groups.push({ key, node: <StitchContent blocks={run} />, anchor: b.heading ? `s-${i}` : undefined })
    } else if (b.blockType === 'mediaText') {
      chapter++
      groups.push({ key, node: <StitchChapter b={b} n={chapters > 1 ? chapter : undefined} plain={plainChapters} />, anchor: b.heading ? `s-${i}` : undefined })
    } else groups.push({ key, node: <StitchBlock b={b} />, anchor: 'heading' in b && b.heading ? `s-${i}` : undefined })
  }
  return (
    <div className="space-y-10 sm:space-y-16 md:space-y-24">
      {groups.map((g) => (
        <div key={g.key} id={g.anchor} className="scroll-mt-28">
          {g.node}
        </div>
      ))}
    </div>
  )
}

/** The content blocks of a page (Pages → Content in the admin), one after another. `design="stitch"`: the Stitch look (Oct 2026) */
export function PageBlocks({ blocks, design, plainChapters }: { blocks?: PageBlock[] | null; design?: 'stitch'; /** stitch: Media + text without the card around the text */ plainChapters?: boolean }) {
  if (!blocks?.length) return null
  if (design === 'stitch') return <StitchList blocks={blocks} plainChapters={plainChapters} />
  return (
    <div className="space-y-10 sm:space-y-16 md:space-y-24">
      {blocks.filter((b) => !('hidden' in b && b.hidden)).map((b, i) => (
        <div key={b.id ?? i} id={'heading' in b && b.heading ? `s-${i}` : undefined} className="scroll-mt-28">
          {render(b)}
        </div>
      ))}
    </div>
  )
}

function render(b: PageBlock): ReactNode {
  switch (b.blockType) {
    case 'content':
      return (
        <div className="max-w-[52rem]">
          <Heading eyebrow={b.eyebrow} heading={b.heading} />
          <RichText html={b.body} />
        </div>
      )
    case 'mediaText': {
      const size = mediaSize(b.image)
      // tall images (e.g. a book cover) are shown at book size instead of filling the column / the whole phone screen
      const tall = size.height > size.width * 1.3
      return (
        <div className={cn('grid items-start gap-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16', b.imagePosition === 'right' && 'md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]')}>
          {mediaUrl(b.image, 'card') && (
            /* full photo at its natural shape — never crop faces */
            <div
              className={cn(
                'overflow-hidden bg-cream md:sticky md:top-28',
                tall ? 'mx-auto w-full max-w-60 rounded-xl shadow-[0_24px_48px_-20px_rgba(20,33,61,.45)] sm:max-w-[18rem] lg:max-w-84' : 'rounded-[1.75rem]',
                b.imagePosition === 'right' && 'md:order-2',
              )}
            >
              <Img media={b.image} variant="card" alt={mediaAlt(b.image, b.heading ?? '')} width={size.width} height={size.height} sizes={tall ? '(max-width:640px) 240px, 336px' : '(max-width:768px) 100vw, 40vw'} className="h-auto w-full" />
            </div>
          )}
          <div className="max-w-2xl">
            <Heading eyebrow={b.eyebrow} heading={b.heading} />
            <RichText html={b.body} />
            {!!b.buttons?.length && (
              <div className="mt-8 flex flex-wrap gap-3">
                {b.buttons.map((l, i) => (
                  <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={cn('btn', i === 0 ? 'btn-primary' : 'btn-ghost')}>{l.label}</CMSLink>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
    case 'stats':
      return (
        <>
          <Heading eyebrow={b.eyebrow} heading={b.heading} />
          <div className="stat-row grid-cols-2 md:grid-cols-4">
            {b.items?.map((s) => (
              <div key={s.id} className="stat-item">
                <p className="stat-value"><CountUp value={s.value} /></p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )
    case 'cards': {
      const withImages = b.items?.some((c) => mediaUrl(c.image, 'card'))
      // a card title is a sub-heading of the block's heading; without one it follows the page title directly
      const CardTitle = b.heading ? 'h3' : 'h2'
      const cols = b.columns === '2' ? 'md:grid-cols-2' : b.columns === '4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
      return (
        <>
          <Heading eyebrow={b.eyebrow} heading={b.heading} />
          {b.intro && <p className="lead -mt-3 mb-10 max-w-3xl">{b.intro}</p>}
          {/* photo cards = open tiles; text-only cards = columns under one shared rule (no boxes) */}
          <div className={cn('grid', cols, withImages ? 'gap-x-7 gap-y-8 sm:gap-y-12' : 'gap-x-10 gap-y-6 sm:gap-y-10 border-t border-charcoal-900/12')}>
            {b.items?.map((c) => {
              const inner = (
                <>
                  {mediaUrl(c.image, 'card') && (
                    <div className="tile-media aspect-[16/10]">
                      <Img media={c.image} variant="card" alt={mediaAlt(c.image, c.title)} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" style={photoFit(c.image, 1.6)} />
                    </div>
                  )}
                  {!withImages && <span aria-hidden className="absolute -top-px left-0 h-[3px] w-12 bg-saffron-500 transition-all duration-300 group-hover:w-20" />}
                  <div className={cn('tile-body', !withImages && 'pt-6')}>
                    <CardTitle className="tile-title">{c.title}{c.url && <ArrowUpRight aria-hidden className="ml-1.5 inline size-4 -translate-y-px text-saffron-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}</CardTitle>
                    {c.meta && <p className="tile-kicker mt-1">{c.meta}</p>}
                    {c.text && <p className="tile-text whitespace-pre-line">{c.text}</p>}
                    {!!c.tags?.length && (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {c.tags.map((t, i) => <li key={i} className="rounded-full bg-saffron-50 px-2.5 py-1 text-xs font-medium text-saffron-700">{t}</li>)}
                      </ul>
                    )}
                  </div>
                </>
              )
              return c.url ? (
                <CMSLink key={c.id} url={c.url} className="tile group">{inner}</CMSLink>
              ) : (
                <div key={c.id} className="tile group">{inner}</div>
              )
            })}
          </div>
        </>
      )
    }
    case 'gallery':
      return (
        <>
          <Heading eyebrow={b.eyebrow} heading={b.heading} />
          <Gallery images={toGallery(b.images, b.heading ?? '')} layout={(b.layout as 'grid' | 'masonry') ?? 'grid'} />
        </>
      )
    case 'faq':
      return (
        <div className="max-w-4xl">
          <Heading eyebrow={b.eyebrow} heading={b.heading} />
          <FaqAccordion items={(b.items ?? []).map((f) => ({ q: f.question, a: <RichText html={f.answer} className="!text-base !text-muted" /> }))} />
        </div>
      )
    case 'video':
      return (
        <div className="max-w-4xl">
          <Heading eyebrow={b.eyebrow} heading={b.heading} />
          <YouTube url={b.youtubeUrl} title={b.caption ?? b.heading} />
          {b.caption && <p className="mt-3 text-sm text-muted">{b.caption}</p>}
        </div>
      )
    case 'quote':
      return (
        /* pull quote: words on the page, held by a saffron rule — no box */
        <figure className="max-w-4xl border-l-4 border-saffron-500 py-2 pl-6 md:pl-10">
          <Quote aria-hidden className="size-9 text-saffron-500" />
          <blockquote className="font-quote mt-4 text-2xl leading-relaxed text-charcoal-900 md:text-[1.9rem] md:leading-[1.5]">{b.text}</blockquote>
          {b.author && <figcaption className="mt-5 font-semibold text-saffron-700">— {b.author}</figcaption>}
        </figure>
      )
    case 'downloads':
      return (
        <div className="max-w-4xl">
          <Heading eyebrow={b.eyebrow} heading={b.heading} />
          <ul className="divide-y divide-line border-y border-line">
            {b.files?.map((f) => {
              const url = typeof f.file === 'object' && f.file ? f.file.url : null
              return (
                <li key={f.id}>
                  <a href={url ?? '#'} download className="group flex items-center gap-4 py-4">
                    <FileText className="size-7 shrink-0 text-saffron-600" strokeWidth={1.6} />
                    <span className="flex-1 font-semibold text-charcoal-900 transition group-hover:text-saffron-700">{f.label}</span>
                    <Download className="size-5 text-muted transition group-hover:translate-y-0.5 group-hover:text-saffron-700" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )
    case 'cta':
      return (
        /* closing invitation: a soft cream panel (the one place a page uses a panel) */
        <div className="grid overflow-hidden rounded-[1.75rem] bg-cream md:grid-cols-[1.3fr_1fr]">
          <div className="p-8 md:p-12">
            {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
            {b.heading && <h2 className="mt-2 text-[1.75rem] leading-tight text-charcoal-900 md:text-[2.25rem]">{b.heading}</h2>}
            {b.text && <p className="lead mt-4 whitespace-pre-line">{b.text}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              {b.buttons?.map((l, i) => (
                <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={cn('btn', i === 0 ? 'btn-primary' : 'btn-ghost')}>
                  {l.label} <ArrowRight className="size-4" />
                </CMSLink>
              ))}
            </div>
          </div>
          {mediaUrl(b.image, 'card') && (
            <div className="relative min-h-60">
              <Img media={b.image} variant="card" alt={mediaAlt(b.image)} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" style={{ objectPosition: mediaPosition(b.image) }} />
            </div>
          )}
        </div>
      )
    default:
      return null
  }
}
