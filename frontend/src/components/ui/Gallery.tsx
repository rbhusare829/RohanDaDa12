import { lazy, Suspense, useState } from 'react'
import { Expand } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GalleryImage } from '@/lib/media'
import { Img } from './Img'
import { Reveal } from './Motion'

const Lightbox = lazy(() => import('./Lightbox'))

/** A grid or masonry of photos; a click opens the full-size photo in a lightbox with zoom and captions */
export function Gallery({ images, layout = 'grid', wide = false, className }: { images: GalleryImage[]; layout?: 'grid' | 'masonry'; wide?: boolean; className?: string }) {
  const [index, setIndex] = useState(-1)
  if (!images.length) return null
  return (
    <>
      <div className={cn(layout === 'masonry' ? (wide ? 'columns-2 gap-3 md:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-3 [&>*]:break-inside-avoid' : 'columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3 [&>*]:break-inside-avoid') : 'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4', className)}>
        {images.map((img, i) => (
          /* each photo settles in when it scrolls into view; photos of one row follow each other by 60 ms */
          <Reveal key={img.src + i} y={18} scale={0.97} delay={(i % 4) * 0.06}>
          <button
            type="button"
            onClick={() => setIndex(i)}
            className={cn('group relative block w-full overflow-hidden rounded-xl bg-cream shadow-sm ring-1 ring-stone-200/60 transition-[box-shadow,scale] duration-300 ease-soft hover:shadow-lg hover:ring-saffron-400/60 active:scale-[0.985]', layout === 'grid' && 'aspect-[4/3]')}
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
          </Reveal>
        ))}
      </div>
      {index >= 0 && (
        <Suspense fallback={null}>
          <Lightbox slides={images.map((i) => ({ src: i.src, alt: i.alt, title: i.caption ?? undefined }))} index={index} onClose={() => setIndex(-1)} />
        </Suspense>
      )}
    </>
  )
}
