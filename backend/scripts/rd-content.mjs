/**
 * Puts the client's content document ("RD Content", Google Docs, Oct 2026) into a database that already has content, in both
 * languages, exactly as written in the document (backend/src/seed/data/rd-content.json):
 *   - Pages: Introduction (admin copy), Family Background, Lokmangal Parivar (intro), Political Career, Lokmangal Foundation (text,
 *     key areas, and the "Impact So Far" figures and closing line, added once), Vision (The New India Manifesto; its closing
 *     "प्रगतीसाठी आजच चळवळीत सामील व्हा / Join the movement" banner and the "प्रत्यक्ष कामाचे परिणाम / Results on the ground"
 *     numbers are hidden — they can be switched back on in the admin)
 *   - Events: Solapur University Youth Festival, Yuva Sahitya Sammelan, International Women's Lawn Tennis Tournament, Rural Sports
 *   - Homepage: About text and pledge line, Vision text
 * Only the parts the document covers are touched; everything else on those pages (photos, buttons, the institution lists, other
 * blocks) stays as it is. A fresh database gets the same content from the seed.
 *
 *   npm run content:rd-content
 *
 * Safe to run again: it writes the same text each time.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const DOC = JSON.parse(await readFile(path.join(here, '..', 'src', 'seed', 'data', 'rd-content.json'), 'utf8'))

/** sets the given localized fields on one block (cards: items by id) */
function applyBlock(block, change) {
  for (const [field, value] of Object.entries(change)) {
    if (field === '_fallback') continue
    if (field === 'items') {
      for (const item of block.items ?? []) {
        const fields = value[item.id]
        if (fields) for (const [f, v] of Object.entries(fields)) item[f] = { ...(item[f] ?? {}), ...v }
      }
    } else if (value === null || typeof value !== 'object') block[field] = value // e.g. hidden: true
    else block[field] = { ...(block[field] ?? {}), ...value }
  }
}

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents } = ctx
  const done = []

  for (const [pagePath, change] of Object.entries(DOC.pages)) {
    const found = await documents.find('pages', { where: { path: { equals: pagePath } }, limit: 1, overrideAccess: true, depth: 0 })
    if (!found.docs.length) {
      console.log(`! No page at ${pagePath} — skipped.`)
      continue
    }
    const { id, createdAt: _c, updatedAt: _u, ...page } = await documents.getRaw('pages', found.docs[0].id)
    if (change.title) page.title = { ...page.title, ...change.title }
    if (change.subtitle) page.subtitle = { ...page.subtitle, ...change.subtitle }
    const layout = page.layout ?? []
    let missing = 0
    for (const [blockId, blockChange] of Object.entries(change.blocks ?? {})) {
      // by its id; or, when the page was built differently (a fresh install's Lokmangal Parivar), by its place: "first:content"
      const [, type] = (blockChange._fallback ?? '').split(':')
      const block = layout.find((b) => b.id === blockId) ?? (type ? layout.find((b) => b.blockType === type) : undefined)
      if (block) applyBlock(block, blockChange)
      else missing++
    }
    // blocks the document adds (once): placed after the block they follow, or at the end
    for (const { after, block } of change.add ?? []) {
      if (layout.some((b) => b.id === block.id)) continue
      const at = layout.findIndex((b) => b.id === after)
      layout.splice(at >= 0 ? at + 1 : layout.length, 0, structuredClone(block))
    }
    await documents.update('pages', id, { ...page, layout }, { overrideAccess: true, locale: 'all' })
    done.push(pagePath + (missing ? ` (${missing} block(s) not found — edited in the admin?)` : ''))
  }

  for (const [slug, change] of Object.entries(DOC.events)) {
    const found = await documents.find('events', { where: { slug: { equals: slug } }, limit: 1, overrideAccess: true, depth: 0 })
    if (!found.docs.length) {
      console.log(`! No event "${slug}" — skipped.`)
      continue
    }
    const { id, createdAt: _c, updatedAt: _u, ...event } = await documents.getRaw('events', found.docs[0].id)
    event.tagline = { ...event.tagline, ...change.tagline }
    event.body = { ...event.body, ...change.body }
    // the key facts as the document lists them (the existing ones keep their ids, in order)
    event.facts = change.facts.map((f, i) => ({ ...(event.facts?.[i]?.id ? { id: event.facts[i].id } : {}), label: f.label, value: f.value }))
    await documents.update('events', id, event, { overrideAccess: true, locale: 'all' })
    done.push(`event ${slug}`)
  }

  const { id: _h, createdAt: _hc, updatedAt: _hu, ...home } = await documents.getGlobalRaw('home')
  for (const [blockType, change] of Object.entries(DOC.home)) {
    const block = (home.sections ?? []).find((s) => s.blockType === blockType)
    if (block) applyBlock(block, change)
  }
  await documents.updateGlobal('home', home, { overrideAccess: true, locale: 'all' })
  done.push('homepage (About, Vision)')

  console.log(`✓ Content from the "RD Content" document is in place (Marathi and English):\n  - ${done.join('\n  - ')}`)
} catch (err) {
  console.error('\n✖ Could not put in the RD Content text:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
