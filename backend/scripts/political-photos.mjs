/**
 * Photos for the three chapters of the Political Career page (Oct 2026), taken from rohandeshmukh.in:
 *   विवेकानंद विचार यात्रा → political-vivekanand-vichar-yatra.webp
 *   भारतीय जनता युवा मोर्चा → political-yuva-morcha-rally.webp
 *   धाराशिव (उस्मानाबाद) लोकसभा निवडणूक → political-dharashiv-tuljapur-sabha.webp (the chapter becomes "Image + text", photo on the left)
 *
 *   npm run content:political-photos
 *
 * The photos are in backend/src/seed/media and listed in media.json, so a fresh database gets the same from "npm run seed".
 * Safe to run again: a photo already in Media (same file name) is reused; only these three chapters are touched.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { collections } from '../src/schema/index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.join(here, '..', 'src', 'seed')
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))

/** chapter id (as in the seed) → photo file name */
const CHAPTERS = {
  '6ad5ec6415929451e812667e': 'political-vivekanand-vichar-yatra.webp',
  '6ad5ec6415929451e812667f': 'political-yuva-morcha-rally.webp',
  '6ad5ec6415929451e8126680': 'political-dharashiv-tuljapur-sabha.webp',
}
const HEADINGS = { '6ad5ec6415929451e812667e': 'विवेकानंद', '6ad5ec6415929451e812667f': 'युवा मोर्चा', '6ad5ec6415929451e8126680': 'धाराशिव' }

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { db, uploads, documents } = ctx
  const media = collections.find((c) => c.slug === 'media')
  const seedMedia = new Map((await readJson(path.join(seedDir, 'data', 'collections', 'media.json'))).map((m) => [m.filename, m]))

  let created = 0
  const photoFor = async (filename) => {
    const existing = await db.models.media.findOne({ where: { filename } })
    if (existing) return existing.id
    const record = seedMedia.get(filename)
    const upload = await uploads.ingestImage(media, { filename, buffer: await readFile(path.join(seedDir, 'media', filename)) })
    created++
    return (await documents.create('media', { alt: record?.alt ?? null, focalX: record?.focalX ?? 50, focalY: record?.focalY ?? 50 }, { overrideAccess: true, locale: 'all', upload })).id
  }

  const found = await documents.find('pages', { where: { path: { equals: '/political-career' } }, limit: 1, overrideAccess: true, depth: 0 })
  if (!found.docs.length) throw new Error('the Political Career page (/political-career) is not in this database')
  const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('pages', found.docs[0].id)

  let changed = 0
  const layout = []
  for (const block of raw.layout ?? []) {
    // the chapter by its id, or (if it was re-made in the admin) by its Marathi heading
    const heading = typeof block.heading === 'object' ? block.heading?.mr ?? '' : block.heading ?? ''
    const key = CHAPTERS[block.id] ? block.id : Object.keys(HEADINGS).find((k) => heading.includes(HEADINGS[k]) && ['content', 'mediaText'].includes(block.blockType))
    if (!key) {
      layout.push(block)
      continue
    }
    const image = await photoFor(CHAPTERS[key])
    if (block.blockType === 'mediaText') {
      layout.push({ ...block, image })
    } else {
      const { id: blockId, blockType: _t, eyebrow, heading: h, hidden, body } = block
      layout.push({ id: blockId, blockType: 'mediaText', eyebrow, heading: h, hidden, image, imagePosition: 'left', body, buttons: [] })
    }
    changed++
  }
  await documents.update('pages', id, { ...raw, layout }, { overrideAccess: true, locale: 'all' })
  console.log(`✓ Political Career: ${changed} chapter photo(s) set, ${created} new photo(s) in Media.`)
} catch (err) {
  console.error('\n✖ Could not set the Political Career photos:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
