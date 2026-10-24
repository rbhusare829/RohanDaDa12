import { Router } from 'express'
import { permissionsFor, resolve } from '../lib/access.js'
import { DEFAULT_LOCALE, LOCALES } from '../lib/localize.js'
import { asyncHandler } from '../lib/util.js'
import { collections, globals } from '../schema/index.js'
import { requireUser } from '../middleware/core.js'

/** Schema → JSON for the admin: functions (default values) are resolved, everything else is data already */
const clean = (field) => {
  const out = { ...field }
  if (typeof out.defaultValue === 'function') out.defaultValue = out.defaultValue()
  if (out.fields) out.fields = out.fields.map(clean)
  if (out.tabs) out.tabs = out.tabs.map((t) => ({ ...t, fields: t.fields.map(clean) }))
  if (out.blocks) out.blocks = out.blocks.map((b) => ({ ...b, fields: b.fields.map(clean) }))
  return out
}

export const serializeCollection = (c, user) => ({
  slug: c.slug,
  labels: c.labels,
  admin: c.admin ?? {},
  drafts: c.drafts ? { schedule: Boolean(c.drafts.schedule) } : false,
  versions: c.versions ?? 0,
  defaultSort: c.defaultSort ?? '-createdAt',
  upload: c.upload ? { kind: c.upload.kind, mimeTypes: c.upload.mimeTypes, maxSize: c.upload.maxSize, private: Boolean(c.upload.private), focalPoint: Boolean(c.upload.focalPoint), sizes: c.upload.sizes?.map((s) => s.name) } : null,
  auth: Boolean(c.auth),
  sqlOnly: Boolean(c.sqlOnly),
  fields: c.fields.map(clean),
  permissions: permissionsFor(c, user),
})

export const serializeGlobal = (g, user) => ({
  slug: g.slug,
  label: g.label,
  admin: g.admin ?? {},
  versions: g.versions ?? 0,
  fields: g.fields.map(clean),
  permissions: { read: resolve(g.access.read, user, g).allowed, update: resolve(g.access.update, user, g).allowed },
})

/** Admin-only helpers: the schema the forms are built from, and the dashboard numbers */
export function adminRoutes({ documents }) {
  const r = Router()
  r.use(requireUser)

  r.get('/schema', (req, res) => {
    res.json({
      locales: LOCALES,
      defaultLocale: DEFAULT_LOCALE,
      collections: collections.map((c) => serializeCollection(c, req.user)),
      globals: globals.map((g) => serializeGlobal(g, req.user)),
    })
  })

  r.get('/dashboard', asyncHandler(async (req, res) => {
    const readable = (slug) => permissionsFor(collections.find((c) => c.slug === slug), req.user).read
    const count = async (slug, where) => (readable(slug) ? documents.count(slug, { where, user: req.user }) : null)
    const [newMessages, pages, posts, initiatives, albums, photos] = await Promise.all([
      count('contact-messages', { status: { equals: 'new' } }),
      count('pages'),
      count('posts'),
      count('initiatives'),
      count('albums'),
      count('media'),
    ])
    let recent = []
    if (readable('contact-messages')) {
      recent = (await documents.find('contact-messages', { sort: '-createdAt', limit: 6, user: req.user, locale: 'en' })).docs.map((d) => ({
        id: d.id, name: d.name, subject: d.subject, message: d.message, status: d.status, createdAt: d.createdAt,
      }))
    }
    res.json({ counts: { newMessages, pages, posts, initiatives, albums, photos }, recent })
  }))

  return r
}
