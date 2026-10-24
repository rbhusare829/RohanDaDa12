import { useEffect, useState } from 'react'
import { admin, type Doc } from '../api'

/** Documents (photos, PDFs, related items) the forms have already shown, so a field does not flash while it looks them up */
const known = new Map<string, Doc>()
const key = (slug: string, id: number) => `${slug}:${id}`

export const rememberDocs = (slug: string, docs: Doc[]) => docs.forEach((d) => known.set(key(slug, d.id), d))
export const forgetDoc = (slug: string, id: number) => known.delete(key(slug, id))

/** The documents with these ids (in the same order), fetched when not known yet */
export function useDocs(slug: string, ids: number[]): Doc[] {
  const [, setVersion] = useState(0)
  const wanted = ids.join(',')

  useEffect(() => {
    const missing = ids.filter((id) => !known.has(key(slug, id)))
    if (!missing.length) return
    let live = true
    admin
      .find(slug, { where: { id: { in: missing } }, limit: missing.length, depth: 0 })
      .then((res) => {
        rememberDocs(slug, res.docs)
        if (live) setVersion((v) => v + 1)
      })
      .catch(() => {})
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, wanted])

  return ids.map((id) => known.get(key(slug, id))).filter((d): d is Doc => Boolean(d))
}

type MediaDoc = Doc & { url?: string; thumbnailURL?: string; filename?: string; alt?: unknown; width?: number; height?: number; filesize?: number; focalX?: number; focalY?: number; sizes?: Record<string, { url?: string | null }> }

/** Small preview address of a photo */
export const thumbOf = (m: MediaDoc) => m.sizes?.thumb?.url || m.thumbnailURL || m.url || null

export type { MediaDoc }
