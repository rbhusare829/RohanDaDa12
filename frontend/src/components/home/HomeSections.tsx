import { ArrowRight, ArrowUpRight, Award, BookOpen, CalendarDays, Camera, Flag, GraduationCap, HandHeart, Heart, Info, Leaf, Medal, PenLine, Phone, User, Video, Vote } from 'lucide-react'
import { Link } from 'react-router'
import type { Event, Home, Page, Post, Video as VideoDoc } from '@/types/cms'
import { useLayout } from '@/lib/layout'
import { LOCALE, useTranslations, type Locale } from '@/lib/i18n'
import { mediaAlt, mediaPosition, mediaUrl, photoFit } from '@/lib/media'
import { cn } from '@/lib/utils'
import { CMSLink } from '../ui/CMSLink'
import { CountUp } from '../ui/CountUp'
import { Img } from '../ui/Img'
import { RichText } from '../ui/RichText'
import { Section } from '../ui/Section'
import { socialLabels } from '@/lib/social'
import { YouTube } from '../ui/YouTube'
import { LatestList, LeadStory } from '../blog/BlogParts'
import { FaqAccordion } from './FaqAccordion'
import { HeroSlider, type Slide } from './HeroSlider'
import { InstagramReels } from './InstagramReels'
import { Lift, Reveal, Stagger, StaggerItem } from '../ui/Motion'
import { CitizenEngagementBanner } from './CitizenEngagementBanner'
import { SupriyaAboutSection } from './SupriyaAboutSection'
import { SupriyaAwardsSection } from './SupriyaAwardsSection'
import { UpdatesTicker } from './UpdatesTicker'
import { SupriyaJourneySection } from './SupriyaJourneySection'
import { SupriyaLatestNewsSection } from './SupriyaLatestNewsSection'
import { SupriyaInitiativesSection } from './SupriyaInitiativesSection'
import { SupriyaSocialActivitiesSection } from './SupriyaSocialActivitiesSection'
import { SupriyaVideoReelsSection } from './SupriyaVideoReelsSection'
import { SupriyaVisionSection } from './SupriyaVisionSection'

type Block = NonNullable<Home['sections']>[number]
type Of<T extends Block['blockType']> = Extract<Block, { blockType: T }>

/** Extra content some homepage sections show (loaded together with the homepage, see pages/Home.tsx) */
export type HomeExtras = { events: Event[]; posts: Post[]; foundationPage: Page | null }

const icons = { user: User, heart: Heart, book: BookOpen, camera: Camera, video: Video, vote: Vote, pen: PenLine, phone: Phone, info: Info, flag: Flag, leaf: Leaf, award: Award }

/** The homepage: 100% Supriya Sule layout with leader branding & dynamic content */
export function HomeSections({ sections, extras, locale = LOCALE }: { sections: Block[]; extras: HomeExtras; locale?: Locale }) {
  const visible = sections.filter((s) => !s.hidden)
  const heroBlock = visible.find((s): s is Of<'heroSlider'> => s.blockType === 'heroSlider') ?? (visible[0] as Of<'heroSlider'> | undefined)
  const aboutBlock = visible.find((s): s is Of<'aboutIntro'> => s.blockType === 'aboutIntro')
  const journeyBlock = visible.find((s): s is Of<'homeJourney'> => s.blockType === 'homeJourney')
  // Video & Reels: from the homepage content; null = hidden in the admin, undefined = not in the content (the section shows its fallback)
  const videoRaw = sections.find((s): s is Of<'featuredVideo'> => s.blockType === 'featuredVideo')
  const reelsRaw = sections.find((s): s is Of<'socialFeeds'> => s.blockType === 'socialFeeds')
  const videoBlock = videoRaw ? (videoRaw.hidden ? null : videoRaw) : undefined
  const reelsBlock = reelsRaw ? (reelsRaw.hidden ? null : reelsRaw) : undefined
  const visionRaw = sections.find((s): s is Of<'homeVision'> => s.blockType === 'homeVision')
  const visionBlock = visionRaw ? (visionRaw.hidden ? null : visionRaw) : undefined

  return (
    <>
      {/* 1. Hero Slider + Citizen Engagement Banner & Marquee Ticker */}
      {heroBlock && <Hero b={heroBlock} locale={locale} />}

      {/* 2. About Leader Section with Red Underline & Video Modal */}
      {aboutBlock ? (
        <SupriyaAboutSection b={aboutBlock} locale={locale} />
      ) : (
        <SupriyaAboutSection
          b={{
            blockType: 'aboutIntro',
            eyebrow: locale === 'en' ? 'ABOUT' : 'परिचय',
            heading: locale === 'en' ? 'Rohan Subhash Deshmukh' : 'रोहन सुभाष देशमुख',
            text: '',
          }}
          locale={locale}
        />
      )}

      {/* 3. Political Journey ("कारकीर्द") timeline — in place of the Press Notes, removed Oct 2026 */}
      <SupriyaJourneySection b={journeyBlock} locale={locale} />

      {/* 4. Speasy Awards & Recognitions Gallery (6 Columns) */}
      <SupriyaAwardsSection locale={locale} />

      {/* 5. Latest News (5 Columns with Real CMS Articles & Media Badges) */}
      <SupriyaLatestNewsSection posts={extras.posts} locale={locale} />

      {/* 6. Key Focus Areas / Initiatives Showcase */}
      <SupriyaInitiativesSection locale={locale} />

      {/* 7. Social Activities (4 photo cards in a mosaic; "Read more" opens each activity's full story) */}
      <SupriyaSocialActivitiesSection locale={locale} />

      {/* 8. Vision (New India Manifesto) */}
      <SupriyaVisionSection b={visionBlock} locale={locale} />

      {/* 9. Video & Reels (featured YouTube video, then the Instagram reels) */}
      <SupriyaVideoReelsSection video={videoBlock} reels={reelsBlock} locale={locale} />
    </>
  )
}

