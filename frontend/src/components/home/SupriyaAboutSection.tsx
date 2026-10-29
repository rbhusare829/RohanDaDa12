import { Link } from 'react-router'
import type { Home } from '@/types/cms'
import { Reveal } from '../ui/Motion'
import { ROHAN_BIO } from '@/lib/rohan-bio'

type Block = NonNullable<Home['sections']>[number]
type AboutBlock = Extract<Block, { blockType: 'aboutIntro' }>

/**
 * About Section:
 * - Desktop (lg+): Clean 2-column layout. Left column has Header, lead paragraph,
 *   and second paragraph with Read More together (no artificial row gaps).
 *   Right column has Rohan Deshmukh's framed portrait with deep black back shadow.
 * - Mobile (<lg): Flow: Header & lead text (ending in '...ताकद आहे.'), THEN
 *   Rohan sir's photo, THEN the second paragraph ('स्वामी विवेकानंदांच्या...') with Read More.
 */
export function SupriyaAboutSection({
  b,
  locale = 'mr',
}: {
  b: AboutBlock
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  // The same text as the Introduction page: the first two paragraphs, then "Read More"
  const bio = isMr ? ROHAN_BIO.mr : ROHAN_BIO.en
  const bioShort = bio[0]
  const bioRest = bio[1]

  const headingText = b.heading || (isMr ? 'रोहन सुभाष देशमुख' : 'Rohan Subhash Deshmukh')
  const eyebrowText = b.eyebrow || (isMr ? 'परिचय' : 'ABOUT')
  const taglineText = isMr
    ? 'सर्वसामान्यांच्या हितासाठी आणि सर्वांगीण विकासासाठी कटिबद्ध'
    : "I'm committed to the betterment of the people"

  // Shared photo card component with rich black back shadow
  const PhotoCard = ({ className = '' }: { className?: string }) => (
    <div className={`group relative w-full ${className}`}>
      {/* Deep diffused black back shadow behind the photo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-3 -bottom-6 top-8 -z-10 rounded-3xl bg-black/45 blur-2xl transition-all duration-500 group-hover:bg-black/60 group-hover:blur-3xl group-hover:-bottom-7"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 rounded-[2rem] bg-black/25 blur-xl transition-all duration-500"
      />

      {/* Framed portrait card with deep black elevation shadow */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-white bg-white shadow-[0_20px_45px_-10px_rgba(0,0,0,0.35),0_10px_20px_-6px_rgba(0,0,0,0.2)] ring-1 ring-stone-200/80 transition-all duration-500 group-hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.45)] group-hover:-translate-y-1">
        <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
          <img
            src="/images/portraits/rohan-peach-kurta-namaskar.webp"
            alt={headingText}
            width={500}
            height={667}
            loading="eager"
            className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
          />
        </div>
      </div>
    </div>
  )

  return (
    <section className="bg-white py-10 sm:py-12 lg:py-16 overflow-hidden">
      <div className="container-x">
        {/* ============================================================== */}
        {/* DESKTOP LAYOUT (lg: and up): Clean 2-column, no vertical gap   */}
        {/* ============================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-14 lg:items-center">
          {/* Left Column: All text continuous */}
          <Reveal className="flex flex-col items-start lg:col-span-7">
            {/* Red Eyebrow */}
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
              {eyebrowText}
            </span>

            {/* Heading */}
            <h2 className="mt-2 font-display text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
              {headingText}
            </h2>

            {/* Signature Red & Saffron Underline Accent Bar */}
            <div className="mt-3 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>

            {/* Tagline */}
            <p className="mt-3 mb-6 font-display text-lg lg:text-xl font-bold sm:font-semibold text-red-600">
              {taglineText}
            </p>

            {/* Continuous Bio Body Text - both paragraphs together */}
            <div className="space-y-4 text-base leading-relaxed text-charcoal-800 lg:text-[1.03rem]">
              <p>{bioShort}</p>
              <p>
                {bioRest} <ReadMore isMr={isMr} />
              </p>
            </div>
          </Reveal>

          {/* Right Column: Portrait Photo */}
          <Reveal delay={0.12} className="flex justify-center lg:col-span-5">
            <PhotoCard className="max-w-[400px] xl:max-w-[420px]" />
          </Reveal>
        </div>

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (<lg): Header -> Para 1 -> Photo -> Para 2       */}
        {/* ============================================================== */}
        <div className="block lg:hidden">
          <Reveal className="flex flex-col items-start">
            {/* Red Eyebrow */}
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
              {eyebrowText}
            </span>

            {/* Heading */}
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#000d3d]">
              {headingText}
            </h2>

            {/* Signature Red & Saffron Underline Accent Bar */}
            <div className="mt-3 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>

            {/* Tagline */}
            <p className="mt-3 mb-5 font-display text-[1.15rem] leading-snug sm:text-lg font-bold sm:font-semibold text-red-600">
              {taglineText}
            </p>

            {/* Paragraph 1 (ends with '...ताकद आहे.') */}
            <p className="text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
              {bioShort}
            </p>

            {/* Photo placed right after '...ताकद आहे.', well-proportioned */}
            <div className="w-full flex justify-center my-6">
              <PhotoCard className="max-w-[310px] sm:max-w-[350px]" />
            </div>

            {/* Paragraph 2 ('स्वामी विवेकानंदांच्या...') with Read More */}
            <p className="text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
              {bioRest} <ReadMore isMr={isMr} />
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const ReadMore = ({ isMr }: { isMr: boolean }) => (
  <Link
    to="/about/introduction"
    className="font-bold text-[#000d3d] hover:text-red-600 underline underline-offset-4 ml-1 inline-block"
  >
    {isMr ? 'अधिक वाचा' : 'Read More'}
  </Link>
)
