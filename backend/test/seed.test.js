import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'
import { clearContent, ensureAdmin, isEmpty, loadSnapshot, readSnapshot, resetAdmin } from '../src/seed/load.js'
import { signedIn, startServer } from './helpers.js'

describe('the bundled website content', () => {
  let srv
  let stats
  before(async () => {
    srv = await startServer()
    stats = await loadSnapshot(srv.ctx, await readSnapshot(), { log: () => {} })
  })
  after(() => srv.stop())

  it('loads completely: every document, with the same ids as the old site', async () => {
    // 235 documents / 171 photos from the old site, plus the three homepage cover photos and 186 project photos (Oct 2026)
    assert.equal(stats.documents, 425)
    assert.equal(stats.media, 360)
    assert.equal(stats.globals, 5)
    assert.deepEqual(stats.problems, [])
    const post = (await srv.client().get('/api/posts/1?locale=en')).data
    assert.match(post.title, /LOTUS/)
    assert.equal((await srv.client().get('/api/initiatives?limit=0')).data.totalDocs, 23) // 23 projects, as on the old site (Media Coverage restored Oct 2026)
  })

  it('gives new documents fresh ids after loading content that kept its own ids (PostgreSQL id counters)', async () => {
    const admin = await signedIn(srv)
    const before = (await srv.client().get('/api/categories?limit=0&depth=0')).data.docs.map((d) => d.id)
    const res = await admin.post('/api/categories', { json: { title: { en: 'Id counter check' }, slug: 'id-counter-check' } })
    assert.equal(res.status, 201, JSON.stringify(res.data))
    assert.ok(res.data.doc.id > Math.max(...before))
    await admin.delete(`/api/categories/${res.data.doc.id}`)
  })

  it('every project except Media Coverage has a cover photo and a gallery', async () => {
    const { docs } = (await srv.client().get('/api/initiatives?limit=0&depth=0')).data
    const bare = docs.filter((d) => !d.heroImage || !d.gallery?.length).map((d) => d.slug)
    assert.deepEqual(bare, ['madhyamanchi-dakhal'])
  })

  it('is not empty afterwards, and clearContent empties it again', async () => {
    assert.equal(await isEmpty(srv.ctx), false)
  })

  it('the homepage has its sections and a hero slider with photos', async () => {
    const home = (await srv.client().get('/api/globals/home?depth=2&locale=en')).data
    assert.deepEqual(home.sections.map((s) => s.blockType), ['heroSlider', 'aboutIntro', 'homeJourney', 'homeHighlights', 'homeVision', 'homeParivar', 'family', 'featuredVideo', 'socialFeeds'])
    const hero = home.sections[0]
    assert.equal(hero.slides[0].heading, 'I am Rohan Subhash Deshmukh')
    assert.match(hero.slides[0].image.url, /^\/uploads\/.+\.webp$/)
    assert.ok(existsSync(path.join(srv.dir, 'uploads', hero.slides[0].image.filename)))
    assert.equal(home.sections.find((s) => s.blockType === 'family').hidden, true)
  })

  it('the hero shows a photo of Rohan with "Get in touch" as the main button (the hero style can be switched to text only)', async () => {
    const home = (await srv.client().get('/api/globals/home?depth=2&locale=en')).data
    const hero = home.sections[0]
    assert.equal(hero.heroStyle, 'photo')
    for (const photo of [hero.photo, hero.photoMobile]) {
      assert.match(photo.url, /^\/uploads\/.+\.webp$/)
      assert.ok(existsSync(path.join(srv.dir, 'uploads', photo.filename)))
    }
    assert.ok(hero.photo.focalX > 50, 'the wide photo keeps Rohan (on the right) in view')
    assert.equal(hero.slides[0].buttons[0].url, '/contact')
    // the style is a real choice: anything but photo / text is refused
    const admin = await signedIn(srv)
    const raw = (await admin.get('/api/globals/home?depth=0&locale=all')).data
    const bad = await admin.post('/api/globals/home', { json: { sections: raw.sections.map((s) => (s.blockType === 'heroSlider' ? { ...s, heroStyle: 'video' } : s)) } })
    assert.equal(bad.status, 400)
    assert.match(JSON.stringify(bad.data), /listed options/)
  })

  it('the menu, footer and settings came across', async () => {
    const c = srv.client()
    const header = (await c.get('/api/globals/header?locale=en')).data
    // no "Connect" item: the header's orange Contact button is the way to the Contact page
    assert.deepEqual(header.nav.map((n) => n.label), ['Home', 'About', 'Lokmangal', 'Media', 'Vision'])
    assert.equal(header.nav[1].children.length, 4)
    const footer = (await c.get('/api/globals/footer?locale=en')).data
    assert.equal(footer.columns.length, 3)
    const settings = (await c.get('/api/globals/site-settings?locale=en&depth=1')).data
    assert.equal(settings.siteName, 'Rohan Subhash Deshmukh')
    assert.equal(settings.phone, '+91 8208737624')
    assert.ok(settings.logoLight.url)
  })

  it('pages, albums, events, videos and offices are all there', async () => {
    const c = srv.client()
    assert.equal((await c.get('/api/pages?limit=0')).data.totalDocs, 10)
    assert.equal((await c.get('/api/albums?limit=0')).data.totalDocs, 3)
    assert.equal((await c.get('/api/events?limit=0')).data.totalDocs, 5)
    assert.equal((await c.get('/api/videos?limit=0')).data.totalDocs, 4)
    const offices = (await c.get('/api/offices?limit=0&locale=en')).data.docs
    assert.deepEqual(offices.map((o) => o.name), ['Head Office, Solapur', 'Contact Office, Pune'])
    const family = (await c.get('/api/pages?where[path][equals]=/about/biography&depth=2&locale=en')).data.docs[0]
    assert.equal(family.layout.filter((b) => b.blockType === 'mediaText').length, 3)
    assert.match(family.layout[1].image.url, /^\/uploads\/.+\.webp$/)
  })

  it('article text came across as clean HTML, with its photos', async () => {
    const posts = (await srv.client().get('/api/posts?limit=0&locale=mr')).data.docs
    assert.ok(posts.some((p) => /<figure><img src="\/uploads\//.test(p.content)))
    for (const p of posts) assert.ok(!/<script|onerror=/i.test(p.content))
  })

  it('has English for every text that has Marathi (the site is shown in English only)', async () => {
    const missing = []
    const walk = (node, where) => {
      if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${where}[${i}]`))
      if (!node || typeof node !== 'object') return
      const empty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length)
      if ('en' in node && 'mr' in node && empty(node.en) && !empty(node.mr)) missing.push(where)
      for (const [k, v] of Object.entries(node)) walk(v, `${where}.${k}`)
    }
    const snapshot = await readSnapshot()
    walk(snapshot, 'content')
    assert.deepEqual(missing, [])
  })

  it('fillEnglish turns Marathi-only text into English and leaves English an editor wrote alone', async () => {
    const { fillEnglish } = await import('../src/seed/english.js')
    const doc = {
      icon: '०२',
      a: { en: null, mr: '<p>रक्ताची निर्मिती कृत्रिम पद्धतीने करता येत नसल्यामुळे गरजू रुग्णांसाठी रक्तदानाचे महत्त्व मोठे आहे.</p>' },
      b: { en: 'Kept', mr: 'लोटस' },
      c: { en: '', mr: 'Family Moments' },
      d: { en: null, mr: 'अज्ञात मजकूर' },
    }
    assert.equal(fillEnglish(doc), 3)
    assert.equal(doc.icon, '02')
    assert.match(doc.a.en, /^<p>Blood cannot be made artificially/)
    assert.equal(doc.b.en, 'Kept')
    assert.equal(doc.c.en, 'Family Moments')
    assert.equal(doc.d.en, null)
  })

  it('clearContent removes the content and the files; accounts stay', async () => {
    const users = await srv.ctx.db.models.users.count()
    await clearContent(srv.ctx)
    assert.equal(await isEmpty(srv.ctx), true)
    assert.equal(await srv.ctx.db.models.media.count(), 0)
    assert.equal(await srv.ctx.db.models.users.count(), users)
    assert.ok(!existsSync(path.join(srv.dir, 'uploads', 'logo-light.webp')))
  })
})

describe('the first admin account', () => {
  it('is never created in production with the example password', async () => {
    const srv = await startServer()
    try {
      // a database without users, a production setting and the password from .env.example
      await srv.ctx.db.models.users.destroy({ where: {} })
      const ctx = { ...srv.ctx, cfg: { ...srv.ctx.cfg, production: true, admin: { email: 'owner@example.com', password: 'ChangeMe@123' } } }
      await assert.rejects(() => ensureAdmin(ctx), /ADMIN_PASSWORD/)
      assert.equal(await srv.ctx.db.models.users.count(), 0)
      // a password of the owner's own is accepted
      ctx.cfg.admin.password = 'My-Own-Long-Password-7'
      assert.equal(await ensureAdmin(ctx), 'owner@example.com')
    } finally {
      await srv.stop()
    }
  })
})

describe('getting back in with `npm run admin`', () => {
  it('sets a new password, lifts a lock-out and ends the old sessions; an unknown e-mail becomes a super admin', async () => {
    const srv = await startServer()
    try {
      const old = srv.client()
      assert.equal((await old.post('/api/users/login', { json: { email: 'admin@test.local', password: 'Correct-Horse-9' } })).status, 200)
      // five wrong passwords lock the account
      for (let i = 0; i < 5; i++) await srv.client().post('/api/users/login', { json: { email: 'admin@test.local', password: 'wrong-password' } })
      assert.equal((await srv.client().post('/api/users/login', { json: { email: 'admin@test.local', password: 'Correct-Horse-9' } })).status, 423)

      const result = await resetAdmin(srv.ctx, { email: ' Admin@Test.Local ', password: 'A-New-Password-42' })
      assert.deepEqual(result, { created: false, email: 'admin@test.local' })
      assert.equal((await srv.client().post('/api/users/login', { json: { email: 'admin@test.local', password: 'Correct-Horse-9' } })).status, 401)
      assert.equal((await srv.client().post('/api/users/login', { json: { email: 'admin@test.local', password: 'A-New-Password-42' } })).status, 200)
      assert.equal((await old.get('/api/users/me')).data.user, null) // the session from before the reset has ended

      const created = await resetAdmin(srv.ctx, { email: 'second@test.local', password: 'Another-Password-7', name: 'Second' })
      assert.deepEqual(created, { created: true, email: 'second@test.local' })
      const me = await srv.client()
      await me.post('/api/users/login', { json: { email: 'second@test.local', password: 'Another-Password-7' } })
      assert.equal((await me.get('/api/users/me')).data.user.role, 'super-admin')

      // too short a password is refused and changes nothing
      await assert.rejects(() => resetAdmin(srv.ctx, { email: 'second@test.local', password: 'short' }))
      assert.equal((await srv.client().post('/api/users/login', { json: { email: 'second@test.local', password: 'Another-Password-7' } })).status, 200)
    } finally {
      await srv.stop()
    }
  })
})
