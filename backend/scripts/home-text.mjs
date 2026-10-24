/**
 * Brings two homepage texts in line with the bundled content (Oct 2026):
 *   - Home → Journey section: heading "His Journey" → "Journey", first point "His journey began…" → "Journey began…"
 *   - Site settings → tagline: the new line from the bundled content
 *
 *   npm run content:home-text
 *
 * Safe to run again, and it never overwrites an edit: a text is changed only while it still reads exactly as the old version.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const seed = async (name) => JSON.parse(await readFile(path.join(here, '..', 'src', 'seed', 'data', 'globals', `${name}.json`), 'utf8'))
const OLD_TAGLINE = 'Shaped by the soil of Solapur, guided by values, committed to society.'

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const { documents } = ctx
  let changed = 0

  const { id: _h, createdAt: _hc, updatedAt: _hu, ...home } = await documents.getGlobalRaw('home')
  const journey = (home.sections ?? []).find((s) => s.blockType === 'homeJourney')
  if (journey?.heading?.en === 'His Journey') { journey.heading.en = 'Journey'; changed++ }
  const first = journey?.items?.[0]?.text
  if (first?.en?.startsWith('His journey began')) { first.en = first.en.replace(/^His journey began/, 'Journey began'); changed++ }
  if (changed) await documents.updateGlobal('home', home, { overrideAccess: true, locale: 'all' })

  const { id: _s, createdAt: _sc, updatedAt: _su, ...settings } = await documents.getGlobalRaw('site-settings')
  const tagline = (await seed('site-settings')).tagline
  if (settings.tagline?.en === OLD_TAGLINE && tagline?.en && tagline.en !== OLD_TAGLINE) {
    settings.tagline = { ...settings.tagline, en: tagline.en }
    await documents.updateGlobal('site-settings', settings, { overrideAccess: true, locale: 'all' })
    changed++
  }
  console.log(changed ? `✓ Updated ${changed} homepage text(s).` : '✓ Nothing to change — the homepage texts are already up to date (or were edited in the admin).')
} catch (err) {
  console.error('\n✖ Could not update the homepage texts:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