/**
 * Hero (Stitch design, Oct 2026): the navy slideshow band, then the New India Manifesto bar — a white card with a kesariya
 * top edge that overlaps the bottom of the band (its label, headline, one line and "Apply now").
 */
function Hero({ b, locale }: { b: Of<'heroSlider'>; locale?: Locale }) {
  const { settings } = useLayout()
  const t = useTranslations('common')
  const textOnly = b.heroStyle === 'text'
  const isMr = locale !== 'en'

  // The three hero slides (Oct 2026), each with a photo that fits its words:
  // 1. grassroots → Rohan in a white kurta (a wide version of the portrait; no political photos)
  // 2. the book → Rohan holding it (a wide version of the portrait, him on the right and space for the words on the left)
  // 3. small steps → Rohan in a peach kurta (a wide version of the portrait; no political photos)
  const slides: Slide[] = [
    {
      image: '/images/hero/rohan-hero-white-kurta.webp',
      alt: isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh',
      kicker: isMr ? 'अध्यक्ष, लोकमंगल फाउंडेशन' : 'PRESIDENT, LOKMANGAL FOUNDATION',
      heading: isMr
        ? 'मोठ्या बदलांची सुरुवात मोठ्या व्यासपीठावरून नव्हे, तर सामान्य माणसाच्या प्रश्नांना समजून घेण्यापासून होते.'
        : 'Good leadership begins with understanding the problems of people at the grassroots',
      position: '77% 20%',
    },
    {
      image: '/images/hero/rohan-hero-book.webp',
      alt: isMr ? 'रोहन सुभाष देशमुख ‘The New India Manifesto’ पुस्तकासह' : 'Rohan Subhash Deshmukh with The New India Manifesto',
      kicker: isMr ? 'न्यू इंडिया मॅनिफेस्टो' : 'NEW INDIA MANIFESTO',
      heading: isMr
        ? 'शक्यतांच्या पलीकडे पाहण्याची दृष्टी आणि नवभारताच्या भविष्याचा विचार—यातून साकारले ‘The New India Manifesto: Going Beyond Possible’.'
        : 'Author of The New India Manifesto: Going Beyond Possible',
      subheading: isMr ? 'लेखक — रोहन देशमुख' : null,
      position: '77% 20%',
    },
    {
      image: '/images/hero/rohan-hero-namaskar.webp',
      alt: isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh',
      kicker: isMr ? 'लोकमंगल फाउंडेशन' : 'LOKMANGAL FOUNDATION',
      heading: isMr
        ? 'समाजात बदल घडवण्यासाठी केलेला छोटासा प्रयत्नही मोठा बदल घडवू शकतो.'
        : 'Small steps toward change can lead to a big difference',
      position: '77% 20%',
    },
  ]

  const social = (Object.entries(settings.social ?? {}).filter(([k, v]) => v && k !== 'id') as [string, string][]).map(([key, url]) => ({ key, url, label: socialLabels[key] ?? key }))
  return (
    <>
      <UpdatesTicker locale={locale} />
      <HeroSlider slides={slides} autoplay={b.autoplaySeconds ?? 6} social={social} textOnly={textOnly} labels={{ prev: t('prev'), next: t('next') }} />
      <CitizenEngagementBanner locale={locale} />
    </>
  )
}

