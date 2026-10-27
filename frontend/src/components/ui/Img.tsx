import { useCallback, type ImgHTMLAttributes } from 'react'
import { isMedia, mediaUrl, srcSetOf, type MaybeMedia, type Variant } from '@/lib/media'
import { cn } from '@/lib/utils'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
  /** an uploaded photo: its smaller copies become the srcset, its size the width / height */
  media?: MaybeMedia
  /** or a plain address (the website's own images in /images) */
  src?: string | null
  /** which copy to use as the default address (the browser still picks from the srcset using `sizes`) */
  variant?: Variant
  /** fill the parent (which must be `relative`), like a background */
  fill?: boolean
  /** above the fold: load now, with high priority */
  priority?: boolean
  width?: number
  height?: number
}

/**
 * A photo. Photos that come from the CMS get a `srcset` of every copy that exists, so a phone downloads the 480px copy
 * and a wide screen the 1920px one; `sizes` tells the browser how wide the photo is shown.
 * A photo that has to be fetched fades in when it arrives (index.css, `data-rd-img`) instead of popping in; one that is already there
 * (cached) or that is the first thing on the page (`priority`) shows at once. A photo that fails to load is shown as the browser shows it
 * (alt text), never left invisible.
 */
export function Img({ media, src, variant, fill, priority, className, style, alt = '', sizes, width, height, onLoad, onError, ...rest }: Props) {
  const m = isMedia(media) ? media : null
  const url = src ?? mediaUrl(m, variant)
  const settled = useCallback(
    (el: HTMLImageElement | null) => {
      if (el && (priority || el.complete)) el.dataset.ready = '1'
    },
    [priority],
  )
  if (!url) return null
  const srcSet = m ? srcSetOf(m) : undefined
  const dims = fill ? {} : { width: width ?? m?.width ?? undefined, height: height ?? m?.height ?? undefined }
  return (
    <img
      ref={settled}
      data-rd-img=""
      src={url}
      srcSet={srcSet}
      sizes={srcSet ? (sizes ?? '100vw') : undefined}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={cn(fill && 'absolute inset-0 size-full', className)}
      style={style}
      onLoad={(e) => {
        if (!e.currentTarget.dataset.ready) e.currentTarget.dataset.ready = 'fade'
        onLoad?.(e)
      }}
      onError={(e) => {
        e.currentTarget.dataset.ready = '1'
        onError?.(e)
      }}
      {...dims}
      {...rest}
    />
  )
}
