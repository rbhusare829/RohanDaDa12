import { useState } from 'react'
import {
  Calendar,
  ChevronDown,
  GraduationCap,
  Heart,
  MapPin,
} from 'lucide-react'
import type { Page } from '@/types/cms'
import { cn } from '@/lib/utils'
import { Img } from '@/components/ui/Img'
import { Reveal } from '@/components/ui/Motion'
import { ROHAN_BIO } from '@/lib/rohan-bio'

type Block = NonNullable<Page['layout']>[number]

interface IntroJourneyProps {
  blocks?: Block[] | null
  locale?: 'mr' | 'en'
}

/**
 * स्वपरिचय (About / Introduction) Page:
 * Section-wise layout with distinct rich backgrounds:
 * 1. Early Life, Ideals & Core Philosophy (Clean white canvas with compact white-shirt photo, bio with Read More toggle, & quick facts)
 * 2. Inspiring Quote Ribbon (Deep royal navy banner with visionary quote)
 * 3. Positions Held (Soft ice-blue watermark section with real photo cards)
 */
export function IntroJourney({ locale = 'mr' }: IntroJourneyProps) {
  const isMr = locale === 'mr'

  return (
    <div className="w-full">
      {/* 1. Early Life, Ideals & Core Philosophy */}
      <PhilosophySection isMr={isMr} />

      {/* 2. Positions Held (भूषविलेली पदे व जबाबदाऱ्या) */}
      <PositionsHeldSection isMr={isMr} />

      {/* 3. Inspiring Thought Ribbon */}
      <QuoteRibbonSection isMr={isMr} />
    </div>
  )
}

/* ==========================================================================
   Section 1: Philosophy, Ideals & Early Life (विचारसरणी आणि समाजकारण)
   - Clean white background
   - Compact photo without name overlay (clean portrait)
   - Narrative with "अधिक वाचा / Read More" expandable toggle
   - Quick Facts Grid
   ========================================================================== */
