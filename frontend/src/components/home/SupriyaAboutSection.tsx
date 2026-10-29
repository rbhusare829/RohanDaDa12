import { Link } from 'react-router'
import type { Home } from '@/types/cms'
import { Reveal } from '../ui/Motion'
import { ROHAN_BIO } from '@/lib/rohan-bio'

type Block = NonNullable<Home['sections']>[number]
type AboutBlock = Extract<Block, { blockType: 'aboutIntro' }>

/**
 * About Section:
 * - Desktop: Left column (Header, lead paragraph, second paragraph with Read More),
 *   Right column (Photo of Rohan Deshmukh with rich black back shadow).
 * - Mobile: Header & lead text (ending in '...ताकद आहे.'), THEN the compact photo,
 *   THEN the second paragraph ('स्वामी विवेकानंदांच्या...') with Read More.
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
    <section className="bg-white py-10 sm:py-12 lg:py-16 overflow-hidden">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-14">
          {/* 1. Header & Lead Paragraph: on mobile order-1 (shows FIRST, ends with '...ताकद आहे.'), on desktop col-span-7 */}
          <div className="order-1 lg:col-span-7">
            <Reveal className="flex flex-col items-start">
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
              <p className="mt-3 mb-5 font-display text-[1.15rem] leading-snug sm:text-lg lg:text-xl font-bold sm:font-semibold text-red-600">
                {isMr ? 'सर्वसामान्यांच्या हितासाठी आणि सर्वांगीण विकासासाठी कटिबद्ध' : "I'm committed to the betterment of the people"}
              </p>

              {/* Lead paragraph ending with '...ताकद आहे.' */}
              <p className="text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
                {bioShort}
              </p>
            </Reveal>
          </div>

          {/* 2. Photo: on mobile order-2 (directly after 'ताकद आहे.'), on desktop col-span-5 in right column */}
          <div className="order-2 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 flex items-center justify-center my-3 sm:my-4 lg:my-0">
            <Reveal delay={0.12} className="w-full flex justify-center">
              {/* Photo size made smaller and compact on mobile as requested */}
              <div className="group relative w-full max-w-[260px] sm:max-w-[290px] lg:max-w-[390px]">
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

          {/* 3. Second Paragraph: on mobile order-3 (shows AFTER photo), on desktop col-span-7 below lead paragraph */}
          <div className="order-3 lg:col-span-7">
            <Reveal delay={0.08}>
              <p className="text-base leading-relaxed text-charcoal-800 sm:text-[1.03rem]">
                {bioRest} <ReadMore isMr={isMr} />
              </p>
            </Reveal>
          </div>
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
