import { escapeHtml } from './util.js'
import { htmlToText } from './sanitize.js'

/**
 * Per-page <title> / description / share tags, produced on the server for the single-page app, so search engines and
 * link previews (WhatsApp, Facebook, X) see them without running JavaScript. The browser then takes over (react-helmet-async).
 * Unknown addresses get a real 404 status instead of a "soft 404".
 */

/** Pages that were removed in the Oct 2026 restructure → the nearest page (permanent redirect) */
export const REMOVED_REDIRECTS = new Map([
  ['/about/achievements', '/about/biography'],
  ['/about/party-organisation', '/political-career'],
  ['/about/thoughts', '/blog'],
  ['/about/leaders', '/about/biography'],
  ['/lokmangal/parivar', '/lokmangal/foundation'],
  ['/lokmangal/vishwamangal', '/lokmangal/foundation'],
  ['/media/downloads', '/media/photos'],
  ['/grievance', '/contact'],
  ['/careers', '/contact'],
  ['/search', '/'],
])
export const isRemovedPath = (p) => [...REMOVED_REDIRECTS.keys()].some((r) => p === r || p.startsWith(`${r}/`))

/** Fixed pages of the site (their text lives in the website's i18n file; keep both in step) */
export const STATIC_PAGES = {
  '/': {},
  '/blog': { title: 'Articles & Perspectives', description: 'Articles and ideas by Rohan Subhash Deshmukh on social work, policy, farming, education and development — from Solapur.' },
  '/events': { title: 'Events', description: 'Lokmangal Foundation initiatives, ceremonies, campaigns and articles — in one place.' },
  '/contact': { title: 'Contact' },
  '/social-work': { title: 'Social Initiatives' },
  '/media/photos': { title: 'Photo Gallery' },
  '/media/videos': { title: 'Video Gallery' },
  '/about/family': { title: 'Family', description: 'The Deshmukh family — a tradition of values, service and hard work.' },
}

export const STATIC_PATHS = Object.keys(STATIC_PAGES)

