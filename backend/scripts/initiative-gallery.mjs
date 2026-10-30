/**
 * Takes photos out of a social project's छायाचित्रे / Photos section (Oct 2026), in a database that already has content.
 *   - REMOVE: project slug → the photos to take out (by file name)
 *     LOTUS: the outdoor drawing session and the "चित्रकला स्पर्धा" banner photo
 *
 *   npm run content:initiative-gallery
 *
 * The photos stay in the Media library (only the project no longer shows them). Safe to run again: when nothing is left to take
 * out it changes nothing.
 */
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const REMOVE = {
  lotus: ['lmf-lotus-03.webp', 'lmf-lotus-04.webp'],
}

const idOf = (x) => (x && typeof x === 'object' ? x.id : x)

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents } = ctx
  for (const [slug, files] of Object.entries(REMOVE)) {
    const found = await documents.find('initiatives', { where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
    const project = found.docs[0]
    if (!project) {
      console.log(`! No project "${slug}" — skipped.`)
      continue
    }
    const media = await documents.find('media', { where: { filename: { in: files } }, limit: 100, overrideAccess: true })
    const drop = new Set(media.docs.map((m) => m.id))
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('initiatives', project.id)
    const gallery = (raw.gallery ?? []).filter((g) => !drop.has(idOf(g)))
    const removed = (raw.gallery ?? []).length - gallery.length
    if (!removed) {
      console.log(`✓ "${slug}" is already up to date — nothing to change.`)
      continue
    }
    await documents.update('initiatives', id, { ...raw, gallery }, { overrideAccess: true, locale: 'all' })
    console.log(`✓ "${slug}": removed ${removed} photo(s) (${gallery.length} left).`)
  }
} catch (err) {
  console.error('\n✖ Could not update the project photos:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
