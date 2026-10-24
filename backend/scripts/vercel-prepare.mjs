/**
 * Runs in the Vercel build (npm run vercel-build), after the website is built:
 *   1. migrations: creates / updates the tables (PostgreSQL schema DB_SCHEMA, e.g. "site" — other tables in the database are never touched)
 *   2. a database with no content gets the bundled content (pages, posts, the 23 initiatives, events, albums, photos → Vercel Blob…)
 *   3. the first admin account (ADMIN_EMAIL / ADMIN_PASSWORD) when there is none — its password is never printed
 * Safe on every deploy: an existing site's content is left exactly as it is.
 */
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { ensureAdmin, isEmpty, loadSnapshot, readSnapshot } from '../src/seed/load.js'

const started = Date.now()
// this step never signs anyone in, so it does not need the real JWT_SECRET (the site itself does — see the README)
process.env.JWT_SECRET ||= 'build-step-only-'.padEnd(48, 'x')
const cfg = loadConfig()
console.log(`[prepare] database: ${cfg.db.dialect}${cfg.db.schema ? ` (schema "${cfg.db.schema}")` : ''} · files: ${cfg.storage.driver}`)
const { ctx, close } = await createApp({ cfg: { ...cfg, autoMigrate: false } })
try {
  const ran = await ctx.db.migrate()
  console.log(ran.length ? `[prepare] ✓ migrations: ${ran.join(', ')}` : '[prepare] ✓ tables are up to date')
  if (await isEmpty(ctx)) {
    console.log('[prepare] the database is empty — loading the website content (this takes a minute the first time)…')
    const stats = await loadSnapshot(ctx, await readSnapshot())
    console.log(`[prepare] ✓ loaded ${stats.documents} documents (${stats.media} photos) and ${stats.globals} settings pages`)
  } else console.log('[prepare] ✓ the database already has content — left as it is')
  await ctx.db.syncIdCounters() // PostgreSQL: new rows get ids after the highest existing one
  // never a live admin with the example password from the README, whatever NODE_ENV the build runs with
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'ChangeMe@123') {
    if ((await ctx.db.models.users.count()) === 0) console.warn('[prepare] ! no admin account yet: add ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in Vercel → Settings → Environment Variables and redeploy')
  } else {
    const admin = await ensureAdmin(ctx)
    if (admin) console.log(`[prepare] ✓ created the admin account ${admin} (the password is the ADMIN_PASSWORD you set)`)
  }
  console.log(`[prepare] done in ${Math.round((Date.now() - started) / 1000)} s`)
} catch (err) {
  console.error('\n[prepare] ✖', err.message)
  process.exitCode = 1
} finally {
  await close()
}
