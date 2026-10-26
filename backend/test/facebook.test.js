import assert from 'node:assert/strict'
import http from 'node:http'
import { after, before, describe, it, mock } from 'node:test'
import { startServer } from './helpers.js'

/** A stand-in for graph.facebook.com that records what it is asked */
async function fakeGraph() {
  const calls = []
  const state = { status: 200, body: { data: [] } }
  const server = http.createServer((req, res) => {
    calls.push(new URL(req.url, 'http://graph.test'))
    res.writeHead(state.status, { 'Content-Type': 'application/json' }).end(JSON.stringify(state.body))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return { calls, state, url: `http://127.0.0.1:${server.address().port}`, stop: () => new Promise((resolve) => server.close(resolve)) }
}

const POSTS = {
  data: [
    { id: '1_1', message: '  Community wedding today  ', created_time: '2026-10-20T10:00:00+0000', full_picture: 'https://scontent.xx.fbcdn.net/a.jpg', permalink_url: 'https://www.facebook.com/page/posts/1' },
    { id: '1_2', created_time: '2026-10-19T10:00:00+0000' }, // nothing to show (no text, no photo) → dropped
    { id: '1_3', message: 'Text only post', created_time: '2026-10-18T10:00:00+0000' },
    { id: '1_4', created_time: '2026-10-17T10:00:00+0000', full_picture: 'https://scontent.xx.fbcdn.net/b.jpg' },
    ...[5, 6, 7, 8, 9].map((n) => ({ id: `1_${n}`, message: `Post ${n}` })),
  ],
}

describe('Facebook latest posts', () => {
  describe('not set up', () => {
    let srv
    before(async () => {
      srv = await startServer()
    })
    after(() => srv.stop())

    it('answers with an empty list (the home page then shows a plain follow card)', async () => {
      const r = await srv.client().get('/api/facebook/posts')
      assert.equal(r.status, 200)
      assert.deepEqual(r.data, { posts: [] })
    })
  })

  describe('with a Page id and token', () => {
    let srv
    let graph
    before(async () => {
      graph = await fakeGraph()
      graph.state.body = POSTS
      srv = await startServer({ env: { FACEBOOK_PAGE_ID: '12345', FACEBOOK_PAGE_TOKEN: 'secret-page-token', FACEBOOK_GRAPH_URL: graph.url } })
      mock.timers.enable({ apis: ['Date'], now: Date.now() })
    })
    after(async () => {
      mock.timers.reset()
      await srv.stop()
      await graph.stop()
    })

    it('reads the Page\'s posts with the token, keeps those with text or a photo, at most six', async () => {
      const r = await srv.client().get('/api/facebook/posts')
      assert.equal(r.status, 200)
      assert.equal(r.data.posts.length, 6)
      assert.deepEqual(r.data.posts[0], { id: '1_1', text: 'Community wedding today', image: 'https://scontent.xx.fbcdn.net/a.jpg', url: 'https://www.facebook.com/page/posts/1', createdAt: '2026-10-20T10:00:00+0000' })
      assert.deepEqual(r.data.posts.slice(1, 3).map((p) => p.id), ['1_3', '1_4'])
      assert.equal(r.data.posts[1].image, null)
      assert.equal(r.data.posts[2].url, 'https://www.facebook.com/1_4') // no permalink → built from the id
      const call = graph.calls.at(-1)
      assert.match(call.pathname, /^\/v\d+\.\d+\/12345\/posts$/)
      assert.equal(call.searchParams.get('access_token'), 'secret-page-token')
      assert.match(call.searchParams.get('fields'), /full_picture/)
    })

    it('never sends the token to the browser, and lets the CDN keep the answer', async () => {
      const r = await srv.client().get('/api/facebook/posts')
      assert.ok(!JSON.stringify(r.data).includes('secret-page-token'))
      assert.match(r.headers.get('cache-control'), /s-maxage=600/)
    })

    it('asks Facebook once for many visitors within ten minutes', async () => {
      const asked = graph.calls.length
      await Promise.all([1, 2, 3].map(() => srv.client().get('/api/facebook/posts')))
      assert.equal(graph.calls.length, asked)
    })

    it('keeps showing the last good posts when Facebook fails, then recovers', async () => {
      graph.state.status = 400
      graph.state.body = { error: { message: 'Invalid OAuth access token.' } }
      mock.timers.tick(11 * 60_000)
      const failed = await srv.client().get('/api/facebook/posts')
      assert.equal(failed.status, 200)
      assert.equal(failed.data.posts.length, 6)
      assert.match(failed.headers.get('cache-control'), /max-age=60$/)

      const calls = graph.calls.length
      await srv.client().get('/api/facebook/posts') // within the one-minute pause: no new request
      assert.equal(graph.calls.length, calls)

      graph.state.status = 200
      graph.state.body = { data: [{ id: '2_1', message: 'Fresh post' }] }
      mock.timers.tick(61_000)
      const recovered = await srv.client().get('/api/facebook/posts')
      assert.deepEqual(recovered.data.posts.map((p) => p.id), ['2_1'])
    })
  })

  describe('Facebook failing from the start', () => {
    let srv
    let graph
    before(async () => {
      graph = await fakeGraph()
      graph.state.status = 400
      graph.state.body = { error: { message: 'Invalid OAuth access token.' } }
      srv = await startServer({ env: { FACEBOOK_PAGE_ID: '12345', FACEBOOK_PAGE_TOKEN: 'bad-token', FACEBOOK_GRAPH_URL: graph.url } })
    })
    after(async () => {
      await srv.stop()
      await graph.stop()
    })

    it('answers with an empty list instead of an error', async () => {
      const r = await srv.client().get('/api/facebook/posts')
      assert.equal(r.status, 200)
      assert.deepEqual(r.data, { posts: [] })
    })
  })
})
