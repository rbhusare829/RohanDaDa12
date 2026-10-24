import { m } from 'motion/react'
import { ArrowRight, ArrowUpRight, BookOpen, ChevronRight, Quote } from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn, toMarathiDigits } from '@/lib/utils'
import { LOCALE } from '@/lib/i18n'
import { mediaAlt, mediaPosition, mediaSize, mediaUrl } from '@/lib/media'
import { PageBlocks } from '@/components/blocks/PageBlocks'
import { StitchBlock } from '@/components/blocks/StitchBlocks'
import { RichText } from '@/components/ui/RichText'
import { CMSLink } from '@/components/ui/CMSLink'
import { CountUp } from '@/components/ui/CountUp'
import { Img } from '@/components/ui/Img'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'

type Block = NonNullable<Page['layout']>[number]
type Cards = Extract<Block, { blockType: 'cards' }>
type MediaText = Extract<Block, { blockType: 'mediaText' }>
type Stats = Extract<Block, { blockType: 'stats' }>
type Cta = Extract<Block, { blockType: 'cta' }>
type QuoteBlock = Extract<Block, { blockType: 'quote' }>

/** 01, 02… (Devanagari digits on the Marathi site) */
const pad = (n: number) => (LOCALE === 'mr' ? toMarathiDigits(String(n).padStart(2, '0')) : String(n).padStart(2, '0'))
const bleed = 'relative left-1/2 w-screen -translate-x-1/2'

/**
 * Vision page (redesign, Oct 2026) — the page's blocks from Pages in the admin, each in a look made for the manifesto:
 *  - a Cards block without a heading (Read · Pledge · Act) → a step bar joined by arrows
 *  - Media + text (the book) → the cover in 3D on a warm band, beside the text and buttons
 *  - Stats → a navy band of big numbers
 *  - the first Call to action → a light invitation card with its photo; later ones → the navy banner
 *  - Quote → a large centred statement
 *  - Cards with a heading (How it works) → numbered steps joined by a dashed line
 */
export function Manifesto({ blocks }: { blocks?: Block[] | null }) {
  const list = (blocks ?? []).filter((b) => !('hidden' in b && b.hidden))
  const firstCta = list.find((b) => b.blockType === 'cta')
  if (!list.length) return null
  return (
    <div className="space-y-16 md:space-y-24">
      {list.map((b, i) => {
        const key = b.id ?? String(i)
        switch (b.blockType) {
          case 'cards':
            return b.items?.some((c) => mediaUrl(c.image, 'card')) ? (
              <PageBlocks key={key} blocks={[b]} design="stitch" />
            ) : b.heading ? (
              <HowItWorks key={key} block={b} />
            ) : (
              <StepBar key={key} block={b} />
            )
          case 'mediaText':
            return <Book key={key} block={b} />
          case 'stats':
            return <StatsBand key={key} block={b} />
          case 'cta':
            return b === firstCta ? <Invitation key={key} block={b} /> : <StitchBlock key={key} b={b} />
          case 'quote':
            return <Statement key={key} block={b} />
          default:
            return <PageBlocks key={key} blocks={[b]} design="stitch" />
        }
      })}
    </div>
  )
}

/** Read → Pledge → Act: one white bar, the steps divided by arrows */
function StepBar({ block }: { block: Cards }) {
  const items = block.items ?? []
  return (
    <Stagger as="ol" className="grid grid-cols-1 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_20px_50px_-12px_rgba(9,20,34,0.12)] md:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ ['--n' as string]: items.length }}>
      {items.map((c, i) => (
        <StaggerItem as="li" key={c.id ?? i} className="group relative flex items-center gap-5 border-stone-200/80 p-6 transition-colors hover:bg-ivory max-md:border-b max-md:last:border-b-0 md:border-r md:p-8 md:last:border-r-0">
          <span className={cn('grid size-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-105', i % 3 === 1 ? 'bg-leaf-600' : i % 3 === 2 ? 'bg-charcoal-950' : 'bg-gradient-to-br from-saffron-600 via-saffron-500 to-[#f97316]')}>
            {pad(i + 1)}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-charcoal-950 md:text-2xl">{c.title}</h2>
            {c.text && <p className="mt-0.5 text-sm text-gray-600">{c.text}</p>}
          </div>
          {i < items.length - 1 && (
            <span aria-hidden className="absolute -right-4 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full border border-stone-200 bg-white text-saffron-600 shadow-sm md:grid">
              <ChevronRight className="size-4" />
            </span>
          )}
        </StaggerItem>
      ))}
    </Stagger>
  )
}

