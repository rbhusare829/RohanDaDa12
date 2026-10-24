/**
 * Hides the "About · Know more" section (three link cards: Family Background, Lokmangal Parivar, Political Career) at the bottom of
 * /about/introduction — removed from the website (Oct 2026). It is hidden, not deleted: Pages → Introduction → that Cards block →
 * untick "Hidden" in the admin brings it back.
 *
 *   npm run content:intro-know-more
 *
 * Safe to run again.
 */
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const PATH = '/about/introduction'

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents } = ctx
  const found = await documents.find('pages', { where: { path: { equals: PATH } }, limit: 1, overrideAccess: true, depth: 0 })
  if (!found.docs.length) {
    console.log(`✓ No ${PATH} page — nothing to change.`)
  } else {
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('pages', found.docs[0].id)
    const block = (raw.layout ?? []).find((b) => b.blockType === 'cards' && b.heading?.en === 'Know more')
    if (!block) console.log('✓ The "Know more" section is not on the page — nothing to change.')
    else if (block.hidden) console.log('✓ The "Know more" section is already hidden.')
    else {
      block.hidden = true
      await documents.update('pages', id, raw, { overrideAccess: true, locale: 'all' })
      console.log(`✓ Hid the "Know more" section on ${PATH}.`)
    }
  }
} catch (err) {
  console.error('\n✖ Could not hide the section:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
