import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { L, createDoc, signedIn, startServer } from './helpers.js'

describe('website routes (SEO, redirects, security)', () => {
  let srv
  let admin
  let visitor
  before(async () => {
    srv = await startServer({ dist: true })
    admin = await signedIn(srv)
    visitor = srv.client()
    await admin.post('/api/globals/site-settings', { json: { siteName: L('Rohan Subhash Deshmukh'), tagline: L('Shaped by Solapur'), email: 'connect@test.local', social: { facebook: 'https://facebook.com/x' } } })
    await createDoc(admin, 'pages', { title: L('Family Background'), path: '/about/biography', subtitle: L('Spiritual values'), layout: [] })
    await createDoc(admin, 'pages', { title: L('Hidden page'), path: '/hidden', _status: 'draft' })
    await createDoc(admin, 'pages', { title: L('Old achievements'), path: '/about/achievements' })
    await createDoc(admin, 'posts', { title: L('A <b>great</b> "post" & more'), slug: 'great-post', excerpt: L('Short summary'), content: L('<p>Body text here</p>') })
    await createDoc(admin, 'posts', { title: L('Draft post'), slug: 'draft-post', _status: 'draft' })
    await createDoc(admin, 'initiatives', { title: L('Annapurna'), slug: 'annapurna', category: 'food', excerpt: L('Meals for seniors') })
    await createDoc(admin, 'events', { title: L('Youth Festival'), slug: 'youth-festival', tagline: L('A stage for talent') })
    await createDoc(admin, 'albums', { title: L('Family Moments'), slug: 'family-moments' }).catch(() => {})
  })
  after(() => srv.stop())

  const html = async (path, opts) => {
    const res = await visitor.get(path, { raw: true, ...opts })
    return { status: res.status, headers: res.headers, text: res.body.toString('utf8') }
  }

  describe('robots.txt and sitemap.xml', () => {
    it('robots.txt keeps crawlers out of the admin and API and names the sitemap', async () => {
      const r = await html('/robots.txt')
      assert.equal(r.status, 200)
      assert.match(r.text, /Disallow: \/admin/)
      assert.match(r.text, /Disallow: \/api/)
      assert.match(r.text, /Sitemap: http:\/\/site\.test\/sitemap\.xml/)
    })

    it('sitemap lists the fixed pages, published content only, and not removed pages', async () => {
      const r = await html('/sitemap.xml')
      assert.equal(r.status, 200)
      assert.match(r.headers.get('content-type'), /xml/)
      for (const p of ['http://site.test</loc>', '/blog</loc>', '/contact</loc>', '/about/biography</loc>', '/blog/great-post</loc>', '/social-work/annapurna</loc>', '/events/youth-festival</loc>']) assert.ok(r.text.includes(p), p)
      assert.ok(!r.text.includes('draft-post'))
      assert.ok(!r.text.includes('/hidden'))
      assert.ok(!r.text.includes('/about/achievements'))
      assert.match(r.text, /<lastmod>20\d\d-/)
    })
  })

  describe('redirects', () => {
    it('removes the /en prefix of the old bilingual URLs (permanent redirect)', async () => {
      const r = await html('/en/about/biography?x=1')
      assert.equal(r.status, 301)
      assert.equal(r.headers.get('location'), '/about/biography?x=1')
      assert.equal((await html('/en')).headers.get('location'), '/')
    })

    it('sends removed pages to the nearest page', async () => {
      for (const [from, to] of [['/grievance', '/contact'], ['/careers', '/contact'], ['/about/achievements', '/about/biography'], ['/lokmangal/vishwamangal', '/lokmangal/foundation'], ['/search', '/']]) {
        const r = await html(from)
        assert.equal(r.status, 301, from)
        assert.equal(r.headers.get('location'), to, from)
      }
    })

    it('removes a trailing slash', async () => {
      const r = await html('/blog/')
      assert.equal(r.status, 301)
      assert.equal(r.headers.get('location'), '/blog')
    })
  })

  describe('the single-page app shell', () => {
    it('home: title, description and share tags for crawlers', async () => {
      const r = await html('/')
      assert.equal(r.status, 200)
      assert.match(r.text, /<title>Rohan Subhash Deshmukh<\/title>/)
      assert.match(r.text, /<meta name="description" content="Shaped by Solapur" data-ssr-meta>/)
      assert.match(r.text, /property="og:type" content="website"/)
      assert.match(r.text, /name="twitter:card" content="summary_large_image"/)
      assert.match(r.text, /<link rel="canonical" href="http:\/\/site\.test" data-ssr-meta>/)
      assert.match(r.text, /"@type":"Person"/)
      assert.equal(r.headers.get('cache-control'), 'no-cache')
    })

    it('a CMS page: its own title, subtitle and canonical address', async () => {
      const r = await html('/about/biography')
      assert.equal(r.status, 200)
      assert.match(r.text, /<title>Family Background \| Rohan Subhash Deshmukh<\/title>/)
      assert.match(r.text, /content="Spiritual values"/)
      assert.match(r.text, /href="http:\/\/site\.test\/about\/biography"/)
    })

    it('a post: article tags, JSON-LD, and escaped text', async () => {
      const r = await html('/blog/great-post')
      assert.equal(r.status, 200)
      assert.match(r.text, /<title>A &lt;b&gt;great&lt;\/b&gt; &quot;post&quot; &amp; more \| Rohan Subhash Deshmukh<\/title>/)
      assert.match(r.text, /property="og:type" content="article"/)
      assert.match(r.text, /"@type":"NewsArticle"/)
      assert.match(r.text, /content="Short summary"/)
      assert.ok(!r.text.includes('<b>great</b>'))
    })

    it('initiatives, events and fixed pages get their titles', async () => {
      assert.match((await html('/social-work/annapurna')).text, /<title>Annapurna \| /)
      assert.match((await html('/events/youth-festival')).text, /<title>Youth Festival \| /)
      assert.match((await html('/events/youth-festival')).text, /content="A stage for talent"/)
      assert.match((await html('/blog')).text, /<title>Articles &amp; Perspectives \| /)
      assert.match((await html('/contact')).text, /<title>Contact \| /)
    })

    it('unknown pages are a real 404 (not a "soft 404") and are not indexed', async () => {
      for (const p of ['/does-not-exist', '/blog/no-such-post', '/social-work/nope', '/events/nope', '/media/photos/nope', '/hidden', '/draft-post']) {
        const r = await html(p)
        assert.equal(r.status, 404, p)
        assert.match(r.text, /<meta name="robots" content="noindex, nofollow"/, p)
        assert.match(r.text, /<title>Page not found \| /, p)
      }
      assert.equal((await html('/blog/draft-post')).status, 404) // a draft is not public
    })

    it('the admin is served but never indexed', async () => {
      const r = await html('/admin/collections/posts')
      assert.equal(r.status, 200)
      assert.match(r.text, /noindex/)
    })

    it('a malformed address is a 400, not a crash', async () => {
      assert.equal((await html('/%E0%A4%A')).status, 400)
    })

    it('missing files are 404, never the start page', async () => {
      const r = await html('/missing-file.js')
      assert.equal(r.status, 404)
      assert.ok(!r.text.includes('<html'))
    })

    it('hashed assets are cached for a year; the HTML never is', async () => {
      const asset = await html('/assets/app-abc123.js')
      assert.equal(asset.status, 200)
      assert.match(asset.headers.get('cache-control'), /immutable/)
      assert.equal((await html('/')).headers.get('cache-control'), 'no-cache')
    })
  })

  describe('security headers', () => {
    it('sends a content-security-policy that allows YouTube, Instagram, Google Maps and nothing wild', async () => {
      const r = await html('/')
      const csp = r.headers.get('content-security-policy')
      assert.match(csp, /default-src 'self'/)
      assert.match(csp, /frame-src [^;]*https:\/\/www\.youtube-nocookie\.com/)
      assert.match(csp, /frame-src [^;]*https:\/\/www\.instagram\.com/)
      assert.match(csp, /img-src [^;]*https:\/\/i\.ytimg\.com/)
      assert.match(csp, /img-src [^;]*https:\/\/\*\.fbcdn\.net/) // photos of the Facebook posts on the home page
      assert.match(csp, /object-src 'none'/)
      assert.match(csp, /frame-ancestors 'self'/)
      assert.ok(!/script-src[^;]*unsafe-eval/.test(csp))
      assert.equal(r.headers.get('x-content-type-options'), 'nosniff')
      assert.ok(!r.headers.get('x-powered-by'))
    })

    it('CORS: the site itself is allowed, a foreign origin is not', async () => {
      const ok = await visitor.get('/api/pages', { headers: { Origin: 'http://site.test' } })
      assert.equal(ok.headers.get('access-control-allow-origin'), 'http://site.test')
      assert.equal(ok.headers.get('access-control-allow-credentials'), 'true')
      const bad = await visitor.get('/api/pages', { headers: { Origin: 'https://evil.example' } })
      assert.equal(bad.headers.get('access-control-allow-origin'), null)
    })

    it('API reads may be cached for visitors; anything for staff is private', async () => {
      assert.match((await visitor.get('/api/pages')).headers.get('cache-control'), /public, max-age=30/)
      assert.equal((await admin.get('/api/pages')).headers.get('cache-control'), 'private, no-store')
      assert.equal((await admin.post('/api/categories', { json: { title: L('c') } })).headers.get('cache-control'), 'no-store')
    })

    it('unknown API paths answer with JSON', async () => {
      const r = await visitor.get('/api/not/a/route')
      assert.equal(r.status, 404)
      assert.equal(typeof r.data.message, 'string')
    })

    it('malformed JSON is a 400 with a clear message', async () => {
      const res = await fetch(`${srv.base}/api/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{nope' })
      assert.equal(res.status, 400)
      assert.match((await res.json()).message, /not valid JSON/)
    })
  })
})

describe('rate limits', () => {
  let srv
  before(async () => {
    srv = await startServer({ env: { RATE_LIMIT_DISABLED: 'false' } })
  })
  after(() => srv.stop())

  it('blocks sign-in after 10 failed attempts from one address', async () => {
    const c = srv.client()
    let last
    for (let i = 0; i < 11; i++) last = await c.login('nobody@test.local', 'wrong-password')
    assert.equal(last.status, 429)
    assert.match(last.data.message, /Too many requests/)
  })

  it('allows only 5 contact form submissions per 10 minutes', async () => {
    const admin = await signedIn(srv).catch(() => null)
    void admin // the sign-in limiter is already used up above; the form limiter is separate
    const send = () => {
      const f = new FormData()
      for (const [k, v] of Object.entries({ name: 'A', mobile: '9876543210', email: 'a@b.co', subject: 's', office: '1' })) f.set(k, v)
      return srv.client().post('/api/forms/contact', { form: f })
    }
    const codes = []
    for (let i = 0; i < 6; i++) codes.push((await send()).status)
    assert.equal(codes.at(-1), 429)
    assert.ok(codes.slice(0, 5).every((c) => c !== 429))
  })
})
