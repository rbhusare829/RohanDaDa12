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
 * One colour family per member (kesariya, green, navy), the same as the homepage's कौटुंबिक पार्श्वभूमी cards: the tint of the
 * photo panel, and the halo behind the father only. The portraits are cut-outs on a transparent background, so the panel colour is
 * what they stand on.
 */
const ACCENTS = [
  { panel: 'from-saffron-100/90 via-saffron-50 to-orange-50/60', halo: '' },
  { panel: 'from-emerald-100/80 via-leaf-50 to-emerald-50/50', halo: 'bg-leaf-300/35' },
  { panel: 'from-slate-200/90 via-slate-100 to-indigo-50/50', halo: '' },
] as const

/** the homepage's family photos (same order: grandfather, father, brother), used when a member has no photo in the admin */
/** the relation only ("वडील · माननीय आमदार…" → "वडील"), as on the homepage cards */
const relation = (label: string) => label.split(/\s+[·•|]\s+/)[0].trim()

const HOME_PHOTOS = ['/images/family/family-suresh-deshmukh.webp', '/images/family/family-subhash-deshmukh.webp', '/images/family/family-manish-deshmukh.webp']

/** the whole family together, beside the परिवार introduction (Oct 2026) */
const FAMILY_PHOTO = { src: '/images/gallery/family/rd-family-together.webp', width: 710, height: 565 }

const FAMILY_MOMENTS = [
  {
    src: '/images/gallery/family/rd-family-01.webp',
    badge: 'माझे कुटुंब',
    title: 'कुटुंबासोबतचे आनंदाचे क्षण',
    desc: 'सौ. व दोन्ही कन्यांसोबत घरगुती वातावरणात घालवलेले सुखद क्षण. कौटुंबिक आधार हीच जनसेवेची खरी प्रेरणा आहे.',
    en: { badge: 'My family', title: 'Happy moments with family', desc: 'Warm moments at home with his wife and both daughters. The support of family is the true inspiration for public service.' },
  },
  {
    src: '/images/gallery/family/rd-family-06.webp',
    badge: 'वडिलांचे मार्गदर्शन',
    title: 'मा. बापूसाहेबांसोबत संवाद',
    desc: 'मा. आ. श्री. सुभाष (बापूसाहेब) देशमुख यांच्यासोबतचे जिव्हाळ्याचे क्षण आणि त्यांच्या समृद्ध राजकीय-सामाजिक अनुभवाचे मार्गदर्शन.',
    en: { badge: 'Father’s guidance', title: 'In conversation with Bapusaheb', desc: 'Close moments with Hon. MLA Shri Subhash (Bapusaheb) Deshmukh, and the guidance of his rich political and social experience.' },
  },
  {
    src: '/images/gallery/family/rd-family-02.webp',
    badge: 'संयुक्त कुटुंब',
    title: 'एकत्र कुटुंबाचा स्नेहमेळावा',
    desc: 'सण, उत्सव आणि कौटुंबिक कार्यक्रमांच्या निमित्ताने सर्व पिढ्या एकत्र येऊन संस्कृती व परंपरेचे जतन करतात.',
    en: { badge: 'Joint family', title: 'The whole family together', desc: 'At festivals, celebrations and family occasions, every generation comes together to keep its culture and traditions alive.' },
  },
  {
    src: '/images/gallery/family/rd-family-03.webp',
    /** a tall photo: show the middle, so both Rohan's face and the baby's are in the card */
    position: 'center 36%',
    badge: 'पुढची पिढी',
    title: 'चिमुकल्यांसोबत संस्कारांची शिदोरी',
    desc: 'पुढच्या पिढीमध्ये लहानपणापासूनच समाजभान, नम्रता आणि संस्कृतीचे बीजारोपण करणे ही कुटुंबाची जबाबदारी आहे.',
    en: { badge: 'The next generation', title: 'Passing on values to the little ones', desc: 'The family sees it as its duty to plant social awareness, humility and culture in the next generation from childhood.' },
  },
  {
    src: '/images/gallery/family/rd-family-15.webp',
    badge: 'कौटुंबिक परंपरा',
    title: 'संस्कार, श्रद्धा आणि सेवा',
    desc: 'कै. सुरेशचंद्रजी देशमुखांपासून सुरू झालेली अध्यात्म, श्रद्धा आणि लोककल्याणाची परंपरा अविरत पुढे चालू आहे.',
    en: { badge: 'Family tradition', title: 'Values, faith and service', desc: 'The tradition of spirituality, faith and public welfare begun by the late Sureshchandra Deshmukh carries on to this day.' },
  },
]

/* What happens inside a card when it scrolls into view: the halo blooms and the person rises into it. These variants have no `initial` of their own: they follow the card's own hidden → show (see StaggerItem), and `custom` (the
   card's number) staggers them the same way the cards are staggered (a delay written in a variant replaces the one inherited from the card). */
const EASE = [0.22, 1, 0.36, 1] as const
const STEP = 0.08
const bloom: Variants = { hidden: { opacity: 0, scale: 0.82 }, show: (i: number) => ({ opacity: 1, scale: 1, transition: { duration: 0.9, delay: 0.02 + i * STEP, ease: EASE } }) }
const rise: Variants = { hidden: { opacity: 0, y: 22, scale: 0.97 }, show: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, delay: 0.12 + i * STEP, ease: EASE } }) }

