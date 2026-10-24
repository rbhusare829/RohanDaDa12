/**
 * Removes the 4th Education point ("Back home" · Solapur · 2009) from the Introduction page (/about/introduction, Oct 2026)
 * in a database that already has content. A fresh database gets the page without it from the seed.
 *
 *   npm run content:intro-education
 *
 * Safe to run again: when the point is already gone it changes nothing. Every other block of the page is left as it is.
 */
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const PATH = '/about/introduction'
const isBackHome = (item) => item?.title?.en?.trim() === 'Back home' || item?.id === '6ad5ec5b15929451e812664c' || item?.title?.mr?.trim() === 'पुन्हा आपल्या मातीत'

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents } = ctx
  const found = await documents.find('pages', { where: { path: { equals: PATH } }, limit: 1, overrideAccess: true })
  const page = found.docs[0]
  if (!page) throw new Error(`No page at ${PATH}.`)
  const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('pages', page.id)
  let removed = 0
  const layout = (raw.layout ?? []).map((b) => {
    if (b.blockType !== 'cards' || !b.items?.some(isBackHome)) return b
    removed += b.items.filter(isBackHome).length
    return { ...b, items: b.items.filter((it) => !isBackHome(it)) }
  })
  if (!removed) console.log('✓ The Education list has no "Back home" point — nothing to change.')
  else {
    await documents.update('pages', id, { ...raw, layout }, { overrideAccess: true, locale: 'all' })
    console.log(`✓ Removed the "Back home" point from the Education list on ${PATH}.`)
  }
} catch (err) {
  console.error('\n✖ Could not update the Introduction page:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
