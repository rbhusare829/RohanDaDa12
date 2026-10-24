/**
 * Puts the homepage cover carousel back to its three photos (greeting, speech, rally — Oct 2026)
 * in a database that already has content. A fresh database gets them from the seed on its own.
 *
 *   npm run content:hero-covers
 *
 * What it does (safe to run again):
 *   1. adds the three photos (src/seed/media/hero-*.webp) to Media, unless a photo with that file name is already there
 *   2. sets the homepage carousel to the three slides from the seed (src/seed/data/globals/home.json),
 *      with the same photo on desktop and phones. Every other homepage section is left exactly as it is.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { collections } from '../src/schema/index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const seedDir = path.join(here, '..', 'src', 'seed')
const COVERS = ['hero-greeting.webp', 'hero-speech.webp', 'hero-rally.webp']

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { db, uploads, documents } = ctx
  const media = collections.find((c) => c.slug === 'media')
  const seedMedia = await readJson(path.join(seedDir, 'data', 'collections', 'media.json'))
  const seedHome = await readJson(path.join(seedDir, 'data', 'globals', 'home.json'))

  // 1. the photos: seed id → id in this database
  const idFor = {}
  for (const filename of COVERS) {
    const record = seedMedia.find((m) => m.filename === filename)
    if (!record) throw new Error(`${filename} is missing from the seed's media list.`)
    const existing = await db.models.media.findOne({ where: { filename } })
    if (existing) {
      idFor[record.id] = existing.id
      console.log(`  ✓ ${filename} is already in Media (id ${existing.id})`)
      continue
    }
    const buffer = await readFile(path.join(seedDir, 'media', filename))
    const upload = await uploads.ingestImage(media, { filename, buffer })
    const { id: _id, createdAt: _c, updatedAt: _u, filename: _f, mimeType: _m, filesize: _s, width: _w, height: _h, focalX: _x, focalY: _y, ...input } = record
    const doc = await documents.create('media', input, { overrideAccess: true, locale: 'all', upload })
    idFor[record.id] = doc.id
    console.log(`  + added ${filename} to Media (id ${doc.id})`)
  }

  // 2. the carousel: the seed's slides, pointing at this database's photos
  const seedHero = seedHome.sections.find((s) => s.blockType === 'heroSlider')
  const slides = seedHero.slides.map((s) => ({ ...s, image: idFor[s.image] ?? s.image, imageMobile: idFor[s.imageMobile] ?? s.imageMobile }))
  const { createdAt: _c, updatedAt: _u, ...home } = await documents.getGlobalRaw('home')
  const sections = home.sections ?? []
  const at = sections.findIndex((s) => s.blockType === 'heroSlider')
  if (at === -1) sections.unshift({ ...seedHero, slides })
  else sections[at] = { ...sections[at], slides }
  await documents.updateGlobal('home', { ...home, sections }, { overrideAccess: true, locale: 'all' })
  console.log(`✓ The homepage carousel now shows ${slides.length} cover photos.`)
} catch (err) {
  console.error('\n✖ Could not update the carousel:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
