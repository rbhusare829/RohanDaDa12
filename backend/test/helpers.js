import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import mysql from 'mysql2/promise'
import pg from 'pg'
import sharp from 'sharp'
import { createApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import { ensureAdmin } from '../src/seed/load.js'

export const ADMIN = { email: 'admin@test.local', password: 'Correct-Horse-9' }

// TEST_MYSQL_URL=mysql://root@127.0.0.1:3306 runs the whole suite on MySQL / MariaDB instead of SQLite (a fresh database for every server)
const MYSQL_URL = process.env.TEST_MYSQL_URL
// TEST_POSTGRES_URL=postgres://postgres@127.0.0.1:5432/postgres runs it on PostgreSQL: a fresh database for every server,
// with the tables in their own schema ("site"), as on Vercel + Neon
const POSTGRES_URL = process.env.TEST_POSTGRES_URL
const pgAdmin = async (sql) => {
  const c = new pg.Client({ connectionString: POSTGRES_URL })
  await c.connect()
  try {
    await c.query(sql)
  } finally {
    await c.end()
  }
}
let databaseCounter = 0

/** A whole application on a random port with an in-memory database (or a fresh MySQL one) and a temporary upload folder */
export async function startServer({ env = {}, dist = false } = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'rohan-test-'))
  let database = null
  let dbEnv = { SQLITE_PATH: ':memory:' }
  if (MYSQL_URL) {
    database = `rohan_test_${process.pid}_${++databaseCounter}`
    const root = await mysql.createConnection(MYSQL_URL)
    await root.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await root.end()
    dbEnv = { DB_DIALECT: 'mysql', DATABASE_URL: `${MYSQL_URL.replace(/\/+$/, '')}/${database}` }
  } else if (POSTGRES_URL) {
    database = `rohan_test_${process.pid}_${++databaseCounter}`
    await pgAdmin(`CREATE DATABASE "${database}"`)
    const u = new URL(POSTGRES_URL)
    u.pathname = `/${database}`
    dbEnv = { DATABASE_URL: u.toString(), DB_SCHEMA: 'site' }
  }
  const frontendDist = path.join(dir, 'dist')
  if (dist) {
    await mkdir(path.join(frontendDist, 'assets'), { recursive: true })
    await writeFile(path.join(frontendDist, 'index.html'), '<!doctype html><html><head><title>Rohan</title><!--app-head--></head><body><div id="root"></div></body></html>')
    await writeFile(path.join(frontendDist, 'assets', 'app-abc123.js'), 'console.log(1)')
  }
  const cfg = loadConfig({
    NODE_ENV: 'test',
    ...dbEnv,
    UPLOAD_DIR: path.join(dir, 'uploads'),
    JWT_SECRET: 'test-secret-'.repeat(4),
    PUBLIC_URL: 'http://site.test',
    ADMIN_EMAIL: ADMIN.email,
    ADMIN_PASSWORD: ADMIN.password,
    FRONTEND_DIST: frontendDist,
    SERVE_FRONTEND: dist ? 'true' : 'false',
    ...env,
  })
  const mails = []
  const log = { info: () => {}, warn: () => {}, error: () => {} }
  const { app, ctx, close } = await createApp({ cfg, log })
  // capture e-mail instead of sending it
  ctx.mailer.send = async (m) => (mails.push(m), { sent: true })
  await ensureAdmin(ctx)
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })
  const base = `http://127.0.0.1:${server.address().port}`
  return {
    ctx,
    cfg,
    base,
    mails,
    dir,
    client: () => client(base, cfg.cookieName),
    async stop() {
      await new Promise((r) => server.close(r))
      await close()
      if (database && MYSQL_URL) {
        const root = await mysql.createConnection(MYSQL_URL)
        await root.query(`DROP DATABASE IF EXISTS \`${database}\``)
        await root.end()
      } else if (database && POSTGRES_URL) await pgAdmin(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`)
      await rm(dir, { recursive: true, force: true })
    },
  }
}

/** A tiny browser: keeps the session cookie, sends the header the admin sends */
export function client(base, cookieName = 'rd_token') {
  let cookie = ''
  const call = async (method, url, { json, form, headers = {}, csrf = true, raw = false } = {}) => {
    const h = { ...(csrf ? { 'X-Requested-With': 'XMLHttpRequest' } : {}), ...headers }
    if (cookie) h.Cookie = cookie
    let body
    if (json !== undefined) {
      h['Content-Type'] = 'application/json'
      body = JSON.stringify(json)
    }
    if (form) body = form
    const res = await fetch(base + url, { method, headers: h, body, redirect: 'manual' })
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(';')
      const i = pair.indexOf('=')
      const name = pair.slice(0, i)
      if (name !== cookieName) continue
      cookie = /expires=Thu, 01 Jan 1970/i.test(c) || pair.slice(i + 1) === '' ? '' : pair
    }
    if (raw) return { status: res.status, headers: res.headers, body: Buffer.from(await res.arrayBuffer()) }
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
    return { status: res.status, headers: res.headers, data }
  }
  return {
    get: (u, o) => call('GET', u, o),
    post: (u, o) => call('POST', u, o),
    patch: (u, o) => call('PATCH', u, o),
    delete: (u, o) => call('DELETE', u, o),
    login: (email = ADMIN.email, password = ADMIN.password) => call('POST', '/api/users/login', { json: { email, password } }),
    cookie: () => cookie,
    setCookie: (c) => (cookie = c),
  }
}

export async function signedIn(srv, creds) {
  const c = srv.client()
  const res = await c.login(creds?.email, creds?.password)
  if (res.status !== 200) throw new Error(`login failed: ${res.status} ${JSON.stringify(res.data)}`)
  return c
}

export const png = (w = 800, h = 600, color = '#f26b1d') => sharp({ create: { width: w, height: h, channels: 3, background: color } }).png().toBuffer()

export const multipart = (fields, file) => {
  const form = new FormData()
  for (const [k, v] of Object.entries(fields ?? {})) form.set(k, typeof v === 'string' ? v : JSON.stringify(v))
  if (file) form.set(file.field ?? 'file', new Blob([file.buffer], { type: file.type }), file.name)
  return form
}

/** The shape used by localized fields */
export const L = (en, mr = null) => ({ en, mr })

/** Creates content through the real API as the admin */
export const createDoc = async (c, slug, data) => {
  const res = await c.post(`/api/${slug}`, { json: data })
  if (res.status !== 201) throw new Error(`create ${slug} failed: ${res.status} ${JSON.stringify(res.data)}`)
  return res.data.doc
}
