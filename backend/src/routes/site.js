import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import express, { Router } from 'express'
import { asyncHandler, escapeHtml } from '../lib/util.js'
import { REMOVED_REDIRECTS, STATIC_PATHS, createSeo, isRemovedPath } from '../lib/seo.js'

/**
 * Everything that is not the API:
 *   /robots.txt, /sitemap.xml         generated from the content
 *   old / removed addresses           permanent redirects (/en/… → /…, /grievance → /contact …)
 *   the built website (frontend/dist) static files with long-lived caching, and index.html for every page route,
 *                                     with that page's title and share tags filled in (real 404 status for unknown pages)
 */
export function siteRoutes(ctx) {
  const { cfg, documents } = ctx
  const seo = createSeo({ cfg, documents })
  const r = Router()

  r.get('/robots.txt', (req, res) => {
    res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${seo.origin(req)}/sitemap.xml\n`)
  })

  r.get('/sitemap.xml', asyncHandler(async (req, res) => {
    const base = seo.origin(req)
    const list = async (slug, mapPath) => (await documents.find(slug, { limit: 0, depth: 0, locale: 'en' })).docs.map((d) => ({ path: mapPath(d), lastmod: d.updatedAt }))
    const [pages, posts, initiatives, albums, events] = await Promise.all([
      list('pages', (d) => d.path),
      list('posts', (d) => `/blog/${d.slug}`),
      list('initiatives', (d) => `/social-work/${d.slug}`),
      list('albums', (d) => `/media/photos/${d.slug}`),
      list('events', (d) => `/events/${d.slug}`),
    ])
    const entries = [...STATIC_PATHS.map((p) => ({ path: p })), ...pages.filter((e) => !isRemovedPath(e.path)), ...posts, ...initiatives, ...albums, ...events]
    const seen = new Set()
    const xml = entries
      .filter((e) => e.path && !seen.has(e.path) && seen.add(e.path))
      .map((e) => `  <url><loc>${escapeHtml(base + (e.path === '/' ? '' : e.path))}</loc>${e.lastmod ? `<lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ''}</url>`)
      .join('\n')
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>\n`)
  }))

  // ---- old addresses → permanent redirects (before the website itself)
  r.use((req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next()
    let p = req.path
    const search = req.url.slice(req.path.length) // keeps ?query
    // English-only site: "/en/about" → "/about"
    if (p === '/en' || p.startsWith('/en/')) return res.redirect(301, (p.slice(3) || '/') + search)
    if (p.length > 1 && p.endsWith('/')) p = p.replace(/\/+$/, '')
    const target = REMOVED_REDIRECTS.get(p.toLowerCase())
    if (target) return res.redirect(301, target + search)
    if (p !== req.path && !path.extname(p)) return res.redirect(301, p + search)
    next()
  })

  if (!cfg.serveFrontend) return r

  // ---- the built website
  const dist = cfg.frontendDist
  r.use(
    express.static(dist, {
      index: false,
      maxAge: '1h',
      setHeaders: (res, file) => {
        if (/[\\/]assets[\\/]/.test(file)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      },
    }),
  )

  let template = { html: '', mtime: 0 }
  const loadTemplate = async () => {
    const file = path.join(dist, 'index.html')
    const { mtimeMs } = await stat(file)
    if (mtimeMs !== template.mtime) template = { html: await readFile(file, 'utf8'), mtime: mtimeMs }
    return template.html
  }

  r.get('*', asyncHandler(async (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next()
    // a missing file (a script, an image…) is a 404, never the website's start page
    if (path.extname(req.path)) return res.status(404).type('text/plain').send('Not found')
    let pathname
    try {
      pathname = decodeURI(req.path).replace(/\/+$/, '').toLowerCase() || '/'
    } catch {
      return res.status(400).type('text/plain').send('Bad request')
    }
    const result = await seo.resolve(req, pathname)
    const html = (await loadTemplate())
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(result.title)}</title>`)
      .replace('<!--app-head-->', seo.tags(result))
    res.status(result.status).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }).send(html)
  }))

  return r
}

export { STATIC_PATHS }
