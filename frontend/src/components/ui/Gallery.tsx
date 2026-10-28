import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Expand } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryImage } from '@/lib/media'
import { Img } from './Img'

const Lightbox = lazy(() => import('./Lightbox'))

/** how many masonry columns fit (2 on phones, 3 from md, 4 from lg, 5 from xl when `wide`) — matches Tailwind's breakpoints */
function useColumns(wide: boolean) {
  const count = () => {
    if (typeof window === 'undefined') return 2
    const w = window.innerWidth
    return wide && w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : 2
  }
  const [cols, setCols] = useState(count)
  useEffect(() => {
    const onResize = () => setCols(count())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })
  return cols
}

/**
 * A grid or masonry of photos; a click opens the full-size photo in a lightbox with zoom and captions.
 * The masonry fills row by row (photo 1, 2, 3… across the top), so the album's first photos are the ones seen first.
 */
export function Gallery({ images, layout = 'grid', wide = false, className }: { images: GalleryImage[]; layout?: 'grid' | 'masonry'; wide?: boolean; className?: string }) {
  const [index, setIndex] = useState(-1)
  const cols = useColumns(wide)
  if (!images.length) return null
  const tiles = images.map((img, i) => (
    <button
      key={img.src + i}
      type="button"
      onClick={() => setIndex(i)}
      className={cn('group relative block w-full overflow-hidden rounded-xl bg-cream shadow-sm ring-1 ring-stone-200/60 transition-shadow duration-300 hover:shadow-lg hover:ring-saffron-400/60', layout === 'grid' && 'aspect-[4/3]')}
      aria-label={img.alt || `Photo ${i + 1}`}
    >
      {layout === 'grid' ? (
        <Img
          media={img.media}
          src={img.media ? undefined : img.thumb}
          variant="card"
          alt={img.alt}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          style={{ objectPosition: img.width && img.height && img.height > img.width * 1.1 ? '50% 22%' : '50% 50%' }}
        />
      ) : (
        <Img
          media={img.media}
          src={img.media ? undefined : img.thumb}
          variant="card"
          alt={img.alt}
          width={img.width || 800}
          height={img.height || 600}
          sizes="(max-width:768px) 50vw, 25vw"
          className="h-auto w-full transition duration-500 group-hover:scale-105"
        />
      )}
      {/* hover: a navy wash with an orange zoom button (and the caption, when there is one) */}
      <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-charcoal-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-saffron-500 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
        <Expand className="size-5" />
      </span>
      {img.caption && (
        <span className="absolute inset-x-0 bottom-0 p-3 text-left text-sm text-white opacity-0 transition group-hover:opacity-100">{img.caption}</span>
      )}
    </button>
  ))
  // masonry: photo i goes to column i % cols, so the first row reads 1, 2, 3… left to right
  const columns: ReactNode[][] = Array.from({ length: cols }, () => [])
  tiles.forEach((tile, i) => columns[i % cols].push(tile))
  return (
    <>
      {layout === 'masonry' ? (
        <div className={cn('flex items-start gap-3', className)}>
          {columns.map((col, c) => (
            <div key={c} className="flex min-w-0 flex-1 flex-col gap-3">
              {col}
            </div>
          ))}
        </div>
      ) : (
        <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4', className)}>{tiles}</div>
      )}
      {index >= 0 && (
        <Suspense fallback={null}>
          <Lightbox slides={images.map((i) => ({ src: i.src, alt: i.alt, title: i.caption ?? undefined }))} index={index} onClose={() => setIndex(-1)} />
        </Suspense>
      )}
    </>
  )
}
