/**
 * Adds any social initiative (project) from the bundled content that is missing from a database that already has content —
 * e.g. "Media Coverage" (/social-work/madhyamanchi-dakhal), the 23rd project of the old site, which the first content
 * snapshot had left out (Oct 2026). A fresh database gets all of them from the seed on its own.
 *
 *   npm run content:initiatives
 *
 * Safe to run again: a project whose address (slug) is already in the database is never touched, so nothing you edited is overwritten.
 * Its photo (if it has one) is added to Media from the seed when missing.
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
const MEDIA_FIELDS = new Set(['heroImage'])

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { db, uploads, documents } = ctx
  const media = collections.find((c) => c.slug === 'media')
  const seedMedia = await readJson(path.join(seedDir, 'data', 'collections', 'media.json'))
  const seedInitiatives = await readJson(path.join(seedDir, 'data', 'collections', 'initiatives.json'))

  /** a seed photo id → the id of the same photo (by file name) in this database, adding it when it is missing */
  const photoFor = async (seedId) => {
    if (!seedId) return null
    const record = seedMedia.find((m) => m.id === seedId)
    if (!record) return null
    const existing = await db.models.media.findOne({ where: { filename: record.filename } })
    if (existing) return existing.id
    const upload = await uploads.ingestImage(media, { filename: record.filename, buffer: await readFile(path.join(seedDir, 'media', record.filename)) })
    const { id: _id, createdAt: _c, updatedAt: _u, filename: _f, mimeType: _m, filesize: _s, width: _w, height: _h, focalX: _x, focalY: _y, ...input } = record
    return (await documents.create('media', input, { overrideAccess: true, locale: 'all', upload })).id
  }

  let added = 0
  for (const item of seedInitiatives) {
    const found = await documents.find('initiatives', { where: { slug: { equals: item.slug } }, limit: 1, overrideAccess: true })
    if (found.docs.length) continue
    const { id: _id, createdAt: _c, updatedAt: _u, relatedPosts: _r, ...input } = item
    for (const key of MEDIA_FIELDS) input[key] = await photoFor(item[key])
    input.gallery = []
    for (const g of item.gallery ?? []) {
      const id = await photoFor(typeof g === 'object' && g ? g.image ?? g.id : g)
      if (id) input.gallery.push(typeof g === 'object' && g ? { ...g, image: id } : id)
    }
    const doc = await documents.create('initiatives', input, { overrideAccess: true, locale: 'all' })
    console.log(`  + added "${item.title?.en || item.title?.mr}" (/social-work/${item.slug}, id ${doc.id})`)
    added++
  }
  const total = (await documents.find('initiatives', { limit: 1, overrideAccess: true })).totalDocs
  console.log(added ? `✓ Added ${added} project(s). The database now has ${total} projects.` : `✓ Nothing to add — all ${total} projects are already there.`)
} catch (err) {
  console.error('\n✖ Could not add the projects:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
