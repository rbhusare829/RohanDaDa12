import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { m, type Variants } from 'motion/react'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn } from '@/lib/utils'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { PageBlocks } from '@/components/blocks/PageBlocks'
import { RichText } from '@/components/ui/RichText'
import { Img } from '@/components/ui/Img'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'

type Block = NonNullable<Page['layout']>[number]
type MediaText = Extract<Block, { blockType: 'mediaText' }>
type Content = Extract<Block, { blockType: 'content' }>

/**
 * One colour family per member (kesariya, green, navy — Stitch): the tint of the photo panel, the halo behind the person, the dot on the
 * relation label, the rule under the name and the ring when the card is hovered. The portraits are cut-outs on a transparent
 * background, so the panel colour is what they stand on — every panel ends in its own tint (not white), so each one reads as a tile.
 */
const ACCENTS = [
  { panel: 'from-saffron-100/90 via-saffron-50 to-orange-50/60', halo: 'bg-saffron-300/40', dot: 'bg-saffron-600', rule: 'bg-saffron-600', ring: 'group-hover:ring-saffron-300/80' },
  { panel: 'from-emerald-100/80 via-leaf-50 to-emerald-50/50', halo: 'bg-leaf-300/35', dot: 'bg-leaf-600', rule: 'bg-leaf-600', ring: 'group-hover:ring-leaf-300/80' },
  { panel: 'from-slate-200/90 via-slate-100 to-indigo-50/50', halo: 'bg-slate-300/50', dot: 'bg-charcoal-900', rule: 'bg-charcoal-900', ring: 'group-hover:ring-slate-300/80' },
] as const

const FAMILY_MOMENTS = [
  {
    src: '/images/gallery/family/rd-family-01.webp',
    badge: 'माझे कुटुंब',
    title: 'कुटुंबासोबतचे आनंदाचे क्षण',
    desc: 'सौ. व दोन्ही कन्यांसोबत घरगुती वातावरणात घालवलेले सुखद क्षण. कौटुंबिक आधार हीच जनसेवेची खरी प्रेरणा आहे.',
  },
  {
    src: '/images/gallery/family/rd-family-06.webp',
    badge: 'वडिलांचे मार्गदर्शन',
    title: 'मा. बापूसाहेबांसोबत संवाद',
    desc: 'मा. आ. श्री. सुभाष (बापूसाहेब) देशमुख यांच्यासोबतचे जिव्हाळ्याचे क्षण आणि त्यांच्या समृद्ध राजकीय-सामाजिक अनुभवाचे मार्गदर्शन.',
  },
  {
    src: '/images/gallery/family/rd-family-02.webp',
    badge: 'संयुक्त कुटुंब',
    title: 'एकत्र कुटुंबाचा स्नेहमेळावा',
    desc: 'सण, उत्सव आणि कौटुंबिक कार्यक्रमांच्या निमित्ताने सर्व पिढ्या एकत्र येऊन संस्कृती व परंपरेचे जतन करतात.',
  },
  {
    src: '/images/gallery/family/rd-family-05.webp',
    badge: 'बंधुप्रेम',
    title: 'मनीष देशमुख यांच्यासोबत',
    desc: 'बंधू मनीष यांच्यासोबत सहकार, उद्योग आणि लोकमंगल परिवाराच्या विविध सामाजिक उपक्रमांचे यशस्वी नियोजन.',
  },
  {
    src: '/images/gallery/family/rd-family-03.webp',
    badge: 'पुढची पिढी',
    title: 'चिमुकल्यांसोबत संस्कारांची शिदोरी',
    desc: 'पुढच्या पिढीमध्ये लहानपणापासूनच समाजभान, नम्रता आणि संस्कृतीचे बीजारोपण करणे ही कुटुंबाची जबाबदारी आहे.',
  },
  {
    src: '/images/gallery/family/rd-family-15.webp',
    badge: 'कौटुंबिक परंपरा',
    title: 'संस्कार, श्रद्धा आणि सेवा',
    desc: 'कै. सुरेशचंद्रजी देशमुखांपासून सुरू झालेली अध्यात्म, श्रद्धा आणि लोककल्याणाची परंपरा अविरत पुढे चालू आहे.',
  },
]

