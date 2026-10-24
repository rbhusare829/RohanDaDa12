/**
 * Brings the content of the OLD website (Payload CMS: Next.js + PostgreSQL) over to this one.
 *
 *   # 1. from the live old CMS, straight into this database (the usual migration)
 *   npm run import:payload -- --url https://cms.rohandeshmukh.in --email you@example.com --password '…'
 *
 *   # 2. refresh the bundled seed (src/seed/data + src/seed/media) from the old CMS
 *   npm run import:payload -- --url http://localhost:3001 --email … --password … --snapshot
 *
 *   # 3. from JSON dumps of the old CMS API (files "<collection>.json" and "global-<name>.json") and a folder of its photos
 *   npm run import:payload -- --from-dir ./dump --media-dir ./old-media --snapshot
 *
 * Options
 *   --into-database   (default when --snapshot is not given) load into the database set in backend/.env; add --fresh to delete the existing content first
 *   --snapshot        write the converted content as JSON + photo files instead of touching the database
 *   --out <dir>       where --snapshot writes (default: src/seed)
 *
 * What comes across: every page, post, category, initiative, event, album, video, office, photo, PDF, the menu, footer,
 * settings, popup and homepage — with both languages, the same ids, and rich text converted to HTML.
 * What does not: user accounts (passwords cannot be exported — create them in the new admin) and the contact inbox.
 */
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

if (flag('help') || (!opt('url') && !opt('from-dir'))) {
  console.log((await readFile(fileURLToPath(import.meta.url), 'utf8')).split('*/')[0].replace(/^\/\*\*?\n?/, '').replace(/^ \* ?/gm, ''))
  process.exit(flag('help') ? 0 : 1)
}

const { collections, globals } = await import('../src/schema/index.js')
const { convertBundle } = await import('../src/seed/payload-convert.js')

const FETCH = ['media', 'documents', ...collections.map((c) => c.slug).filter((s) => !['users', 'media', 'documents', 'media-folders', 'form-uploads', 'contact-messages', 'grievances', 'job-applications'].includes(s))]

/* ------------------------------------------------------------------ reading the old CMS */

async function readFromApi() {
  const base = opt('url').replace(/\/$/, '')
  const login = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: opt('email'), password: opt('password') }),
  })
  if (!login.ok) throw new Error(`Could not sign in to ${base} (${login.status}). Check --email and --password.`)
  const headers = { Authorization: `JWT ${(await login.json()).token}` }
  const q = 'depth=0&locale=all&fallback-locale=none&draft=false'

  const raw = { collections: {}, globals: {}, base, headers }
  for (const slug of FETCH) {
    let docs = []
    for (let page = 1; ; page++) {
      const res = await fetch(`${base}/api/${slug}?limit=100&page=${page}&${q}`, { headers })
      if (!res.ok) {
        console.warn(`  (skipping ${slug}: ${res.status})`)
        break
      }
      const body = await res.json()
      docs = docs.concat(body.docs ?? [])
      if (!body.hasNextPage) break
    }
    raw.collections[slug] = docs
  }
  for (const g of globals) {
    const res = await fetch(`${base}/api/globals/${g.slug}?${q}`, { headers })
    if (res.ok) raw.globals[g.slug] = await res.json()
  }
  return raw
}

async function readFromDir() {
  const dir = opt('from-dir')
  const raw = { collections: {}, globals: {} }
  for (const slug of FETCH) {
    const file = path.join(dir, `${slug}.json`)
    raw.collections[slug] = existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : []
  }
  for (const g of globals) {
    const file = path.join(dir, `global-${g.slug}.json`)
    if (existsSync(file)) raw.globals[g.slug] = JSON.parse(await readFile(file, 'utf8'))
  }
  return raw
}

