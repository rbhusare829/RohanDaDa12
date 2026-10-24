import { useEffect, useRef, useState } from 'react'
import { SocialIcon } from '../ui/SocialIcon'

type Reel = { url: string; title: string }

/** instagram.com/reel/ID/…, /p/ID/… or /user/reel/ID/… → the official embed page for that post */
function embedUrl(url: string) {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/)
  if (!m) return null
  const kind = m[1] === 'p' ? 'p' : 'reel'
  return `https://www.instagram.com/${kind}/${m[2]}/embed/`
}

/** one reel: an Instagram-coloured placeholder until it nears the screen, then Instagram's own player */
function ReelCard({ reel }: { reel: Reel }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const src = embedUrl(reel.url)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return setShow(true)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative h-[640px] overflow-hidden rounded-2xl border border-saffron-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* placeholder (also what shows if Instagram is blocked): a link to the reel */}
      <a href={reel.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream p-6 text-center text-charcoal-900">
        <SocialIcon name="instagram" className="size-10 animate-pulse text-saffron-600" />
        {reel.title && <span className="text-[0.98rem] leading-snug">{reel.title}</span>}
      </a>
      {show && src && (
        <iframe
          src={src}
          title={reel.title || 'Instagram reel'}
          loading="lazy"
          scrolling="no"
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
          className="absolute inset-0 size-full border-0 bg-white"
        />
      )}
    </div>
  )
}

/** reels side by side on wide screens; a swipeable row (one and a bit visible) on phones and tablets */
export function InstagramReels({ reels }: { reels: Reel[] }) {
  return (
    <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 py-2 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
      {reels.map((r) => (
        <div key={r.url} className="w-[min(22rem,calc(100vw-3rem))] shrink-0 snap-center md:w-auto">
          <ReelCard reel={r} />
        </div>
      ))}
    </div>
  )
}
