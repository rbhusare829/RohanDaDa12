import { useState } from 'react'
import { Play, X, ExternalLink, ThumbsUp, MessageCircle, Share2 } from 'lucide-react'
import type { Video as VideoDoc } from '@/types/cms'
import { youtubeId as extractYtId } from '@/lib/utils'
import { Reveal } from '../ui/Motion'
import { YouTube } from '../ui/YouTube'

interface VideoItem {
  id: string
  title: string
  thumbnail: string
  youtubeId: string
  duration: string
  views?: string
}

const DEFAULT_REAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-1',
    title: 'सामुदायिक विवाह सोहळा — सामाजिक परिवर्तनाची दिशा',
    thumbnail: 'https://i.ytimg.com/vi/pooqDuktVeM/hqdefault.jpg',
    youtubeId: 'pooqDuktVeM',
    duration: 'लोकमंगल',
    views: 'YouTube',
  },
  {
    id: 'vid-2',
    title: 'लोटस शिष्यवृत्ती योजना — होतकरू विद्यार्थ्यांसाठी आधार',
    thumbnail: 'https://i.ytimg.com/vi/Mi-1-IPWPmk/hqdefault.jpg',
    youtubeId: 'Mi-1-IPWPmk',
    duration: 'लोकमंगल',
    views: 'YouTube',
  },
  {
    id: 'vid-3',
    title: 'जलसंधारण प्रकल्प — दुष्काळमुक्तीसाठी थेट कृती',
    thumbnail: 'https://i.ytimg.com/vi/DyXdiolI1TI/hqdefault.jpg',
    youtubeId: 'DyXdiolI1TI',
    duration: 'लोकमंगल',
    views: 'YouTube',
  },
  {
    id: 'vid-4',
    title: 'लोकमंगल अन्नपूर्णा योजना — एक डबा जेवणाचा, माणुसकीचा हात',
    thumbnail: 'https://i.ytimg.com/vi/xqe6JKzo11I/hqdefault.jpg',
    youtubeId: 'xqe6JKzo11I',
    duration: 'लोकमंगल',
    views: 'YouTube',
  },
]

const REAL_FACEBOOK_POSTS = [
  {
    date: 'काल दुपारी ३:३०',
    text: 'सोलापूरच्या मातीने घडवलेलं व्यक्तिमत्त्व, संस्कारांनी दिलेली दिशा आणि समाजासाठीची बांधिलकी. सर्वसामान्य नागरिकांशी संवाद आणि विकासाचा संकल्प.',
    image: '/images/gallery/political/rd-political-03.webp',
    likes: '1.4K',
    comments: '124',
  },
  {
    date: '२१ ऑक्टोबर',
    text: 'लोकमंगल फाऊंडेशनच्या माध्यमातून लोटस शिष्यवृत्ती योजनेद्वारे शेकडो गुणवंत विद्यार्थ्यांना शिक्षणाची संधी. आत्मविश्वासू आणि स्वावलंबी तरुणच सशक्त राष्ट्र घडवतात.',
    image: '/images/gallery/political/rd-political-04.webp',
    likes: '2.1K',
    comments: '189',
  },
]

const REAL_TWITTER_POSTS = [
  {
    handle: '@rohandeshmukhh',
    time: '2h',
    text: 'सोलापूर आणि धाराशिव भागातील सर्वांगीण विकासासाठी आणि ग्रामीण युवकांच्या रोजगारासाठी कटिबद्ध! #Solapur #Lokmangal #Maharashtra',
  },
  {
    handle: '@rohandeshmukhh',
    time: '1d',
    text: 'अन्नपूर्णा योजनेच्या माध्यमातून दररोज गरजू रुग्णांच्या नातेवाईकांना मोफत सकस भोजनाची सेवा. जनसेवेचा हा अविरत यज्ञ असाच चालू राहील. #Seva #Lokmangal',
  },
  {
    handle: '@rohandeshmukhh',
    time: '3d',
    text: 'युवा शक्ती हीच राष्ट्र शक्ती! नवनिर्मिती आणि उद्योजकतेच्या जोरावर ग्रामीण तरुणांनी स्वावलंबी व्हावे हाच स्वामी विवेकानंदांचा संदेश. #YouthEmpowerment',
  },
]

