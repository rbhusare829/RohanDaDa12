import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { Home } from '@/types/cms'
import { YouTube } from '../ui/YouTube'
import { SocialIcon } from '../ui/SocialIcon'
import { InstagramReels } from './InstagramReels'
import { cn, youtubeId } from '@/lib/utils'
import { AccentBar } from '../ui/Motion'

type Block = NonNullable<Home['sections']>[number]
type VideoBlock = Extract<Block, { blockType: 'featuredVideo' }>
type ReelsBlock = Extract<Block, { blockType: 'socialFeeds' }>

/** our own thumbnails for featured videos, by YouTube video id (shown instead of YouTube's) */
const POSTERS: Record<string, string> = {
  FwxrbJumPzI: '/images/videos/annapurna-video-thumbnail.webp', // Annapurna Yojana
  KN_Pb_Cm8Xs: '/images/videos/milk-adulteration-thumbnail.webp', // Milk Adulteration in Maharashtra
}

/** Featured videos displayed in the section */
const FEATURED_VIDEOS = [
  {
    id: 'annapurna',
    url: 'https://youtu.be/FwxrbJumPzI',
    eyebrow: { mr: 'व्हिडिओ', en: 'Video' },
    title: { mr: 'लोकमंगल अन्नपूर्णा योजना — शेकडो आजी-आजोबांसाठी अन्नसेवेची अनोखी कहाणी', en: 'Lokmangal Annapurna Yojana: Nutritious Meals for the Elderly' },
    text: {
      mr: 'सोलापूरच्या लोकमंगल अन्नपूर्णा योजनेच्या माध्यमातून दररोज शेकडो गरजू, वृद्ध आजी-आजोबांना मिळणारे मोफत व सकस अन्न — एका कल्याणकारी विचाराची हृदयस्पर्शी कहाणी.',
      en: 'The heartwarming story of Lokmangal Annapurna Yojana serving free, dignified and nutritious daily meals to hundreds of elderly citizens in Solapur.',
    },
    button: { mr: 'YouTube वर पहा', en: 'Watch on YouTube' },
  },
  {
    id: 'milk-adulteration',
    url: 'https://www.youtube.com/watch?v=KN_Pb_Cm8Xs',
    eyebrow: { mr: 'व्हिडिओ', en: 'Video' },
    title: { mr: 'पुण्याच्या दुधात नेमकं काय मिसळतंय?', en: 'Milk Adulteration in India: Pune Milk Reality Check' },
    text: {
      mr: 'शेतकऱ्यापासून ग्राहकापर्यंत पुण्याच्या दुधाचा प्रवास — संकलन केंद्र, डेअरी कामगार, विक्रेते, ग्राहक आणि आरोग्य तज्ज्ञांशी संवाद, आणि धाराशिव जिल्ह्यातील बनावट दूध रॅकेटचा रिॲलिटी चेक.',
      en: 'Following Pune’s milk from the farmer to your home — conversations with collection centres, dairy workers, vendors, consumers and health experts, and a reality check on a synthetic-milk racket in Dharashiv district.',
    },
    button: { mr: 'YouTube वर पहा', en: 'Watch on YouTube' },
  },
]

const FALLBACK_REELS = {
  eyebrow: { mr: 'इंस्टाग्राम', en: 'Instagram' },
  title: { mr: 'रील्स', en: 'Reels' },
  reels: ['https://www.instagram.com/reel/DcoDuGQs7fB/', 'https://www.instagram.com/reel/DeMgK2oOt5i/', 'https://www.instagram.com/reel/Db0vnBzvFn0/'],
  reelTitle: { mr: 'रोहन देशमुख — रील', en: 'Rohan Deshmukh — reel' },
}

/**
 * Video & Reels (Supriya Sule layout, Oct 2026):
 * Displays featured YouTube videos in an auto-scrolling horizontal slider,
 * followed by the Instagram Reels grid.
 */
