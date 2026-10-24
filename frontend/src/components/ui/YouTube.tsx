import { useState } from 'react'
import { Play } from 'lucide-react'
import { youtubeId } from '@/lib/utils'
import { Img } from './Img'

/** Lite YouTube embed: shows the thumbnail until clicked (keeps pages fast) */
export function YouTube({ url, title }: { url?: string | null; title?: string | null }) {
  const id = youtubeId(url)
  const [play, setPlay] = useState(false)
  if (!id) return null
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-charcoal-950">
      {play ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title ?? 'YouTube video'} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="absolute inset-0 size-full" />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label={`Play: ${title ?? 'video'}`}>
          <Img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill className="object-cover opacity-90 transition group-hover:opacity-100" />
          <span className="absolute inset-0 bg-gradient-to-t from-charcoal-950/55 to-transparent" />
          <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-btn text-white shadow-xl transition group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" />
          </span>
          {title && <span className="absolute inset-x-0 bottom-0 p-4 text-left font-semibold text-white">{title}</span>}
        </button>
      )}
    </div>
  )
}
