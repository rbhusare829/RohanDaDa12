import {
  Calendar,
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
 * Section-wise layout in Modern Teal + Saffron (Cloud → Cloud White → Modern Teal):
 * 1. Early Life, Ideals & Core Philosophy (a Cloud band with the compact white-shirt photo, the full bio & quick facts)
 * 2. Positions Held (the white page with Cloud photo cards)
 * 3. Inspiring Quote Ribbon (the Modern Teal closing band with the visionary quote)
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
   - a Cloud band with a faint saffron watercolour (no saffron flood: saffron stays the accent)
   - Compact photo without name overlay (clean portrait)
   - The full narrative (every paragraph)
   - Quick Facts Grid
   ========================================================================== */
function PhilosophySection({ isMr }: { isMr: boolean }) {
  const paragraphs = isMr ? ROHAN_BIO.mr : ROHAN_BIO.en

  // Paragraph 0 is the lead intro paragraph
  const leadParagraph = paragraphs[0]
  // Remaining paragraphs start from index 1
  const remainingParagraphs = paragraphs.slice(1)
  // the whole bio is shown (Oct 2026: no Read More toggle)
  const visibleRemaining = remainingParagraphs

  return (
    <section
      className="relative py-12 sm:py-16 lg:py-20 border-b border-line bg-cream overflow-hidden"
    >
      {/* the saffron watercolour texture, faint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16] bg-no-repeat bg-left-top bg-cover sm:bg-[length:auto_100%]"
        style={{
          backgroundImage: "url('/images/backgrounds/manifesto-pattern-amber.png')",
        }}
      />

      {/* soft gold and saffron glows (decorative) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 -left-12 size-96 rounded-full bg-gold/15 blur-3xl -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-10 size-80 rounded-full bg-saffron-600/10 blur-3xl -z-10"
      />

      <div className="container-x relative z-10">
        {/* ============================================================== */}
        {/* DESKTOP LAYOUT (lg: and up): Clean 2-column, no vertical gap   */}
        {/* ============================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14 items-start">
          {/* Left Column: Photo (sticky) in the editorial frame */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <Reveal delay={0.08}>
              <div className="relative isolate mx-auto w-full group">
                {/* editorial frame: a thin Modern Teal outline set off behind the photo and a small saffron block at its corner (decoration) */}
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-2xl border-[1.5px] border-charcoal-900/70 transition-transform duration-500 sm:rounded-3xl motion-safe:group-hover:translate-x-5 motion-safe:group-hover:translate-y-5" />
                <div aria-hidden className="pointer-events-none absolute -left-3 -top-3 -z-10 size-16 rounded-lg bg-gold" />

                {/* Direct photo container with clean rounded corners and depth shadow */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-paper bg-paper shadow-[0_24px_48px_-20px_rgba(24,33,38,0.45)] transition-all duration-500 group-hover:shadow-[0_32px_60px_-22px_rgba(24,33,38,0.55)] motion-safe:group-hover:-translate-y-1">
                  <Img
                    src="/images/portraits/rohan-white-shirt-armchair.webp"
                    alt={isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
                    fill
                    priority
                    className="object-cover object-[50%_15%] transition-transform duration-700 ease-out group-hover:scale-103"
                    sizes="380px"
                  />

                  {/* Gentle bottom shade to ground the image naturally */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-charcoal-950/25 to-transparent"
                  />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column: All content continuous */}
          <div className="lg:col-span-8 space-y-5">
            <Reveal>
              {/* Heading / Core Tagline */}
              <h2 className="font-display text-2xl lg:text-[2.2rem] font-bold leading-snug tracking-tight text-charcoal-900">
                {isMr ? (
                  <>
                    <span>सर्वसामान्यांच्या हितासाठी आणि</span>{' '}
                    <span>सर्वांगीण विकासासाठी कटिबद्ध</span>
                  </>
                ) : (
                  "I'm committed to the betterment of the people"
                )}
              </h2>

              {/* the saffron underline + teal dot */}
              <div aria-hidden className="mt-3.5 flex items-center gap-1.5">
                <span className="h-1.5 w-14 rounded-full bg-gold" />
                <span className="h-1.5 w-3.5 rounded-full bg-leaf-600" />
              </div>

              {/* Continuous narrative: Lead Paragraph + Remaining Paragraphs */}
              <div className="mt-5 space-y-4 text-base leading-relaxed text-ink lg:text-[1.03rem] font-normal">
                <p>{leadParagraph}</p>
                {visibleRemaining.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

            </Reveal>

            {/* Quick Facts Grid */}
            <Reveal delay={0.12} className="pt-2">
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 border-t border-line pt-5">
                <QuickFactCard
                  icon={Calendar}
                  label={isMr ? 'जन्म' : 'Born'}
                  val={isMr ? '१२ डिसेंबर १९८७' : '12 December 1987'}
                />
                <QuickFactCard
                  icon={MapPin}
                  label={isMr ? 'जन्मस्थान' : 'Birthplace'}
                  val={isMr ? 'सोलापूर, महाराष्ट्र' : 'Solapur, Maharashtra'}
                />
                <QuickFactCard
                  icon={GraduationCap}
                  label={isMr ? 'शिक्षण' : 'Education'}
                  val={isMr ? 'रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी, न्यूयॉर्क' : 'Rochester Institute of Technology, New York'}
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

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (<lg): Header -> Lead -> Photo -> Remaining     */}
        {/* ============================================================== */}
        <div className="block lg:hidden">
          <Reveal className="flex flex-col items-start">
            {/* Heading / Core Tagline */}
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug tracking-tight text-charcoal-900">
              {isMr ? (
                <>
                  <span>सर्वसामान्यांच्या हितासाठी आणि</span>{' '}
                  <span className="block sm:inline">सर्वांगीण विकासासाठी कटिबद्ध</span>
                </>
              ) : (
                "I'm committed to the betterment of the people"
              )}
            </h2>

            {/* the saffron underline + teal dot */}
            <div aria-hidden className="mt-3.5 flex items-center gap-1.5">
              <span className="h-1.5 w-14 rounded-full bg-gold" />
              <span className="h-1.5 w-3.5 rounded-full bg-leaf-600" />
            </div>

            {/* Lead Paragraph */}
            <p className="mt-4 text-base leading-relaxed text-ink font-normal">
              {leadParagraph}
            </p>

            {/* Photo placed after lead paragraph */}
            <div className="w-full flex justify-center my-6">
              <div className="relative isolate mx-auto w-full max-w-[310px] sm:max-w-[340px] group">
                {/* editorial frame: a thin Modern Teal outline set off behind the photo and a small saffron block at its corner (decoration) */}
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-2xl border-[1.5px] border-charcoal-900/70 transition-transform duration-500 sm:rounded-3xl motion-safe:group-hover:translate-x-5 motion-safe:group-hover:translate-y-5" />
                <div aria-hidden className="pointer-events-none absolute -left-3 -top-3 -z-10 size-16 rounded-lg bg-gold" />

                {/* Direct photo container with clean rounded corners and depth shadow */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-paper bg-paper shadow-[0_24px_48px_-20px_rgba(24,33,38,0.45)] transition-all duration-500 group-hover:shadow-[0_32px_60px_-22px_rgba(24,33,38,0.55)] motion-safe:group-hover:-translate-y-1">
                  <Img
                    src="/images/portraits/rohan-white-shirt-armchair.webp"
                    alt={isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
                    fill
                    priority
                    className="object-cover object-[50%_15%] transition-transform duration-700 ease-out group-hover:scale-103"
                    sizes="340px"
                  />

                  {/* Gentle bottom shade to ground the image naturally */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-charcoal-950/25 to-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Remaining Narrative */}
            <div className="space-y-4 text-base leading-relaxed text-ink font-normal">
              {visibleRemaining.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>


            {/* Quick Facts Grid */}
            <div className="w-full pt-4">
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 border-t border-line pt-5">
                <QuickFactCard
                  icon={Calendar}
                  label={isMr ? 'जन्म' : 'Born'}
                  val={isMr ? '१२ डिसेंबर १९८७' : '12 December 1987'}
                />
                <QuickFactCard
                  icon={MapPin}
                  label={isMr ? 'जन्मस्थान' : 'Birthplace'}
                  val={isMr ? 'सोलापूर, महाराष्ट्र' : 'Solapur, Maharashtra'}
                />
                <QuickFactCard
                  icon={GraduationCap}
                  label={isMr ? 'शिक्षण' : 'Education'}
                  val={isMr ? 'रोचेस्टर इन्स्टिट्यूट ऑफ टेक्नॉलॉजी, रोचेस्टर, न्यूयॉर्क' : 'Rochester Institute of Technology, Rochester, New York'}
                />
                <QuickFactCard
                  icon={Heart}
                  label={isMr ? 'प्रेरणा' : 'Inspiration'}
                  val={isMr ? 'स्वामी विवेकानंद' : 'Swami Vivekananda'}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** one fact: the icon and label at the top, the value under them, centred across the card — the labels of all four line up */
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
    <div className="flex h-full flex-col items-center rounded-2xl border border-line bg-paper/90 p-3.5 text-center backdrop-blur-sm transition-all hover:border-gold hover:bg-paper hover:shadow-md">
      <div className="flex items-center justify-center gap-2 text-saffron-600">
        <Icon className="size-4" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink">{label}</span>
      </div>
      <p className="mt-1 font-display text-sm font-bold text-charcoal-900 sm:text-[0.95rem]">{val}</p>
    </div>
  )
}

/* ==========================================================================
   Section 2: Inspiring Quote Ribbon (प्रेरणादायी विचार)
   - the Modern Teal closing band with saffron accents
   ========================================================================== */
function QuoteRibbonSection({ isMr }: { isMr: boolean }) {
  return (
    <section className="on-dark relative py-14 sm:py-20 overflow-hidden bg-charcoal-900 text-paper">
      {/* 1. Subtle Deep Ambient Refraction Lights */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-1/10 size-80 sm:size-[24rem] rounded-full bg-gradient-to-tr from-gold/15 via-gold/5 to-transparent blur-3xl animate-float-fluid"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 right-1/10 size-88 sm:size-[26rem] rounded-full bg-gradient-to-bl from-saffron-600/15 via-saffron-600/5 to-transparent blur-3xl animate-float-reverse"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-charcoal-950/40 blur-3xl animate-float-slow"
      />

      {/* 2. Glass Sheen Reflections - soft light sweeps over the Modern Teal */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main sweeping light beam across glass */}
        <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-paper/10 to-transparent animate-glass-sheen" />
        {/* Secondary opposing gleam */}
        <div className="absolute inset-y-0 -right-full w-full bg-gradient-to-l from-transparent via-gold/10 to-transparent animate-glass-sheen-reverse" />
      </div>

      {/* 3. Hairline Glass Specular Rim Lines at top & bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
      />

      {/* 4. Open, unboxed content: white words on the Modern Teal */}
      <div className="container-x relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6">
        <Reveal>
          {/* Inspiring Quote Text - Cloud White on Modern Teal (6.8:1) */}
          <blockquote className="font-display text-base sm:text-lg md:text-xl lg:text-[1.28rem] font-semibold leading-relaxed sm:leading-loose text-paper tracking-tight">
            {isMr
              ? '“ग्रामीण भागातील तरुणांनी केवळ रोजगाराच्या शोधात न राहता स्वतः रोजगारनिर्मिती करणारे व्हावे; हीच आत्मनिर्भर भारताची खरी ताकद आहे.”'
              : '“Youth should not merely seek jobs but become creators of opportunity and employment; that is the true foundation of a self-reliant nation.”'}
          </blockquote>

          {/* Signature in white with saffron lines (small saffron words on teal would be 3.2:1) */}
          <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2.5">
            <span aria-hidden className="h-0.5 w-6 sm:w-10 rounded-full bg-gradient-to-r from-transparent to-gold" />
            <p className="font-display text-xs sm:text-sm font-bold tracking-wider text-paper">
              — {isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh'}
            </p>
            <span aria-hidden className="h-0.5 w-6 sm:w-10 rounded-full bg-gradient-to-l from-transparent to-gold" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ==========================================================================
   Section 3: Positions Held (भूषविलेली पदे व जबाबदाऱ्या)
   - the white page
   - 5 Cloud photo cards
   ========================================================================== */
function PositionsHeldSection({ isMr }: { isMr: boolean }) {
  const positions = [
    {
      role: isMr ? 'अध्यक्ष' : 'President',
      org: isMr ? 'लोकमंगल फाउंडेशन' : 'Lokmangal Foundation',
      desc: isMr
        ? 'सन २००५ मध्ये माननीय श्री. सुभाष (बापू) देशमुख यांनी लोकमंगल फाउंडेशनची स्थापना केली. गरजू कुटुंबांना आधार देणे, प्रत्येक व्यक्तीला प्रगतीची संधी उपलब्ध करून देणे आणि ग्रामीण भागाच्या विकासाला चालना देणे, ही या संस्थेची प्रमुख उद्दिष्टे आहेत. फाउंडेशनचे अध्यक्ष म्हणून रोहन देशमुख विविध उपक्रमांचे नियोजन, अंमलबजावणी आणि प्रत्यक्ष कार्याचा आढावा घेण्याची जबाबदारी सांभाळतात.'
        : 'As President of Lokmangal Foundation, Rohan Deshmukh leads the Foundation and oversees every initiative, from planning to work on the ground. Founded in 2005 by Hon. Shri Subhash (Bapu) Deshmukh, the Foundation was built on a clear belief: every family in need should find support, every person should get a chance to grow, and every village should move forward.',
      image: '/images/positions/position-foundation-president.webp',
      imgPos: '30% 40%',
    },
    {
      role: isMr ? 'संचालक' : 'Director',
      org: isMr ? 'लोकमंगल मल्टीस्टेट को-ऑपरेटिव्ह सोसायटी' : 'Lokmangal Multistate Co-operative Society',
      desc: isMr
        ? 'लोकमंगल मल्टीस्टेट को-ऑपरेटिव्ह सोसायटीच्या माध्यमातून रोहन सुभाष देशमुख यांनी अर्थकारणाच्या क्षेत्रातही आपला ठसा उमटवला. दोन राज्यांमध्ये ६० शाखांचे विस्तृत जाळे आणि ७०० कोटी रुपयांहून अधिक ठेवींच्या बळावर संस्थेने अल्पावधीत विश्वासार्हता व लौकिक मिळवला. प्रशिक्षित कर्मचारीवर्ग, तत्पर सेवा आणि पारदर्शक व्यवहारांच्या माध्यमातून आर्थिक साक्षरता वाढवणे आणि सर्वसामान्यांमध्ये आर्थिक जागरूकता निर्माण करणे, हा त्यांचा महत्त्वपूर्ण प्रयत्न राहिला आहे.'
        : 'Through Lokmangal Multistate Co-operative Society, Rohan Subhash Deshmukh has made his mark in the world of finance as well. With a network of 60 branches across two states and deposits exceeding ₹700 crore, the institution has earned trust and a strong reputation in a short span of time. Backed by a trained team, prompt service, and transparent dealings, he has made it his mission to improve financial literacy and build financial awareness among ordinary people.',
      image: '/images/positions/position-lokmangal-multistate.webp',
      imgPos: '20% 50%',
    },
    {
      role: isMr ? 'अध्यक्ष' : 'Chairman',
      org: isMr ? 'लोकमंगल कॉलेज' : 'Lokmangal College',
      desc: isMr
        ? 'लोकमंगल कॉलेजचे अध्यक्ष रोहन सुभाष देशमुख यांचे जैवतंत्रज्ञान आणि उद्योजकतेतील शैक्षणिक पार्श्वभूमीमुळे या क्षेत्रांकडे पाहण्याची स्वतंत्र दृष्टी लाभली आहे. याच दृष्टिकोनातून वडाळा, ता. उत्तर सोलापूर येथे २०० एकरांच्या विस्तीर्ण परिसरात लोकमंगल जैवतंत्रज्ञान महाविद्यालयाची स्थापना करण्यात आली. आज येथे सुमारे १२०० विद्यार्थी शिक्षण घेत आहेत.'
        : 'Rohan Subhash Deshmukh, Chairman of Lokmangal College, draws on his background in biotechnology and entrepreneurship to bring a fresh vision to both fields. That vision led to the founding of Lokmangal College of Biotechnology on a 200-acre campus in Wadala, North Solapur, where around 1,200 students now study.',
      image: '/images/positions/position-lokmangal-college.webp',
      contain: true,
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
  ]

  return (
    <section className="relative py-14 sm:py-20 bg-paper border-t border-line overflow-hidden">
      <div className="container-x relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <Reveal>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-saffron-700">
              {isMr ? 'प्रशासकीय व संस्थात्मक अनुभव' : 'Governance & Institutional Experience'}
            </p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-charcoal-900">
              {isMr ? 'भूषविलेली पदे व जबाबदाऱ्या' : 'Positions Held'}
            </h2>
            {/* the saffron underline + teal dot */}
            <div aria-hidden className="mt-2.5 flex justify-center items-center gap-1.5">
              <span className="h-1.5 w-14 rounded-full bg-gold" />
              <span className="h-1.5 w-3.5 rounded-full bg-leaf-600" />
            </div>
            <p className="mt-3 text-sm sm:text-base text-muted max-w-2xl mx-auto">
              {isMr
                ? 'विविध क्षेत्रांतील नेतृत्व आणि महत्त्वपूर्ण जबाबदाऱ्या'
                : 'Leadership and Key Responsibilities Across Different Fields'}
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
                  className="group flex flex-col justify-between rounded-2xl border border-line bg-cream p-5 shadow-sm transition-all duration-300 hover:border-gold hover:shadow-xl hover:-translate-y-1.5"
                >
                  <div>
                    {/* The photo for this position */}
                    <div
                      className={cn(
                        'relative aspect-[16/10] overflow-hidden rounded-xl border border-line',
                        'bg-paper',
                      )}
                    >
                      {item.image ? (
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
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-charcoal-900">
                          <GraduationCap aria-hidden className="size-10 text-saffron-600" />
                          <span className="font-display text-sm font-bold">{item.org}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-saffron-700">
                        {item.role}
                      </span>
                      <h3 className="mt-0.5 font-display text-base sm:text-lg font-bold text-charcoal-900">
                        {item.org}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
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