/** the book: its cover tilted in 3D on a warm band, the text and buttons beside it */
function Book({ block }: { block: MediaText }) {
  const hasImg = Boolean(mediaUrl(block.image, 'card'))
  const size = mediaSize(block.image)
  const right = block.imagePosition === 'right'
  return (
    <section className={cn(bleed, 'overflow-hidden border-y border-stone-200/70 bg-gradient-to-br from-ivory via-cream to-ivory')}>
      <div aria-hidden className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-saffron-500/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-10 size-[24rem] rounded-full bg-leaf-600/10 blur-3xl" />
      <div className={cn('container-x relative grid grid-cols-1 items-center gap-12 py-16 lg:gap-16 lg:py-24', hasImg && 'lg:grid-cols-12')}>
        {hasImg && (
          <Reveal className={cn('flex justify-center lg:col-span-5', right && 'lg:order-2')}>
            <div className="relative [perspective:1400px]">
              <div aria-hidden className="absolute inset-6 -z-10 rounded-full bg-saffron-500/30 blur-3xl" />
              <m.div
                className="relative w-60 overflow-hidden rounded-r-xl rounded-l-sm shadow-[24px_32px_60px_-20px_rgba(9,20,34,0.55)] sm:w-72 lg:w-80"
                initial={{ rotateY: -18, rotateX: 4 }}
                whileHover={{ rotateY: -4, rotateX: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Img media={block.image} variant="card" alt={mediaAlt(block.image, block.heading ?? '')} width={size.width} height={size.height} sizes="(max-width:640px) 240px, 320px" className="h-auto w-full" />
                {/* spine shading */}
                <span aria-hidden className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/35 to-transparent" />
              </m.div>
            </div>
          </Reveal>
        )}
        <Reveal delay={0.1} className={cn('flex flex-col gap-5', hasImg && 'lg:col-span-7')}>
          {block.eyebrow && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-saffron-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">
              <BookOpen aria-hidden className="size-4" />
              {block.eyebrow}
            </span>
          )}
          {block.heading && <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-charcoal-950 sm:text-5xl">{block.heading}</h2>}
          <span aria-hidden className="block h-1 w-16 rounded-full bg-gradient-to-r from-saffron-600 to-leaf-600" />
          <RichText html={block.body} className="max-w-2xl" />
          {!!block.buttons?.length && (
            <div className="flex flex-wrap gap-3 pt-2">
              {block.buttons.map((l, i) => (
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

/** the numbers on a navy band */
function StatsBand({ block }: { block: Stats }) {
  const items = block.items ?? []
  return (
    <section className={cn(bleed, 'on-dark overflow-hidden border-y-4 border-y-saffron-500 bg-gradient-to-b from-charcoal-950 via-[#0c1a2e] to-[#10233d] text-white')}>
      <div aria-hidden className="glow-tl" />
      <div aria-hidden className="glow-br" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.04] [background-size:24px_24px]" />
      <div className="container-x relative grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-12 lg:py-20">
        <Reveal className="space-y-2 lg:col-span-4">
          {block.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-300">{block.eyebrow}</p>}
          {block.heading && <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{block.heading}</h2>}
        </Reveal>
        <Stagger className={cn('grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:col-span-8')} style={{ ['--n' as string]: items.length }}>
          {items.map((s, i) => (
            <StaggerItem key={s.id ?? i} className="bg-charcoal-950/60 p-6 backdrop-blur-sm md:p-8">
              <p className={cn('font-display text-4xl font-bold tracking-tight lg:text-5xl', i % 2 ? 'text-leaf-200' : 'text-saffron-500')}>
                <CountUp value={s.value} />
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-300">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/** the first call to action: a light card with its photo */
function Invitation({ block }: { block: Cta }) {
  const hasImg = Boolean(mediaUrl(block.image, 'card'))
  return (
    <Reveal className={cn('relative grid overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-[0_20px_50px_-12px_rgba(9,20,34,0.14)]', hasImg && 'md:grid-cols-[1.2fr_1fr]')}>
      <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-saffron-600 via-saffron-500 to-leaf-600" />
      <div className="relative p-8 md:p-12 lg:p-14">
        <span aria-hidden className="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-saffron-500/10 blur-2xl" />
        {block.eyebrow && <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-600">{block.eyebrow}</p>}
        {block.heading && <h2 className="relative mt-2 font-display text-3xl font-bold leading-tight text-charcoal-950 md:text-4xl">{block.heading}</h2>}
        {block.text && <p className="relative mt-4 whitespace-pre-line text-lg leading-relaxed text-gray-600">{block.text}</p>}
        {!!block.buttons?.length && (
          <div className="relative mt-8 flex flex-wrap gap-3">
            {block.buttons.map((l, i) => (
              <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={cn('btn', i > 0 && 'btn-ghost')}>
                {l.label} <ArrowRight className="size-4" />
              </CMSLink>
            ))}
          </div>
        )}
      </div>
      {hasImg && (
        <div className="group relative min-h-64 overflow-hidden">
          <Img media={block.image} variant="card" alt={mediaAlt(block.image)} fill sizes="(max-width:768px) 100vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: mediaPosition(block.image) }} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent max-md:bg-gradient-to-b" />
        </div>
      )}
    </Reveal>
  )
}

/** the quote as a large centred statement */
function Statement({ block }: { block: QuoteBlock }) {
  return (
    <Reveal as="figure" className="relative mx-auto max-w-5xl px-2 py-6 text-center md:py-10">
      <span aria-hidden className="mx-auto mb-8 flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-saffron-500" />
        <Quote className="size-7 text-saffron-500" />
        <span className="h-px w-12 bg-leaf-600" />
      </span>
      <blockquote className="font-quote relative text-2xl leading-relaxed text-charcoal-950 sm:text-3xl lg:text-[2.4rem] lg:leading-[1.45]">{block.text}</blockquote>
      {block.author && <figcaption className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-saffron-600">{block.author}</figcaption>}
    </Reveal>
  )
}

/** How it works: numbered steps joined by a dashed line, each one a link */
function HowItWorks({ block }: { block: Cards }) {
  const items = block.items ?? []
  return (
    <section>
      <Reveal className="mx-auto mb-12 max-w-2xl space-y-2 text-center">
        {block.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-600">{block.eyebrow}</p>}
        {block.heading && <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-4xl">{block.heading}</h2>}
        {block.intro && <p className="pt-1 text-base leading-relaxed text-gray-600">{block.intro}</p>}
      </Reveal>
      <div className="relative">
        {items.length > 1 && (
          <m.span
            aria-hidden
            className="absolute top-10 hidden h-0.5 origin-left bg-[repeating-linear-gradient(90deg,var(--color-saffron-500)_0_10px,transparent_10px_18px)] md:block"
            style={{ left: `calc(100% / ${items.length * 2})`, right: `calc(100% / ${items.length * 2})` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
          />
        )}
        <Stagger as="ol" className="relative grid grid-cols-1 gap-6 md:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ ['--n' as string]: items.length }}>
          {items.map((c, i) => {
            const inner = (
              <>
                <span className={cn('relative z-10 mx-auto grid size-20 place-items-center rounded-full font-display text-2xl font-bold text-white shadow-lg ring-8 ring-paper transition-transform duration-300 group-hover:scale-110', i % 3 === 1 ? 'bg-leaf-600' : i % 3 === 2 ? 'bg-charcoal-950' : 'bg-gradient-to-br from-saffron-600 via-saffron-500 to-[#f97316]')}>
                  {pad(i + 1)}
                </span>
                <div className="mt-6 flex flex-1 flex-col items-center gap-2 rounded-2xl border border-stone-200/90 bg-white p-6 text-center shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-saffron-300 group-hover:shadow-lg">
                  <h3 className="font-display text-xl font-bold text-charcoal-950 transition-colors group-hover:text-saffron-700">{c.title}</h3>
                  {c.text && <p className="text-sm leading-relaxed text-gray-600">{c.text}</p>}
                  {c.url && <ArrowUpRight aria-hidden className="mt-auto size-5 text-saffron-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
                </div>
              </>
            )
            return (
              <StaggerItem as="li" key={c.id ?? i} className="h-full">
                {c.url ? (
                  <CMSLink url={c.url} className="group flex h-full flex-col">{inner}</CMSLink>
                ) : (
                  <div className="group flex h-full flex-col">{inner}</div>
                )}
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