/** Photos and PDFs → files in `into` (downloaded from the old CMS, or copied from --media-dir) */
async function fetchFiles(raw, into) {
  await mkdir(into, { recursive: true })
  const files = [...(raw.collections.media ?? []), ...(raw.collections.documents ?? [])]
  let n = 0
  for (const doc of files) {
    const target = path.join(into, doc.filename)
    if (opt('media-dir')) {
      const src = path.join(opt('media-dir'), doc.filename)
      if (!existsSync(src)) throw new Error(`File ${src} is missing (referenced by ${doc.filename}).`)
      await copyFile(src, target)
    } else {
      const url = /^https?:/.test(doc.url) ? doc.url : `${raw.base}${doc.url}`
      const res = await fetch(url, { headers: raw.headers })
      if (!res.ok) throw new Error(`Could not download ${url} (${res.status}).`)
      await writeFile(target, Buffer.from(await res.arrayBuffer()))
    }
    n++
  }
  return n
}

/* ------------------------------------------------------------------ main */

console.log(opt('url') ? `Reading ${opt('url')} …` : `Reading ${opt('from-dir')} …`)
const raw = opt('url') ? await readFromApi() : await readFromDir()
for (const [slug, docs] of Object.entries(raw.collections)) if (docs.length) console.log(`  ${slug.padEnd(18)} ${docs.length}`)

const converted = convertBundle(raw)

if (flag('snapshot')) {
  const out = path.resolve(opt('out') ?? path.join(here, '..', 'src', 'seed'))
  const dataDir = path.join(out, 'data')
  await rm(dataDir, { recursive: true, force: true })
  await mkdir(path.join(dataDir, 'collections'), { recursive: true })
  await mkdir(path.join(dataDir, 'globals'), { recursive: true })
  for (const [slug, docs] of Object.entries(converted.collections)) if (docs.length) await writeFile(path.join(dataDir, 'collections', `${slug}.json`), `${JSON.stringify(docs, null, 1)}\n`)
  for (const [slug, doc] of Object.entries(converted.globals)) await writeFile(path.join(dataDir, 'globals', `${slug}.json`), `${JSON.stringify(doc, null, 1)}\n`)
  const copied = await fetchFiles(raw, path.join(out, 'media'))
  await writeFile(path.join(dataDir, 'manifest.json'), `${JSON.stringify({ importedFrom: opt('url') ?? 'JSON dump of the old Payload CMS API', importedAt: new Date().toISOString(), documents: Object.values(converted.collections).reduce((n, d) => n + d.length, 0), files: copied }, null, 1)}\n`)
  console.log(`\n✓ Snapshot written to ${out} (${copied} photo/PDF files).`)
} else {
  const { loadConfig } = await import('../src/config.js')
  const { createApp } = await import('../src/app.js')
  const { clearContent, ensureAdmin, isEmpty, loadSnapshot } = await import('../src/seed/load.js')
  const { ctx, close } = await createApp({ cfg: loadConfig() })
  const tmp = path.join(os.tmpdir(), `rohan-import-${Date.now()}`)
  try {
    if (flag('fresh')) {
      console.log('Deleting the existing content …')
      await clearContent(ctx)
    } else if (!(await isEmpty(ctx))) {
      throw new Error('The database already has content. Add --fresh to replace it.')
    }
    console.log('Fetching photos …')
    const copied = await fetchFiles(raw, tmp)
    console.log(`Loading ${copied} files and the content …`)
    const stats = await loadSnapshot(ctx, converted, { mediaDir: tmp, strict: false, log: () => {} })
    console.log(`\n✓ Imported ${stats.documents} documents (${stats.media} photos) and ${stats.globals} settings pages.`)
    if (stats.problems.length) {
      console.log(`\n⚠ ${stats.problems.length} item(s) could not be imported:`)
      for (const p of stats.problems) console.log(`  - ${p}`)
      process.exitCode = 2
    }
    const admin = await ensureAdmin(ctx)
    if (admin) console.log(`✓ Created the admin account ${admin} — change its password after signing in.`)
  } finally {
    await close()
    await rm(tmp, { recursive: true, force: true })
  }
}
