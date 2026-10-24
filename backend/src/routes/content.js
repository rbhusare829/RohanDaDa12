import { Router } from 'express'
import multer from 'multer'
import { DEFAULT_LOCALE, isLocale } from '../lib/localize.js'
import { toCsv } from '../lib/csv.js'
import { collectionBySlug, flatFields, globalBySlug } from '../schema/index.js'
import { asyncHandler, badRequest, forbidden, isPlainObject, notFound, unauthorized } from '../lib/util.js'
import { hasRole, ROLE_GROUPS } from '../lib/access.js'

/**
 * The REST API for content, in the shape Payload CMS used (the website's client code did not have to change):
 *   GET    /api/:collection            list      ?where[…]&sort=&limit=&page=&depth=&locale=
 *   GET    /api/:collection/count
 *   GET    /api/:collection/:id
 *   POST   /api/:collection            create    (multipart for photos / documents)
 *   PATCH  /api/:collection/:id         update
 *   DELETE /api/:collection/:id
 *   GET    /api/globals/:slug           POST /api/globals/:slug
 * Who may do what, and what a visitor sees (published items only), is decided in the schema — see lib/access.js.
 */
export function contentRoutes({ db, documents, uploads, storage }) {
  const r = Router()

  const localeOf = (req) => (req.query.locale === 'all' ? 'all' : isLocale(req.query.locale) ? req.query.locale : DEFAULT_LOCALE)
  const listOptions = (req) => ({
    where: req.query.where,
    sort: typeof req.query.sort === 'string' ? req.query.sort : undefined,
    limit: req.query.limit,
    page: req.query.page,
    depth: req.query.depth,
    locale: localeOf(req),
    user: req.user,
  })

  /** multipart bodies: the file plus a "_payload" JSON field (and/or plain fields) */
  const multipart = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024, files: 1, fields: 60, fieldSize: 2 * 1024 * 1024 } })
  const readBody = (req) => {
    const out = { ...(isPlainObject(req.body) ? req.body : {}) }
    if (typeof out._payload === 'string') {
      try {
        Object.assign(out, JSON.parse(out._payload))
      } catch {
        throw badRequest('The _payload field is not valid JSON.')
      }
      delete out._payload
    }
    return out
  }

  const collectionOr404 = (req) => {
    const c = collectionBySlug[req.params.collection]
    if (!c) throw notFound(`Unknown collection "${req.params.collection}".`)
    return c
  }

  /* ---------------------------------------------------------------- globals (before :collection routes) */

  r.get('/globals/:slug', asyncHandler(async (req, res) => {
    if (!globalBySlug[req.params.slug]) throw notFound(`Unknown global "${req.params.slug}".`)
    res.json(await documents.findGlobal(req.params.slug, { depth: req.query.depth, locale: localeOf(req), user: req.user }))
  }))

  r.post('/globals/:slug', asyncHandler(async (req, res) => {
    if (!globalBySlug[req.params.slug]) throw notFound(`Unknown global "${req.params.slug}".`)
    const doc = await documents.updateGlobal(req.params.slug, req.body, { user: req.user, locale: 'all' })
    res.json({ message: 'Saved.', doc })
  }))

  r.get('/globals/:slug/versions', asyncHandler(async (req, res) => {
    const global = globalBySlug[req.params.slug]
    if (!global) throw notFound()
    if (!req.user) throw unauthorized()
    if (!global.versions) return res.json({ docs: [] })
    res.json({ docs: await documents.listVersions('global', global.slug, null) })
  }))

  r.get('/globals/:slug/versions/:versionId', asyncHandler(async (req, res) => {
    const global = globalBySlug[req.params.slug]
    if (!global) throw notFound()
    if (!req.user) throw unauthorized()
    res.json(await documents.getVersion('global', global.slug, null, req.params.versionId))
  }))

  /* ---------------------------------------------------------------- collections */

  r.get('/:collection', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    res.json(await documents.find(c.slug, listOptions(req)))
  }))

  r.get('/:collection/count', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    res.json({ totalDocs: await documents.count(c.slug, { where: req.query.where, user: req.user }) })
  }))

  // CSV export of an inbox (contact messages…), for the admin's "Export" button
  r.get('/:collection/export', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    if (!c.admin?.export) throw notFound()
    if (!req.user) throw unauthorized()
    if (!hasRole(req.user, ROLE_GROUPS.editors)) throw forbidden()
    const result = await documents.find(c.slug, { ...listOptions(req), limit: 500, page: 1, locale: 'en' })
    let docs = result.docs
    for (let p = 2; p <= Math.min(result.totalPages, 40); p++) docs = docs.concat((await documents.find(c.slug, { ...listOptions(req), limit: 500, page: p, locale: 'en' })).docs)
    const columns = ['id', 'createdAt', ...flatFields(c.fields).map((f) => f.name)]
    const stamp = new Date().toISOString().slice(0, 10)
    res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${c.slug}-${stamp}.csv"`, 'Cache-Control': 'no-store' })
    res.send(toCsv(columns, docs))
  }))

  // files that are not public (attachments sent through the forms): editors only, always downloaded, never displayed in the browser
  r.get('/:collection/file/:filename', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    if (!c.upload?.private) throw notFound()
    if (!req.user) throw unauthorized()
    if (!hasRole(req.user, ROLE_GROUPS.editors)) throw forbidden()
    const row = await db.models[c.slug].findOne({ where: { filename: req.params.filename } })
    if (!row) throw notFound('File not found.')
    const { stream, size } = await storage.read(uploads.keyFor(c, row.filename))
    res.set({
      'Content-Type': row.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${row.filename.replace(/[^\w.-]/g, '_')}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
      ...(size ? { 'Content-Length': size } : {}),
    })
    stream.pipe(res)
  }))

  r.get('/:collection/:id(\\d+)', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    res.json(await documents.findByID(c.slug, req.params.id, { depth: req.query.depth, locale: localeOf(req), user: req.user }))
  }))

  r.get('/:collection/:id(\\d+)/versions', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    if (!req.user) throw unauthorized()
    await documents.findByID(c.slug, req.params.id, { user: req.user }) // same access as reading the document
    res.json({ docs: c.versions ? await documents.listVersions('collection', c.slug, Number(req.params.id)) : [] })
  }))

  r.get('/:collection/:id(\\d+)/versions/:versionId(\\d+)', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    if (!req.user) throw unauthorized()
    await documents.findByID(c.slug, req.params.id, { user: req.user })
    res.json(await documents.getVersion('collection', c.slug, Number(req.params.id), req.params.versionId))
  }))

  /** Handles the optional uploaded file of photo / document collections */
  const saveUpload = async (c, req) => {
    if (!c.upload || !req.file) return null
    const model = db.models[c.slug]
    return c.upload.kind === 'image' ? uploads.saveImage(c, model, req.file) : uploads.saveFile(c, model, req.file)
  }

  r.post('/:collection', (req, res, next) => (req.is('multipart/form-data') ? multipart.single('file')(req, res, next) : next()), asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    if (c.access.create === 'never') throw forbidden()
    if (c.upload && !req.file) throw badRequest('Choose a file to upload.', { errors: [{ field: 'file', message: 'This field is required.' }] })
    const body = readBody(req)
    let upload = null
    try {
      upload = await saveUpload(c, req)
      const doc = await documents.create(c.slug, body, { user: req.user, upload, locale: 'all' })
      res.status(201).json({ message: 'Created successfully.', doc })
    } catch (err) {
      if (upload && !err.errors?.some((e) => e.field === 'file')) await uploads.removeFiles(c, upload)
      throw err
    }
  }))

  r.patch('/:collection/:id(\\d+)', (req, res, next) => (req.is('multipart/form-data') ? multipart.single('file')(req, res, next) : next()), asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    const body = readBody(req)
    let upload = null
    try {
      upload = await saveUpload(c, req)
      const doc = await documents.update(c.slug, req.params.id, body, { user: req.user, upload, locale: 'all' })
      res.json({ message: 'Updated successfully.', doc })
    } catch (err) {
      if (upload) await uploads.removeFiles(c, upload)
      throw err
    }
  }))

  r.delete('/:collection/:id(\\d+)', asyncHandler(async (req, res) => {
    const c = collectionOr404(req)
    const { id } = await documents.remove(c.slug, req.params.id, { user: req.user })
    res.json({ message: 'Deleted successfully.', id })
  }))

  return r
}
