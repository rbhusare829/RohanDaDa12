/**
 * Changes blog cover photos (Oct 2026). The cover shows on the blog card (homepage ब्लॉग row, the blog list) and at the top of the
 * post.
 *   - COVERS: post slug → the new photo (a photo already in the Media library, by file name; otherwise the file in scripts/assets
 *     goes into the library once), which becomes the cover
 *     "गुणवत्ता, जिद्द आणि संधी: 'लोटस'…" → Rohan handing a Lotus scholarship to a student (the Lotus project cover, without its frame)
 *     "एक डबा जेवणाचा, पण त्यामागे माणुसकीचा हात…" → a meal tiffin handed to an elderly man (from the Annapurna project photos)
 *
 *   npm run content:blog-covers
 *
 * Safe to run again: a post that already has its new cover is left as it is.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { collections } from '../src/schema/index.js'

const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets')

const COVERS = {
  'lotus-blog-merit-determination-opportunity': {
    filename: 'lotus-blog-cover.webp',
    alt: { en: 'Rohan Deshmukh handing a Lotus scholarship to a student', mr: 'रोहन देशमुख विद्यार्थिनीला लोटस शिष्यवृत्ती प्रदान करताना' },
  },
  'lokmangal-annapurna-yojana': {
    filename: 'lmf-annapurna-yojana-10.webp',
    alt: { en: 'A Lokmangal Annapurna Yojana meal tiffin handed to an elderly man', mr: 'लोकमंगल अन्नपूर्णा योजनेचा जेवणाचा डबा ज्येष्ठ नागरिकाला देताना' },
  },
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

  for (const [slug, photo] of Object.entries(COVERS)) {
    const found = await documents.find('posts', { where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
    const post = found.docs[0]
    if (!post) {
      console.log(`! No post "${slug}" — skipped.`)
      continue
    }
    const cover = await mediaFor(photo)
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('posts', post.id)
    if (idOf(raw.coverImage) === cover) {
      console.log(`✓ "${slug}" already has its new cover — nothing to change.`)
      continue
    }
    await documents.update('posts', id, { ...raw, coverImage: cover }, { overrideAccess: true, locale: 'all' })
    console.log(`✓ "${slug}": new cover photo.`)
  }
} catch (err) {
  console.error('\n✖ Could not update the blog covers:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
