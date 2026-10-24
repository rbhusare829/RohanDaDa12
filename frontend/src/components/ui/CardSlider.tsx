import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { Img } from './Img'
import type { Media } from '@/types/cms'

export type SlideCard = {
  href: string
  title: string
  text?: string | null
  media?: Media | number | null
  imageStyle?: CSSProperties
  meta?: string | null
}

/**
 * Card slider (photo on top, title, short text, "read more") with square arrow buttons under it —
 * 1 card on phones, 2 on tablets, 3 on desktop. Swipe or drag on touch screens.
 */
export function CardSlider({ cards, readMore, prevLabel = 'Previous', nextLabel = 'Next' }: { cards: SlideCard[]; readMore: string; prevLabel?: string; nextLabel?: string }) {
  const [ref, api] = useEmblaCarousel({ align: 'start', loop: cards.length > 3, slidesToScroll: 1 })
  const [can, setCan] = useState({ prev: false, next: true })
  const [index, setIndex] = useState(0)
  const [snaps, setSnaps] = useState(0)

  const update = useCallback(() => {
    if (!api) return
    setCan({ prev: api.canScrollPrev(), next: api.canScrollNext() })
    setIndex(api.selectedScrollSnap())
    setSnaps(api.scrollSnapList().length)
  }, [api])

  useEffect(() => {
    if (!api) return
    // the first reading happens just after the carousel has measured itself
    const first = requestAnimationFrame(update)
    api.on('select', update).on('reInit', update)
    return () => {
      cancelAnimationFrame(first)
      api.off('select', update).off('reInit', update)
    }
  }, [api, update])

  const scrollable = can.prev || can.next
  const arrow = 'btn-icon size-11 shrink-0 disabled:pointer-events-none disabled:opacity-30'

  return (
    <div className="relative">
      <div>
        <div className="min-w-0 flex-1 overflow-hidden" ref={ref}>
          {/* transition-none: Embla moves the track itself; a CSS transition on the track would make a just-cleared transform linger for a moment, and Embla would measure the slides against the wrong parent (the first card jumps by one gutter after a resize) */}
          <ul className="-ml-5 flex touch-pan-y transition-none md:-ml-7">
            {cards.map((c, i) => (
              <li key={c.href + i} className="min-w-0 shrink-0 grow-0 basis-[88%] pl-5 transition-none sm:basis-1/2 md:pl-7 lg:basis-1/3">
                <article className="tile group h-full">
                  <div className="tile-media aspect-[16/10]">
                    {c.media ? (
                      <Img media={c.media} variant="card" alt="" fill sizes="(max-width:640px) 88vw, (max-width:1024px) 45vw, 380px" className="object-cover" style={c.imageStyle} />
                    ) : (
                      // no photo yet: branded placeholder with the first letter
                      <div aria-hidden className="grid h-full place-items-center bg-gradient-to-br from-saffron-50 via-paper to-saffron-100">
                        <span className="grid size-16 place-items-center rounded-full bg-white font-display text-3xl text-saffron-600 shadow-sm ring-1 ring-saffron-100">{c.title.trim().charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="tile-body">
                    {c.meta && <p className="tile-kicker mb-1">{c.meta}</p>}
                    <h3 className="tile-title text-[1.2rem] md:text-[1.3rem]">
                      <Link to={c.href} className="after:absolute after:inset-0">{c.title}</Link>
                    </h3>
                    {c.text && <p className="tile-text line-clamp-3">{c.text}</p>}
                    <span className="more-link mt-auto pt-4 text-sm">
                      {readMore} <ArrowRight className="size-4" />
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* arrows + position under the cards, so the cards line up with the page grid */}
      {snaps > 1 && scrollable && (
        <div className="mt-8 flex items-center gap-3">
          <button type="button" onClick={() => api?.scrollPrev()} disabled={!can.prev} aria-label={prevLabel} className={arrow}><ChevronLeft className="size-5" /></button>
          <button type="button" onClick={() => api?.scrollNext()} disabled={!can.next} aria-label={nextLabel} className={arrow}><ChevronRight className="size-5" /></button>
          <span className="ml-2 text-sm tabular-nums text-muted">{index + 1} / {snaps}</span>
        </div>
      )}
    </div>
  )
}
