/**
 * Brings all 23 Lokmangal Foundation projects in line with lokmangalfoundation.com/projects (Oct 2026): for each project
 * the title, the highlight line ("stat"), the summary, the objective, the full description, the cover photo, the whole
 * photo gallery (in the same order as on that website) and the video, in Marathi and English.
 *
 *   npm run content:foundation-projects
 *
 * The words and photos come from the seed (backend/src/seed/data/collections/initiatives.json and media.json, photos in
 * backend/src/seed/media/lmf-*.webp), so a fresh database gets the same content from "npm run seed" on its own.
 * Safe to run again: a photo already in Media (same file name) is reused, nothing is added twice. It replaces these fields
 * of the 23 projects with the website's version — the category, "featured" and counters you set in the admin are kept.
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
const FIELDS = ['title', 'stat', 'excerpt', 'objective', 'body', 'order', 'youtubeUrl', 'videos']

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
    if (!found.docs.length) {
      console.log(`  – ${item.slug}: not in this database, skipped`)
      continue
    }
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('initiatives', found.docs[0].id)
    const gallery = []
    for (const seedId of item.gallery ?? []) {
      const photo = await photoFor(seedId)
      if (photo && !gallery.includes(photo)) gallery.push(photo)
    }
    const heroImage = item.heroImage ? await photoFor(item.heroImage) : null
    const next = { ...raw, heroImage, gallery }
    for (const f of FIELDS) next[f] = item[f] ?? null
    if (!Array.isArray(next.videos)) next.videos = []
    await documents.update('initiatives', id, next, { overrideAccess: true, locale: 'all' })
    console.log(`  ✓ ${item.title?.en}: ${gallery.length} photo(s)${heroImage ? ' + cover' : ''}`)
    changed++
  }
  console.log(`✓ Updated ${changed} project(s), ${created} new photo(s) in Media.`)
} catch (err) {
  console.error('\n✖ Could not update the Foundation projects:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
