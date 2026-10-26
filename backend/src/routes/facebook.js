import { Router } from 'express'
import { asyncHandler } from '../lib/util.js'

const FRESH_MS = 10 * 60_000 // a good answer is reused this long before Facebook is asked again
const RETRY_MS = 60_000 // after a failed request, wait this long before asking again
const TIMEOUT_MS = 8_000
const LIMIT = 6
const MAX_TEXT = 1000

const toPost = (p) => ({
  id: String(p.id),
  text: String(p.message ?? '').trim().slice(0, MAX_TEXT),
  image: typeof p.full_picture === 'string' ? p.full_picture : null,
  url: typeof p.permalink_url === 'string' ? p.permalink_url : `https://www.facebook.com/${p.id}`,
  createdAt: p.created_time ?? null,
})

/**
 * GET /api/facebook/posts — the Facebook Page's latest posts for the home page.
 *
 * Facebook no longer shows a Page's posts in its embeddable plugin, so they are read with the Graph API and the Page's access token
 * (FACEBOOK_PAGE_ID + FACEBOOK_PAGE_TOKEN; the token stays on the server). The answer is kept for 10 minutes and shared by all visitors.
 * Not set up, or Facebook unreachable → an empty list (or the last good one), never an error: the home page then shows a plain "follow us" card.
 */
export function facebookRoutes({ cfg, logger }) {
  const { pageId, pageToken, graphUrl, graphVersion } = cfg.facebook
  const r = Router()
  let cached = null // { at, ok, posts }
  let inflight = null

  async function load() {
    const url = new URL(`${graphUrl}/${graphVersion}/${encodeURIComponent(pageId)}/posts`)
    url.search = new URLSearchParams({ fields: 'id,message,created_time,full_picture,permalink_url', limit: '12', access_token: pageToken }).toString()
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(`Facebook answered ${res.status}: ${body?.error?.message ?? 'no details'}`) // never log the URL — it carries the token
    return (body.data ?? []).map(toPost).filter((p) => p.text || p.image).slice(0, LIMIT)
  }

  r.get('/posts', asyncHandler(async (_req, res) => {
    if (!pageId || !pageToken) return res.set('Cache-Control', 'public, max-age=300').json({ posts: [] })
    if (!cached || Date.now() - cached.at >= (cached.ok ? FRESH_MS : RETRY_MS)) {
      inflight ??= load()
        .then((posts) => {
          cached = { at: Date.now(), ok: true, posts }
        })
        .catch((err) => {
          logger.warn(`[facebook] could not read the Page's posts: ${err.message}`)
          cached = { at: Date.now(), ok: false, posts: cached?.posts ?? [] }
        })
        .finally(() => {
          inflight = null
        })
      await inflight
    }
    res.set('Cache-Control', cached.ok ? 'public, max-age=300, s-maxage=600, stale-while-revalidate=3600' : 'public, max-age=60').json({ posts: cached.posts })
  }))

  return r
}
