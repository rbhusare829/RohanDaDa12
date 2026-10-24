/**
 * Homepage "Social initiatives" cards (Oct 2026), in a database that already has content:
 *   - the Swami Vivekananda Vichar Yatra card shows the yatra photo (work-vivekanand-yatra.webp, also used on Political Career)
 *   - the small labels on the photos ("His idea", "General Secretary", "Independent candidate") are cleared
 * A fresh database gets this from the seed on its own.
 *
 *   npm run content:home-highlights
 *
 * Safe to run again. Every other homepage section is left exactly as it is.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { collections } from '../src/schema/index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.join(here, '..', 'src', 'seed')
const PHOTO = 'work-vivekanand-yatra.webp'
const isYatra = (it) => it?.title?.en?.includes('Vivekananda') || it?.title?.mr?.includes('विवेकानंद')

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { db, uploads, documents } = ctx

  // the photo: already in Media on every database made from the seed; added from the seed if it is missing
  let photo = await db.models.media.findOne({ where: { filename: PHOTO } })
  if (!photo) {
    const seedMedia = JSON.parse(await readFile(path.join(seedDir, 'data', 'collections', 'media.json'), 'utf8'))
    const record = seedMedia.find((m) => m.filename === PHOTO)
    if (!record) throw new Error(`${PHOTO} is missing from the seed's media list.`)
    const media = collections.find((c) => c.slug === 'media')
    const upload = await uploads.ingestImage(media, { filename: PHOTO, buffer: await readFile(path.join(seedDir, 'media', PHOTO)) })
    const { id: _id, createdAt: _c, updatedAt: _u, filename: _f, mimeType: _m, filesize: _s, width: _w, height: _h, focalX: _x, focalY: _y, ...input } = record
    photo = await documents.create('media', input, { overrideAccess: true, locale: 'all', upload })
    console.log(`  + added ${PHOTO} to Media (id ${photo.id})`)
  }

  const { createdAt: _c, updatedAt: _u, ...home } = await documents.getGlobalRaw('home')
  const sections = home.sections ?? []
  const block = sections.find((s) => s.blockType === 'homeHighlights')
  if (!block) throw new Error('The homepage has no "Social initiatives" section.')
  let yatra = false
  block.items = (block.items ?? []).map((it) => {
    const next = { ...it, tag: { en: null, mr: null } }
    if (isYatra(it)) {
      next.image = photo.id
      yatra = true
    }
    return next
  })
  await documents.updateGlobal('home', { ...home, sections }, { overrideAccess: true, locale: 'all' })
  console.log(yatra ? '✓ The Vivekananda Vichar Yatra card now shows the yatra photo.' : '! No Vivekananda Vichar Yatra card found — photo not changed.')
  console.log('✓ The labels on the Social initiatives photos are cleared.')
} catch (err) {
  console.error('\n✖ Could not update the homepage:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
