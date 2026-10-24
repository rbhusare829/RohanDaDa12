import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadConfig } from '../src/config.js'
import { createBlobStorage, createStorage } from '../src/lib/storage.js'

const TOKEN = 'vercel_blob_rw_AbC123xYz_secretPart42'

/** a stand-in for the @vercel/blob client that keeps files in memory */
function fakeClient() {
  const files = new Map()
  const calls = []
  return {
    files,
    calls,
    async put(pathname, body, options) {
      calls.push({ op: 'put', pathname, options })
      files.set(`https://abc123xyz.public.blob.vercel-storage.com/${pathname}`, { body: Buffer.from(body), type: options.contentType })
      return { url: `https://abc123xyz.public.blob.vercel-storage.com/${pathname}` }
    },
    async del(url) {
      calls.push({ op: 'del', url })
      files.delete(url)
    },
    async head(url) {
      if (!files.has(url)) throw new Error('not found')
      return { url }
    },
    async fetch(url) {
      const f = files.get(url)
      if (!f) return new Response(null, { status: 404 })
      return new Response(f.body, { headers: { 'content-type': f.type, 'content-length': String(f.body.length) } })
    },
  }
}

describe('Vercel Blob storage', () => {
  const cfg = loadConfig({ NODE_ENV: 'test', BLOB_READ_WRITE_TOKEN: TOKEN })

  it('is chosen on its own when the Blob token is set, and finds the store address in the token', () => {
    assert.equal(cfg.storage.driver, 'vercel-blob')
    const storage = createStorage(cfg)
    assert.equal(storage.driver, 'vercel-blob')
    assert.equal(storage.url('photo.webp'), 'https://abc123xyz.public.blob.vercel-storage.com/site/photo.webp')
  })

  it('stores, reads, checks and removes a file', async () => {
    const client = fakeClient()
    const storage = createBlobStorage(cfg, client)
    await storage.put('photo.webp', Buffer.from('img'), 'image/webp')
    const put = client.calls.find((c) => c.op === 'put')
    assert.equal(put.pathname, 'site/photo.webp')
    assert.equal(put.options.access, 'public')
    assert.equal(put.options.addRandomSuffix, false)
    assert.equal(put.options.allowOverwrite, true)
    assert.equal(put.options.token, TOKEN)
    assert.equal(await storage.exists('photo.webp'), true)
    const { stream, size, contentType } = await storage.read('photo.webp')
    const chunks = []
    for await (const c of stream) chunks.push(c)
    assert.equal(Buffer.concat(chunks).toString(), 'img')
    assert.equal(size, 3)
    assert.equal(contentType, 'image/webp')
    await storage.remove('photo.webp')
    assert.equal(await storage.exists('photo.webp'), false)
    await assert.rejects(storage.read('photo.webp'), /not found/i)
  })

  it('hides private files (form attachments) under an address that cannot be guessed from the file name', async () => {
    const client = fakeClient()
    const storage = createBlobStorage(cfg, client)
    await storage.put('private/cv-1a2b3c4d5e.pdf', Buffer.from('%PDF'), 'application/pdf')
    const put = client.calls.find((c) => c.op === 'put')
    assert.match(put.pathname, /^site\/private\/[0-9a-f]{32}\/cv-1a2b3c4d5e\.pdf$/)
    assert.equal(put.options.cacheControlMaxAge, 60)
    // a different token (another store) gives a different folder
    const other = createBlobStorage(loadConfig({ NODE_ENV: 'test', BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_Other1_zz' }), fakeClient())
    assert.notEqual(other.url('private/cv-1a2b3c4d5e.pdf').split('/').at(-2), put.pathname.split('/').at(-2))
    assert.ok(await storage.exists('private/cv-1a2b3c4d5e.pdf'))
  })

  it('refuses unsafe keys and a token it cannot read', () => {
    const storage = createBlobStorage(cfg, fakeClient())
    assert.throws(() => storage.url('../secret'), /Unsafe/)
    assert.throws(() => createBlobStorage(loadConfig({ NODE_ENV: 'test', BLOB_READ_WRITE_TOKEN: 'nonsense' }), fakeClient()), /does not look like/)
  })

  it('on Vercel, needs a real database instead of an SQLite file, and reads Neon addresses as PostgreSQL', () => {
    assert.throws(() => loadConfig({ NODE_ENV: 'test', VERCEL: '1' }), /real database/)
    const neon = loadConfig({
      NODE_ENV: 'test',
      VERCEL: '1',
      DATABASE_URL: 'postgres://u:p@ep-x-pooler.aws.neon.tech/neondb?sslmode=require',
      DATABASE_URL_UNPOOLED: 'postgresql://u:p@ep-x.aws.neon.tech/neondb?sslmode=require',
      DB_SCHEMA: 'site',
      VERCEL_ENV: 'production',
      VERCEL_PROJECT_PRODUCTION_URL: 'example.vercel.app',
      VERCEL_URL: 'example-abc.vercel.app',
    })
    assert.equal(neon.db.dialect, 'postgres')
    assert.match(neon.db.url, /ep-x\.aws\.neon\.tech/) // the direct (unpooled) connection
    assert.equal(neon.db.ssl, true)
    assert.equal(neon.db.schema, 'site')
    assert.equal(neon.publicUrl, 'https://example.vercel.app')
    assert.ok(neon.corsOrigins.includes('https://example-abc.vercel.app'))
    assert.equal(neon.backupCron, '')
    assert.equal(neon.serverless, true)
  })
})
