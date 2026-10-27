import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Post } from '@/types/cms'
import { mediaUrl } from '@/lib/media'
import { AccentBar, Reveal } from '../ui/Motion'

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

const SOURCES = ['माध्यम वार्ता', 'सोलापूर विशेष', 'लोकमंगल वार्ता', 'धोरण व विचार', 'कृषी व सहकार']

/**
 * Latest News Section (100% Supriya Sule 5-Column Grid Layout):
 * Connected directly to REAL CMS POSTS & ARTICLES!
 * - Heading with signature red & saffron accent line
 * - Every post the homepage loads (the latest 20), moving continuously from right to left in one endless row (Oct 2026: no
 *   "View all" link). The row is drawn twice so the loop never shows a gap (the copy is hidden from screen readers and the keyboard);
 *   it pauses while the pointer is over it or a card has keyboard focus, and for visitors who ask for less motion it stands still
 *   and scrolls sideways by hand instead
 * - Each card: Media tag, real published date badge, LIVE indicator on first item, real cover image & headline
 */
export function SupriyaLatestNewsSection({
  posts = [],
  locale = 'mr',
}: {
  posts?: Post[]
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  // every real post from the CMS (the homepage loads the latest 20)
  const displayItems = posts.map((p, i) => {
    const rawCat = p.categories?.[0]
    const catName = typeof rawCat === 'object' && rawCat !== null ? (rawCat as { title?: string }).title : null
    // the admin's tags are typed in Marathi: on the English site a Marathi tag gives way to the category or "Media Update"
    const rawTag = (p.tags?.[0] as string) || catName
    const tag = (isMr ? rawTag : rawTag && !/[\u0900-\u097F]/.test(rawTag) ? rawTag : null) || (isMr ? SOURCES[i % SOURCES.length] : 'Media Update')
    const img = mediaUrl(p.coverImage, 'card') || (
      i === 0 ? '/images/gallery/political/rd-political-06.webp' :
      i === 1 ? '/images/gallery/political/rd-political-02.webp' :
      i === 2 ? '/images/gallery/political/rd-political-04.webp' :
      i === 3 ? '/images/gallery/political/rd-political-05.webp' :
      '/images/gallery/political/rd-political-03.webp'
    )
    return {
      id: String(p.id),
      source: tag,
      title: p.title,
      date: formatDate(p.publishedAt, isMr),
      isLive: i === 0,
      image: img,
      slug: p.slug,
    }
  })

  if (!displayItems.length) return null

  return (
    <section className="bg-white py-14 sm:py-20 border-b border-stone-200 overflow-hidden">
      <div className="container-x">
        {/* Header */}
        <Reveal className="mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">
              {isMr ? 'माध्यम वार्तांकन' : 'Media Coverage'}
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#000d3d]">
              {isMr ? 'ब्लॉग' : 'Blogs'}
            </h2>
            <AccentBar className="mt-2.5" />
          </div>
        </Reveal>

        {/* the endless row: two copies side by side, moved left by one copy's width (-50%) and back to the start, over and over */}
        <Reveal delay={0.08}>
          <div className="group/row relative -mx-4 overflow-hidden px-4 py-2 [mask-image:linear-gradient(to_right,transparent,#000_3%,#000_97%,transparent)] sm:mx-0 sm:px-0 motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
            <div
              className="flex w-max animate-[marquee_var(--marquee-duration)_linear_infinite] group-hover/row:[animation-play-state:paused] group-focus-within/row:[animation-play-state:paused] motion-reduce:animate-none"
              style={{ '--marquee-duration': `${Math.max(displayItems.length * 6, 24)}s` } as CSSProperties}
            >
              {[false, true].map((copy) =>
                displayItems.map((item) => (
                  <div
                    key={`${copy ? 'b' : 'a'}-${item.id}`}
                    aria-hidden={copy || undefined}
                    className={`w-[240px] shrink-0 pr-4 sm:w-[256px] lg:w-[264px]${copy ? ' motion-reduce:hidden' : ''}`}
                  >
                    <Link
                      to={`/blog/${item.slug}`}
                      tabIndex={copy ? -1 : undefined}
                      className="group flex flex-col h-full overflow-hidden rounded-xl bg-white border border-stone-200 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
                    >
                      {/* Image & Badges */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* LIVE Badge on First News Item */}
                        {item.isLive && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                            <span className="size-1.5 rounded-full bg-white animate-ping" />
                            <span>LIVE</span>
                          </div>
                        )}

                        {/* Hover Arrow Overlay */}
                        <div className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="grid size-10 place-items-center rounded-full bg-red-600 text-white shadow-md">
                            <ArrowUpRight className="size-5" />
                          </span>
                        </div>

                        {/* Date Badge */}
                        <div className="absolute bottom-2 right-2 rounded bg-[#000d3d]/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                          {item.date}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">
                            [{item.source}]
                          </span>
                          <h3 className="mt-1 font-display text-xs sm:text-[13px] font-bold leading-snug text-[#000d3d] group-hover:text-red-600 transition-colors line-clamp-3">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </div>
                )),
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