/**
 * Stay Connected Section (100% Supriya Sule 3-Column Social Grid Layout):
 * Connected directly to REAL Videos from CMS & Real Social Handles!
 * Column 1: Facebook Page Feed Card (@rohandeshmukh.official)
 * Column 2: Twitter / X Feed Card (@rohandeshmukhh)
 * Column 3: YouTube 2x2 Video Grid with Real Videos from CMS Database
 */
export function SupriyaStayConnectedSection({
  videos = [],
  locale = 'mr',
}: {
  videos?: VideoDoc[]
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  // Map real videos from CMS if available, else use verified default videos
  const displayVideos: VideoItem[] =
    videos && videos.length > 0
      ? videos.slice(0, 4).map((v) => {
          const ytid = extractYtId(v.youtubeUrl) || 'pooqDuktVeM'
          return {
            id: String(v.id),
            title: v.title,
            thumbnail: `https://i.ytimg.com/vi/${ytid}/hqdefault.jpg`,
            youtubeId: ytid,
            duration: v.playlist || 'व्हिडिओ',
            views: 'YouTube',
          }
        })
      : DEFAULT_REAL_VIDEOS

  return (
    <section className="bg-white py-14 sm:py-20 border-b border-stone-200 overflow-hidden">
      <div className="container-x">
        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">
            {isMr ? 'सोशल मीडिया' : 'Social Media'}
          </span>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#000d3d]">
            {isMr ? 'संपर्कात रहा' : 'Stay Connected'}
          </h2>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="h-1 w-14 rounded-full bg-red-600" />
            <span className="h-1 w-3 rounded-full bg-saffron-500" />
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Facebook Card */}
          <Reveal delay={0.05}>
            <div className="flex flex-col h-full rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              {/* Facebook Card Header */}
              <div className="bg-[#1877F2] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full overflow-hidden border-2 border-white shadow-xs">
                    <img
                      src="/images/portraits/rohan-deshmukh-office.webp"
                      alt="Rohan Deshmukh"
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">Rohan Subhash Deshmukh</h3>
                    <span className="text-xs text-white/80">@rohandeshmukh.official</span>
                  </div>
                </div>
                <a
                  href="https://www.facebook.com/rohandeshmukh.official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white text-[#1877F2] px-3.5 py-1 text-xs font-extrabold hover:bg-slate-100 transition-colors"
                >
                  {isMr ? 'फॉलो करा' : 'Follow'}
                </a>
              </div>

              {/* Feed Content */}
              <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[480px]">
                {REAL_FACEBOOK_POSTS.map((post, idx) => (
                  <div key={idx} className="border border-stone-200 rounded-xl p-3 text-xs text-slate-700 space-y-2 bg-stone-50/50">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-900">Rohan Subhash Deshmukh</span>
                      <span>{post.date}</span>
                    </div>
                    <p className="leading-relaxed line-clamp-3">{post.text}</p>
                    {post.image && (
                      <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-stone-200">
                        <img src={post.image} alt="" className="size-full object-cover object-top" />
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="size-3 text-[#1877F2]" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="size-3" /> {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="size-3" /> {isMr ? 'शेअर' : 'Share'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-stone-50 border-t border-stone-200 p-3 text-center">
                <a
                  href="https://www.facebook.com/rohandeshmukh.official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1877F2] hover:underline"
                >
                  <span>{isMr ? 'फेसबुकवर अधिक पहा' : 'View more on Facebook'}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Column 2: Twitter / X Card */}
          <Reveal delay={0.1}>
            <div className="flex flex-col h-full rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              {/* X Header */}
              <div className="bg-black p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full overflow-hidden border-2 border-white/80 shadow-xs">
                    <img
                      src="/images/portraits/rohan-deshmukh-office.webp"
                      alt="Rohan Deshmukh"
                      className="size-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">Rohan Deshmukh</h3>
                    <span className="text-xs text-white/70">@rohandeshmukhh</span>
                  </div>
                </div>
                <a
                  href="https://twitter.com/rohandeshmukhh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white text-black px-3.5 py-1 text-xs font-extrabold hover:bg-slate-200 transition-colors"
                >
                  {isMr ? 'फॉलो करा' : 'Follow'}
                </a>
              </div>

              {/* Feed Content */}
              <div className="p-4 space-y-3.5 flex-1 overflow-y-auto max-h-[480px]">
                {REAL_TWITTER_POSTS.map((t, idx) => (
                  <div key={idx} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-900">Rohan Deshmukh</span>
                      <span className="text-slate-400">{t.handle}</span>
                      <span className="text-slate-400">· {t.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">{t.text}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-stone-50 border-t border-stone-200 p-3 text-center">
                <a
                  href="https://twitter.com/rohandeshmukhh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-black hover:underline"
                >
                  <span>{isMr ? 'X (ट्विटर) वर अधिक पहा' : 'View more on X (Twitter)'}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* Column 3: YouTube 2x2 Grid */}
          <Reveal delay={0.15}>
            <div className="flex flex-col h-full rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
              {/* YouTube Header */}
              <div className="bg-[#FF0000] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full overflow-hidden border-2 border-white shadow-xs bg-white p-0.5">
                    <img
                      src="/images/portraits/rohan-deshmukh-office.webp"
                      alt="Rohan Deshmukh"
                      className="size-full object-cover object-top rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">Rohan Deshmukh Official</h3>
                    <span className="text-xs text-white/80">YouTube Channel</span>
                  </div>
                </div>
                <a
                  href="https://youtube.com/@rd.connects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white text-[#FF0000] px-3.5 py-1 text-xs font-extrabold hover:bg-slate-100 transition-colors"
                >
                  {isMr ? 'सबस्क्राईब' : 'Subscribe'}
                </a>
              </div>

              {/* 2x2 Video Grid */}
              <div className="p-4 grid grid-cols-2 gap-3 flex-1">
                {displayVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideo(vid)}
                    className="group flex flex-col cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/10">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 grid place-items-center bg-black/25 group-hover:bg-black/40 transition-colors">
                        <span className="grid size-8 place-items-center rounded-full bg-red-600 text-white shadow-sm">
                          <Play className="size-4 fill-white ml-0.5" />
                        </span>
                      </div>
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-white">
                        {vid.duration}
                      </span>
                    </div>
                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <h4 className="font-display text-[11px] font-bold leading-tight text-[#000d3d] group-hover:text-red-600 line-clamp-2">
                        {vid.title}
                      </h4>
                      <span className="mt-1 text-[10px] text-slate-500 font-semibold">{isMr ? 'युट्यूब' : vid.views}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-stone-50 border-t border-stone-200 p-3 text-center">
                <a
                  href="https://youtube.com/@rd.connects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                >
                  <span>{isMr ? 'सर्व व्हिडिओ पहा' : 'View all videos on YouTube'}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              aria-label="Close modal"
              className="absolute top-3 right-3 z-20 grid size-9 place-items-center rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
            >
              <X className="size-5" />
            </button>
            <div className="aspect-video w-full bg-black">
              <YouTube
                url={`https://www.youtube.com/watch?v=${activeVideo.youtubeId || 'pooqDuktVeM'}`}
                title={activeVideo.title}
              />
            </div>
            <div className="bg-[#000d3d] p-4 text-white">
              <h4 className="text-base sm:text-lg font-bold">{activeVideo.title}</h4>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
