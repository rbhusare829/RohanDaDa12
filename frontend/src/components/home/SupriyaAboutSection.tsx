import { useState } from 'react'
import { Link } from 'react-router'
import { PlayCircle } from 'lucide-react'
import type { Home } from '@/types/cms'
import { Reveal } from '../ui/Motion'

type Block = NonNullable<Home['sections']>[number]
type AboutBlock = Extract<Block, { blockType: 'aboutIntro' }>

/**
 * About Section (100% Supriya Sule Layout):
 * - Left column: ABOUT eyebrow, Leader Heading with red/saffron underline bar,
 *   bio text with Read More link, large quote callout, and 2 action buttons.
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
  const [showVideo, setShowVideo] = useState(false)

  const bio =
    b.text ||
    (isMr
      ? 'रोहन सुभाष देशमुख हे सोलापूरचे उद्योजक, लेखक आणि सामाजिक कार्यकर्ते आहेत. स्वामी विवेकानंदांच्या विचारांनी प्रेरित होऊन, आत्मविश्वासू आणि स्वावलंबी तरुणच सशक्त राष्ट्र घडवतात, असा त्यांचा विश्वास आहे. तरुणाई, उद्योजकता आणि स्वावलंबन हे त्यांच्या प्रत्येक कामाच्या केंद्रस्थानी आहेत.'
      : 'Rohan Subhash Deshmukh is an entrepreneur, author and social worker from Solapur. Inspired by the thoughts of Swami Vivekananda, he believes a strong nation is built by confident, self-reliant young people.')
  // On mobile only the first two sentences are shown; the rest appears from the sm breakpoint up
  const sentences = bio.split(/(?<=[.।])\s+/)
  const bioShort = sentences.slice(0, 2).join(' ')
  const bioRest = sentences.slice(2).join(' ')

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-28 overflow-hidden">
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
            <div className="mt-3 mb-6 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>

            {/* Bio Body Text */}
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-700">
              <p>
                {bioShort}
                {bioRest && <span className="hidden sm:inline"> {bioRest}</span>}
                {' '}
                <Link
                  to="/about/introduction"
                  className="font-bold text-[#000d3d] hover:text-red-600 underline underline-offset-4 ml-1 inline-block"
                >
                  {isMr ? 'अधिक वाचा' : 'Read More'}
                </Link>
              </p>
            </div>

            {/* Large Highlighted Quote Block (Supriya Sule style) */}
            <div className="my-7 flex items-start gap-2.5">
              <span className="font-serif text-3xl sm:text-4xl leading-none text-red-600 select-none">&ldquo;</span>
              <p className="font-display text-lg sm:text-xl lg:text-2xl font-bold leading-snug text-[#000d3d]">
                {b.pledge ||
                  (isMr
                    ? 'सर्वसामान्यांच्या हितासाठी आणि सर्वांगीण विकासासाठी कटिबद्ध'
                    : "I'm committed to the betterment of the people")}
              </p>
              <span className="font-serif text-3xl sm:text-4xl leading-none text-red-600 select-none">&rdquo;</span>
            </div>

            {/* Vision button (opens the video) */}
            <div className="flex w-full justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#000d3d] hover:shadow-md active:scale-95 cursor-pointer"
              >
                <PlayCircle className="size-4.5 text-white" />
                <span>{isMr ? 'दृष्टिकोन' : 'Vision'}</span>
              </button>

            </div>
          </Reveal>

          {/* Video Modal (Supriya Sule style) */}
          {showVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setShowVideo(false)}>
              <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#000d3d]">
                    {isMr ? 'रोहन सुभाष देशमुख - नेतृत्व व कार्य आढावा' : 'Rohan Subhash Deshmukh - Leadership & Performance'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowVideo(false)}
                    className="grid size-8 place-items-center rounded-full bg-stone-100 text-stone-600 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    &times;
                  </button>
                </div>
                <div className="aspect-video w-full bg-black">
                  <iframe
                    className="size-full border-0"
                    src="https://www.youtube-nocookie.com/embed/p3E7W2g6iZ8?autoplay=1"
                    title="Leadership Performance Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Portrait Photo (Supriya Sule style framed presentation) */}
          <Reveal className="relative order-first flex items-center justify-center lg:order-none lg:col-span-5" delay={0.15}>
            <div className="relative w-full max-w-[420px]">
              {/* Subtle ambient backdrop glow */}
              <div
                aria-hidden
                className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-saffron-200/40 via-red-100/30 to-blue-200/30 blur-2xl"
              />

              {/* Elegant framed portrait card */}
              <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[0_25px_60px_-15px_rgba(0,13,61,0.25)] ring-1 ring-stone-200/80">
                <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
                  <img
                    src="/images/portraits/rohan-deshmukh-kurta.webp"
                    alt={b.heading || 'Rohan Deshmukh'}
                    width={500}
                    height={667}
                    loading="eager"
                    className="size-full object-cover object-top transition-transform duration-700 hover:scale-105"
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