const safeDecode = (s) => {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
const absolute = (origin, url) => (url ? (/^https?:\/\//.test(url) ? url : `${origin}${url}`) : null)
const mediaUrl = (m, size = 'card') => (m && typeof m === 'object' ? m.sizes?.[size]?.url || m.url || null : null)
const clip = (s, n = 300) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s || null)

export function createSeo({ cfg, documents }) {
  const origin = (req) => cfg.publicUrl || `${req.protocol}://${req.get('host')}`

  async function resolve(req, pathname) {
    const base = origin(req)
    const site = await documents.findGlobal('site-settings', { depth: 2, locale: 'en' })
    const siteName = site.siteName || 'Rohan Subhash Deshmukh'
    const shareDefault = mediaUrl(site.defaultShareImage)
    const person = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Rohan Subhash Deshmukh',
      alternateName: 'रोहन सुभाष देशमुख',
      url: base,
      birthPlace: 'Solapur, Maharashtra',
      sameAs: Object.values(site.social ?? {}).filter((v) => typeof v === 'string' && v),
      email: site.email || undefined,
      telephone: site.phone || undefined,
    }
    const make = (o) => ({
      status: 200,
      siteName,
      type: 'website',
      jsonLd: [person],
      canonical: `${base}${pathname === '/' ? '' : pathname}`,
      ...o,
      image: absolute(base, o.image || shareDefault),
      title: o.absoluteTitle ? o.title : `${o.title} | ${siteName}`,
    })

    const notFound = () => make({ title: 'Page not found', description: null, robots: 'noindex, nofollow', status: 404 })
    const meta = (doc) => doc?.meta ?? {}
    const first = async (slug, where, depth = 2) => (await documents.find(slug, { where, limit: 1, depth, locale: 'en' })).docs[0] ?? null

    if (pathname === '/') {
      const home = await documents.findGlobal('home', { depth: 2, locale: 'en' })
      const m = meta(home)
      return make({ title: m.title || siteName, absoluteTitle: true, description: m.description || site.tagline, image: mediaUrl(m.image) })
    }
    if (pathname.startsWith('/admin')) return make({ title: 'Admin', description: null, robots: 'noindex, nofollow', absoluteTitle: false })

    const staticPage = STATIC_PAGES[pathname]
    if (staticPage) return make({ title: staticPage.title, description: staticPage.description || site.tagline })

    const seg = pathname.split('/').filter(Boolean)
    if (seg[0] === 'blog' && seg.length === 2) {
      const post = await first('posts', { slug: { equals: safeDecode(seg[1]) } })
      if (!post) return notFound()
      const m = meta(post)
      const url = `${base}${pathname}`
      return make({
        title: m.title || post.title,
        description: clip(m.description || post.excerpt || htmlToText(post.content)),
        image: mediaUrl(m.image) || mediaUrl(post.coverImage),
        type: 'article',
        publishedTime: post.publishedAt,
        jsonLd: [
          person,
          { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: post.title, datePublished: post.publishedAt, dateModified: post.updatedAt, author: { '@type': 'Person', name: 'Rohan Subhash Deshmukh' }, image: mediaUrl(post.coverImage, 'hero') ? [absolute(base, mediaUrl(post.coverImage, 'hero'))] : undefined, mainEntityOfPage: url },
        ],
      })
    }
    if (seg[0] === 'social-work' && seg.length === 2) {
      const d = await first('initiatives', { slug: { equals: safeDecode(seg[1]) } })
      if (!d) return notFound()
      const m = meta(d)
      return make({ title: m.title || d.title, description: clip(m.description || d.excerpt), image: mediaUrl(m.image) || mediaUrl(d.heroImage) })
    }
    if (seg[0] === 'events' && seg.length === 2) {
      const d = await first('events', { slug: { equals: safeDecode(seg[1]) } })
      if (!d) return notFound()
      return make({ title: d.title, description: clip(d.tagline || d.description), image: mediaUrl(d.coverImage) })
    }
    if (seg[0] === 'media' && seg[1] === 'photos' && seg.length === 3) {
      const a = await first('albums', { slug: { equals: safeDecode(seg[2]) } }, 1)
      if (!a) return notFound()
      return make({ title: a.title, description: clip(a.description) || site.tagline, image: mediaUrl(a.cover) })
    }
    if (isRemovedPath(pathname)) return notFound()
    const page = await first('pages', { path: { equals: pathname } })
    if (!page) return notFound()
    const m = meta(page)
    return make({ title: m.title || page.title, description: clip(m.description || page.subtitle) || site.tagline, image: mediaUrl(m.image) || mediaUrl(page.bannerImage) })
  }

  /** The tags that go into <head> */
  function tags(seo) {
    const t = []
    const meta = (attrs) => t.push(`<meta ${Object.entries(attrs).map(([k, v]) => `${k}="${escapeHtml(v)}"`).join(' ')} data-ssr-meta>`)
    if (seo.description) meta({ name: 'description', content: seo.description })
    if (seo.robots) meta({ name: 'robots', content: seo.robots })
    if (seo.canonical && !seo.robots) t.push(`<link rel="canonical" href="${escapeHtml(seo.canonical)}" data-ssr-meta>`)
    meta({ property: 'og:site_name', content: seo.siteName })
    meta({ property: 'og:locale', content: 'en_IN' })
    meta({ property: 'og:type', content: seo.type })
    meta({ property: 'og:title', content: seo.title })
    if (seo.description) meta({ property: 'og:description', content: seo.description })
    if (seo.canonical) meta({ property: 'og:url', content: seo.canonical })
    if (seo.image) meta({ property: 'og:image', content: seo.image })
    if (seo.publishedTime) meta({ property: 'article:published_time', content: seo.publishedTime })
    meta({ name: 'twitter:card', content: 'summary_large_image' })
    meta({ name: 'twitter:site', content: '@rohandeshmukhh' })
    meta({ name: 'twitter:title', content: seo.title })
    if (seo.description) meta({ name: 'twitter:description', content: seo.description })
    if (seo.image) meta({ name: 'twitter:image', content: seo.image })
    for (const ld of seo.jsonLd ?? []) t.push(`<script type="application/ld+json" data-ssr-meta>${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`)
    return t.join('\n    ')
  }

  return { resolve, tags, origin }
}