/**
 * कौटुंबिक पार्श्वभूमी page (Stitch design, Oct 2026): the family introduction (परिवार) — the whole family's photo on the left, the
 * heading and the text beside it (on phones: heading, photo, text) — then the family
 * members (the page's consecutive Media + text blocks, edited under Pages in the admin) as cards in the homepage's कौटुंबिक
 * पार्श्वभूमी style — a tinted photo panel with the relation label in maroon, then the name and the whole story (on phones shortened behind "Read more"). On mobile, it seamlessly presents an interactive swipeable snap-carousel with
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
  // like the homepage: photo on top, two cards a row on tablets, three on wide screens
  const cols = count >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : count === 2 ? 'md:grid-cols-2' : 'md:max-w-md'
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-6">
            <Reveal className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
              {intro.eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{intro.eyebrow}</p>}
              {intro.heading && <h2 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-4xl">{intro.heading}</h2>}
              <span aria-hidden className="mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-saffron-600 to-leaf-600" />
            </Reveal>
            {/* the whole family: a white frame like the cards below, the faces kept in view (object-top) */}
            <Reveal delay={0.05} className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
              <figure className="overflow-hidden rounded-3xl bg-white p-2.5 shadow-[0_16px_36px_-24px_rgba(14,30,52,0.35)] ring-1 ring-stone-200/85">
                <img
                  src={FAMILY_PHOTO.src}
                  width={FAMILY_PHOTO.width}
                  height={FAMILY_PHOTO.height}
                  alt={isMr ? 'देशमुख परिवार एकत्र' : 'The Deshmukh family together'}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[5/4] h-auto w-full rounded-2xl object-cover object-top"
                />
              </figure>
            </Reveal>
            <Reveal delay={0.1} className="relative overflow-hidden rounded-2xl border-l-4 border-saffron-500 bg-gradient-to-br from-cream via-cream/95 to-saffron-50/20 p-6 shadow-sm md:p-8 lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:self-start">
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
              const photo = mediaUrl(member.image, 'card')
              const fallback = HOME_PHOTOS[i]
              return (
                <StaggerItem
                  as="article"
                  key={member.id ?? i}
                  data-member-card={i}
                  className={cn(
                    'group relative flex w-[82vw] max-w-[340px] shrink-0 snap-center flex-col rounded-3xl bg-white p-3.5 shadow-[0_16px_36px_-24px_rgba(14,30,52,0.25)] ring-1 ring-stone-200/85',
                    'transition-[box-shadow,translate] duration-300 hover:shadow-[0_28px_56px_-24px_rgba(14,30,52,0.35)] motion-safe:hover:-translate-y-1.5',
                    'md:h-full md:w-auto md:max-w-none md:shrink md:snap-align-none',
                  )}
                >
                  {/* the photo panel: a soft tint, the halo (father only), the relation label in maroon */}
                  <div className={cn('relative isolate aspect-[4/3.1] overflow-hidden rounded-2xl bg-gradient-to-b', a.panel)}>
                    {a.halo && <m.span aria-hidden variants={bloom} custom={i} className={cn('absolute left-1/2 top-[56%] -z-10 aspect-square w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full', a.halo)} />}
                    {member.eyebrow && (
                      <span className="absolute left-3 top-3 z-10 text-[11px] font-bold uppercase tracking-wider text-[#800020]">{relation(member.eyebrow)}</span>
                    )}
                    {photo || fallback ? (
                      <m.div variants={rise} custom={i} className="absolute inset-x-[4%] bottom-0 top-[10%]">
                        {photo ? (
                          <Img
                            media={member.image}
                            variant="card"
                            alt={mediaAlt(member.image, member.heading ?? '')}
                            fill
                            sizes="(max-width:768px) 85vw, (max-width:1024px) 45vw, 400px"
                            className="origin-bottom object-contain object-bottom transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
                          />
                        ) : (
                          <img
                            src={fallback}
                            alt={member.heading ?? ''}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full origin-bottom object-contain object-bottom transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]"
                          />
                        )}
                      </m.div>
                    ) : (
                      <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-7xl font-bold text-charcoal-900/10">
                        {(member.heading ?? member.eyebrow ?? '').trim().charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* the name and the whole story */}
                  <div className="flex flex-1 flex-col px-3 pb-4 pt-4 lg:pt-5">
                    {member.heading && (
                      <h3 className="font-display text-[1.28rem] font-bold leading-snug tracking-tight text-charcoal-950 sm:text-[1.35rem] md:text-[1.4rem] lg:text-[1.3rem] xl:text-[1.4rem]">
                        {member.heading}
                      </h3>
                    )}
                    {/* phones: the first lines and "अधिक वाचा / Read more"; tablets and desktops: the whole story */}
                    <RichText readMore html={member.body} className="mt-3 text-[0.95rem] leading-[1.75] text-slate-600" />
                  </div>
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

          {/* Curated Family Moments Cards (Oct 2026: the "With Manish Deshmukh" card removed) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FAMILY_MOMENTS.map((item, idx) => (
              <div
                key={idx}
                className="group overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-saffron-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100">
                  <Img
                    src={item.src}
                    alt={isMr ? item.title : item.en.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    style={'position' in item ? { objectPosition: item.position } : undefined}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold uppercase text-charcoal-800 shadow-xs">
                    {isMr ? item.badge : item.en.badge}
                  </span>
                </div>
                <div className="p-3.5 flex flex-col flex-1">
                  <h4 className="font-display text-base font-bold text-charcoal-950 group-hover:text-saffron-700 transition-colors">
                    {isMr ? item.title : item.en.title}
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                    {isMr ? item.desc : item.en.desc}
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

