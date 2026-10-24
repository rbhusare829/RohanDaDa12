import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { L, createDoc, multipart, png, signedIn, startServer } from './helpers.js'

describe('content API', () => {
  let srv
  let admin
  let visitor
  before(async () => {
    srv = await startServer()
    admin = await signedIn(srv)
    visitor = srv.client()
  })
  after(() => srv.stop())

  describe('creating and validating', () => {
    it('creates a post, fills in the slug from the title, and adds ids to rows', async () => {
      const doc = await createDoc(admin, 'posts', {
        title: L('Hello World, Today!'),
        content: L('<p>Body</p>'),
        tags: ['a', 'b'],
      })
      assert.equal(doc.slug, 'hello-world-today')
      assert.equal(doc._status, 'published')
      assert.deepEqual(doc.tags, ['a', 'b'])
      assert.ok(doc.publishedAt)
      assert.equal(doc.author.en, null) // the Marathi default lives in the Marathi column
      assert.equal(doc.author.mr, 'रोहन देशमुख')
    })

    it('reports every problem at once, with field paths', async () => {
      const res = await admin.post('/api/events', {
        json: { title: L(null), editions: [{ title: L('No year') }], facts: [{ label: L('x') }] },
      })
      assert.equal(res.status, 400)
      const fields = res.data.errors.map((e) => e.field)
      assert.ok(fields.includes('title'))
      assert.ok(fields.includes('editions.0.year'))
      assert.ok(fields.includes('facts.0.value'))
    })

    it('keeps drafts incomplete: required fields are not enforced on a draft', async () => {
      const res = await admin.post('/api/events', { json: {} })
      assert.equal(res.status, 400)
      const draft = await admin.post('/api/posts', { json: { _status: 'draft' } })
      assert.equal(draft.status, 201)
      assert.equal(draft.data.doc._status, 'draft')
    })

    it('enforces unique slugs and paths', async () => {
      await createDoc(admin, 'categories', { title: L('Unique Cat'), slug: 'unique-cat' })
      const dup = await admin.post('/api/categories', { json: { title: L('Other'), slug: 'unique-cat' } })
      assert.equal(dup.status, 400)
      assert.deepEqual(dup.data.errors, [{ field: 'slug', message: 'Value must be unique.' }])
      await createDoc(admin, 'pages', { title: L('P1'), path: 'About/Team/' })
      const dupPath = await admin.post('/api/pages', { json: { title: L('P2'), path: '/about/team' } })
      assert.equal(dupPath.status, 400)
      assert.equal(dupPath.data.errors[0].field, 'path')
    })

    it('normalises page paths', async () => {
      const page = await createDoc(admin, 'pages', { title: L('Normalised'), path: '  /Legal//Terms/  '.replace('//', '/') })
      assert.equal(page.path, '/legal/terms')
    })

    it('slugs keep Devanagari letters and vowel signs', async () => {
      const doc = await createDoc(admin, 'categories', { title: L(null, 'सामाजिक कार्य') })
      assert.equal(doc.slug, 'सामाजिक-कार्य')
    })

    it('rejects unknown select values, bad e-mails, numbers out of range and unknown block types', async () => {
      const bad = await admin.post('/api/initiatives', { json: { title: L('X'), category: 'nonsense' } })
      assert.ok(bad.data.errors.some((e) => e.field === 'category'))
      const mail = await admin.post('/api/offices', { json: { name: L('O'), email: 'not-mail' } })
      assert.ok(mail.data.errors.some((e) => e.field === 'email'))
      const block = await admin.post('/api/pages', { json: { title: L('B'), path: '/b', layout: [{ blockType: 'nope' }] } })
      assert.ok(block.data.errors.some((e) => e.field === 'layout.0'))
    })

    it('checks that referenced photos exist', async () => {
      const res = await admin.post('/api/albums', { json: { title: L('Album'), photos: [9999] } })
      assert.equal(res.status, 400)
      assert.match(res.data.errors[0].message, /no longer exists/)
      assert.equal(res.data.errors[0].field, 'photos')
    })

    it('drops fields that are not in the schema', async () => {
      const doc = await createDoc(admin, 'categories', { title: L('Strict'), evil: 'x', passwordHash: 'y', id: 99999 })
      assert.ok(!('evil' in doc))
      assert.notEqual(doc.id, 99999)
    })

    it('limits text length', async () => {
      const res = await admin.post('/api/categories', { json: { title: L('x'.repeat(3000)) } })
      assert.equal(res.status, 400)
    })
  })

  describe('rich text', () => {
    it('removes scripts, event handlers and dangerous links before saving', async () => {
      const dirty =
        '<p onclick="alert(1)">Hi <script>alert(1)</script><a href="javascript:alert(2)">x</a> <a href="https://ok.example" target="_blank">ok</a></p><img src="x" onerror="alert(3)"><iframe src="https://evil"></iframe><h1>Title</h1>'
      const doc = await createDoc(admin, 'posts', { title: L('Sanitised'), content: L(dirty) })
      const html = doc.content.en
      assert.ok(!/script|onclick|onerror|javascript:|iframe/i.test(html), html)
      assert.match(html, /<a href="https:\/\/ok\.example" target="_blank" rel="noopener noreferrer">ok<\/a>/)
      assert.match(html, /<h2>Title<\/h2>/)
    })
  })

  describe('visibility', () => {
    it('visitors see published posts only; editors see drafts too', async () => {
      const draft = await createDoc(admin, 'posts', { title: L('Secret draft'), _status: 'draft' })
      const list = await visitor.get('/api/posts?limit=100')
      assert.ok(!list.data.docs.some((p) => p.id === draft.id))
      assert.equal((await visitor.get(`/api/posts/${draft.id}`)).status, 404)
      const seen = await admin.get('/api/posts?limit=100')
      assert.ok(seen.data.docs.some((p) => p.id === draft.id))
      assert.equal((await admin.get(`/api/posts/${draft.id}`)).status, 200)
    })

    it('a scheduled post appears only once its publish date has passed', async () => {
      const future = new Date(Date.now() + 86_400_000).toISOString()
      const past = new Date(Date.now() - 86_400_000).toISOString()
      const later = await createDoc(admin, 'posts', { title: L('Tomorrow'), publishedAt: future })
      const earlier = await createDoc(admin, 'posts', { title: L('Yesterday'), publishedAt: past })
      const ids = (await visitor.get('/api/posts?limit=100')).data.docs.map((p) => p.id)
      assert.ok(!ids.includes(later.id))
      assert.ok(ids.includes(earlier.id))
    })

    it('hides staff e-mail addresses from the public API but shows them to editors', async () => {
      const office = await createDoc(admin, 'offices', { name: L('Head office'), notifyEmails: ['staff@test.local'] })
      const pub = await visitor.get(`/api/offices/${office.id}`)
      assert.ok(!('notifyEmails' in pub.data))
      const priv = await admin.get(`/api/offices/${office.id}`)
      assert.deepEqual(priv.data.notifyEmails, ['staff@test.local'])
      const settings = await visitor.get('/api/globals/site-settings')
      assert.ok(!('formNotifyEmails' in settings.data))
    })

    it('hides related items the visitor may not see (a draft initiative on an event)', async () => {
      const ini = await createDoc(admin, 'initiatives', { title: L('Hidden initiative'), category: 'food', _status: 'draft' })
      const ev = await createDoc(admin, 'events', { title: L('Linked event'), initiative: ini.id })
      const pub = await visitor.get(`/api/events/${ev.id}?depth=1`)
      assert.equal(pub.data.initiative, null)
      const priv = await admin.get(`/api/events/${ev.id}?depth=1`)
      assert.equal(priv.data.initiative.id, ini.id)
    })
  })

  describe('languages', () => {
    let post
    before(async () => {
      post = await createDoc(admin, 'posts', { title: { en: 'English title', mr: 'मराठी शीर्षक' }, excerpt: { en: null, mr: 'फक्त मराठी' } })
    })

    it('returns the requested language, falling back to the other when it is empty', async () => {
      const en = (await visitor.get(`/api/posts/${post.id}?locale=en`)).data
      const mr = (await visitor.get(`/api/posts/${post.id}?locale=mr`)).data
      assert.equal(en.title, 'English title')
      assert.equal(en.excerpt, 'फक्त मराठी') // no English excerpt → Marathi shown
      assert.equal(mr.title, 'मराठी शीर्षक')
    })

    it('locale=all returns every language (the admin edit form)', async () => {
      const all = (await admin.get(`/api/posts/${post.id}?locale=all`)).data
      assert.deepEqual(all.title, { en: 'English title', mr: 'मराठी शीर्षक' })
    })

    it('a plain string for a localized field is stored as English', async () => {
      const doc = await createDoc(admin, 'categories', { title: 'Plain string' })
      assert.equal(doc.title.en, 'Plain string')
    })

    it('rejects language keys it does not know', async () => {
      const res = await admin.post('/api/categories', { json: { title: { en: 'x', fr: 'y' } } })
      assert.equal(res.status, 400)
    })
  })

  describe('queries', () => {
    let cats
    before(async () => {
      const a = await createDoc(admin, 'categories', { title: L('Alpha'), slug: 'q-alpha' })
      const b = await createDoc(admin, 'categories', { title: L('Beta'), slug: 'q-beta' })
      cats = { a, b }
      await createDoc(admin, 'posts', { title: L('Query one'), categories: [a.id], tags: ['red', 'blue'], publishedAt: '2026-01-01T00:00:00.000Z' })
      await createDoc(admin, 'posts', { title: L('Query two'), categories: [b.id], tags: ['blue'], publishedAt: '2026-02-01T00:00:00.000Z' })
      await createDoc(admin, 'posts', { title: L('Query three'), categories: [a.id, b.id], tags: ['green'], publishedAt: '2026-03-01T00:00:00.000Z' })
    })
    const titles = (res) => res.data.docs.map((p) => p.title)

    it('filters by a relationship (contains) and sorts newest first', async () => {
      const res = await visitor.get(`/api/posts?where[categories][contains]=${cats.a.id}&where[title][like]=query&sort=-publishedAt`)
      assert.deepEqual(titles(res), ['Query three', 'Query one'])
    })

    it('filters by a tag, by "in", and by text with like', async () => {
      assert.deepEqual(titles(await visitor.get('/api/posts?where[tags][contains]=blue&where[title][like]=query&sort=publishedAt')), ['Query one', 'Query two'])
      assert.deepEqual(titles(await visitor.get(`/api/posts?where[categories][in]=${cats.b.id}&where[title][like]=query&sort=publishedAt`)), ['Query two', 'Query three'])
      assert.deepEqual(titles(await visitor.get('/api/posts?where[title][like]=THREE')), ['Query three'])
    })

    it('supports and / or groups the way the website sends them', async () => {
      const q = `where[and][0][_status][equals]=published&where[and][1][or][0][title][like]=query one&where[and][1][or][1][title][like]=query two&sort=publishedAt`
      assert.deepEqual(titles(await visitor.get(`/api/posts?${q}`)), ['Query one', 'Query two'])
    })

    it('paginates and reports totals', async () => {
      const res = await visitor.get('/api/posts?where[title][like]=query&sort=publishedAt&limit=2&page=2')
      assert.equal(res.data.totalDocs, 3)
      assert.equal(res.data.totalPages, 2)
      assert.equal(res.data.page, 2)
      assert.equal(res.data.hasPrevPage, true)
      assert.equal(res.data.hasNextPage, false)
      assert.deepEqual(titles(res), ['Query three'])
    })

    it('counts', async () => {
      const res = await visitor.get('/api/posts/count?where[title][like]=query')
      assert.equal(res.data.totalDocs, 3)
    })

    it('sorts by localized text in the requested language', async () => {
      const res = await visitor.get('/api/categories?where[slug][like]=q-&sort=title')
      assert.deepEqual(titles(res), ['Alpha', 'Beta'])
      const desc = await visitor.get('/api/categories?where[slug][like]=q-&sort=-title')
      assert.deepEqual(titles(desc), ['Beta', 'Alpha'])
    })

    it('rejects unknown operators and unknown fields', async () => {
      assert.equal((await visitor.get('/api/posts?where[title][regex]=x')).status, 400)
      assert.equal((await visitor.get('/api/posts?where[nonsense][equals]=x')).status, 400)
    })

    it('caps the page size', async () => {
      const res = await visitor.get('/api/posts?limit=100000')
      assert.ok(res.data.limit <= 500)
    })

    it('populates relationships to the requested depth', async () => {
      const post = (await visitor.get('/api/posts?where[title][like]=query three&depth=1')).data.docs[0]
      assert.equal(typeof post.categories[0], 'object')
      assert.ok(post.categories[0].slug)
      const shallow = (await visitor.get('/api/posts?where[title][like]=query three&depth=0')).data.docs[0]
      assert.equal(typeof shallow.categories[0], 'number')
    })
  })

  describe('updating and deleting', () => {
    it('updates only what is sent and keeps the rest', async () => {
      const doc = await createDoc(admin, 'posts', { title: L('Before'), excerpt: L('Keep me'), tags: ['x'] })
      const res = await admin.patch(`/api/posts/${doc.id}`, { json: { title: L('After') } })
      assert.equal(res.status, 200)
      assert.equal(res.data.doc.title.en, 'After')
      assert.equal(res.data.doc.excerpt.en, 'Keep me')
      assert.deepEqual(res.data.doc.tags, ['x'])
    })

    it('publishing and unpublishing changes visibility', async () => {
      const doc = await createDoc(admin, 'posts', { title: L('Toggle me') })
      assert.equal((await visitor.get(`/api/posts/${doc.id}`)).status, 200)
      await admin.patch(`/api/posts/${doc.id}`, { json: { _status: 'draft' } })
      assert.equal((await visitor.get(`/api/posts/${doc.id}`)).status, 404)
      await admin.patch(`/api/posts/${doc.id}`, { json: { _status: 'published' } })
      assert.equal((await visitor.get(`/api/posts/${doc.id}`)).status, 200)
    })

    it('keeps the last 20 versions and lets an editor read them', async () => {
      const doc = await createDoc(admin, 'posts', { title: L('Versioned 0') })
      for (let i = 1; i <= 22; i++) await admin.patch(`/api/posts/${doc.id}`, { json: { title: L(`Versioned ${i}`) } })
      const list = await admin.get(`/api/posts/${doc.id}/versions`)
      assert.equal(list.data.docs.length, 20)
      const newest = await admin.get(`/api/posts/${doc.id}/versions/${list.data.docs[0].id}`)
      assert.equal(newest.data.data.title.en, 'Versioned 22')
      assert.equal((await visitor.get(`/api/posts/${doc.id}/versions`)).status, 401)
    })

    it('deletes, and the document is gone', async () => {
      const doc = await createDoc(admin, 'categories', { title: L('Delete me') })
      assert.equal((await admin.delete(`/api/categories/${doc.id}`)).status, 200)
      assert.equal((await visitor.get(`/api/categories/${doc.id}`)).status, 404)
      assert.equal((await admin.delete(`/api/categories/${doc.id}`)).status, 404)
    })
  })

  describe('blocks and groups (pages, globals)', () => {
    it('stores a page with blocks, gives rows ids and keeps their order', async () => {
      const page = await createDoc(admin, 'pages', {
        title: L('Blocks'),
        path: '/blocks',
        layout: [
          { blockType: 'content', body: L('<p>One</p>') },
          { blockType: 'cards', items: [{ title: L('Card A'), tags: { en: ['t1'], mr: [] } }, { title: L('Card B') }] },
          { blockType: 'quote', text: L('Words') },
        ],
      })
      const full = (await visitor.get(`/api/pages/${page.id}?locale=en`)).data
      assert.deepEqual(full.layout.map((b) => b.blockType), ['content', 'cards', 'quote'])
      assert.ok(full.layout.every((b) => typeof b.id === 'string' && b.id.length >= 8))
      assert.equal(full.layout[1].items[0].title, 'Card A')
      assert.deepEqual(full.layout[1].items[0].tags, ['t1'])
      assert.equal(full.layout[0].body, '<p>One</p>')
    })

    it('updates a global, and visitors can read it', async () => {
      const res = await admin.post('/api/globals/footer', {
        json: { copyright: L('© 2026 Test'), columns: [{ title: L('Col'), links: [{ label: L('Home'), url: '/' }] }] },
      })
      assert.equal(res.status, 200)
      const read = await visitor.get('/api/globals/footer?locale=en')
      assert.equal(read.data.copyright, '© 2026 Test')
      assert.equal(read.data.columns[0].links[0].url, '/')
    })

    it('only editors may update a global', async () => {
      assert.equal((await visitor.post('/api/globals/footer', { json: { copyright: L('x') } })).status, 401)
    })

    it('returns defaults for a global that was never saved', async () => {
      const popup = (await visitor.get('/api/globals/popup')).data
      assert.equal(popup.enabled, false)
      assert.equal(popup.delaySeconds, 2)
    })

    it('rejects an unknown collection or global', async () => {
      assert.equal((await visitor.get('/api/nothing')).status, 404)
      assert.equal((await visitor.get('/api/globals/nothing')).status, 404)
    })
  })

  describe('media', () => {
    it('populates uploaded photos with sizes (checked in uploads.test.js) and the alt text', async () => {
      const file = { buffer: await png(2000, 1000), type: 'image/png', name: 'Hero Photo.png' }
      const up = await admin.post('/api/media', { form: multipart({ _payload: { alt: L('A hero') } }, file) })
      assert.equal(up.status, 201)
      const post = await createDoc(admin, 'posts', { title: L('With cover'), coverImage: up.data.doc.id })
      const res = (await visitor.get(`/api/posts/${post.id}?depth=1`)).data
      assert.equal(res.coverImage.alt, 'A hero')
      assert.match(res.coverImage.url, /\/uploads\/hero-photo\.webp$/)
    })
  })
})

