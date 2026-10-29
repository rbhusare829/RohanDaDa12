/**
 * Renames the Introduction page in Marathi (Oct 2026): "स्वपरिचय" → "परिचय" — the page title and its section labels, the
 * header menu item and the homepage button that links to it.
 *
 *   npm run content:rename-intro
 *
 * Safe to run again, and it never overwrites an edit: only a text that still reads exactly "स्वपरिचय" is changed.
 */
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const OLD = 'स्वपरिचय'
const NEW = 'परिचय'

/** every { mr: 'स्वपरिचय' } inside a document → { mr: 'परिचय' }; returns how many it changed */
function rename(node) {
  if (!node || typeof node !== 'object') return 0
  let n = 0
  if (node.mr === OLD) { node.mr = NEW; n++ }
  for (const v of Object.values(node)) n += rename(v)
  return n
}

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents } = ctx
  let changed = 0

  const pages = await documents.find('pages', { where: { path: { equals: '/about/introduction' } }, limit: 1, overrideAccess: true })
  for (const page of pages.docs) {
    const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw('pages', page.id)
    const n = rename(raw)
    if (n) { await documents.update('pages', id, raw, { overrideAccess: true, locale: 'all' }); changed += n }
  }

  for (const slug of ['header', 'home']) {
    const { id: _i, createdAt: _c, updatedAt: _u, ...raw } = await documents.getGlobalRaw(slug)
    const n = rename(raw)
    if (n) { await documents.updateGlobal(slug, raw, { overrideAccess: true, locale: 'all' }); changed += n }
  }

  console.log(changed ? `✓ Renamed ${changed} text(s) to "${NEW}".` : `✓ Nothing to change — no "${OLD}" left.`)
} catch (err) {
  console.error('\n✖ Could not rename the Introduction page:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
