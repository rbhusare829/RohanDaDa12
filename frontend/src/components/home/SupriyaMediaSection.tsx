import { useState } from 'react'
import { Link } from 'react-router'
import { Play, ChevronRight, Video } from 'lucide-react'
import type { Video as VideoDoc } from '@/types/cms'
import { YouTube } from '../ui/YouTube'
import { Reveal } from '../ui/Motion'

const SAMPLE_SPEECHES = [
  {
    title: 'युवा सक्षमीकरण आणि स्टार्टअप परिसंस्था यावर रोहन देशमुख यांचे मार्गदर्शन',
    duration: '8:45',
    youtubeId: 'p3E7W2g6iZ8',
    date: '2026-10-15',
    thumbnail: '/images/portraits/rohan-executive-desk.webp',
  },
  {
    title: 'सहकार क्षेत्रातील नवीन आव्हाने आणि लोकमंगल बँकेचे योगदान',
    duration: '12:20',
    youtubeId: 'kJQP7kiw5Fk',
    date: '2026-10-02',
    thumbnail: '/images/portraits/rohan-flag-tiranga.webp',
  },
  {
    title: 'शेतकरी समृद्धी आणि ग्रामीण भागातील रोजगार निर्मिती विषयी सविस्तर संवाद',
    duration: '6:30',
    youtubeId: 'fJ9rUzIMcZQ',
    date: '2026-09-24',
    thumbnail: '/images/portraits/rohan-blue-suit-magazine.webp',
  },
]

const LATEST_NEWS_ITEMS = [
  {
    source: 'ABP Majha',
    title: 'सोलापूरच्या विकासासाठी आणि शेतकऱ्यांच्या हितासाठी रोहन देशमुख यांची आक्रमक भूमिका',
    date: '22 October 2026',
    isLive: true,
    image: '/images/portraits/rohan-executive-desk.webp',
  },
  {
    source: 'Zee 24 Taas',
    title: 'लोकमंगल समूहाच्या माध्यमातून हजारो युवकांना रोजगाराच्या संधी: पत्रकार परिषदेत माहिती',
    date: '20 October 2026',
    isLive: false,
    image: '/images/portraits/rohan-flag-tiranga.webp',
  },
  {
    source: 'Lokmat',
    title: 'ग्रामीण भागात शिक्षण आणि आरोग्य सेवांचा विस्तार करणार: रोहन देशमुख',
    date: '18 October 2026',
    isLive: false,
    image: '/images/portraits/rohan-blue-suit-smile.webp',
  },
  {
    source: 'Sakal',
    title: 'स्टार्टअप आणि नवनिर्मितीला चालना देण्यासाठी राज्यस्तरीय परिषद उत्साहात',
    date: '15 October 2026',
    isLive: false,
    image: '/images/gallery/political/rd-political-06.webp',
  },
]

/**
 * Latest News & Video Speeches Section (100% Supriya Sule Layout):
 * - Latest News grid with LIVE badge and play thumbnail
 * - Speeches & Interviews player with playlist on right
 */
export function SupriyaMediaSection({
  videos: _videos = [],
  locale = 'mr',
}: {
  videos?: VideoDoc[]
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_SPEECHES[0])

  return (
    <div className="space-y-16 py-16 sm:py-20 bg-white">
      {/* 1. Latest News (Supriya Sule style) */}
      <section className="container-x">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#000d3d]">
              {isMr ? 'ताज्या बातम्या (Latest News)' : 'Latest News'}
            </h2>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>
          </div>

          <Link
            to="/blog"
            className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#000d3d] hover:text-red-600 transition-colors"
          >
            <span>{isMr ? 'सर्व पहा' : 'View all'}</span>
            <ChevronRight className="size-4.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LATEST_NEWS_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="group flex flex-col h-full overflow-hidden rounded-xl bg-white border border-stone-200 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* LIVE Badge if active */}
                  {item.isLive && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                      <span className="size-1.5 rounded-full bg-white animate-ping" />
                      <span>LIVE</span>
                    </div>
                  )}

                  {/* Play icon overlay */}
                  <div className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="grid size-11 place-items-center rounded-full bg-red-600 text-white shadow-md">
                      <Play className="size-5 fill-white ml-0.5" />
                    </span>
                  </div>

                  {/* Date Badge */}
                  <div className="absolute bottom-2 right-2 rounded bg-[#000d3d]/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                    {item.date}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">
                      [{item.source}]
                    </span>
                    <h3 className="mt-1 font-display text-sm sm:text-[0.95rem] font-bold leading-snug text-[#000d3d] group-hover:text-red-600 transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 2. Video Gallery & Speeches (Supriya Sule style) */}
      <section className="bg-[#f8fafc] border-t border-stone-200 py-16">
        <div className="container-x">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Video className="size-5 text-red-600" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                {isMr ? 'व्हिडिओ गॅलरी' : 'Video Gallery'}
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#000d3d]">
              {isMr ? 'भाषणे, मुलाखती व संवाद' : 'Speeches & Media'}
            </h2>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Featured Video Player */}
            <div className="lg:col-span-8 overflow-hidden rounded-2xl bg-black shadow-xl">
              <div className="aspect-video w-full">
                <YouTube url={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`} title={selectedVideo.title} />
              </div>
              <div className="bg-[#000d3d] p-5 text-white">
                <span className="text-xs font-semibold text-saffron-400">
                  {selectedVideo.date}
                </span>
                <h3 className="mt-1 font-display text-lg sm:text-xl font-bold">
                  {selectedVideo.title}
                </h3>
              </div>
            </div>

            {/* Playlist on the Right (Supriya Sule style) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-700 px-1">
                {isMr ? 'इतर भाषणे' : 'More Speeches'}
              </h4>
              <div className="space-y-3">
                {SAMPLE_SPEECHES.map((v, idx) => {
                  const isSelected = selectedVideo.youtubeId === v.youtubeId
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVideo(v)}
                      className={`group flex items-start gap-3 w-full p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-white border-red-500 ring-2 ring-red-500/20 shadow-md'
                          : 'bg-white/80 border-stone-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        <img src={v.thumbnail} alt={v.title} className="size-full object-cover object-top" />
                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {v.duration}
                        </span>
                        <div className="absolute inset-0 grid place-items-center bg-black/20 group-hover:bg-black/40 transition-colors">
                          <Play className="size-4 fill-white text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-display text-xs sm:text-sm font-bold leading-snug text-[#000d3d] group-hover:text-red-600 transition-colors line-clamp-2">
                          {v.title}
                        </h5>
                        <span className="mt-1 block text-[11px] text-slate-500">
                          {v.date}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
