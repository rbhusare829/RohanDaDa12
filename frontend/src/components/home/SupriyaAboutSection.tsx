import { Link } from 'react-router'
import type { Home } from '@/types/cms'
import { Reveal } from './HomeMotion'
import { ROHAN_BIO } from '@/lib/rohan-bio'

type Block = NonNullable<Home['sections']>[number]
type AboutBlock = Extract<Block, { blockType: 'aboutIntro' }>

/**
 * About Section (Modern Teal + Saffron: Cloud White, editorial):
 * - Desktop (lg+): Clean 2-column layout. Left column has the eyebrow, the heading, the tagline as a pull quote beside a saffron rule,
 *   and both paragraphs with Read More together (no artificial row gaps).
 *   Right column has Rohan Deshmukh's portrait in a Cloud White frame, a thin teal outline set off behind it and a small saffron block.
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

  // the portrait, editorial style: a Cloud White frame with a soft charcoal shadow, a thin Modern Teal outline set off behind it and a small
  // Saffron Amber block at its top corner (decoration only)
  const photoCard = (className = '') => (
    <div className={`group relative isolate w-full ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-2xl border-[1.5px] border-charcoal-900/70 transition-transform duration-500 sm:translate-x-5 sm:translate-y-5 sm:rounded-3xl motion-safe:group-hover:translate-x-6 motion-safe:group-hover:translate-y-6" />
      <div aria-hidden className="pointer-events-none absolute -left-3 -top-3 -z-10 size-16 rounded-lg bg-gold sm:-left-4 sm:-top-4 sm:size-20" />

      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-paper bg-paper shadow-[0_24px_48px_-20px_rgba(24,33,38,0.45)] transition-all duration-500 motion-safe:group-hover:-translate-y-1 group-hover:shadow-[0_32px_60px_-22px_rgba(24,33,38,0.55)]">
        <div className="aspect-[3/4] w-full overflow-hidden bg-cream">
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
    <section className="bg-paper py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="container-x">
        {/* ============================================================== */}
        {/* DESKTOP LAYOUT (lg: and up): Clean 2-column, no vertical gap   */}
        {/* ============================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-14 lg:items-center">
          {/* Left Column: All text continuous */}
          <Reveal className="flex flex-col items-start lg:col-span-7">
            {/* small eyebrow in Modern Teal after a saffron bar (saffron words that small would be too faint) */}
            <span className="eyebrow sm:text-sm">
              {eyebrowText}
            </span>

            {/* Heading */}
            <h2 className="mt-2 font-display text-4xl lg:text-5xl font-bold tracking-tight text-charcoal-900">
              {headingText}
            </h2>

            {/* the saffron underline + teal dot */}
            <div aria-hidden className="mt-3 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-gold" />
              <span className="h-1 w-3 rounded-full bg-leaf-600" />
            </div>

            {/* Tagline: a pull quote beside a saffron rule */}
            <p className="mt-5 mb-7 border-l-4 border-gold pl-4 font-display text-lg lg:text-xl font-semibold leading-snug text-charcoal-950">
              {taglineText}
            </p>

            {/* Continuous Bio Body Text - both paragraphs together */}
            <div className="space-y-4 text-base leading-relaxed text-ink lg:text-[1.03rem]">
              <p>{bioShort}</p>
              <p>
                {bioRest} <ReadMore isMr={isMr} />
              </p>
            </div>
          </Reveal>

          {/* Right Column: Portrait Photo */}
          <Reveal delay={0.15} x={40} className="flex justify-center lg:col-span-5">
            {photoCard('max-w-[400px] xl:max-w-[420px]')}
          </Reveal>
        </div>

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (<lg): Header -> Para 1 -> Photo -> Para 2       */}
        {/* ============================================================== */}
        <div className="block lg:hidden">
          <Reveal className="flex flex-col items-start">
            {/* small eyebrow in Modern Teal after a saffron bar (saffron words that small would be too faint) */}
            <span className="eyebrow sm:text-sm">
              {eyebrowText}
            </span>

            {/* Heading */}
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900">
              {headingText}
            </h2>

            {/* the saffron underline + teal dot */}
            <div aria-hidden className="mt-3 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-gold" />
              <span className="h-1 w-3 rounded-full bg-leaf-600" />
            </div>

            {/* Tagline: a pull quote beside a saffron rule */}
            <p className="mt-4 mb-5 border-l-4 border-gold pl-3.5 font-display text-[1.15rem] leading-snug sm:text-lg font-semibold text-charcoal-950">
              {taglineText}
            </p>

            {/* Paragraph 1 (ends with '...ताकद आहे.') */}
            <p className="text-base leading-relaxed text-ink sm:text-[1.03rem]">
              {bioShort}
            </p>

            {/* Photo placed right after '...ताकद आहे.', well-proportioned */}
            <div className="w-full flex justify-center my-6">
              {photoCard('max-w-[310px] sm:max-w-[350px]')}
            </div>

            {/* Paragraph 2 ('स्वामी विवेकानंदांच्या...') with Read More */}
            <p className="text-base leading-relaxed text-ink sm:text-[1.03rem]">
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
    className="font-bold text-charcoal-900 underline decoration-gold decoration-2 underline-offset-4 ml-1 inline-block transition-colors hover:text-ink"
  >
    {isMr ? 'अधिक वाचा' : 'Read More'}
  </Link>
)
