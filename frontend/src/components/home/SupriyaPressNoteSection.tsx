import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import type { Post } from '@/types/cms'
import { mediaUrl } from '@/lib/media'
import { Reveal } from '../ui/Motion'

const MONTHS_MR = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
]

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatDate(dateStr?: string | null, isMr = true) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = isMr ? MONTHS_MR[d.getMonth()] : MONTHS_EN[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Press Note Section (100% Supriya Sule Layout):
 * - Light-blue background
 * - Press Note heading with red underline bar & View all link
 * - 5-column horizontal news card strip with bottom-right date badge on the image
 */
const FALLBACK_POSTS = [
  {
    id: 'f1',
    title: 'सोलापूर आणि धाराशिव जिल्ह्यातील शेतकऱ्यांच्या प्रश्नांवर रोहन देशमुख यांचे निवेदन',
    slug: 'solapur-dharashiv-farmers-statement',
    publishedAt: '2026-10-22T10:00:00.000Z',
    coverImage: '/images/portraits/rohan-deshmukh-office.webp',
  },
  {
    id: 'f2',
    title: 'लोकमंगल समूहाच्या माध्यमातून ग्रामीण युवकांसाठी रोजगार व कौशल्य विकास मेळावा',
    slug: 'lokmangal-youth-skill-fair',
    publishedAt: '2026-10-18T10:00:00.000Z',
    coverImage: '/images/portraits/rohan-deshmukh-tiranga.webp',
  },
  {
    id: 'f3',
    title: 'सहकारी साखर कारखानदारी व इथेनॉल उत्पादनास प्रोत्साहन देण्याची मागणी',
    slug: 'coop-sugar-ethanol-demand',
    publishedAt: '2026-10-14T10:00:00.000Z',
    coverImage: '/images/portraits/rohan-deshmukh-kurta.webp',
  },
  {
    id: 'f4',
    title: 'लोकमंगल फाऊंडेशनतर्फे सोलापूरमध्ये भव्य मोफत आरोग्य व नेत्रतपासणी शिबिर',
    slug: 'lokmangal-health-camp-solapur',
    publishedAt: '2026-10-09T10:00:00.000Z',
    coverImage: '/images/gallery/political/rd-political-04.webp',
  },
  {
    id: 'f5',
    title: 'तरुणांनी कृषी व नवनिर्मिती क्षेत्रात स्टार्टअप सुरू करण्याचे रोहन देशमुख यांचे आवाहन',
    slug: 'youth-startup-agri-call',
    publishedAt: '2026-10-02T10:00:00.000Z',
    coverImage: '/images/portraits/rohan-deshmukh-introduction.webp',
  },
]

export function SupriyaPressNoteSection({
  posts,
  locale = 'mr',
}: {
  posts: Post[]
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'
  const displayPosts = posts.length >= 5 ? posts.slice(0, 5) : [...posts, ...FALLBACK_POSTS.slice(posts.length, 5)]

  return (
    <section className="bg-[#f0f6fc] border-y border-stone-200/80 py-14 sm:py-18 overflow-hidden">
      <div className="container-x">
        {/* Header Row */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#000d3d]">
              {isMr ? 'ताज्या घडामोडी' : 'Press Notes'}
            </h2>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="h-1 w-14 rounded-full bg-red-600" />
              <span className="h-1 w-3 rounded-full bg-saffron-500" />
            </div>
          </div>

          <Link
            to="/blog"
            className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#000d3d] hover:text-red-600 transition-colors shrink-0"
          >
            <span>{isMr ? 'सर्व पहा' : 'View all'}</span>
            <ChevronRight className="size-4.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 5-Column News Cards (Exact 20% width grid on desktop, scroll on mobile) */}
        <Reveal delay={0.08}>
          <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {displayPosts.map((post, i) => {
              const img = (typeof post.coverImage === 'string' ? post.coverImage : mediaUrl(post.coverImage, 'card')) || '/images/gallery/political/rd-political-04.webp'
              const dateText = formatDate(post.publishedAt, isMr)

              return (
                <div key={post.id ?? i} className="w-[75vw] max-w-[270px] shrink-0 snap-center sm:w-auto sm:shrink">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col h-full bg-transparent transition-all duration-300"
                  >
                    {/* 1. Date on top of card (Supriya Sule style: mod-muted mod-small) */}
                    <div className="mb-2 text-xs font-semibold text-slate-500">
                      {dateText}
                    </div>

                    {/* 2. Image Thumbnail (height ~190px, rounded) */}
                    <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-stone-100 shadow-xs border border-stone-200/80">
                      <img
                        src={img}
                        alt={post.title}
                        loading="lazy"
                        className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* 3. Headline underneath image */}
                    <div className="pt-3 flex-1 flex flex-col justify-between">
                      <h3 className="font-display text-sm sm:text-[0.92rem] font-bold leading-snug text-[#000d3d] transition-colors group-hover:text-red-600 line-clamp-3">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
