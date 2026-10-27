import { useState } from 'react'
import { Link } from 'react-router'
import { PlayCircle } from 'lucide-react'
import type { Home } from '@/types/cms'
import { AccentBar, Reveal, Stagger, StaggerItem } from '../ui/Motion'

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
      ? 'रोहन सुभाष देशमुख हे सोलापूर येथील उद्योजक, लेखक आणि समाजकार्यकर्ते आहेत. नव्या विचारांकडे सकारात्मक दृष्टिकोनातून पाहत, नावीन्यपूर्ण उपक्रम राबवण्याची आणि समाजाच्या प्रगतीत योगदान देण्याची जिद्द बाळगणारे ते एक तरुण नेतृत्व. स्वामी विवेकानंदांच्या विचारांपासून प्रेरणा घेत त्यांनी आपल्या कार्याची दिशा निश्चित केली. आत्मविश्वासू आणि स्वावलंबी तरुणाई हाच सक्षम राष्ट्राचा पाया, असा त्यांचा ठाम विश्वास आहे. युवाशक्ती, उद्योजकता आणि स्वावलंबन हे त्यांच्या कार्याचे तीन प्रमुख आधारस्तंभ असून, तरुणांनी केवळ रोजगाराच्या संधी शोधण्यापुरते मर्यादित न राहता रोजगारनिर्मिती करणारे व्हावे, हा त्यांच्या विचारांचा केंद्रबिंदू आहे.'
      : 'Rohan Subhash Deshmukh is an entrepreneur, author and social worker from Solapur. A young leader with a positive outlook, he is driven to do things differently, to turn fresh ideas into action and to contribute to society’s progress in his own way. Inspired by the thoughts of Swami Vivekananda, he has built his work around one belief: confident, self-reliant young people are the foundation of a strong nation. Youth power, enterprise and self-reliance are the three pillars of his work. His message to young people is clear: do not just look for jobs, become the ones who create them.')
  // On mobile only the first two sentences are shown; the rest appears from the sm breakpoint up
  const sentences = bio.split(/(?<=[.।])\s+/)
  const bioShort = sentences.slice(0, 2).join(' ')
  const bioRest = sentences.slice(2).join(' ')

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-28 overflow-hidden">
      <div className="container-x">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Content */}
          <Stagger className="flex flex-col items-start lg:col-span-7">
            {/* Red Eyebrow */}
            <StaggerItem as="span" className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
              {b.eyebrow || (isMr ? 'परिचय' : 'ABOUT')}
            </StaggerItem>

            {/* Heading */}
            <StaggerItem>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
                {b.heading || (isMr ? 'रोहन देशमुख' : 'Rohan Deshmukh')}
              </h2>
            </StaggerItem>

            {/* Signature Red Underline Accent Bar */}
            <AccentBar className="mt-3 mb-6" />

            {/* Bio Body Text */}
            <StaggerItem className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-700">
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
            </StaggerItem>

            {/* Large Highlighted Quote Block (Supriya Sule style) */}
            <StaggerItem className="my-7 flex items-start gap-2.5">
              <span className="font-serif text-3xl sm:text-4xl leading-none text-red-600 select-none">&ldquo;</span>
              <p className="font-display text-lg sm:text-xl lg:text-2xl font-bold leading-snug text-[#000d3d]">
                {b.pledge ||
                  (isMr
                    ? 'सर्वसामान्यांच्या हितासाठी आणि सर्वांगीण विकासासाठी कटिबद्ध'
                    : "I'm committed to the betterment of the people")}
              </p>
              <span className="font-serif text-3xl sm:text-4xl leading-none text-red-600 select-none">&rdquo;</span>
            </StaggerItem>

            {/* Vision button (opens the video) */}
            <StaggerItem className="flex w-full justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#000d3d] hover:shadow-md active:scale-95 cursor-pointer"
              >
                <PlayCircle className="size-4.5 text-white" />
                <span>{isMr ? 'दृष्टिकोन' : 'Vision'}</span>
              </button>

            </StaggerItem>
          </Stagger>

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
          <Reveal className="relative order-first flex items-center justify-center lg:order-none lg:col-span-5" delay={0.15} x={28} y={12} scale={0.97}>
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
                    src="/images/portraits/rohan-peach-kurta-namaskar.webp"
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