/* What happens inside a card when it scrolls into view: the halo blooms, the person rises into it and the rule under the
   name is drawn. These variants have no `initial` of their own: they follow the card's own hidden → show (see StaggerItem), and `custom` (the
   card's number) staggers them the same way the cards are staggered (a delay written in a variant replaces the one inherited from the card). */
const EASE = [0.22, 1, 0.36, 1] as const
const STEP = 0.08
const bloom: Variants = { hidden: { opacity: 0, scale: 0.82 }, show: (i: number) => ({ opacity: 1, scale: 1, transition: { duration: 0.9, delay: 0.02 + i * STEP, ease: EASE } }) }
const rise: Variants = { hidden: { opacity: 0, y: 22, scale: 0.97 }, show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay: 0.12 + i * STEP, ease: EASE } }) }
const draw: Variants = { hidden: { scaleX: 0 }, show: (i: number) => ({ scaleX: 1, transition: { duration: 0.7, delay: 0.35 + i * STEP, ease: EASE } }) }

/**
 * कौटुंबिक पार्श्वभूमी page (Stitch design, Oct 2026): the family introduction beside its heading, then the family
 * members (the page's consecutive Media + text blocks, edited under Pages in the admin) as cards — a tinted photo panel with the
 * relation label, then the name and the story. On mobile, it seamlessly presents an interactive swipeable snap-carousel with
 * dot indicators and touch navigation; on wide screens, members sit side by side in a clean responsive grid.
 */
