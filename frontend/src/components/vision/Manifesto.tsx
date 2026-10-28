import { m } from 'motion/react'
import { ArrowRight, ArrowUpRight, Quote } from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn, toMarathiDigits } from '@/lib/utils'
import { LOCALE } from '@/lib/i18n'
import { mediaAlt, mediaSize, mediaUrl } from '@/lib/media'
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
type QuoteBlock = Extract<Block, { blockType: 'quote' }>
type Text = { mr: string; en: string }

/** the page's words, in both languages (Oct 2026) */
const COPY = {
  title: { mr: 'द न्यू इंडिया मॅनिफेस्टो', en: 'The New India Manifesto' },
  pledge: { mr: 'उद्योजकतेतून स्वावलंबी भारताच्या निर्मितीचा संकल्प', en: 'A pledge to build a self-reliant India through enterprise' },
  motto: { mr: 'विचार करा. संकल्प करा. कृतीत उतरवा.', en: 'Think. Commit. Act.' },
  intro: {
    mr: '‘द न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी उद्योजकतेच्या माध्यमातून भारताच्या विकासाला नवी दिशा देण्याचा विचार मांडला आहे. तरुणांनी नोकरीच्या संधी शोधण्यापुरते मर्यादित न राहता स्वतः रोजगारनिर्मिती करावी, आपल्या कल्पनांना व्यवसायाचे स्वरूप द्यावे आणि देशाच्या आर्थिक व सामाजिक प्रगतीत योगदान द्यावे, हा या विचारामागील मुख्य हेतू आहे. सोलापूरपासून सुरू झालेला हा प्रवास देशभरातील तरुणांमधून एक लाख नवे उद्योजक घडवण्याच्या संकल्पाशी जोडलेला आहे.',
    en: 'In The New India Manifesto, Rohan Subhash Deshmukh sets out a simple idea: India’s growth can take a new direction through enterprise. He believes young people should not stop looking for jobs. They should create jobs, turn their ideas into businesses and add to the nation’s economic and social progress. This journey began in Solapur and is tied to one pledge: to help build one lakh new entrepreneurs from among India’s youth.',
  },
  goals: [
    {
      title: { mr: 'एक लाख उद्योजक घडवण्याचे ध्येय', en: 'One lakh entrepreneurs' },
      text: { mr: 'तरुणांमधील उद्योजकीय क्षमता विकसित करून त्यांना स्वतःचे व्यवसाय उभारण्यासाठी प्रेरित करणे.', en: 'Build the entrepreneurial strength of young people and inspire them to start businesses of their own.' },
    },
    {
      title: { mr: 'ग्रामीण भागात उद्योजकतेला चालना', en: 'Enterprise in rural India' },
      text: { mr: 'ग्रामीण भागातील संसाधने, कौशल्ये आणि स्थानिक गरजा यांवर आधारित व्यवसायांच्या संधी निर्माण करणे.', en: 'Create business opportunities rooted in the resources, skills and needs of rural communities.' },
    },
    {
      title: { mr: 'कल्पनांना संधी आणि मार्गदर्शन', en: 'Ideas with guidance' },
      text: {
        mr: 'शेती, दुग्धव्यवसाय, हस्तकला, व्यापार किंवा तंत्रज्ञान अशा विविध क्षेत्रांतील व्यावसायिक कल्पनांना योग्य मार्गदर्शन आणि आवश्यक संसाधनांची जोड मिळवून देणे.',
        en: 'Give ideas in farming, dairy, handicrafts, trade or technology the right guidance and resources to grow.',
      },
    },
    {
      title: { mr: 'उद्योजकतेतून सामाजिक परिवर्तन', en: 'Change through enterprise' },
      text: { mr: 'व्यवसायाच्या माध्यमातून रोजगारनिर्मिती करणे, स्थानिक समस्या सोडवणे आणि समाजाच्या आर्थिक प्रगतीत योगदान देणे.', en: 'Use business to create jobs, solve local problems and strengthen the economy of the community.' },
    },
  ],
  stepsTitle: { mr: 'वाचा → संकल्प करा → कृती करा', en: 'Read → Commit → Act' },
  steps: [
    {
      title: { mr: 'वाचा', en: 'Read' },
      text: { mr: 'उद्योजकता, स्वावलंबन आणि नवभारताच्या निर्मितीविषयी पुस्तकात मांडलेले विचार जाणून घ्या.', en: 'Discover the ideas in the book on enterprise, self-reliance and building a new India.' },
      url: 'https://newindiamanifesto.com/book',
    },
    {
      title: { mr: 'संकल्प करा', en: 'Commit' },
      text: {
        mr: 'स्वतःचा व्यवसाय सुरू करण्याचा, एखादी नवी कल्पना प्रत्यक्षात आणण्याचा किंवा उद्योजकतेच्या प्रवासात सहभागी होण्याचा निर्धार करा.',
        en: 'Decide to start a business, bring a new idea to life or join the entrepreneurial journey.',
      },
      url: 'https://newindiamanifesto.com/pledge',
    },
    {
      title: { mr: 'कृती करा', en: 'Act' },
      text: {
        mr: 'आपल्या कल्पनेला कृतीची जोड द्या, व्यवसाय उभारण्याच्या दिशेने पहिले पाऊल टाका किंवा नवोदित उद्योजकांना मार्गदर्शन व सहकार्य करा.',
        en: 'Take the first step towards building your business, or guide and support a new entrepreneur.',
      },
      url: 'https://newindiamanifesto.com/initiative',
    },
  ],
  quote: {
    mr: 'नवभारताची निर्मिती केवळ घोषणांनी होणार नाही; ती नव्या विचारांतून, उद्योजकतेतून आणि सामान्य माणसाला संधी उपलब्ध करून देणाऱ्या कृतीतून साकार होईल.',
    en: 'A new India will not be built by slogans alone. It will be built through new ideas, through enterprise, and through action that gives the common person a chance.',
  },
  author: { mr: 'रोहन सुभाष देशमुख', en: 'Rohan Subhash Deshmukh' },
}