describe('public view', () => {
  let srv
  let admin
  before(async () => {
    srv = await startServer()
    admin = await signedIn(srv)
  })
  after(() => srv.stop())

  it('"X-Public-View: 1" shows a signed-in editor what a visitor sees (no drafts)', async () => {
    const draft = await createDoc(admin, 'posts', { title: L('Only a draft'), _status: 'draft' })
    assert.ok((await admin.get('/api/posts?limit=50')).data.docs.some((p) => p.id === draft.id))
    const asVisitor = await admin.get('/api/posts?limit=50', { headers: { 'X-Public-View': '1' } })
    assert.ok(!asVisitor.data.docs.some((p) => p.id === draft.id))
  })

  it('an editor browsing the website never gets a cacheable answer (a change shows at once); real visitors do', async () => {
    const editor = await admin.get('/api/posts?limit=5', { headers: { 'X-Public-View': '1' } })
    assert.equal(editor.headers.get('cache-control'), 'private, no-store')
    const anyone = await srv.client().get('/api/posts?limit=5', { headers: { 'X-Public-View': '1' } })
    assert.match(anyone.headers.get('cache-control'), /public, max-age=30/)
  })

  it('does not downgrade writes (only reads are affected)', async () => {
    const res = await admin.post('/api/categories', { json: { title: L('Still allowed') }, headers: { 'X-Public-View': '1' } })
    assert.equal(res.status, 201)
  })
})
