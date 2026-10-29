import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collections, globals } from '../schema/index.js'

const here = path.dirname(fileURLToPath(import.meta.url))
export const DEFAULT_DATA_DIR = path.join(here, 'data')
export const DEFAULT_MEDIA_DIR = path.join(here, 'media')

/** Parents first: photos, then what points at them, then what points at those */
const ORDER = ['media', 'documents', 'categories', 'offices', 'posts', 'initiatives', 'events', 'albums', 'videos', 'quotes', 'jobs', 'download-photos', 'leader-meetings', 'awards', 'pages']

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'))

/** data/collections/<slug>.json + data/globals/<slug>.json → { collections, globals } */
export async function readSnapshot(dir = DEFAULT_DATA_DIR) {
  const out = { collections: {}, globals: {} }
  for (const [kind, key] of [['collections', 'collections'], ['globals', 'globals']]) {
    let files = []
    try {
      files = (await readdir(path.join(dir, kind))).filter((f) => f.endsWith('.json'))
    } catch {
      /* folder missing: nothing to read */
    }
    for (const f of files) out[key][f.replace(/\.json$/, '')] = await readJson(path.join(dir, kind, f))
  }
  return out
}

export async function isEmpty({ db }) {
  return (await db.models.pages.count()) === 0 && (await db.globalModel.count()) === 0
}

/** Deletes all content (accounts stay): documents, uploaded files, saved versions, singletons */
export async function clearContent({ db, uploads }) {
  for (const c of collections) {
    if (c.slug === 'users') continue
    if (c.upload) {
      for (const row of await db.models[c.slug].findAll()) {
        const plain = row.get({ plain: true })
        await uploads.removeFiles(c, { filename: plain.filename, sizes: plain.data?.sizes })
      }
    }
    await db.models[c.slug].destroy({ where: {} })
  }
  await db.globalModel.destroy({ where: {} })
  await db.versionModel.destroy({ where: {} })
}

/**
 * Loads a snapshot. Documents keep their ids (so every reference stays valid) and their dates.
 * strict: stop at the first problem (the bundled seed); otherwise report and carry on (importing someone's live data).
 */
export async function loadSnapshot(ctx, snapshot, { mediaDir = DEFAULT_MEDIA_DIR, strict = true, log = console.log } = {}) {
  const { documents, uploads, db } = ctx
  const stats = { documents: 0, media: 0, globals: 0, problems: [] }
  const order = [...ORDER, ...collections.map((c) => c.slug).filter((s) => !ORDER.includes(s))]

// 1. Load globals first (site-settings, header nav, home sections, footer)
  for (const g of globals) {
    const data = snapshot.globals[g.slug]
    if (!data) continue
    try {
      await documents.updateGlobal(g.slug, data, { overrideAccess: true, locale: 'all' })
      stats.globals++
    } catch (err) {
      const detail = err.errors ? err.errors.map((e) => `${e.field}: ${e.message}`).join('; ') : err.message
      if (strict) throw new Error(`Could not load global ${g.slug}: ${detail}`)
      stats.problems.push(`global ${g.slug}: ${detail}`)
    }
  }

  // 2. Load collections
  for (const slug of order) {
    const docs = snapshot.collections[slug]
    if (!docs?.length) continue
    const collection = collections.find((c) => c.slug === slug)
    log(`  ${slug.padEnd(18)} ${docs.length}`)
    for (const doc of docs) {
      const { id, createdAt, updatedAt, filename, mimeType: _m, filesize: _f, width: _w, height: _h, focalX, focalY, ...input } = doc
      try {
        let upload = null
        if (collection.upload) {
          const buffer = await readFile(path.join(mediaDir, filename))
          upload = collection.upload.kind === 'image'
            ? { ...(await uploads.ingestImage(collection, { filename, buffer })), ...(focalX != null ? { focalX, focalY } : {}) }
            : await uploads.saveFile(collection, db.models[slug], { buffer, originalname: filename })
        }
        await documents.create(slug, input, { overrideAccess: true, locale: 'all', upload, preserve: { id, createdAt, updatedAt } })
        stats.documents++
        if (slug === 'media') stats.media++
      } catch (err) {
        const where = `${slug}/${id}${filename ? ` (${filename})` : ''}`
        const detail = err.errors ? `${err.message} — ${err.errors.map((e) => `${e.field}: ${e.message}`).join('; ')}` : err.message
        if (strict) throw new Error(`Could not load ${where}: ${detail}`)
        stats.problems.push(`${where}: ${detail}`)
      }
    }
  }

  await db.syncIdCounters?.()
  return stats
}

/** The first super admin, from ADMIN_EMAIL / ADMIN_PASSWORD (README documents the defaults) */
export async function ensureAdmin({ cfg, db, documents }) {
  if ((await db.models.users.count()) > 0) return null
  // the example password is public (README, .env.example): a live site must never be created with it
  if (cfg.production && cfg.admin.password === 'ChangeMe@123') {
    throw new Error('Set ADMIN_PASSWORD in backend/.env to a password of your own (not the example one) before the first start in production.')
  }
  await documents.create('users', { email: cfg.admin.email, password: cfg.admin.password, name: 'Super Admin', role: 'super-admin' }, { overrideAccess: true })
  return cfg.admin.email
}

/**
 * The way back in when a password is lost and e-mail is not set up (`npm run admin -- --email …`):
 * sets a new password for the account with this e-mail address (and lifts a lock-out), or creates it as a super admin.
 * Everyone signed in to that account is signed out, because sessions are tied to the password.
 */
export async function resetAdmin({ db, documents }, { email, password, name }) {
  const address = String(email ?? '').trim().toLowerCase()
  const row = await db.models.users.findOne({ where: { email: address } })
  if (row) {
    await documents.update('users', row.id, { password }, { overrideAccess: true })
    await db.models.users.update({ loginAttempts: 0, lockUntil: null }, { where: { id: row.id } })
    return { created: false, email: address }
  }
  await documents.create('users', { email: address, password, name: name || 'Super Admin', role: 'super-admin' }, { overrideAccess: true })
  return { created: true, email: address }
}
