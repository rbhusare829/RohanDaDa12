/**
 * Fills in the English text that was missing (so English pages showed Marathi): Vision → "How it works" and its
 * closing invitation, the 18 Lokmangal projects that had Marathi only, and photo descriptions (Oct 2026).
 *
 *   npm run content:english
 *
 * Safe to run again: only empty English fields are filled, so nothing you edited is overwritten.
 */
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { collections, globals } from '../src/schema/index.js'
import { fillEnglish } from '../src/seed/english.js'

/** visitor submissions and accounts — never touched */
const SKIP = new Set(['contact-messages', 'grievances', 'job-applications', 'form-uploads', 'documents', 'users'])

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents } = ctx
  let total = 0
  for (const c of collections) {
    if (c.auth || SKIP.has(c.slug)) continue
    for (let page = 1; ; page++) {
      const res = await documents.find(c.slug, { limit: 100, page, overrideAccess: true, depth: 0 })
      for (const d of res.docs) {
        const { id, createdAt: _c, updatedAt: _u, ...raw } = await documents.getRaw(c.slug, d.id)
        const n = fillEnglish(raw)
        if (!n) continue
        await documents.update(c.slug, id, raw, { overrideAccess: true, locale: 'all' })
        console.log(`  ✓ ${c.slug} #${id}: ${n} field(s)`)
        total += n
      }
      if (!res.hasNextPage) break
    }
  }
  for (const g of globals) {
    const raw = await documents.getGlobalRaw?.(g.slug)
    if (!raw) continue
    const { id: _i, createdAt: _c, updatedAt: _u, ...data } = raw
    const n = fillEnglish(data)
    if (!n) continue
    await documents.updateGlobal(g.slug, data, { overrideAccess: true, locale: 'all' })
    console.log(`  ✓ ${g.slug}: ${n} field(s)`)
    total += n
  }
  console.log(total ? `✓ Filled ${total} English field(s).` : '✓ Nothing to fill — all English text is already there.')
} catch (err) {
  console.error('\n✖ Could not fill the English text:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
