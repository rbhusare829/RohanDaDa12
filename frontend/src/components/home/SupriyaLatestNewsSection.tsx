import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowRightCircle, ArrowUpRight } from 'lucide-react'
import type { Post } from '@/types/cms'
import { mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Reveal } from './HomeMotion'

const MONTHS_MR = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
]
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/** the post's own publishing date, or nothing (no made-up date when a post has none) */
function formatDate(dateStr?: string | null, isMr = true) {
  const dateObj = dateStr ? new Date(dateStr) : null
  if (!dateObj || isNaN(dateObj.getTime())) return ''
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = isMr ? MONTHS_MR[dateObj.getMonth()] : MONTHS_EN[dateObj.getMonth()]
  const year = dateObj.getFullYear()
  return `${day} ${month} ${year}`
}


/**
 * Latest News & Blogs Section (the crowd watermark layout of the user's screenshot, in Modern Teal + Saffron):
 * - the Cloud White page with the crowd silhouette watermark in faint Modern Teal
 * - Header with "ब्लॉग" and "View all ➔" link
 * - cards with a white photo frame, a Charcoal Black date badge and a bold Modern Teal headline below
 * Only real blog posts are shown (the PDF's notes: no placeholder update cards, no unverified claims); without any the section is left out.
 */

export function SupriyaLatestNewsSection({
  posts = [],
  locale = 'mr',
}: {
  posts?: Post[]
  locale?: 'mr' | 'en'
}) {
  const isMr = locale !== 'en'

  // Map real CMS posts
  const realItems = posts.map((p, i) => {
    const img = mediaUrl(p.coverImage, 'card') || (
      i === 0 ? '/images/gallery/political/rd-political-06.webp' :
      i === 1 ? '/images/gallery/political/rd-political-02.webp' :
      i === 2 ? '/images/gallery/political/rd-political-04.webp' :
      i === 3 ? '/images/gallery/political/rd-political-05.webp' :
      '/images/gallery/political/rd-political-03.webp'
    )
    return {
      id: String(p.id),
      title: p.title,
      date: formatDate(p.publishedAt, isMr),
      image: img,
      slug: p.slug,
    }
  })

  // every published blog post (nothing invented to fill the row)
  const displayItems = realItems
  if (!displayItems.length) return null

  return (
    <section
      className="relative py-12 sm:py-16 lg:py-20 overflow-hidden border-t border-line bg-paper"
      aria-labelledby="home-news-heading"
    >
      {/* the crowd silhouette watermark (from the reference screenshot), in faint Modern Teal */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] bg-repeat bg-center"
        style={{
          backgroundImage: "url('/images/backgrounds/social-work-pattern-teal.png')",
          backgroundSize: '1017px auto',
        }}
      />

      <div className="container-x relative z-10">
        {/* Header: Title on Left, 'View all ➔' on Right */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <Reveal>
              <h2
                id="home-news-heading"
                className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F5C63]"
              >
                {isMr ? 'ब्लॉग' : 'Blogs'}
              </h2>
              <div aria-hidden className="mt-2.5 flex items-center gap-1.5">
                <span className="h-1 w-14 rounded-full bg-gold" />
                <span className="h-1 w-3 rounded-full bg-leaf-600" />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <Link
              to="/blog"
              className="group/all inline-flex items-center gap-2 text-sm sm:text-base font-bold text-charcoal-900 hover:text-saffron-700 transition-colors"
            >
              <span>{isMr ? 'सर्व पहा' : 'View all'}</span>
              <ArrowRightCircle className="size-5 transition-transform duration-300 group-hover/all:translate-x-1 text-charcoal-900 group-hover/all:text-saffron-700" />
            </Link>
          </Reveal>
        </div>

                {/* every post in one row that moves on its own, right to left, without end (the list twice, each card with the same space after it, so the loop has no seam);
            it stops while hovered, touched or focused, and for visitors who ask for reduced motion it is a swipeable row */}
        <Reveal delay={0.15}>
          <div className="group/row -mx-6 overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0">
            <div
              className="flex w-max animate-[marquee_var(--dur)_linear_infinite] py-2 group-hover/row:[animation-play-state:paused] group-focus-within/row:[animation-play-state:paused] group-active/row:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:pl-6 lg:motion-reduce:pl-0"
              style={{ '--dur': `${displayItems.length * 7}s` } as CSSProperties}
            >
            {[...displayItems, ...displayItems].map((item, k) => (
              <div
                key={`${item.id}-${k}`}
                aria-hidden={k >= displayItems.length || undefined}
                className={cn('mr-5 w-[72vw] shrink-0 sm:mr-6 sm:w-[320px]', k >= displayItems.length && 'motion-reduce:hidden')}
              >
                <Link
                  to={`/blog/${item.slug}`}
                  tabIndex={k >= displayItems.length ? -1 : undefined}
                  className="group flex flex-col gap-3 transition-transform duration-300 hover:-translate-y-1.5"
                >
                  {/* Photo in a 3px white frame */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-[3px] border-paper shadow-md bg-cream">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Date Badge at Bottom-Right inside the Photo frame (Charcoal Black, white text) — only when the post has a date */}
                    {item.date && (
                      <div className="absolute bottom-0 right-0 z-10 bg-charcoal-950/90 backdrop-blur-sm text-paper text-[11px] sm:text-xs font-semibold px-2.5 py-1 border-t border-l border-paper/20">
                        {item.date}
                      </div>
                    )}

                    {/* Subtle hover icon overlay */}
                    <div className="absolute inset-0 grid place-items-center bg-charcoal-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
                      <span className="grid size-9 place-items-center rounded-full bg-saffron-600 text-ink shadow-md">
                        <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </div>

                  {/* Headline in bold deep navy text below the photo */}
                  <div className="pt-0.5">
                    <h3 className="font-display text-sm sm:text-[15px] font-bold leading-snug text-[#182126] group-hover:text-saffron-700 transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