export function FamilyBackground({ blocks, locale }: { blocks?: Block[] | null; locale?: 'mr' | 'en' }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const list = (blocks ?? []).filter((b) => !('hidden' in b && b.hidden))
  const start = list.findIndex((b) => b.blockType === 'mediaText')
  let end = start
  while (end >= 0 && list[end]?.blockType === 'mediaText') end++
  if (start < 0) return <PageBlocks blocks={list} design="stitch" />

  const members = list.slice(start, end) as MediaText[]
  const introIdx = start > 0 && list[start - 1].blockType === 'content' ? start - 1 : -1
  const intro = introIdx >= 0 ? (list[introIdx] as Content) : null
  const before = list.slice(0, introIdx >= 0 ? introIdx : start)
  const after = list.slice(end)
  const count = members.length
  const stacked = count >= 3 // side by side, photo on top, on wide screens
  const cols = count >= 5 ? 'lg:grid-cols-3' : count === 4 ? 'lg:grid-cols-2 xl:grid-cols-4' : count === 3 ? 'lg:grid-cols-3' : count === 2 ? 'lg:grid-cols-2' : ''
  const isMr = locale !== 'en'

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const cards = container.querySelectorAll<HTMLElement>('[data-member-card]')
      if (!cards.length) return
      const containerCenter = container.scrollLeft + container.clientWidth / 2
      let closestIndex = 0
      let minDistance = Infinity

      cards.forEach((card, idx) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const distance = Math.abs(containerCenter - cardCenter)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = idx
        }
      })
      setActiveIndex(closestIndex)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [count])

  const scrollToIndex = (idx: number) => {
    const container = scrollRef.current
    if (!container) return
    const cards = container.querySelectorAll<HTMLElement>('[data-member-card]')
    const card = cards[idx]
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      setActiveIndex(idx)
    }
  }

  return (
    <div className="space-y-16 md:space-y-24">
      {before.length > 0 && <PageBlocks blocks={before} design="stitch" />}

      <section className="flex flex-col gap-10 md:gap-12">
        {intro && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-5">
              {intro.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{intro.eyebrow}</p>}
              {intro.heading && <h2 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-4xl">{intro.heading}</h2>}
              <span aria-hidden className="mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-saffron-600 to-leaf-600" />
            </Reveal>
            <Reveal delay={0.1} className="relative overflow-hidden rounded-2xl border-l-4 border-saffron-500 bg-gradient-to-br from-cream via-cream/95 to-saffron-50/20 p-6 shadow-sm md:p-8 lg:col-span-7">
              <RichText html={intro.body} readMore />
            </Reveal>
          </div>
        )}

        <div className="relative">
          {/* Members Carousel on Mobile (snap-x swipeable) / Responsive Grid on Desktop */}
          <Stagger
            ref={scrollRef}
            className={cn(
              'no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-3 sm:-mx-6 sm:px-6',
              'md:mx-0 md:grid md:snap-none md:gap-6 lg:gap-7 md:overflow-visible md:px-0',
              cols,
            )}
          >
            {members.map((member, i) => {
              const a = ACCENTS[i % ACCENTS.length]
              const hasPhoto = Boolean(mediaUrl(member.image, 'card'))
              return (
                <StaggerItem
                  as="article"
                  key={member.id ?? i}
                  data-member-card={i}
                  className={cn(
                    'group relative flex flex-col gap-1 rounded-3xl bg-white p-3.5 shadow-[0_16px_36px_-24px_rgba(14,30,52,0.25)] ring-1 ring-stone-200/85',
                    'transition-[box-shadow,translate] duration-300 hover:shadow-[0_28px_56px_-24px_rgba(14,30,52,0.35)] motion-safe:hover:-translate-y-1.5',
                    'w-[82vw] max-w-[340px] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none',
                    stacked ? 'md:flex-row md:gap-4 lg:flex-col lg:gap-1' : 'md:flex-row md:gap-4',
                    a.ring,
                  )}
                >
                  {/* the photo panel: a soft tint, a halo behind the person, the relation label */}
                  <div
                    className={cn(
                      'relative isolate aspect-[4/4.6] overflow-hidden rounded-2xl bg-gradient-to-b md:aspect-[4/4.8] md:w-[40%] md:shrink-0 md:self-start',
                      stacked ? 'lg:aspect-[4/4.5] lg:w-auto lg:self-auto' : '',
                      a.panel,
                    )}
                  >
                    <m.span aria-hidden variants={bloom} custom={i} className={cn('absolute left-1/2 top-[56%] -z-10 aspect-square w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full', a.halo)} />
                    {member.eyebrow && (
                      <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-charcoal-900 shadow-sm ring-1 ring-black/5 backdrop-blur-sm">
                        <span aria-hidden className={cn('size-2 rounded-full ring-2 ring-white', a.dot)} />
                        {member.eyebrow}
                      </span>
                    )}
                    {hasPhoto ? (
                      <m.div variants={rise} custom={i} className="absolute inset-x-[4%] bottom-0 top-[6%]">
                        <Img
                          media={member.image}
                          variant="card"
                          alt={mediaAlt(member.image, member.heading ?? '')}
                          fill
                          sizes="(max-width:768px) 85vw, (max-width:1024px) 30vw, 340px"
                          className="origin-bottom object-contain object-bottom transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
                        />
                      </m.div>
                    ) : (
                      <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-7xl font-bold text-charcoal-900/10">
                        {(member.heading ?? member.eyebrow ?? '').trim().charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* the name and the story */}
                  <div className="flex min-w-0 flex-1 flex-col px-3 pb-5 pt-4 md:justify-center md:px-4 md:py-4 lg:justify-start lg:px-3 lg:pb-6 lg:pt-5">
                    {member.heading && (
                      <h3 className="font-display text-[1.28rem] font-bold leading-snug tracking-tight text-charcoal-950 sm:text-[1.35rem] md:text-[1.45rem] lg:text-[1.3rem] xl:text-[1.4rem]">
                        {member.heading}
                      </h3>
                    )}
                    <m.span aria-hidden variants={draw} custom={i} className={cn('mt-2.5 block h-1 w-12 origin-left rounded-full', a.rule)} />
                    <RichText readMore html={member.body} className="mt-3.5 text-[0.95rem] leading-[1.75] text-slate-600" />
                  </div>

                  {/* a coloured foot, so a card with a shorter story still ends in line with its neighbours */}
                  <m.span aria-hidden variants={draw} custom={i} className={cn('absolute inset-x-6 bottom-0 h-1 origin-left rounded-t-full', a.rule)} />
                </StaggerItem>
              )
            })}
          </Stagger>

          {/* Mobile Carousel Indicators & Navigation (Visible on phone < md) */}
          {count > 1 && (
            <div className="mt-4 flex items-center justify-between px-2 pr-14 md:pr-0 md:hidden">
              {/* Swipe prompt with subtle animated hint */}
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                <span className="inline-block animate-pulse text-saffron-600">←</span>
                <span>{isMr ? 'स्वाइप करा' : 'Swipe'}</span>
                <span className="inline-block animate-pulse text-saffron-600">→</span>
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5">
                {members.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => scrollToIndex(dotIdx)}
                    aria-label={isMr ? `कार्ड ${dotIdx + 1}` : `Card ${dotIdx + 1}`}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 focus:outline-none',
                      activeIndex === dotIdx
                        ? 'w-6 bg-gradient-to-r from-saffron-600 to-saffron-500 shadow-sm shadow-saffron-600/30'
                        : 'w-2 bg-stone-300 hover:bg-stone-400',
                    )}
                  />
                ))}
              </div>

              {/* Prev / Next touch buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  aria-label={isMr ? 'मागील' : 'Previous'}
                  className="grid size-8 place-items-center rounded-full border border-stone-200 bg-white text-charcoal-700 shadow-sm transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToIndex(Math.min(count - 1, activeIndex + 1))}
                  disabled={activeIndex === count - 1}
                  aria-label={isMr ? 'पुढील' : 'Next'}
                  className="grid size-8 place-items-center rounded-full border border-stone-200 bg-white text-charcoal-700 shadow-sm transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Family Spotlight & Moments Gallery (Supriya Sule style) */}
        <div className="mt-14 pt-10 border-t border-stone-200/80 md:mt-20">
          <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-saffron-500/30 bg-saffron-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">
                <Sparkles className="size-3 text-saffron-600" />
                {isMr ? 'संस्कार आणि स्नेह' : 'Family Values & Legacy'}
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-3xl">
                {isMr ? 'कौटुंबिक स्नेह आणि क्षणचित्रे' : 'Family Moments & Togetherness'}
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                {isMr
                  ? 'एकत्र कुटुंब हीच आमची खरी ताकद आहे. आदर, प्रेम आणि समाजसेवेचे संस्कार पुढच्या पिढीमध्ये संक्रमित करणे हा आमच्या कुटुंबाचा मूळ विचार आहे.'
                  : 'A joint family rooted in shared values, mutual respect, and dedicated service to society.'}
              </p>
            </div>
            <Link
              to="/media/photos/family-moments"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-saffron-300 bg-saffron-50/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-saffron-800 transition-all hover:bg-saffron-500 hover:text-white hover:border-saffron-500"
            >
              <span>{isMr ? 'सर्व कौटुंबिक फोटो पहा' : 'View Full Family Album'}</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {/* 6 Curated Family Moments Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FAMILY_MOMENTS.map((item, idx) => (
              <div
                key={idx}
                className="group overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-saffron-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100">
                  <Img
                    src={item.src}
                    alt={item.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase text-charcoal-800 shadow-xs">
                    {item.badge}
                  </span>
                </div>
                <div className="p-3.5 flex flex-col flex-1">
                  <h4 className="font-display text-base font-bold text-charcoal-950 group-hover:text-saffron-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {after.length > 0 && <PageBlocks blocks={after} design="stitch" />}
    </div>
  )
}