export function SupriyaVideoReelsSection({
  video,
  reels,
  locale = 'mr',
}: {
  /** null = hidden in the admin; undefined = not in the content (the fallback is shown) */
  video?: VideoBlock | null
  reels?: ReelsBlock | null
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const pick = (x: { mr: string; en: string }) => (isMr ? x.mr : x.en)

  // Build the list of videos: always show featured videos unless explicitly hidden
  const showVideos = video !== null
  const videoList = showVideos
    ? FEATURED_VIDEOS.map((item) => ({
        url: item.url,
        eyebrow: pick(item.eyebrow),
        title: pick(item.title),
        text: pick(item.text),
        buttonLabel: pick(item.button),
      }))
    : []

  const count = videoList.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hasPlayedVideo, setHasPlayedVideo] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const nextSlide = useCallback(() => {
    if (count <= 1) return
    setCurrentIndex((prev) => (prev + 1) % count)
  }, [count])

  const prevSlide = useCallback(() => {
    if (count <= 1) return
    setCurrentIndex((prev) => (prev - 1 + count) % count)
  }, [count])

  const goToSlide = useCallback((idx: number) => {
    setCurrentIndex(idx)
  }, [])

  // Auto-scrolling every 5 seconds
  useEffect(() => {
    if (count <= 1 || isPaused || hasPlayedVideo) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [count, isPaused, hasPlayedVideo, nextSlide])

  // Pause when browser tab is inactive
  useEffect(() => {
    const handleVis = () => setIsPaused(document.hidden)
    document.addEventListener('visibilitychange', handleVis)
    return () => document.removeEventListener('visibilitychange', handleVis)
  }, [])

  // Touch gesture support on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide()
      else prevSlide()
    }
    touchStartX.current = null
    setIsPaused(false)
  }

  const r =
    reels === null
      ? null
      : {
          eyebrow: reels ? reels.eyebrow : pick(FALLBACK_REELS.eyebrow),
          title: reels ? reels.heading : pick(FALLBACK_REELS.title),
          items: reels
            ? (reels.instagramPosts ?? []).map((x) => ({ url: x.url, title: x.title ?? '' }))
            : FALLBACK_REELS.reels.map((url) => ({ url, title: pick(FALLBACK_REELS.reelTitle) })),
        }

  if (!videoList.length && !r?.items.length) return null

  return (
    <section className="bg-white border-t border-stone-200 py-6 sm:py-10 lg:py-14" aria-labelledby="video-reels-title">
      <div className="container-x">
        {/* Section Heading: Only 'व्हिडिओ' (Single Title) */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 id="video-reels-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
            {isMr ? 'व्हिडिओ' : 'Video'}
          </h2>
          <AccentBar center className="mt-2.5" bar="h-1 w-16" dot="h-1.5 w-3.5" />
        </div>

        {/* Horizontal Auto-scrolling Video Slider */}
        {videoList.length > 0 && (
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Horizontal Track Container */}
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {videoList.map((item, idx) => (
                  <div key={item.url || idx} className="w-full shrink-0">
                    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition-shadow hover:shadow-md lg:grid-cols-12">
                      {/* Video Player / Thumbnail */}
                      <div className="flex items-center bg-[#000d3d] lg:col-span-7 xl:col-span-8 [&>div]:rounded-none">
                        <YouTube
                          url={item.url}
                          title={null}
                          playClassName="bg-red-600"
                          poster={POSTERS[youtubeId(item.url) ?? '']}
                          onPlay={() => setHasPlayedVideo(true)}
                        />
                      </div>

                      {/* Content Side */}
                      <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 xl:col-span-4">
                        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-red-600">
                          <SocialIcon name="youtube" className="size-4" /> {item.eyebrow}
                        </p>
                        {item.title && (
                          <h3 className="mt-2 font-display text-xl font-bold leading-snug text-[#000d3d] sm:text-2xl">
                            {item.title}
                          </h3>
                        )}
                        <AccentBar className="mt-3 mb-4" bar="h-1 w-12" dot="h-1.5 w-3" />
                        {item.text && (
                          <p className="text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">
                            {item.text}
                          </p>
                        )}
                        <div className="mt-6 flex flex-wrap gap-3">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2.5 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-[#000d3d] hover:shadow-lg hover:-translate-y-0.5"
                          >
                            {item.buttonLabel} <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Indicators (Clean Dots Only - No Arrow Buttons) */}
            {count > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {videoList.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    data-carousel-dot={i}
                    onClick={() => goToSlide(i)}
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-300',
                      currentIndex === i ? 'w-8 bg-red-600' : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                    )}
                    aria-label={`${isMr ? 'व्हिडिओ' : 'Video'} ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instagram Reels Grid */}
        {r && r.items.length > 0 && (
          <div className="mt-12 sm:mt-16 border-t border-stone-100 pt-10">
            <div className="text-center mb-6 sm:mb-10">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">{r.eyebrow}</span>
              <h3 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#000d3d]">{r.title}</h3>
              <AccentBar center className="mt-2.5" bar="h-1 w-14" dot="h-1.5 w-3" />
            </div>
            <InstagramReels reels={r.items} />
          </div>
        )}
      </div>
    </section>
  )
}
