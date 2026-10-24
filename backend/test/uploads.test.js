import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import sharp from 'sharp'
import { L, multipart, png, signedIn, startServer } from './helpers.js'

const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF')

describe('uploads', () => {
  let srv
  let admin
  before(async () => {
    srv = await startServer()
    admin = await signedIn(srv)
  })
  after(() => srv.stop())

  const upload = (buffer, name, type, fields) => admin.post('/api/media', { form: multipart(fields, { buffer, name, type }) })
  const fileOnDisk = (name) => path.join(srv.dir, 'uploads', name)

  describe('photos', () => {
    it('converts to WebP and makes the smaller copies of a large photo', async () => {
      const res = await upload(await png(3000, 2000), 'Big Photo.PNG', 'image/png')
      assert.equal(res.status, 201)
      const d = res.data.doc
      assert.equal(d.filename, 'big-photo.webp')
      assert.equal(d.mimeType, 'image/webp')
      assert.equal(d.width, 2400) // shrunk to the 2400px limit
      assert.equal(d.height, 1600)
      assert.equal(d.focalX, 50)
      assert.equal(d.sizes.thumb.width, 480)
      assert.equal(d.sizes.card.width, 960)
      assert.equal(d.sizes.hero.width, 1920)
      for (const f of ['big-photo.webp', 'big-photo__thumb.webp', 'big-photo__card.webp', 'big-photo__hero.webp']) assert.ok(existsSync(fileOnDisk(f)), f)
      const meta = await sharp(fileOnDisk('big-photo.webp')).metadata()
      assert.equal(meta.format, 'webp')
    })

    it('never enlarges a small photo (no copy larger than the original)', async () => {
      const d = (await upload(await png(700, 500), 'small.png', 'image/png')).data.doc
      assert.equal(d.width, 700)
      assert.equal(d.sizes.thumb.width, 480)
      assert.equal(d.sizes.card.url, null)
      assert.equal(d.sizes.hero.url, null)
    })

    it('gives a second photo with the same name a free name', async () => {
      const a = (await upload(await png(600, 400), 'twin.png', 'image/png')).data.doc
      const b = (await upload(await png(600, 400), 'twin.png', 'image/png')).data.doc
      assert.equal(a.filename, 'twin.webp')
      assert.equal(b.filename, 'twin-1.webp')
    })

    it('serves the file publicly with long-lived caching', async () => {
      const d = (await upload(await png(500, 500), 'serve-me.png', 'image/png')).data.doc
      const res = await srv.client().get(d.url, { raw: true })
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('content-type'), 'image/webp')
      assert.match(res.headers.get('cache-control'), /max-age=31536000/)
    })

    it('trusts what the file is, not what the browser says: a text file called photo.png is refused', async () => {
      const res = await upload(Buffer.from('<?php echo 1; ?>'), 'photo.png', 'image/png')
      assert.equal(res.status, 400)
      assert.match(res.data.message, /not a valid image/i)
    })

    it('refuses SVG (it can carry scripts)', async () => {
      const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
      const res = await upload(svg, 'x.svg', 'image/svg+xml')
      assert.equal(res.status, 400)
    })

    it('refuses a file over 15 MB', async () => {
      const big = Buffer.alloc(16 * 1024 * 1024, 1)
      const res = await upload(big, 'big.png', 'image/png')
      assert.equal(res.status, 413)
    })

    it('needs a file', async () => {
      const res = await admin.post('/api/media', { form: multipart({ _payload: { alt: L('x') } }) })
      assert.equal(res.status, 400)
    })

    it('stores alt text and lets the focal point be changed', async () => {
      const d = (await upload(await png(900, 900), 'focus.png', 'image/png', { _payload: { alt: L('Rohan at work', 'कामावर') } })).data.doc
      assert.deepEqual(d.alt, { en: 'Rohan at work', mr: 'कामावर' })
      const res = await admin.patch(`/api/media/${d.id}`, { json: { alt: d.alt, focalX: 30, focalY: 120 } })
      assert.equal(res.data.doc.focalX, 30)
      assert.equal(res.data.doc.focalY, 100) // clamped
      assert.equal(res.data.doc.filename, d.filename) // the file itself is untouched
    })

    it('replaces the file of a photo and removes the old files', async () => {
      const d = (await upload(await png(2000, 1000), 'replace.png', 'image/png')).data.doc
      assert.ok(existsSync(fileOnDisk(d.filename)))
      const res = await admin.patch(`/api/media/${d.id}`, { form: multipart({}, { buffer: await png(800, 800, '#000'), name: 'replacement.png', type: 'image/png' }) })
      assert.equal(res.status, 200)
      assert.equal(res.data.doc.filename, 'replacement.webp')
      assert.ok(!existsSync(fileOnDisk(d.filename)))
      assert.ok(!existsSync(fileOnDisk(`${d.filename.replace('.webp', '')}__thumb.webp`)))
    })

    it('deleting a photo removes its files', async () => {
      const d = (await upload(await png(2000, 1000), 'remove-me.png', 'image/png')).data.doc
      assert.equal((await admin.delete(`/api/media/${d.id}`)).status, 200)
      for (const n of ['remove-me.webp', 'remove-me__thumb.webp', 'remove-me__card.webp', 'remove-me__hero.webp']) assert.ok(!existsSync(fileOnDisk(n)), n)
      assert.equal((await srv.client().get(d.url, { raw: true })).status, 404)
    })

    it('does not let a path in the file name escape the upload folder', async () => {
      const res = await upload(await png(300, 300), '../../evil.png', 'image/png')
      assert.equal(res.status, 201)
      assert.equal(res.data.doc.filename, 'evil.webp')
    })

    it('visitors cannot upload; the traversal URL does not read other files', async () => {
      const v = srv.client()
      assert.equal((await v.post('/api/media', { form: multipart({}, { buffer: await png(300, 300), name: 'a.png', type: 'image/png' }) })).status, 401)
      for (const u of ['/uploads/../package.json', '/uploads/%2e%2e/package.json', '/uploads/..%2fsrc%2fconfig.js']) {
        const res = await v.get(u, { raw: true })
        assert.ok([400, 403, 404].includes(res.status), `${u} → ${res.status}`)
      }
    })
  })

  describe('documents (PDF)', () => {
    it('accepts a real PDF and serves it', async () => {
      const res = await admin.post('/api/documents', { form: multipart({ _payload: { title: L('Profile') } }, { buffer: PDF, name: 'Profile 2026.pdf', type: 'application/pdf' }) })
      assert.equal(res.status, 201)
      assert.equal(res.data.doc.filename, 'profile-2026.pdf')
      assert.equal(res.data.doc.url, '/uploads/documents/profile-2026.pdf')
      const file = await srv.client().get(res.data.doc.url, { raw: true })
      assert.equal(file.status, 200)
      assert.equal(file.body.subarray(0, 5).toString(), '%PDF-')
    })

    it('refuses a non-PDF named .pdf, and images', async () => {
      const fake = await admin.post('/api/documents', { form: multipart({}, { buffer: Buffer.from('MZ not a pdf'), name: 'x.pdf', type: 'application/pdf' }) })
      assert.equal(fake.status, 400)
      const img = await admin.post('/api/documents', { form: multipart({}, { buffer: await png(100, 100), name: 'x.png', type: 'image/png' }) })
      assert.equal(img.status, 400)
    })
  })

  describe('private form attachments', () => {
    it('are not publicly reachable, and editors download them as attachments', async () => {
      const form = new FormData()
      for (const [k, v] of Object.entries({ name: 'Asha', mobile: '9876543210', email: 'asha@example.com', subject: 'CV', office: '1' })) form.set(k, v)
      await admin.post('/api/offices', { json: { name: L('Office') } })
      form.set('attachment', new Blob([PDF], { type: 'application/pdf' }), 'My CV.pdf')
      const sent = await srv.client().post('/api/forms/contact', { form })
      assert.equal(sent.status, 200, JSON.stringify(sent.data))
      const stored = (await admin.get('/api/form-uploads')).data.docs[0]
      assert.match(stored.filename, /^my-cv-[0-9a-f]{10}\.pdf$/) // unguessable name
      assert.equal((await srv.client().get(`/uploads/private/${stored.filename}`, { raw: true })).status, 404)
      assert.equal((await srv.client().get(`/api/form-uploads/file/${stored.filename}`, { raw: true })).status, 401)
      const dl = await admin.get(`/api/form-uploads/file/${stored.filename}`, { raw: true })
      assert.equal(dl.status, 200)
      assert.match(dl.headers.get('content-disposition'), /^attachment;/)
      assert.equal(dl.headers.get('x-content-type-options'), 'nosniff')
    })
  })
})
