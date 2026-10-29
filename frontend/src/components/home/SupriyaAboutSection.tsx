import { Link } from 'react-router'
import type { Home } from '@/types/cms'
import { Reveal } from '../ui/Motion'
import { ROHAN_BIO } from '@/lib/rohan-bio'

type Block = NonNullable<Home['sections']>[number]
type AboutBlock = Extract<Block, { blockType: 'aboutIntro' }>

/**
 * About Section (100% Supriya Sule Layout):
 * - Left column: ABOUT eyebrow, Leader Heading with red/saffron underline bar,
 *   tagline, and bio text with Read More link.
 * - Right column: Full portrait of Rohan Deshmukh directly on the background.
 */
export function SupriyaAboutSection({
  b,
  locale = 'mr',
}: {
  b: AboutBlock
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  // the same text as the Introduction page: the first two paragraphs (on every screen), then "Read More"
  const bio = isMr ? ROHAN_BIO.mr : ROHAN_BIO.en
  const bioShort = bio[0]
  const bioRest = bio[1]

  return (
    <section className="bg-white py-8 sm:py-12 lg:py-14 overflow-hidden">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Content */}
          <Reveal className="flex flex-col items-start lg:col-span-7">
            {/* Red Eyebrow */}
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
              {b.eyebrow || (isMr ? 'परिचय' : 'ABOUT')}
            </span>

            {/* Heading */}
            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
              {b.heading || (isMr ? 'रोहन देशमुख' : 'Rohan Deshmukh')}
            </h2>

            {/* Signature Red Underline Accent Bar */}
            <div className="mt-3 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>

            {/* Tagline under the name and its underline */}
            <p className="mt-3 mb-6 font-display text-[1.2rem] leading-snug sm:text-lg lg:text-xl font-bold sm:font-semibold text-red-600">
              {isMr ? 'सर्वसामान्यांच्या हितासाठी आणि सर्वांगीण विकासासाठी कटिबद्ध' : "I'm committed to the betterment of the people"}
            </p>

            {/* Bio Body Text */}
            {/* same paragraph layout as the Introduction page; "Read More" ends the last paragraph shown */}
            <div className="space-y-4 text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
              <p>{bioShort}</p>
              <p>
                {bioRest} <ReadMore isMr={isMr} />
              </p>
            </div>
          </Reveal>

          {/* Right Column: Portrait Photo (with rich black back shadow) */}
          <Reveal className="relative order-first flex items-center justify-center lg:order-none lg:col-span-5" delay={0.15}>
            <div className="group relative w-full max-w-[420px]">
              {/* Deep diffused black back shadow behind the photo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-4 -bottom-7 top-10 -z-10 rounded-3xl bg-black/45 blur-2xl transition-all duration-500 group-hover:bg-black/60 group-hover:blur-3xl group-hover:-bottom-8"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-2.5 -z-10 rounded-[2rem] bg-black/25 blur-xl transition-all duration-500"
              />

              {/* Elegant framed portrait card with deep black elevation shadow */}
              <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[0_25px_50px_-10px_rgba(0,0,0,0.35),0_12px_24px_-6px_rgba(0,0,0,0.2)] ring-1 ring-stone-200/80 transition-all duration-500 group-hover:shadow-[0_35px_65px_-10px_rgba(0,0,0,0.45)] group-hover:-translate-y-1">
                <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
                  <img
                    src="/images/portraits/rohan-peach-kurta-namaskar.webp"
                    alt={b.heading || 'Rohan Deshmukh'}
                    width={500}
                    height={667}
                    loading="eager"
                    className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-103"
                  />
                </div>
              </div>
            </div>
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
