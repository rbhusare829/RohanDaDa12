import { ArrowUpRight } from 'lucide-react'
import type { Home } from '@/types/cms'
// import { useLayout } from '@/lib/layout'
import { Reveal } from '../ui/Motion'
import { YouTube } from '../ui/YouTube'
import { SocialIcon } from '../ui/SocialIcon'
import { InstagramReels } from './InstagramReels'

type Block = NonNullable<Home['sections']>[number]
type VideoBlock = Extract<Block, { blockType: 'featuredVideo' }>
type ReelsBlock = Extract<Block, { blockType: 'socialFeeds' }>

/** the same video and reels as the main website, for when the homepage content has no such section */
const FALLBACK = {
  youtubeUrl: 'https://www.youtube.com/watch?v=KN_Pb_Cm8Xs',
  videoEyebrow: { mr: 'व्हिडिओ', en: 'Video' },
  videoTitle: { mr: 'पुण्याच्या दुधात नेमकं काय मिसळतंय?', en: 'Milk Adulteration in India: Pune Milk Reality Check' },
  videoText: {
    mr: 'शेतकऱ्यापासून ग्राहकापर्यंत पुण्याच्या दुधाचा प्रवास — संकलन केंद्र, डेअरी कामगार, विक्रेते, ग्राहक आणि आरोग्य तज्ज्ञांशी संवाद, आणि धाराशिव जिल्ह्यातील बनावट दूध रॅकेटचा रिॲलिटी चेक.',
    en: 'Following Pune’s milk from the farmer to your home — conversations with collection centres, dairy workers, vendors, consumers and health experts, and a reality check on a synthetic-milk racket in Dharashiv district.',
  },
  videoButton: { mr: 'YouTube वर पहा', en: 'Watch on YouTube' },
  videoButtonUrl: 'https://youtu.be/KN_Pb_Cm8Xs',
  reelsEyebrow: { mr: 'इंस्टाग्राम', en: 'Instagram' },
  reelsTitle: { mr: 'रील्स', en: 'Reels' },
  reels: ['https://www.instagram.com/reel/DcoDuGQs7fB/', 'https://www.instagram.com/reel/DeMgK2oOt5i/', 'https://www.instagram.com/reel/Db0vnBzvFn0/'],
  reelTitle: { mr: 'रोहन देशमुख — रील', en: 'Rohan Deshmukh — reel' },
}

/**
 * Video & Reels (Supriya Sule layout, Oct 2026), below Social Activities — the "Video" and "Reels" sections of the main website in one:
 * the centred homepage header (red label, navy title, red and saffron bars), then the featured YouTube video in a white card with its
 * title, a few lines and "Watch on YouTube", then the Instagram reels. The video and reels come from the homepage content
 * (Home → "Featured video" and "Social feeds" in the admin); a part hidden there is not shown, and a part missing from the content
 * falls back to the main website's video and reels.
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
  // const { settings } = useLayout()

  const v =
    video === null
      ? null
      : {
          url: video?.youtubeUrl || FALLBACK.youtubeUrl,
          eyebrow: video ? video.eyebrow : pick(FALLBACK.videoEyebrow),
          title: video ? video.heading : pick(FALLBACK.videoTitle),
          text: video ? video.text : pick(FALLBACK.videoText),
          links: video ? (video.links ?? []) : [{ id: 'yt', label: pick(FALLBACK.videoButton), url: FALLBACK.videoButtonUrl, newTab: true }],
        }
  const r =
    reels === null
      ? null
      : {
          eyebrow: reels ? reels.eyebrow : pick(FALLBACK.reelsEyebrow),
          title: reels ? reels.heading : pick(FALLBACK.reelsTitle),
          items: reels
            ? (reels.instagramPosts ?? []).map((x) => ({ url: x.url, title: x.title ?? '' }))
            : FALLBACK.reels.map((url) => ({ url, title: pick(FALLBACK.reelTitle) })),
        }
  if (!v && !r?.items.length) return null

  return (
    <section className="bg-white border-t border-stone-200 py-16 sm:py-24" aria-labelledby="video-reels-title">
      <div className="container-x">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">{isMr ? 'व्हिडिओ' : 'Video'}</span>
          <h2 id="video-reels-title" className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
            {isMr ? 'भारतातील दुधात भेसळ' : 'Milk Adulteration in India'}
          </h2>
          <div className="mt-2.5 mb-4 flex justify-center items-center gap-1.5">
            <span className="h-1 w-14 rounded-full bg-red-600" />
            <span className="h-1 w-3 rounded-full bg-saffron-500" />
          </div>
        </div>

        {/* the featured video: player on the left (navy), its title, a few lines and the YouTube button on the right */}
        {v && (
          <Reveal className="grid grid-cols-1 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm lg:grid-cols-12">
            <div className="flex items-center bg-[#000d3d] lg:col-span-8 [&>div]:rounded-none">
              <YouTube url={v.url} title={null} playClassName="bg-red-600" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-4">
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-red-600">
                <SocialIcon name="youtube" className="size-4" /> {v.eyebrow || (isMr ? 'व्हिडिओ' : 'Video')}
              </p>
              {v.title && <h3 className="mt-2 font-display text-xl font-bold leading-snug text-[#000d3d] sm:text-2xl">{v.title}</h3>}
              <div className="mt-3 mb-4 flex items-center gap-1.5">
                <span className="h-1 w-10 rounded-full bg-red-600" />
                <span className="h-1 w-3 rounded-full bg-saffron-500" />
              </div>
              {v.text && <p className="text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">{v.text}</p>}
              {v.links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3 max-md:justify-center">
                  {v.links.map((l, i) => (
                    <a
                      key={l.id ?? i}
                      href={l.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        i === 0
                          ? 'inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#000d3d]'
                          : 'inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-bold text-[#000d3d] transition-colors hover:border-red-500 hover:text-red-600'
                      }
                    >
                      {l.label} <ArrowUpRight aria-hidden className="size-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* the reels */}
        {r && r.items.length > 0 && (
          <div className={v ? 'mt-14 sm:mt-16' : ''}>
            {/* centred, with the same red and saffron line under "Reels" as under the section title */}
            <div className="mb-8 flex flex-col items-center text-center sm:mb-10">
              <p className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest text-red-600">
                <SocialIcon name="instagram" className="size-4" /> {r.eyebrow || 'Instagram'}
              </p>
              {r.title && <h3 className="mt-1 font-display text-2xl font-bold text-[#000d3d] sm:text-3xl">{r.title}</h3>}
              <div className="mt-2.5 flex items-center justify-center gap-1.5">
                <span className="h-1 w-14 rounded-full bg-red-600" />
                <span className="h-1 w-3 rounded-full bg-saffron-500" />
              </div>
            </div>
            <Reveal>
              <InstagramReels reels={r.items} />
            </Reveal>
          </div>
        )}
      </div>
    </section>
  )
}