const t = (x: Text) => (LOCALE === 'mr' ? x.mr : x.en)
const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;')
/** the four aims as a list, their titles in bold */
const goalsList = () => `<ul>${COPY.goals.map((g) => `<li><strong>${esc(t(g.title))}:</strong> ${esc(t(g.text))}</li>`).join('')}</ul>`

/** 01, 02… (Devanagari digits on the Marathi site) */
const pad = (n: number) => (LOCALE === 'mr' ? toMarathiDigits(String(n).padStart(2, '0')) : String(n).padStart(2, '0'))
const bleed = 'relative left-1/2 w-screen -translate-x-1/2'
const NAVY = 'text-[#000d3d]'
/** the step numbers: red, navy, saffron (as on the homepage) */
const stepBg = (i: number) => (i % 3 === 1 ? 'bg-[#000d3d]' : i % 3 === 2 ? 'bg-saffron-500' : 'bg-red-600')
/** the homepage buttons: red, navy on hover; the second one outlined in navy */
const btn = (i: number) =>
  cn(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-sm transition-colors',
    i === 0 ? 'bg-red-600 text-white hover:bg-[#000d3d]' : 'border border-[#000d3d]/20 bg-white text-[#000d3d] hover:border-red-600 hover:text-red-600',
  )

/** the red-and-saffron bar under every homepage heading */
function Bar({ center }: { center?: boolean }) {
  return (
    <span aria-hidden className={cn('flex items-center gap-1.5', center && 'justify-center')}>
      <span className="h-1 w-14 rounded-full bg-red-600" />
      <span className="h-1 w-3 rounded-full bg-saffron-500" />
    </span>
  )
}

/**
 * Vision page (redesign, Oct 2026) — the page's blocks from Pages in the admin, each in a look made for the manifesto, in the
 * homepage's colours (navy titles, red labels and buttons that turn navy on hover, the red-and-saffron bar, light-blue bands,
 * white cards with stone borders):
 *  - a Cards block without a heading (the Read · Pledge · Act bar) is not shown
 *  - Media + text (the book) → the cover in 3D beside the text and buttons
 *  - Stats → a navy band of big numbers
 *  - the first Call to action (the invitation card) is not shown; later ones → the navy banner
 *  - Quote → a large centred statement
 *  - Cards with a heading (How it works) → numbered steps joined by a dashed line
 */
