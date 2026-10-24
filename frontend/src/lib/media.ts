import type { CSSProperties } from 'react'
import type { Media } from '@/types/cms'

export type MaybeMedia = number | Media | null | undefined
export type Variant = 'thumb' | 'card' | 'hero'

export const isMedia = (m: MaybeMedia): m is Media => Boolean(m) && typeof m === 'object'

/** URL of a photo: a smaller copy when asked for one (and it exists — small photos have no larger copies), else the original */
export const mediaUrl = (m: MaybeMedia, size?: Variant): string | null => {
  if (!isMedia(m)) return null
  const sized = size ? m.sizes?.[size]?.url : null
  return sized || m.url || null
}

/**
 * Where a cropped (object-fit: cover) photo is anchored: the focal point chosen in the admin,
 * or — for portrait photos without one — the upper part, so faces are not cut off.
 */
export const mediaPosition = (m: MaybeMedia): string => {
  if (!isMedia(m)) return '50% 20%'
  const fx = m.focalX ?? 50
  const fy = m.focalY ?? 50
  const portrait = Boolean(m.width && m.height && m.height > m.width * 1.1)
  return `${fx}% ${portrait && fy === 50 ? 20 : fy === 50 ? 22 : fy}%`
}

/**
 * Style for a photo filling a box of the given width/height ratio.
 * Normally crops (cover) around the focal point; when the box would cut away more than
 * `maxCrop` of the photo (e.g. a tall book cover in a wide card) the whole photo is shown instead.
 */
export const photoFit = (m: MaybeMedia, boxRatio?: number, maxCrop = 0.5): CSSProperties => {
  if (isMedia(m) && boxRatio && m.width && m.height) {
    const r = m.width / m.height
    if (1 - Math.min(r / boxRatio, boxRatio / r) > maxCrop) return { objectFit: 'contain', objectPosition: '50% 50%' }
  }
  return { objectFit: 'cover', objectPosition: mediaPosition(m) }
}

/** Natural pixel size of an uploaded photo (falls back to 4:3) */
export const mediaSize = (m: MaybeMedia): { width: number; height: number } =>
  isMedia(m) && m.width && m.height ? { width: m.width, height: m.height } : { width: 1200, height: 900 }

export const mediaAlt = (m: MaybeMedia, fallback = ''): string => (isMedia(m) && (m.alt || m.caption)) || fallback

/**
 * `srcset` of every copy of a photo that exists (480 / 960 / 1920 px wide, plus the original) so the browser
 * downloads the smallest one that is sharp enough for the space the photo fills.
 */
export function srcSetOf(m: MaybeMedia): string | undefined {
  if (!isMedia(m)) return undefined
  const list: { url: string; w: number }[] = []
  for (const v of ['thumb', 'card', 'hero'] as const) {
    const s = m.sizes?.[v]
    if (s?.url && s.width) list.push({ url: s.url, w: s.width })
  }
  if (m.url && m.width) list.push({ url: m.url, w: m.width })
  const seen = new Set<string>()
  const unique = list.filter((x) => !seen.has(x.url) && seen.add(x.url)).sort((a, b) => a.w - b.w)
  return unique.length > 1 ? unique.map((x) => `${x.url} ${x.w}w`).join(', ') : undefined
}

/** A photo (or just a URL) in the shape the lightbox gallery uses */
export type GalleryImage = { src: string; thumb: string; alt: string; caption?: string | null; width?: number | null; height?: number | null; media?: Media }

export const toGallery = (items: (number | Media | null | undefined)[] | null | undefined, fallbackAlt = ''): GalleryImage[] =>
  (items ?? [])
    .filter((m): m is Media => isMedia(m) && Boolean(m.url))
    .map((m) => ({
      src: mediaUrl(m, 'hero')!,
      thumb: mediaUrl(m, 'card')!,
      alt: mediaAlt(m, fallbackAlt),
      caption: m.caption,
      width: m.width,
      height: m.height,
      media: m,
    }))
