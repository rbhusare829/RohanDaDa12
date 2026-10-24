import { useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Several uploaded video files: a list of titles, the chosen one plays below (as on lokmangalfoundation.com) */
export function ProjectVideos({ videos, countLabel }: { videos: { url: string; title?: string | null }[]; countLabel: string }) {
  const [active, setActive] = useState(0)
  if (!videos.length) return null
  const current = videos[active] ?? videos[0]
  return (
    <div>
      {videos.length > 1 && (
        <>
          <p className="mb-3 text-sm font-semibold text-muted">{countLabel}</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {videos.map((v, i) => (
              <button
                key={v.url}
                type="button"
                aria-pressed={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-1.5 text-left text-sm font-semibold transition',
                  i === active ? 'border-btn bg-btn text-white' : 'border-field bg-white text-charcoal-900 hover:border-field-hover hover:bg-cream',
                )}
              >
                <PlayCircle aria-hidden className="size-4 shrink-0" /> {v.title || `${i + 1}`}
              </button>
            ))}
          </div>
        </>
      )}
      <video key={current.url} src={current.url} controls preload="metadata" playsInline className="aspect-video w-full rounded-2xl bg-charcoal-950">
        <track kind="captions" />
      </video>
    </div>
  )
}