export function Manifesto({ blocks }: { blocks?: Block[] | null }) {
  const all = (blocks ?? []).filter((b) => !('hidden' in b && b.hidden))
  // the quote always closes the page, after every other block
  const list = [...all.filter((b) => b.blockType !== 'quote'), ...all.filter((b) => b.blockType === 'quote')]
  const firstCta = list.find((b) => b.blockType === 'cta')
  if (!list.length) return null
  return (
    // the page's own background (as on the Introduction page); the book starts right under the banner (the template's top gap is taken back)
    <div className="relative isolate -mt-8 space-y-10 sm:-mt-12 sm:space-y-16 md:-mt-16 md:space-y-24">
      {list.map((b, i) => {
        const key = b.id ?? String(i)
        switch (b.blockType) {
          case 'cards':
            return b.items?.some((c) => mediaUrl(c.image, 'card')) ? (
              <PageBlocks key={key} blocks={[b]} design="stitch" />
            ) : b.heading ? (
              <HowItWorks key={key} block={b} />
            ) : null // the short Read · Commit · Act bar at the top was removed, Oct 2026
          case 'mediaText':
            return <Book key={key} block={b} />
          case 'stats':
            return <StatsBand key={key} block={b} />
          case 'cta':
            // the first call to action (the "Invitation" card: Starting something new in your village or city?) was removed, Oct 2026
            return b === firstCta ? null : <StitchBlock key={key} b={b} />
          case 'quote':
            return <Statement key={key} block={b} />
          default:
            return <PageBlocks key={key} blocks={[b]} design="stitch" />
        }
      })}
    </div>
  )
}

