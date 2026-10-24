import { loadConfig } from '../config.js'
import { createApp } from '../app.js'
import { clearContent, ensureAdmin, isEmpty, loadSnapshot, readSnapshot } from './load.js'

/**
 * Loads the bundled content (the website as it was handed over: pages, posts, initiatives, events, albums, photos,
 * menu, footer, homepage…) into the database, and creates the first admin account.
 *
 *   npm run seed          loads it when the database is empty (safe to run any time; used by `npm run dev`)
 *   npm run seed:fresh    deletes ALL content (not the users) and loads it again
 */
const args = new Set(process.argv.slice(2))
const cfg = loadConfig()
const { ctx, close } = await createApp({ cfg })

try {
  const fresh = args.has('--fresh')
  if (!fresh && args.has('--if-empty') && !(await isEmpty(ctx))) {
    console.log('✓ The database already has content — nothing to load.')
  } else {
    if (fresh) {
      console.log('Deleting all content…')
      await clearContent(ctx)
    } else if (!(await isEmpty(ctx))) {
      console.log('The database already has content. Use "npm run seed:fresh" to replace it.')
      process.exitCode = 1
    }
    if (!process.exitCode) {
      console.log('Loading the website content…')
      const snapshot = await readSnapshot()
      const stats = await loadSnapshot(ctx, snapshot)
      console.log(`✓ Loaded ${stats.documents} documents (${stats.media} photos) and ${stats.globals} settings pages.`)
    }
  }
  const admin = await ensureAdmin(ctx)
  if (admin) console.log(`✓ Created the admin account ${admin} (password: ${cfg.admin.password}) — change it after the first sign-in.`)
} catch (err) {
  console.error('\n✖ Seeding failed:', err.message)
  process.exitCode = 1
} finally {
  await close()
}