export function QuickLinksSection({ b }: { b: Of<'quickLinks'> }) {
  if (!b.items?.length) return null
  return (
    <section className="border-b border-line bg-white">
      <div className="container-x">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-line">
          {b.items.map((it) => {
            const Icon = icons[(it.icon as keyof typeof icons) ?? 'info'] ?? Info
            return (
              <li key={it.id}>
                <CMSLink url={it.url} newTab={it.newTab} className="group flex h-full flex-col items-center gap-3 px-3 py-7 text-center">
                  <Icon className="size-7 text-saffron-600 transition group-hover:-translate-y-0.5" strokeWidth={1.6} />
                  <span className="text-[0.98rem] font-semibold leading-snug text-charcoal-900 transition group-hover:text-saffron-700">{it.label}</span>
                </CMSLink>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function AboutIntroSection({ b }: { b: Of<'aboutIntro'> }) {
  const img = mediaUrl(b.image, 'card')
  return (
    <section className="container-x py-20 lg:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {img && (
          <Reveal className="relative order-2 lg:order-1 lg:col-span-5">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-saffron-100 bg-white shadow-2xl">
              <Img media={b.image} variant="card" alt={mediaAlt(b.image, b.heading ?? '')} sizes="(max-width:1024px) 90vw, 448px" className="h-auto w-full" />
            </div>
          </Reveal>
        )}
        <Reveal className="order-1 flex flex-col items-start gap-4 lg:order-2 lg:col-span-7" delay={0.1}>
          {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
          {b.heading && <h2 className="text-3xl leading-tight tracking-tight text-charcoal-950 sm:text-4xl lg:text-5xl">{b.heading}</h2>}
          {b.pledge && (
            <blockquote className="font-quote my-2 w-full rounded-r-2xl border-l-4 border-saffron-500 bg-gradient-to-r from-charcoal-950 to-charcoal-900 py-4 pl-6 pr-4 text-lg leading-relaxed text-white shadow-md sm:text-xl">
              “{b.pledge}”
            </blockquote>
          )}
          {b.text && <p className="text-base leading-relaxed text-gray-700">{b.text}</p>}
          {/* quick facts as small white tiles with a kesariya label */}
          {!!b.stats?.length && (
            <Stagger as="dl" className="grid w-full grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              {b.stats.map((f) => (
                <StaggerItem key={f.id} className="rounded-xl border border-saffron-100 bg-white p-3 shadow-sm">
                  <dt className="text-xs font-bold uppercase tracking-wider text-saffron-700">{f.label}</dt>
                  <dd className="mt-1 font-display text-lg font-bold leading-snug text-charcoal-950">{f.value}</dd>
                </StaggerItem>
              ))}
            </Stagger>
          )}
          {b.buttonUrl && (
            <CMSLink url={b.buttonUrl} className="btn btn-dark mt-4">
              {b.buttonLabel} <ArrowRight className="size-5" />
            </CMSLink>
          )}
        </Reveal>
      </div>
    </section>
  )
}

export function BiographySection({ b }: { b: Of<'biography'> }) {
  return (
    <section className="section band-cream">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
          {b.heading && <h2 className="h-section">{b.heading}</h2>}
          {b.intro && <p className="font-quote mt-6 text-2xl leading-relaxed text-charcoal-800">“{b.intro}”</p>}
          {mediaUrl(b.image) && (
            /* full photo at its natural shape — never crop portraits */
            <div className="mt-8 overflow-hidden rounded-3xl bg-cream">
              <Img media={b.image} alt={mediaAlt(b.image)} sizes="(max-width:1024px) 100vw, 45vw" className="h-auto w-full" />
            </div>
          )}
        </div>
        <ol className="divide-y divide-charcoal-900/10 self-center border-y border-charcoal-900/10">
          {b.items?.map((it, i) => (
            <li key={it.id}>
              <CMSLink url={it.url} className="tile group flex-row gap-6 py-7">
                <span className="font-display text-3xl leading-none text-saffron-600">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">
                  <span className="tile-title block text-xl">{it.title}</span>
                  <span className="tile-text block">{it.text}</span>
                </span>
                <ArrowUpRight className="size-5 shrink-0 text-saffron-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </CMSLink>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/**
 * Featured video (Stitch design): a sand band, the eyebrow and the video's title, then one white card — the video on the left
 * (thumbnail until it is played), the description and the YouTube button on the right.
 */
export function FeaturedVideoSection({ b }: { b: Of<'featuredVideo'> }) {
  const links = b.links ?? []
  return (
    <section className="w-full border-y border-saffron-100 bg-cream py-20 lg:py-28">
      <div className="container-x">
        <Reveal className="mb-12 max-w-3xl">
          {b.eyebrow && <p className="eyebrow mb-1">{b.eyebrow}</p>}
          {b.heading && <h2 className="h-section">{b.heading}</h2>}
        </Reveal>
        <Reveal className="grid grid-cols-1 overflow-hidden rounded-2xl border border-saffron-100 bg-white shadow-xl lg:grid-cols-12">
          <div className="flex items-center bg-charcoal-950 lg:col-span-7 [&>div]:rounded-none">
            <YouTube url={b.youtubeUrl} title={null} />
          </div>
          <div className="flex flex-col justify-between p-8 lg:col-span-5 lg:p-10">
            <div>
              {b.text && <p className="mb-6 text-[0.95rem] leading-relaxed text-gray-600">{b.text}</p>}
            </div>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {links.map((l, i) => (
                  <CMSLink key={l.id ?? i} url={l.url} newTab={l.newTab} className={cn('btn', i > 0 && 'btn-ghost')}>
                    {l.label} <ArrowUpRight className="size-5" />
                  </CMSLink>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function WorkHighlightsSection({ b }: { b: Of<'workHighlights'> }) {
  return (
    <Section eyebrow={b.eyebrow} heading={b.heading}>
      <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
        {b.items?.map((it, i) => (
          <CMSLink key={it.id} url={it.url} className={cn('tile group', i === 0 && 'lg:col-span-2 lg:row-span-2')}>
            {mediaUrl(it.image, 'card') && (
              <div className={cn('tile-media', i === 0 ? 'aspect-[16/10] lg:aspect-auto lg:flex-1' : 'aspect-[4/3]')}>
                <Img media={it.image} variant="card" alt={mediaAlt(it.image, it.title ?? '')} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" style={photoFit(it.image, 1.6)} />
              </div>
            )}
            <div className="tile-body">
              <h3 className={cn('tile-title', i === 0 && 'text-2xl md:text-3xl')}>{it.title}</h3>
              {it.text && <p className="tile-text line-clamp-3">{it.text}</p>}
            </div>
          </CMSLink>
        ))}
      </div>
    </Section>
  )
}

/**
 * Home → Lokmangal Foundation: the Foundation's own introduction ("आजची सेवा, उद्याची समृद्धी") and a Read more button
 * (the key areas of work stay on the Foundation page). The text is read from the Lokmangal Foundation page, so editing it there updates both places.
 */
export function InitiativesSection({ b, page }: { b: Of<'initiativesShowcase'>; page: Page | null }) {
  const t = useTranslations('common')
  const intro = (page?.layout ?? []).find((x) => x.blockType === 'mediaText') as Extract<NonNullable<Page['layout']>[number], { blockType: 'mediaText' }> | undefined
  if (!intro) return null
  const more = b.buttonUrl || '/lokmangal/foundation'
  return (
    <section className="section">
      <div className="container-x">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
          {mediaUrl(intro.image, 'card') && (
            /* the Foundation at work, on a soft saffron block */
            <div className="photo-backdrop mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-cream shadow-[0_30px_60px_-40px_rgb(20_33_61/0.55)]">
                <Img media={intro.image} variant="card" alt={mediaAlt(intro.image, intro.heading ?? '')} fill sizes="(max-width:1024px) 90vw, 46vw" className="object-cover" style={photoFit(intro.image, 4 / 3)} />
              </div>
            </div>
          )}
          <div>
            {(b.eyebrow || intro.eyebrow) && <p className="eyebrow">{b.eyebrow || intro.eyebrow}</p>}
            {intro.heading && <h2 className="h-section">{intro.heading}</h2>}
            <RichText html={intro.body} className="mt-6 text-muted" />
            <CMSLink url={more} className="btn btn-primary mt-8">{t('readMore')} <ArrowRight className="size-4" /></CMSLink>
          </div>
        </div>
      </div>
    </section>
  )
}

/** "More →" text link used beside section headings (Stitch: bold kesariya text with an arrow) */
function MoreLink({ url, label }: { url?: string | null; label?: string | null; dark?: boolean }) {
  if (!url || !label) return null
  return (
    <CMSLink url={url} className="more-link shrink-0">
      {label}
      <ArrowRight className="size-5" />
    </CMSLink>
  )
}

/** eyebrow + heading on the left, the "more" link on the right (Stitch section header) */
function HeadRow({ eyebrow, heading, intro, url, label }: { eyebrow?: string | null; heading?: string | null; intro?: string | null; url?: string | null; label?: string | null }) {
  return (
    <Reveal className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        {heading && <h2 className="h-section">{heading}</h2>}
        {intro && <p className="lead">{intro}</p>}
      </div>
      <MoreLink url={url} label={label} />
    </Reveal>
  )
}

const DEV = '०१२३४५६७८९'
const digits = (n: number, locale: Locale) => (locale === 'mr' ? String(n).replace(/\d/g, (d) => DEV[Number(d)]) : String(n))
const JOURNEY_ICONS = [Medal, Award, GraduationCap, HandHeart]

/**
 * Journey (Stitch design): a sand band with four milestone cards joined by a kesariya-to-green line on wide screens.
 * Each card: a numbered circle and the place as a small chip, the title, the text, and a footer line with an icon
 * (the part of "Place — Subtitle" after the dash). The latest milestone is highlighted with a kesariya border.
 */
export function JourneySection({ b, locale }: { b: Of<'homeJourney'>; locale: Locale }) {
  const items = b.items ?? []
  if (!items.length) return null
  return (
    <section className="w-full border-y border-saffron-100 bg-cream py-20 lg:py-28">
      <div className="container-x">
        <HeadRow eyebrow={b.eyebrow} heading={b.heading} url={b.buttonUrl} label={b.buttonLabel} />
        <div className="relative">
          <div aria-hidden className="absolute left-12 right-12 top-7 hidden h-0.5 bg-gradient-to-r from-saffron-200 via-saffron-500 to-leaf-200 lg:block" />
          <Stagger as="ol" className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {items.map((it, i) => {
              const last = i === items.length - 1
              const [place, sub] = (it.place ?? '').split(/\s+[—–-]\s+/)
              const Icon = JOURNEY_ICONS[i % JOURNEY_ICONS.length]
              const accents = ['text-saffron-600', 'text-leaf-600', 'text-charcoal-900', 'text-saffron-600']
              return (
                <StaggerItem as="li" key={it.id} className={cn('group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-lg', last ? 'border-2 border-saffron-500' : 'border border-saffron-100 hover:border-saffron-500')}>
                  {last && <div aria-hidden className="absolute right-0 top-0 size-16 rounded-bl-3xl bg-saffron-500/10" />}
                  <div>
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold', last ? 'bg-gradient-to-r from-saffron-600 to-saffron-500 text-white shadow-sm' : 'border border-saffron-200 bg-saffron-50 text-saffron-600')}>
                        {digits(i + 1, locale).padStart(2, locale === 'mr' ? '०' : '0')}
                      </span>
                      {place && <span className={cn('rounded-md px-2.5 py-1 text-xs font-bold uppercase', last ? 'border border-saffron-200 bg-saffron-50 text-saffron-700' : 'bg-paper text-gray-700')}>{place}</span>}
                    </div>
                    {it.title && <h3 className="mb-2 text-lg text-charcoal-950">{it.title}</h3>}
                    {it.text && <p className="text-sm leading-relaxed text-gray-600">{it.text}</p>}
                  </div>
                  {sub && (
                    <div className={cn('mt-6 flex items-center border-t border-gray-100 pt-4 text-xs font-bold', accents[i % accents.length])}>
                      <Icon className="mr-1.5 size-[18px]" /> {sub}
                    </div>
                  )}
                </StaggerItem>
              )
            })}
          </Stagger>
        </div>
      </div>
    </section>
  )
}

export function FamilySection({ b }: { b: Of<'family'> }) {
  const members = b.members ?? []
  if (!members.length) return null
  return (
    <Section eyebrow={b.eyebrow} heading={b.heading} intro={b.intro} action={<MoreLink url={b.buttonUrl} label={b.buttonLabel} />}>
      {/* three generations side by side: a proper portrait each, then relation, name and a few words */}
      <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {members.map((m) => (
          <li key={m.id} className="tile group max-sm:grid max-sm:grid-cols-[7.5rem_minmax(0,1fr)] max-sm:items-start max-sm:gap-5">
            <div className="tile-media aspect-[4/5] bg-cream">
              <Img media={m.image} variant="card" alt={mediaAlt(m.image, m.name ?? '')} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" className="object-cover" style={photoFit(m.image, 0.8, 0.55)} />
              {m.relation && <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[0.85rem] text-saffron-700 shadow-sm max-sm:hidden">{m.relation}</span>}
            </div>
            <div className="tile-body max-sm:!pt-1">
              {m.relation && <p className="tile-kicker mb-1 sm:hidden">{m.relation}</p>}
              {m.name && <h3 className="tile-title">{m.name}</h3>}
              {m.text && <p className="tile-text">{m.text}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/**
 * Lokmangal Parivar (Stitch design): heading and introduction, five number tiles with a coloured top bar
 * (kesariya, green, navy, deep kesariya, slate), then the "more" link.
 */
export function ParivarSection({ b }: { b: Of<'homeParivar'> }) {
  const bars = ['bg-saffron-500', 'bg-leaf-600', 'bg-charcoal-900', 'bg-saffron-600', 'bg-slate-500']
  const items = b.items ?? []
  return (
    <section className="container-x py-20 lg:py-28">
      <Reveal className="mb-14 max-w-3xl">
        {b.eyebrow && <p className="eyebrow mb-1">{b.eyebrow}</p>}
        {b.heading && <h2 className="h-section mb-3">{b.heading}</h2>}
        {b.text && <p className="text-base leading-relaxed text-gray-700">{b.text}</p>}
      </Reveal>
      <Stagger as="ul" className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
        {items.map((g, i) => (
          <StaggerItem as="li" key={g.id} className={cn('relative flex flex-col justify-between overflow-hidden rounded-2xl border border-saffron-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg', i === items.length - 1 && items.length % 2 === 1 && 'col-span-2 md:col-span-1')}>
            <div aria-hidden className={cn('absolute left-0 top-0 h-1.5 w-full', bars[i % bars.length])} />
            <div>
              <span className="mb-1 block font-display text-3xl font-bold text-charcoal-950 sm:text-4xl">{g.value && <CountUp value={g.value} />}</span>
              {g.title && <span className="block text-xs font-bold uppercase tracking-wider text-charcoal-900">{g.title}</span>}
            </div>
            {g.text && <p className="mt-3 text-xs text-gray-500">{g.text}</p>}
          </StaggerItem>
        ))}
      </Stagger>
      {b.buttonUrl && (
        <div className="mt-8 text-center sm:text-left">
          <MoreLink url={b.buttonUrl} label={b.buttonLabel} />
        </div>
      )}
    </section>
  )
}

/**
 * Social initiatives (Stitch design): three white cards — photo with a label badge on it, title, text and an arrow. The middle card carries a kesariya border; badges alternate kesariya / navy / ivory.
 */
export function HighlightsSection({ b }: { b: Of<'homeHighlights'> }) {
  // the photos carry no label (removed Oct 2026) — the title and text below say what each one is
  return (
    <section className="container-x py-20 lg:py-28">
      <HeadRow eyebrow={b.eyebrow} heading={b.heading} intro={b.text} url={b.buttonUrl} label={b.buttonLabel} />
      <Stagger as="ol" className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {b.items?.map((c, i) => {
          const img = mediaUrl(c.image, 'card')
          return (
            <StaggerItem as="li" key={c.id}>
              <Lift className="h-full">
                <CMSLink url={c.url || b.buttonUrl || '#'} className={cn('group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-2xl', i === 1 ? 'border-2 border-saffron-500' : 'border border-saffron-100')}>
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                    {img && <Img media={c.image} variant="card" alt={mediaAlt(c.image, c.title ?? '')} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" style={photoFit(c.image, 1.6)} />}
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      {c.title && <h3 className="mb-3 text-lg text-charcoal-950 transition-colors group-hover:text-saffron-600">{c.title}</h3>}
                      {c.text && <p className="text-sm leading-relaxed text-gray-600">{c.text}</p>}
                    </div>
                    <ArrowRight aria-hidden className="mt-6 size-5 text-saffron-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </CMSLink>
              </Lift>
            </StaggerItem>
          )
        })}
      </Stagger>
    </section>
  )
}

const GROUP: Record<string, Record<string, string>> = { mr: { youth: 'युवा व शिक्षण', sports: 'क्रीडा' }, en: { youth: 'Youth & Education', sports: 'Sports' } }

export function EventsSection({ b, events: all, locale }: { b: Of<'homeEvents'>; events: Event[]; locale: Locale }) {
  // the events from the client document first (youth & education, sports), then any others
  const ordered = [...all.filter((e) => e.group === 'youth'), ...all.filter((e) => e.group === 'sports'), ...all.filter((e) => !e.group)]
  const events = ordered.slice(0, b.limit ?? 4)
  if (!events.length) return null
  return (
    <Section eyebrow={b.eyebrow} heading={b.heading} action={<MoreLink url={b.buttonUrl} label={b.buttonLabel} />}>
      <ul className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((e) => {
          const meta = e.group ? GROUP[locale]?.[e.group] : null
          return (
            <li key={e.id}>
              <Link to={`/events/${e.slug}`} className="tile group h-full">
                <div className="tile-media grid aspect-[4/3] place-items-center">
                  {mediaUrl(e.coverImage, 'card') ? (
                    <Img media={e.coverImage} variant="card" alt={mediaAlt(e.coverImage, e.title)} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover" style={photoFit(e.coverImage, 4 / 3, 0.6)} />
                  ) : (
                    <CalendarDays aria-hidden className="size-9 text-saffron-600" strokeWidth={1.5} />
                  )}
                </div>
                <div className="tile-body">
                  {meta && <p className="tile-kicker">{meta}</p>}
                  <h3 className="tile-title mt-1 line-clamp-2">{e.title}</h3>
                  {e.tagline && <p className="tile-text line-clamp-2">{e.tagline}</p>}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/**
 * Vision (Stitch design): a deep navy band with a kesariya top edge and soft glows — the book cover tilted on the left
 * with a kesariya glow under it, the eyebrow, heading, text and a kesariya button on the right.
 */
export function VisionSection({ b }: { b: Of<'homeVision'> }) {
  const img = mediaUrl(b.image)
  return (
    <section className="on-dark band-navy relative w-full overflow-hidden py-20 lg:py-28">
      <div aria-hidden className="glow-tl !right-1/4 !top-0" />
      <div aria-hidden className="glow-br" />
      <div className="container-x relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <Reveal className="flex justify-center lg:col-span-5">
            {img ? (
              <div className="group relative">
                <div className="w-60 -rotate-2 overflow-hidden rounded-xl border border-saffron-500/40 shadow-2xl transition-transform duration-500 group-hover:rotate-0 sm:w-72">
                  <Img media={b.image} alt={mediaAlt(b.image, b.heading ?? '')} sizes="288px" className="h-auto w-full" />
                </div>
                <div aria-hidden className="mx-auto mt-2 h-6 w-60 rounded-full bg-saffron-500/30 blur-xl sm:w-72" />
              </div>
            ) : (
              <BookOpen className="size-24 text-saffron-500" />
            )}
          </Reveal>
          <Reveal className="flex flex-col items-start gap-4 lg:col-span-7">
            {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
            {b.heading && <h2 className="text-3xl leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{b.heading}</h2>}
            {b.text && <p className="font-quote text-lg leading-relaxed text-slate-200">{b.text}</p>}
            {b.buttonUrl && (
              <CMSLink url={b.buttonUrl} className="btn mt-2 px-8">
                {b.buttonLabel} <ArrowRight className="size-5" />
              </CMSLink>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function GallerySection({ b }: { b: Of<'homeGallery'> }) {
  const images = (b.images ?? []).filter((m) => typeof m === 'object').slice(0, 9)
  if (!images.length) return null
  return (
    <Section eyebrow={b.eyebrow} heading={b.heading} action={<MoreLink url={b.buttonUrl} label={b.buttonLabel} />}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((m, i) => {
          if (!mediaUrl(m, 'card')) return null
          return (
            <li key={m.id ?? i} className={cn('relative aspect-square overflow-hidden rounded-2xl bg-cream', i === 0 && 'col-span-2 row-span-2 aspect-auto sm:col-span-1 sm:row-span-1 sm:aspect-square lg:col-span-2 lg:row-span-2 lg:aspect-auto')}>
              <Img media={m} variant="card" alt={mediaAlt(m, b.heading ?? '')} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition duration-700 hover:scale-105" style={photoFit(m, 1, 0.5)} />
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

export function StatsSection({ b }: { b: Of<'homeStats'> }) {
  return (
    <section className="section band-cream relative overflow-hidden">
      {/* the photo stays, faded right back into the warm band so the numbers read cleanly */}
      {mediaUrl(b.image, 'hero') && (
        <>
          <Img media={b.image} variant="hero" alt="" fill sizes="100vw" className="object-cover opacity-[0.12] grayscale" style={{ objectPosition: mediaPosition(b.image) }} />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/60" />
        </>
      )}
      <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
          {b.heading && <h2 className="h-section">{b.heading}</h2>}
          {b.buttonUrl && (
            <CMSLink url={b.buttonUrl} className="btn btn-primary mt-8">{b.buttonLabel} <ArrowRight className="size-4" /></CMSLink>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {b.items?.map((s) => <div key={s.id} className="stat-card"><p className="stat-value"><CountUp value={s.value} /></p><p className="stat-label">{s.label}</p></div>)}
        </div>
      </div>
    </section>
  )
}

export function FaqSection({ b }: { b: Of<'homeFaq'> }) {
  return (
    <Section className="band-cream">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
          {b.heading && <h2 className="h-section">{b.heading}</h2>}
          {b.text && <p className="lead mt-4">{b.text}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {b.buttons?.map((l, i) => (
              <CMSLink key={l.id} url={l.url} newTab={l.newTab} className={cn('btn', i === 0 ? 'btn-primary' : 'btn-ghost')}>{l.label}</CMSLink>
            ))}
          </div>
        </div>
        <FaqAccordion items={(b.items ?? []).map((f) => ({ q: f.question, a: <RichText html={f.answer} className="!text-base !text-muted" /> }))} />
      </div>
    </Section>
  )
}

export function BlogSection({ b, posts, locale }: { b: Of<'latestBlog'>; posts: Post[]; locale: Locale }) {
  const t = useTranslations('common')
  const tb = useTranslations('blog')
  if (!posts.length) return null
  // newspaper layout: one lead story + a list of the next ones
  const [lead, ...rest] = posts
  return (
    <Section eyebrow={b.eyebrow} heading={b.heading} action={<Link to="/blog" className="more-link">{t('viewAll')} <ArrowRight className="size-4" /></Link>}>
      <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-16">
        <LeadStory post={lead} locale={locale} badge={tb('lead')} readFull={tb('readFull')} />
        {rest.length > 0 && <LatestList posts={rest.slice(0, 4)} locale={locale} title={tb('latestUpdates')} />}
      </div>
    </Section>
  )
}

/**
 * Reels (Stitch design): heading on the left and "More reels on Instagram" as a white button on the right,
 * then the chosen Instagram reels as three tall cards (a swipeable row on phones), each loading only near the screen.
 */
export function SocialSection({ b, videos: all }: { b: Of<'socialFeeds'>; videos: VideoDoc[] }) {
  const { settings } = useLayout()
  const t = useTranslations('common')
  const videos = b.showYoutube ? all.slice(0, 3) : []
  const fb = settings.social?.facebook
  const insta = settings.social?.instagram
  return (
    <section className="container-x py-20 lg:py-28">
      <Reveal className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="max-w-3xl">
          {b.eyebrow && <p className="eyebrow mb-1">{b.eyebrow}</p>}
          {b.heading && <h2 className="h-section">{b.heading}</h2>}
          {b.text && <p className="lead">{b.text}</p>}
        </div>
        {insta && (
          <a href={`${insta.replace(/\/$/, '')}/reels/`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost shrink-0 self-start md:self-auto">
            {t('moreReels')} <ArrowUpRight className="size-[18px]" />
          </a>
        )}
      </Reveal>
      {!!b.instagramPosts?.length && (
        <Reveal>
          <InstagramReels reels={b.instagramPosts.map((x) => ({ url: x.url, title: x.title ?? '' }))} />
        </Reveal>
      )}
      {(videos.length > 0 || (fb && b.showFacebook)) && (
        <div className={cn('mt-12 grid gap-8', fb && b.showFacebook ? 'lg:grid-cols-[1fr_380px]' : '')}>
          {videos.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {videos.slice(0, 2).map((v) => <YouTube key={v.id} url={v.youtubeUrl} title={v.title} />)}
              <Link to="/media/videos" className="btn btn-dark self-start sm:col-span-2 sm:justify-self-start">YouTube <ArrowRight className="size-4" /></Link>
            </div>
          )}
          {fb && b.showFacebook && (
            <div className="overflow-hidden rounded-2xl bg-white">
              <iframe
                title="Facebook"
                loading="lazy"
                src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(fb)}&tabs=timeline&width=380&height=520&small_header=true&hide_cover=false&show_facepile=false`}
                width="100%"
                height="520"
                style={{ border: 0 }}
                allow="encrypted-media"
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export function AppealSection({ b }: { b: Of<'appealBand'> }) {
  const { settings } = useLayout()
  const wa = b.showWhatsapp ? settings.whatsappNumber?.replace(/\D/g, '') : null
  return (
    /* the page closes with one clear call to action on saffron */
    <section className="on-saffron relative isolate overflow-hidden bg-saffron-600 text-white">
      <div aria-hidden className="absolute -right-20 -top-24 -z-10 size-80 rounded-full border-[40px] border-white/10" />
      <div className="container-x flex flex-col items-start gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-2xl">
          {b.eyebrow && <p className="text-white/85">{b.eyebrow}</p>}
          {b.heading && <h2 className="mt-1 text-[1.8rem] leading-tight text-white md:text-[2.4rem]">{b.heading}</h2>}
          {b.text && <p className="mt-3 text-lg text-white/90">{b.text}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          {b.buttonUrl && <CMSLink url={b.buttonUrl} className="btn px-6 py-3">{b.buttonLabel} <ArrowRight className="size-4" /></CMSLink>}
          {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost px-6 py-3">WhatsApp <ArrowUpRight className="size-4" /></a>}
        </div>
      </div>
    </section>
  )
}