function PhilosophySection({ isMr }: { isMr: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const paragraphs = isMr ? ROHAN_BIO.mr : ROHAN_BIO.en

  // Paragraph 0 is the lead intro paragraph
  const leadParagraph = paragraphs[0]
  // Remaining paragraphs start from index 1
  const remainingParagraphs = paragraphs.slice(1)
  // When collapsed, show the first paragraph of remaining (i.e. paragraphs[1]), rest when expanded
  const visibleRemaining = expanded ? remainingParagraphs : remainingParagraphs.slice(0, 1)

  return (
    <section className="relative py-10 sm:py-14 lg:py-20 bg-white overflow-hidden">
      {/* Subtle ambient atmospheric glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-1/4 -z-10 size-96 rounded-full bg-orange-100/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-10 -z-10 size-80 rounded-full bg-sky-100/25 blur-3xl"
      />

      <div className="container-x relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-14 items-start">
          {/* 1. Header & Lead Paragraph: on mobile order-1 (shows FIRST), on desktop col-span-8 in right column */}
          <div className="order-1 lg:col-span-8 lg:col-start-5">
            <Reveal>
              {/* Heading / Core Tagline */}
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-[2.1rem] font-bold leading-snug tracking-tight text-[#000d3d]">
                {isMr ? (
                  <>
                    <span>सर्वसामान्यांच्या हितासाठी आणि</span>{' '}
                    <span className="block sm:inline">सर्वांगीण विकासासाठी कटिबद्ध</span>
                  </>
                ) : (
                  "I'm committed to the betterment of the people"
                )}
              </h2>

              {/* Signature red and saffron underline bar */}
              <div className="mt-3.5 flex items-center gap-1.5">
                <span className="h-1.5 w-14 rounded-full bg-red-600" />
                <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
              </div>

              {/* Lead Paragraph */}
              <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-[1.03rem]">
                {leadParagraph}
              </p>
            </Reveal>
          </div>

          {/* 2. Photo: on mobile order-2 (shows AFTER lead text), on desktop col-span-4 in left column */}
          <div className="order-2 lg:order-none lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-24">
            <Reveal delay={0.08}>
              <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[330px] lg:max-w-none">
                {/* Soft modern ambient aura behind the photo (NO hard border) */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-3xl bg-gradient-to-tr from-saffron-500/20 via-sky-500/10 to-transparent blur-xl opacity-80"
                />

                {/* Subtle modern offset backdrop accent behind photo */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-2 -right-2 -top-2 -left-2 -z-10 rounded-[1.75rem] bg-gradient-to-br from-saffron-100/60 via-transparent to-slate-200/50"
                />

                {/* Direct borderless photo container - NO white padding frame, NO border box */}
                <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_45px_-12px_rgba(0,13,61,0.22)] transition-all duration-500 hover:shadow-[0_25px_55px_-10px_rgba(0,13,61,0.28)] hover:scale-[1.01]">
                  <Img
                    src="/images/portraits/rohan-white-shirt-armchair.webp"
                    alt={isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
                    fill
                    priority
                    className="object-cover object-[50%_15%] transition-transform duration-700 ease-out group-hover:scale-103"
                    sizes="(max-width: 640px) 300px, (max-width: 1024px) 330px, 360px"
                  />

                  {/* Gentle bottom shade to ground the image naturally */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent"
                  />
                </div>
              </div>
            </Reveal>
          </div>

          {/* 3. Remaining Narrative & Read More: on mobile order-3 (shows AFTER photo), on desktop col-span-8 in right column */}
          <div className="order-3 lg:col-span-8 lg:col-start-5 space-y-4 text-base leading-relaxed text-slate-700 sm:text-[1.03rem]">
            <Reveal delay={0.12}>
              <div className="space-y-4">
                {visibleRemaining.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Read More / Show Less Toggle Button */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-[#000d3d] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>
                    {expanded
                      ? (isMr ? 'कमी माहिती पहा' : 'Show Less')
                      : (isMr ? 'अधिक वाचा' : 'Read More')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform duration-300',
                      expanded && 'rotate-180',
                    )}
                  />
                </button>
              </div>
            </Reveal>
          </div>

          {/* 4. Quick Facts Grid: on mobile order-4 (shows at bottom), on desktop col-span-8 in right column */}
          <div className="order-4 lg:col-span-8 lg:col-start-5 pt-2">
            <Reveal delay={0.15}>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 border-t border-stone-200/80 pt-4">
                <QuickFactCard
                  icon={Calendar}
                  label={isMr ? 'जन्म' : 'Born'}
                  val={isMr ? '१२ डिसेंबर १९८७' : '12 December 1987'}
                />
                <QuickFactCard
                  icon={MapPin}
                  label={isMr ? 'जन्मस्थान' : 'Birthplace'}
                  val={isMr ? 'सोलापूर, देशमुख कुटुंब' : 'Solapur, into the Deshmukh family'}
                />
                <QuickFactCard
                  icon={GraduationCap}
                  label={isMr ? 'शिक्षण' : 'Education'}
                  val={isMr ? 'रोचेस्टर इन्स्टिट्यूट (RIT)' : 'Rochester Institute (RIT)'}
                />
                <QuickFactCard
                  icon={Heart}
                  label={isMr ? 'प्रेरणा' : 'Inspiration'}
                  val={isMr ? 'स्वामी विवेकानंद' : 'Swami Vivekananda'}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickFactCard({
  icon: Icon,
  label,
  val,
}: {
  icon: typeof Calendar
  label: string
  val: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-3.5 transition-all hover:border-saffron-300 hover:bg-white hover:shadow-sm">
      <div className="flex items-center gap-2 text-saffron-600">
        <Icon className="size-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{label}</span>
      </div>
      <p className="mt-1 font-display text-sm font-bold text-[#000d3d] sm:text-[0.95rem]">{val}</p>
    </div>
  )
}

/* ==========================================================================
   Section 2: Inspiring Quote Ribbon (प्रेरणादायी विचार)
   - Royal Navy Gradient Ribbon
   ========================================================================== */
function QuoteRibbonSection({ isMr }: { isMr: boolean }) {
  return (
    <section className="relative py-14 sm:py-20 overflow-hidden bg-gradient-to-b from-[#140105] via-[#1d0309] to-[#0f0104] text-white border-t border-rose-950/60">
      {/* 1. Subtle Deep Ambient Refraction Lights */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-1/10 size-80 sm:size-[24rem] rounded-full bg-gradient-to-tr from-rose-900/20 via-pink-950/15 to-transparent blur-3xl animate-float-fluid"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 right-1/10 size-88 sm:size-[26rem] rounded-full bg-gradient-to-bl from-amber-700/15 via-rose-900/10 to-transparent blur-3xl animate-float-reverse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-rose-950/30 blur-3xl animate-float-slow"
      />

      {/* 2. Glass Sheen Reflections - Smooth Specular Light Sweeps over Ultra-Dark Burgundy */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main sweeping light beam across glass */}
        <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/12 via-rose-300/8 to-transparent animate-glass-sheen" />
        {/* Secondary opposing gleam */}
        <div className="absolute inset-y-0 -right-full w-full bg-gradient-to-l from-transparent via-amber-200/8 via-white/5 to-transparent animate-glass-sheen-reverse" />
      </div>

      {/* 3. Hairline Glass Specular Rim Lines at top & bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 via-rose-500/20 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent"
      />

      {/* 4. Open, Unboxed Content - Ultra-Dark Burgundy Glass Typography */}
      <div className="container-x relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6">
        <Reveal>
          {/* Inspiring Quote Text - Crisp Pure White on Ultra-Dark Burgundy */}
          <blockquote className="font-display text-base sm:text-lg md:text-xl lg:text-[1.28rem] font-semibold leading-relaxed sm:leading-loose text-white/95 tracking-tight drop-shadow-sm">
            {isMr
              ? '“ग्रामीण भागातील तरुणांनी केवळ रोजगाराच्या शोधात न राहता स्वतः रोजगारनिर्मिती करणारे व्हावे; हीच आत्मनिर्भर भारताची खरी ताकद आहे.”'
              : '“Youth should not merely seek jobs but become creators of opportunity and employment; that is the true foundation of a self-reliant nation.”'}
          </blockquote>

          {/* Signature with Golden Saffron Accents */}
          <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2.5">
            <span className="h-0.5 w-6 sm:w-10 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-amber-500" />
            <p className="font-display text-xs sm:text-sm font-bold tracking-wider text-amber-300">
              — {isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
            </p>
            <span className="h-0.5 w-6 sm:w-10 rounded-full bg-gradient-to-l from-transparent via-amber-400 to-amber-500" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ==========================================================================
   Section 3: Positions Held (भूषविलेली पदे व जबाबदाऱ्या)
   - Light Ice-Blue with crowd pattern watermark
   - 5 Clean White Photo Cards
   ========================================================================== */
function PositionsHeldSection({ isMr }: { isMr: boolean }) {
  const positions = [
    {
      role: isMr ? 'अध्यक्ष' : 'President',
      org: isMr ? 'लोकमंगल फाउंडेशन' : 'Lokmangal Foundation',
      desc: isMr
        ? 'फाउंडेशनचे अध्यक्ष म्हणून रोहन देशमुख विविध उपक्रमांचे नियोजन, अंमलबजावणी आणि प्रत्यक्ष कार्याचा आढावा घेण्याची जबाबदारी सांभाळतात.'
        : 'As President of Lokmangal Foundation, Rohan Deshmukh leads the Foundation and oversees every initiative, from planning to work on the ground.',
      image: '/images/positions/position-foundation-president.webp',
      imgPos: '30% 40%',
    },
    {
      role: isMr ? 'संचालक' : 'Director',
      org: isMr ? 'लोकमंगल मल्टिस्टेट' : 'Lokmangal Multistate',
      desc: isMr
        ? 'माननीय श्री. सुभाष देशमुख यांनी स्थापन केलेला लोकमंगल समूह आज बँकिंग, उद्योग, शिक्षण, आरोग्यसेवा आणि समाजसेवा अशा विविध क्षेत्रांत कार्यरत आहे.'
        : 'Founded by Hon. Shri Subhash Deshmukh, the Lokmangal Group has grown over the years into a large family working in banking, industry, education, healthcare and social service.',
      image: '/images/positions/position-lokmangal-multistate.webp',
      imgPos: '20% 50%',
    },
    {
      role: isMr ? 'सरचिटणीस' : 'General Secretary',
      org: isMr ? 'भारतीय जनता युवा मोर्चा' : 'Bharatiya Janata Yuva Morcha',
      desc: isMr
        ? 'भारतीय जनता युवा मोर्चाचे सरचिटणीस म्हणून रोहन देशमुख यांनी महाराष्ट्रभर दौरे करून युवकांशी संवाद साधला.'
        : 'As General Secretary of the Bharatiya Janata Yuva Morcha, Rohan Deshmukh travelled across Maharashtra to connect with young people and raise their political awareness.',
      image: '/images/positions/position-bjym.webp',
      imgPos: '50% 20%',
    },
    {
      role: isMr ? 'अपक्ष उमेदवार' : 'Independent Candidate',
      org: isMr ? 'धाराशिव (उस्मानाबाद) लोकसभा निवडणूक' : 'Lok Sabha Election, Dharashiv (Osmanabad)',
      desc: isMr
        ? 'मतदारसंघातील विविध गावांना भेटी देत त्यांनी नागरिकांशी थेट संवाद साधला आणि आपले विचार त्यांच्यापर्यंत पोहोचवले.'
        : 'He took his ideas directly to voters, reaching every corner of the constituency.',
      image: '/images/positions/position-loksabha.webp',
      imgPos: '50% 30%',
    },
    {
      role: isMr ? 'लेखक' : 'Author',
      org: isMr ? 'द न्यू इंडिया मॅनिफेस्टो' : 'The New India Manifesto',
      desc: isMr
        ? '‘द न्यू इंडिया मॅनिफेस्टो’ या पुस्तकातून रोहन सुभाष देशमुख यांनी उद्योजकतेच्या माध्यमातून भारताच्या विकासाला नवी दिशा देण्याचा विचार मांडला आहे.'
        : 'In The New India Manifesto, Rohan Subhash Deshmukh sets out a simple idea: India’s growth can take a new direction through enterprise.',
      image: '/images/positions/position-author.webp',
      contain: true,
    },
  ]

  return (
    <section
      className="relative py-14 sm:py-20 border-t border-sky-200/80 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #edf6fd 0%, #f4f9fe 50%, #ffffff 100%)',
      }}
    >
      {/* Subtle crowd watermark from homepage */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 bg-repeat bg-center"
        style={{
          backgroundImage: "url('/images/backgrounds/social-work-pattern.png')",
          backgroundSize: '1017px auto',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-10 size-96 rounded-full bg-sky-200/35 blur-3xl -z-10"
      />

      <div className="container-x relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <Reveal>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-saffron-700">
              {isMr ? 'प्रशासकीय व संस्थात्मक अनुभव' : 'Governance & Institutional Experience'}
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#000d3d]">
              {isMr ? 'भूषविलेली पदे व जबाबदाऱ्या' : 'Positions Held'}
            </h2>
            {/* Signature red and saffron underline */}
            <div className="mt-2.5 flex justify-center items-center gap-1.5">
              <span className="h-1.5 w-14 rounded-full bg-red-600" />
              <span className="h-1.5 w-3.5 rounded-full bg-saffron-500" />
            </div>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              {isMr
                ? 'सामाजिक संस्था, उद्योग समूह, राजकीय मंच आणि साहित्य क्षेत्रात बजावलेल्या महत्त्वाच्या जबाबदाऱ्या.'
                : 'Key responsibilities undertaken across social institutions, business conglomerates, political forums, and literature.'}
            </p>
          </Reveal>
        </div>

        {/* 5 Cards Grid */}
        <Reveal delay={0.15}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {positions.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:border-saffron-400 hover:shadow-xl hover:-translate-y-1.5"
                >
                  <div>
                    {/* The photo for this position */}
                    <div
                      className={cn(
                        'relative aspect-[16/10] overflow-hidden rounded-xl border border-stone-100',
                        item.contain ? 'bg-[#f0f6fc]' : 'bg-stone-100',
                      )}
                    >
                      <img
                        src={item.image}
                        alt={`${item.role}, ${item.org}`}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                          'size-full transition-transform duration-500 group-hover:scale-105',
                          item.contain ? 'object-contain p-3' : 'object-cover',
                        )}
                        style={item.contain ? undefined : { objectPosition: item.imgPos }}
                      />
                    </div>

                    <div className="mt-4">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-saffron-600">
                        {item.role}
                      </span>
                      <h3 className="mt-0.5 font-display text-base sm:text-lg font-bold text-[#000d3d]">
                        {item.org}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
