import { readFile } from 'node:fs/promises'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { collections } from '../src/schema/index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(here, '..', 'uploads')
const seedDir = path.join(here, '..', 'src', 'seed', 'data', 'collections')

async function run() {
  const { ctx, close } = await createApp({ cfg: loadConfig() })
  try {
    const { db, uploads, documents } = ctx
    const mediaDef = collections.find((c) => c.slug === 'media')

    const photoIds = []
    let coverId = null

    console.log('Ingesting 28 leadership portraits into Media collection...')
    for (let i = 1; i <= 28; i++) {
      const padded = String(i).padStart(2, '0')
      const filename = `rd-portrait-${padded}.webp`
      const filePath = path.join(uploadsDir, filename)

      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`)
        continue
      }

      // Check if already in DB
      let existing = await db.models.media.findOne({ where: { filename } })
      if (!existing) {
        const buffer = await readFile(filePath)
        const upload = await uploads.ingestImage(mediaDef, { filename, buffer })
        const doc = await documents.create(
          'media',
          {
            alt: {
              en: `Rohan Subhash Deshmukh - Portrait ${padded}`,
              mr: `रोहन सुभाष देशमुख - व्यक्तिमत्त्व छायाचित्र ${padded}`,
            },
          },
          { overrideAccess: true, locale: 'all', upload }
        )
        existing = doc
        console.log(`  + Created media #${doc.id}: ${filename}`)
      } else {
        console.log(`  ✓ Existing media #${existing.id}: ${filename}`)
      }

      photoIds.push(existing.id)

      // Use photo 22 (rohan_6431 royal blue suit smile) as the cover
      if (i === 22) {
        coverId = existing.id
      }
    }

    if (!coverId && photoIds.length > 0) coverId = photoIds[0]

    console.log(`\nFound/created ${photoIds.length} media records. Cover ID: ${coverId}`)

    const albumData = {
      title: {
        en: 'Portraits & Leadership',
        mr: 'व्यक्तिमत्त्व आणि नेतृत्व',
      },
      slug: 'leadership-portraits',
      category: 'public',
      date: '2026-10-26T00:00:00.000Z',
      cover: coverId,
      description: {
        en: 'Official executive and leadership portraits of Rohan Subhash Deshmukh.',
        mr: 'सोलापूरच्या विकासाची धुरा सांभाळणारे युवा नेतृत्व — रोहन सुभाष देशमुख यांची अधिकृत व्यक्तिमत्त्व आणि नेतृत्व छायाचित्रे.',
      },
      photos: photoIds,
    }

    const existingAlbum = await db.models.albums.findOne({ where: { slug: 'leadership-portraits' } })
    if (existingAlbum) {
      console.log(`Updating existing album #${existingAlbum.id}...`)
      await documents.update('albums', existingAlbum.id, albumData, { overrideAccess: true, locale: 'all' })
      console.log(`✓ Updated album #${existingAlbum.id}`)
    } else {
      console.log('Creating new album "leadership-portraits"...')
      const newAlbum = await documents.create('albums', albumData, { overrideAccess: true, locale: 'all' })
      console.log(`✓ Created album #${newAlbum.id}`)
    }

    // Also update seed albums.json for longevity
    const seedAlbumsPath = path.join(seedDir, 'albums.json')
    if (fs.existsSync(seedAlbumsPath)) {
      const albumsSeed = JSON.parse(fs.readFileSync(seedAlbumsPath, 'utf8'))
      const idx = albumsSeed.findIndex((a) => a.slug === 'leadership-portraits')
      const seedEntry = {
        id: 4,
        ...albumData,
        createdAt: '2026-10-26T10:00:00.000Z',
        updatedAt: '2026-10-26T10:00:00.000Z',
      }
      if (idx >= 0) {
        albumsSeed[idx] = { ...albumsSeed[idx], ...seedEntry }
      } else {
        albumsSeed.push(seedEntry)
      }
      fs.writeFileSync(seedAlbumsPath, JSON.stringify(albumsSeed, null, 1), 'utf8')
      console.log('✓ Seed data updated in albums.json')
    }

    console.log('\nAll portraits and leadership album created successfully!')
  } finally {
    await close()
  }
}

run().catch((err) => {
  console.error('Error adding portraits album:', err)
  process.exit(1)
})
