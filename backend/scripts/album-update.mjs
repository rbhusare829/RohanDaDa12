/**
 * Updates the photo albums (Oct 2026) in a database that already has content. A fresh database gets the same albums from the seed.
 *   - ADD: new photos (the file in scripts/assets goes into the Media library once, then into the album)
 *   - ALBUMS: photos to take out — "कौटुंबिक क्षण / Family Moments" (/media/photos/family-moments): 16 photos;
 *     "राजकीय क्षण / Political Moments" (/media/photos/political-moments): 7 photos
 *   - REPLACE: a photo swapped for a new one in the same place (Political Moments: the group photo with Ajit Pawar → the close-up
 *     of Rohan and Ajit Pawar cut from it)
 *   - FIRST: photos to show first, in that order (Family Moments opens with Rohan and his mother, then Rohan with his father; Political Moments with the evening
 *     speech, then the photos with Narendra Modi, Devendra Fadnavis and Uddhav Thackeray, then the other leaders); the rest keep their
 *     order after them
 *
 *   npm run content:album-update
 *
 * The photos are found by file name. Removed photos stay in the Media library (only the album no longer shows them). When an album's
 * cover is one of them, the first photo left becomes the cover. Safe to run again: when nothing is left to change it changes nothing.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { collections } from '../src/schema/index.js'

const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets')

/** new photos for an album: the file in scripts/assets and its alt text */
const ADD = {
  'family-moments': [{ filename: 'rd-family-mother.webp', alt: { en: 'Rohan Deshmukh with his mother', mr: 'रोहन देशमुख आईसोबत' } }],
}

/** photo in the album → the new photo from scripts/assets that takes its place */
const REPLACE = {
  'political-moments': {
    'rd-political-03.webp': { filename: 'rd-political-03-ajit-pawar.webp', alt: { en: 'Rohan Deshmukh with Ajit Pawar', mr: 'रोहन देशमुख अजित पवार यांच्यासोबत' } },
  },
}

const files = (prefix, numbers) => numbers.map((n) => `${prefix}-${String(n).padStart(2, '0')}.webp`)
const ALBUMS = {
  'family-moments': files('rd-family', [1, 4, 8, 9, 11, 12, 15, 16, 17, 18, 20, 21, 24, 25, 27, 30]),
  'political-moments': files('rd-political', [8, 9, 12, 17, 18, 24, 30]),
}

/** photos to show first, in this order */
const FIRST = {
  'family-moments': ['rd-family-mother.webp', 'rd-family-06.webp'],
  'political-moments': files('rd-political', [11, 6, 2, 20, 5, 4, 13, 1]),
}

const idOf = (x) => (x && typeof x === 'object' ? x.id : x)

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents, uploads } = ctx
  const mediaDef = collections.find((c) => c.slug === 'media')

  /** the media id of a photo from scripts/assets, adding it to the Media library the first time */
  async function mediaFor({ filename, alt }) {
    const found = await documents.find('media', { where: { filename: { equals: filename } }, limit: 1, overrideAccess: true })
    if (found.docs[0]) return found.docs[0].id
    const buffer = await readFile(path.join(assets, filename))
    const upload = await uploads.ingestImage(mediaDef, { filename, buffer })
    const doc = await documents.create('media', { alt }, { overrideAccess: true, locale: 'all', upload })
    console.log(`  + Added ${filename} to the Media library (#${doc.id}).`)
    return doc.id
  }

  for (const [slug, remove] of Object.entries(ALBUMS)) {
    const found = await documents.find('albums', { where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
    const album = found.docs[0]
    if (!album) {
      console.log(`– No album "${slug}" — skipped.`)
      continue
    }
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('albums', album.id)
    const media = await documents.find('media', { where: { filename: { in: remove } }, limit: 100, overrideAccess: true })
    const drop = new Set(media.docs.map((m) => m.id))
    const kept = (raw.photos ?? []).filter((p) => !drop.has(idOf(p)))
    const removed = (raw.photos ?? []).length - kept.length
    let added = 0
    for (const [old, item] of Object.entries(REPLACE[slug] ?? {})) {
      const oldMedia = await documents.find('media', { where: { filename: { equals: old } }, limit: 1, overrideAccess: true })
      const at = kept.findIndex((p) => idOf(p) === oldMedia.docs[0]?.id)
      if (at < 0) continue
      kept[at] = await mediaFor(item)
      drop.add(oldMedia.docs[0].id)
      added++
    }
    for (const item of ADD[slug] ?? []) {
      const mid = await mediaFor(item)
      if (!kept.some((p) => idOf(p) === mid)) {
        kept.push(mid)
        added++
      }
    }

    // the photos listed in FIRST go to the front, in that order
    const firstFiles = FIRST[slug] ?? []
    const firstMedia = firstFiles.length ? await documents.find('media', { where: { filename: { in: firstFiles } }, limit: 100, overrideAccess: true }) : { docs: [] }
    const rank = new Map(firstMedia.docs.map((m) => [m.id, firstFiles.indexOf(m.filename)]))
    const photos = [...kept.filter((p) => rank.has(idOf(p))).sort((a, b) => rank.get(idOf(a)) - rank.get(idOf(b))), ...kept.filter((p) => !rank.has(idOf(p)))]
    const reordered = photos.some((p, i) => idOf(p) !== idOf(kept[i]))

    if (!removed && !added && !reordered) {
      console.log(`✓ "${slug}" is already up to date — nothing to change.`)
      continue
    }
    const cover = drop.has(idOf(raw.cover)) ? (idOf(photos[0]) ?? null) : raw.cover
    await documents.update('albums', id, { ...raw, photos, cover }, { overrideAccess: true, locale: 'all' })
    console.log(`✓ "${slug}": added ${added}, removed ${removed} photo(s)${reordered ? ', put the chosen photos first' : ''} (${photos.length} photos).`)
  }
} catch (err) {
  console.error('\n✖ Could not update the albums:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
