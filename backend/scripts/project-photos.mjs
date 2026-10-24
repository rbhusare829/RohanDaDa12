/**
 * Adds the Lokmangal project photos recovered from the old site (Oct 2026) to a database that already has content:
 * a cover photo for each project that has none, and the photos missing from each project's gallery. 22 of the 23
 * projects get photos (Media Coverage has none). A fresh database gets all of them from the seed on its own.
 *
 *   npm run content:project-photos
 *
 * Safe to run again: a photo already in Media (same file name) is reused, a cover you chose is kept, and photos already
 * in a gallery are not added twice.
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
const idOf = (v) => (v && typeof v === 'object' ? v.id : v)

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { db, uploads, documents } = ctx
  const media = collections.find((c) => c.slug === 'media')
  const seedMedia = new Map((await readJson(path.join(seedDir, 'data', 'collections', 'media.json'))).map((m) => [m.id, m]))
  const seedProjects = await readJson(path.join(seedDir, 'data', 'collections', 'initiatives.json'))

  /** a seed photo → its id in this database (matched by file name), added to Media when missing */
  let created = 0
  const photoFor = async (seedId) => {
    const record = seedMedia.get(seedId)
    if (!record) return null
    const existing = await db.models.media.findOne({ where: { filename: record.filename } })
    if (existing) return existing.id
    const upload = await uploads.ingestImage(media, { filename: record.filename, buffer: await readFile(path.join(seedDir, 'media', record.filename)) })
    const { id: _id, createdAt: _c, updatedAt: _u, filename: _f, mimeType: _m, filesize: _s, width: _w, height: _h, ...input } = record
    created++
    return (await documents.create('media', input, { overrideAccess: true, locale: 'all', upload })).id
  }

  let changed = 0
  for (const item of seedProjects) {
    const found = await documents.find('initiatives', { where: { slug: { equals: item.slug } }, limit: 1, overrideAccess: true, depth: 0 })
    if (!found.docs.length) continue
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('initiatives', found.docs[0].id)
    const gallery = (raw.gallery ?? []).map(idOf).filter(Boolean)
    let cover = idOf(raw.heroImage)
    let added = 0
    for (const seedId of item.gallery ?? []) {
      const photo = await photoFor(seedId)
      if (photo && !gallery.includes(photo)) { gallery.push(photo); added++ }
    }
    const setCover = !cover && item.heroImage
    if (setCover) cover = await photoFor(item.heroImage)
    if (!added && !setCover) continue
    await documents.update('initiatives', id, { ...raw, heroImage: cover ?? null, gallery }, { overrideAccess: true, locale: 'all' })
    console.log(`  ✓ ${item.title?.en}: ${setCover ? 'cover photo, ' : ''}${added} gallery photo(s)`)
    changed++
  }
  console.log(changed ? `✓ Updated ${changed} project(s), ${created} new photo(s) in Media.` : '✓ Nothing to add — every project already has its photos.')
} catch (err) {
  console.error('\n✖ Could not add the project photos:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