/** the book: its cover tilted in 3D, the text and buttons beside it (on the page's own background) */
function Book({ block }: { block: MediaText }) {
  const hasImg = Boolean(mediaUrl(block.image, 'card'))
  const size = mediaSize(block.image)
  const right = block.imagePosition === 'right'
  return (
    <section className={cn(bleed, 'overflow-hidden')}>
      {/* phones: heading → first paragraph, then the book, then the aims and buttons; desktop: the book beside all the text */}
      <div className={cn('container-x relative grid grid-cols-1 gap-8 sm:gap-12 pt-8 pb-4 sm:pt-12 sm:pb-6 lg:gap-x-16 lg:gap-y-5 lg:pt-14 lg:pb-8', hasImg && 'lg:grid-cols-12')}>
        <Reveal delay={0.1} className={cn('flex flex-col gap-5', hasImg && 'lg:col-span-7 lg:row-start-1 lg:self-end', hasImg && (right ? 'lg:col-start-1' : 'lg:col-start-6'))}>
          <div>
            <h2 className={cn('font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl', NAVY)}>{t(COPY.title)}</h2>
            <p className="mt-3 font-display text-lg font-semibold leading-snug text-slate-700 sm:text-xl">{t(COPY.pledge)}</p>
          </div>
          <Bar />
          <p className="font-display text-lg font-bold text-red-600">{t(COPY.motto)}</p>
          <RichText html={`<p>${esc(t(COPY.intro))}</p>`} className="max-w-2xl" />
        </Reveal>
        {hasImg && (
          <Reveal className={cn('flex items-center justify-center lg:col-span-5 lg:row-span-2 lg:row-start-1', right ? 'lg:col-start-8' : 'lg:col-start-1')}>
            <div className="relative [perspective:1400px]">
              <div aria-hidden className="absolute inset-6 -z-10 rounded-full bg-[#000d3d]/15 blur-3xl" />
              <m.div
                className="relative w-60 overflow-hidden rounded-r-xl rounded-l-sm shadow-[24px_32px_60px_-20px_rgba(9,20,34,0.55)] sm:w-72 lg:w-80"
                initial={{ rotateY: -18, rotateX: 4 }}
                whileHover={{ rotateY: -4, rotateX: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Img media={block.image} variant="card" alt={mediaAlt(block.image, t(COPY.title))} width={size.width} height={size.height} sizes="(max-width:640px) 240px, 320px" className="h-auto w-full" />
                {/* spine shading */}
                <span aria-hidden className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/35 to-transparent" />
              </m.div>
            </div>
          </Reveal>
        )}
        <Reveal delay={0.1} className={cn('flex flex-col gap-5', hasImg && 'lg:col-span-7 lg:row-start-2 lg:self-start', hasImg && (right ? 'lg:col-start-1' : 'lg:col-start-6'))}>
          <RichText html={goalsList()} className="max-w-2xl" />
          {!!block.buttons?.length && (
            <div className="flex flex-wrap gap-3 pt-2 max-md:justify-center">
              {block.buttons.map((l, i) => (
                <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={btn(i)}>
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
    <section className={cn(bleed, 'on-dark overflow-hidden border-t-4 border-t-red-600 bg-[#000d3d] text-white')}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-[0.04] [background-size:24px_24px]" />
      <div className="container-x relative grid grid-cols-1 items-center gap-6 sm:gap-10 py-8 sm:py-14 lg:grid-cols-12 lg:py-20">
        <Reveal className="space-y-2 lg:col-span-4">
          {block.eyebrow && <p className="text-xs font-extrabold uppercase tracking-widest text-saffron-400">{block.eyebrow}</p>}
          {block.heading && <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{block.heading}</h2>}
          <Bar />
        </Reveal>
        <Stagger className={cn('grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))] lg:col-span-8')} style={{ ['--n' as string]: items.length }}>
          {items.map((s, i) => (
            <StaggerItem key={s.id ?? i} className="bg-[#000d3d] p-6 md:p-8">
              <p className={cn('font-display text-4xl font-bold tracking-tight lg:text-5xl', i % 2 ? 'text-white' : 'text-saffron-400')}>
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

/** the quote as a large centred statement */
function Statement(_: { block: QuoteBlock }) {
  return (
    <Reveal as="figure" className="relative mx-auto max-w-5xl px-2 py-6 text-center md:py-10">
      <span aria-hidden className="mx-auto mb-8 flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-red-600" />
        <Quote className="size-7 text-red-600" />
        <span className="h-px w-12 bg-saffron-500" />
      </span>
      <blockquote className="font-quote relative text-2xl leading-relaxed text-[#000d3d] sm:text-3xl lg:text-[2.4rem] lg:leading-[1.45]">{t(COPY.quote)}</blockquote>
      <figcaption className="mt-8 text-sm font-extrabold uppercase tracking-widest text-red-600">— {t(COPY.author)}</figcaption>
    </Reveal>
  )
}

/** How it works: numbered steps joined by a dashed line, each one a link */
function HowItWorks({ block }: { block: Cards }) {
  const items = COPY.steps.map((st, i) => ({ id: block.items?.[i]?.id ?? String(i), title: t(st.title), text: t(st.text), url: block.items?.[i]?.url || st.url }))
  return (
    <section>
      <Reveal className="mx-auto mb-12 max-w-2xl space-y-2 text-center">
        {block.eyebrow && <p className="text-xs font-extrabold uppercase tracking-widest text-red-600 sm:text-sm">{block.eyebrow}</p>}
        <h2 className={cn('font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl', NAVY)}>{t(COPY.stepsTitle)}</h2>
        <Bar center />
        {block.intro && <p className="pt-1 text-base leading-relaxed text-slate-600">{block.intro}</p>}
      </Reveal>
      <div className="relative">
        {items.length > 1 && (
          <m.span
            aria-hidden
            className="absolute top-10 hidden h-0.5 origin-left bg-[repeating-linear-gradient(90deg,var(--color-red-600)_0_10px,transparent_10px_18px)] md:block"
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
                <span className={cn('relative z-10 mx-auto grid size-20 place-items-center rounded-full font-display text-2xl font-bold text-white shadow-lg ring-8 ring-white transition-transform duration-300 group-hover:scale-110', stepBg(i))}>
                  {pad(i + 1)}
                </span>
                <div className="mt-6 flex flex-1 flex-col items-center gap-2 rounded-2xl border border-stone-200/90 bg-white p-6 text-center shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-red-300 group-hover:shadow-lg">
                  <h3 className="font-display text-xl font-bold text-[#000d3d] transition-colors group-hover:text-red-600">{c.title}</h3>
                  {c.text && <p className="text-sm leading-relaxed text-slate-600">{c.text}</p>}
                  {c.url && <ArrowUpRight aria-hidden className="mt-auto size-5 text-red-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
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
