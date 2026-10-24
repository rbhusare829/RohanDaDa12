import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { collectionBySlug, flatFields, globalBySlug } from '../schema/index.js'
import { columnNames } from '../db/models.js'
import { fieldAllowed, resolve } from './access.js'
import { DEFAULT_LOCALE, LOCALES, isEmptyValue, presentDoc } from './localize.js'
import { assertQueryable, matches, parseSort, parseWhere, sortDocs, sortableInSql, splitWhere, sqlOrder } from './query.js'
import { sanitizeRichText } from './sanitize.js'
import { badRequest, clamp, forbidden, isPlainObject, normalizePath, notFound, rowId, slugify, unauthorized, validationError } from './util.js'

/** Columns that exist on a user row for signing in; they never appear in documents or API output */
const INTERNAL = new Set(['passwordHash', 'loginAttempts', 'lockUntil'])

const MAX_LIMIT = 500
const MAX_DEPTH = 3
const MIN_PASSWORD = 8

const iso = (d) => (d instanceof Date ? d.toISOString() : d ?? null)
const blockDef = (field, row) => field.blocks.find((b) => b.slug === row?.blockType)
const hasDevanagari = (s) => /[ऀ-ॿ]/.test(s)
/** Not signed in → 401 (the admin sends the visitor to the sign-in page); signed in but not allowed → 403 */
const denied = (user) => (user ? forbidden() : unauthorized())

/**
 * The document service: every read and write of content goes through here.
 *   find / findByID / count        read (access rules, query language, relationships, languages)
 *   create / update / remove       write (validation, cleaning, versions, files)
 *   findGlobal / updateGlobal      the singleton documents (site settings, menu, footer, homepage, popup)
 */
export function createDocuments({ db, uploads, logger = console, hashRounds = 12 }) {
  const { models, globalModel, versionModel } = db
  const afterCreate = []

  /* ------------------------------------------------------------------ rows ⇄ documents */

  function docFromRow(collection, row) {
    const plain = row.get({ plain: true })
    const { id, data, createdAt, updatedAt } = plain
    const doc = { id, ...data }
    for (const name of columnNames[collection.slug] ?? []) {
      if (INTERNAL.has(name)) continue
      doc[name] = iso(plain[name]) ?? null
    }
    doc.createdAt = iso(createdAt)
    doc.updatedAt = iso(updatedAt)
    return collection.upload ? uploads.describe(collection, doc) : doc
  }

  /** Splits a document into the values that have their own column and the JSON that holds the rest */
  function rowFromDoc(collection, doc) {
    const cols = columnNames[collection.slug] ?? []
    const row = {}
    const data = {}
    for (const [k, v] of Object.entries(doc)) {
      if (['id', 'createdAt', 'updatedAt'].includes(k)) continue
      if (cols.includes(k)) row[k] = v === '' ? null : v
      else data[k] = v
    }
    row.data = data
    return row
  }

  /* ------------------------------------------------------------------ cleaning and validating input */

  const defaultFor = (f) => {
    const v = typeof f.defaultValue === 'function' ? f.defaultValue() : f.defaultValue
    if (v !== undefined && f.localized && typeof v === 'string') return hasDevanagari(v) ? { mr: v } : { en: v }
    return v
  }

  // control characters (except tab and line breaks) have no place in text
  // eslint-disable-next-line no-control-regex
  const control = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  /**
   * One value of one language (or the only value of a non-localized field) → clean value.
   * Returns { value } or { error }.
   */
  function cleanLeaf(f, v, refs, path) {
    const fail = (message) => ({ error: { field: path, message } })
    if (f.hasMany && f.type !== 'upload' && f.type !== 'relationship') {
      const list = (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map((x) => cleanLeaf({ ...f, hasMany: false }, x, refs, path))
      const bad = list.find((r) => r.error)
      if (bad) return bad
      return { value: list.map((r) => r.value).filter((x) => x !== null && x !== '') }
    }
    switch (f.type) {
      case 'text':
      case 'textarea': {
        if (v == null) return { value: null }
        const max = f.maxLength ?? (f.type === 'text' ? 2048 : 20000)
        const s = String(v).replace(control, '')
        const out = f.type === 'text' ? s.trim() : s.replace(/\r\n/g, '\n').trim()
        if (out.length > max) return fail(`Too long (maximum ${max} characters).`)
        return { value: out === '' ? null : out }
      }
      case 'email': {
        if (v == null || v === '') return { value: null }
        const s = String(v).trim().toLowerCase()
        return emailRe.test(s) && s.length <= 255 ? { value: s } : fail('Enter a valid e-mail address.')
      }
      case 'number': {
        if (v == null || v === '') return { value: null }
        const n = Number(v)
        if (!Number.isFinite(n)) return fail('Enter a number.')
        const out = f.integer ? Math.round(n) : n
        if (f.min != null && out < f.min) return fail(`Must be at least ${f.min}.`)
        if (f.max != null && out > f.max) return fail(`Must be at most ${f.max}.`)
        return { value: out }
      }
      case 'checkbox':
        return { value: v === true || v === 'true' || v === 1 || v === '1' || v === 'on' }
      case 'select': {
        if (v == null || v === '') return { value: null }
        return f.options.some((o) => o.value === v) ? { value: v } : fail('Choose one of the listed options.')
      }
      case 'date': {
        if (v == null || v === '') return { value: null }
        const d = new Date(v)
        return Number.isNaN(d.getTime()) ? fail('Enter a valid date.') : { value: d.toISOString() }
      }
      case 'richText':
        return { value: v == null ? null : sanitizeRichText(v) || null }
      case 'upload':
      case 'relationship': {
        const one = (x) => {
          if (x == null || x === '') return null
          const id = Number(isPlainObject(x) ? x.id : x)
          return Number.isInteger(id) && id > 0 ? id : NaN
        }
        const note = (id) => {
          if (!refs.has(f.relationTo)) refs.set(f.relationTo, new Map())
          const m = refs.get(f.relationTo)
          m.set(id, [...(m.get(id) ?? []), path])
        }
        if (f.hasMany) {
          const ids = (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map(one).filter((x) => x !== null)
          if (ids.some(Number.isNaN)) return fail('Invalid selection.')
          const unique = [...new Set(ids)]
          unique.forEach(note)
          return { value: unique }
        }
        const id = one(v)
        if (Number.isNaN(id)) return fail('Invalid selection.')
        if (id !== null) note(id)
        return { value: id }
      }
      default:
        return fail(`Unsupported field type "${f.type}".`)
    }
  }

  /** A field's value (all languages when localized) → clean value; pushes validation errors. `stored` = the value now in the database (groups keep the fields not sent) */
  function cleanField(f, v, ctx, path, stored) {
    if (f.type === 'group') return cleanFields(f.fields, isPlainObject(v) ? v : {}, isPlainObject(stored) ? stored : null, ctx, path)
    if (f.type === 'array') {
      if (v == null) return []
      if (!Array.isArray(v)) {
        ctx.errors.push({ field: path, message: 'Must be a list.' })
        return []
      }
      if (f.maxRows != null && v.length > f.maxRows) ctx.errors.push({ field: path, message: `At most ${f.maxRows} items.` })
      if (f.minRows != null && v.length < f.minRows && !ctx.draft) ctx.errors.push({ field: path, message: `At least ${f.minRows} item(s).` })
      return v.map((row, i) => {
        const clean = cleanFields(f.fields, isPlainObject(row) ? row : {}, null, ctx, `${path}.${i}`)
        return { id: typeof row?.id === 'string' && /^[\w-]{8,40}$/.test(row.id) ? row.id : rowId(), ...clean }
      })
    }
    if (f.type === 'blocks') {
      if (v == null) return []
      if (!Array.isArray(v)) {
        ctx.errors.push({ field: path, message: 'Must be a list.' })
        return []
      }
      return v.map((row, i) => {
        const def = blockDef(f, row)
        if (!def) {
          ctx.errors.push({ field: `${path}.${i}`, message: `Unknown block type "${row?.blockType}".` })
          return null
        }
        const clean = cleanFields(def.fields, row, null, ctx, `${path}.${i}`)
        return {
          id: typeof row.id === 'string' && /^[\w-]{8,40}$/.test(row.id) ? row.id : rowId(),
          blockType: def.slug,
          ...(typeof row.blockName === 'string' && row.blockName ? { blockName: row.blockName.slice(0, 120) } : {}),
          ...clean,
        }
      }).filter(Boolean)
    }

    if (f.localized) {
      let map
      if (v == null) map = {}
      else if (isPlainObject(v)) {
        const keys = Object.keys(v)
        if (keys.some((k) => !LOCALES.includes(k))) {
          ctx.errors.push({ field: path, message: 'Send one value per language ({ en, mr }).' })
          return null
        }
        map = v
      } else map = { [DEFAULT_LOCALE]: v }
      const out = {}
      for (const l of LOCALES) {
        const r = cleanLeaf(f, map[l], ctx.refs, `${path}.${l}`)
        if (r.error) ctx.errors.push(r.error)
        out[l] = r.error ? null : (r.value ?? (f.hasMany ? [] : null))
      }
      return out
    }
    const r = cleanLeaf(f, v, ctx.refs, path)
    if (r.error) {
      ctx.errors.push(r.error)
      return null
    }
    return r.value
  }

  const isBlank = (f, v) => (f.localized ? LOCALES.every((l) => isEmptyValue(v?.[l])) : f.type === 'checkbox' ? false : isEmptyValue(v))

  /** The fields of one object (a document, a group, an array row or a block) → clean object */
  function cleanFields(fields, input, existing, ctx, prefix) {
    const out = {}
    const slugs = []
    for (const f of flatFields(fields)) {
      const path = prefix ? `${prefix}.${f.name}` : f.name
      const op = ctx.operation === 'create' ? 'create' : 'update'
      const provided = Object.prototype.hasOwnProperty.call(input ?? {}, f.name) && input[f.name] !== undefined
      // a field the user may not change keeps its stored value (or its default for a new document)
      if (!ctx.overrideAccess && !fieldAllowed(f, op, ctx.user)) {
        if (existing && f.name in existing) out[f.name] = existing[f.name]
        else if (defaultFor(f) !== undefined) out[f.name] = cleanField(f, defaultFor(f), ctx, path)
        continue
      }
      let v
      if (provided) v = input[f.name]
      else if (existing && f.name in existing) {
        out[f.name] = existing[f.name]
        continue
      } else v = defaultFor(f)

      let clean = cleanField(f, v, ctx, path, existing?.[f.name])
      if (f.type === 'text' && f.normalize === 'path') clean = clean ? normalizePath(clean) || null : clean
      if (f.slugFrom) {
        slugs.push({ f, path })
        out[f.name] = clean
        continue
      }
      if (f.required && !ctx.draft && isBlank(f, clean)) ctx.errors.push({ field: path, message: 'This field is required.' })
      out[f.name] = clean
    }
    // slugs are made after the other fields (they come from the title)
    for (const { f, path } of slugs) {
      let s = out[f.name] ? slugify(out[f.name]) : ''
      if (!s) {
        const src = out[f.slugFrom]
        const text = isPlainObject(src) ? (src.en || src.mr || '') : src || ''
        s = slugify(text)
      }
      out[f.name] = s || null
      if (f.required && !ctx.draft && !s) ctx.errors.push({ field: path, message: 'This field is required.' })
    }
    return out
  }

  /** Checks that every referenced photo / document / related item really exists */
  async function checkRefs(refs, errors) {
    for (const [slug, ids] of refs) {
      const target = collectionBySlug[slug]
      const found = await models[slug].findAll({ where: { id: { [Op.in]: [...ids.keys()] } }, attributes: ['id'], raw: true })
      const have = new Set(found.map((r) => r.id))
      for (const [id, paths] of ids) if (!have.has(id)) for (const p of paths) errors.push({ field: p, message: `The selected ${target?.labels?.singular?.toLowerCase() ?? 'item'} no longer exists.` })
    }
  }

  async function prepare(fields, input, existing, { operation, user, draft, overrideAccess = false }) {
    const errors = []
    const refs = new Map()
    const ctx = { operation, user, draft, overrideAccess, errors, refs }
    const clean = cleanFields(fields, isPlainObject(input) ? input : {}, existing, ctx, '')
    await checkRefs(refs, errors)
    if (errors.length) throw validationError(errors)
    return clean
  }

  /** A unique-constraint failure from SQLite or MySQL → "this field's value must be unique" */
  const uniqueError = (collection, err) => {
    const hay = [
      ...(Array.isArray(err.fields) ? err.fields : Object.keys(err.fields ?? {})),
      ...(err.errors ?? []).map((e) => e.path),
      err.parent?.message ?? '',
    ]
      .map(String)
      .join(' ')
    const names = (columnNames[collection.slug] ?? []).filter((n) => !INTERNAL.has(n))
    const field = names.find((n) => new RegExp(String.raw`(^|[^\w])${n}([^\w]|$)`).test(hay)) ?? 'slug'
    return validationError([{ field: field === 'filename' ? 'file' : field, message: 'Value must be unique.' }])
  }

  /* ------------------------------------------------------------------ relationships */

  /** Collect the ids a document points at */
  function walkRefs(fields, obj, visit) {
    for (const f of flatFields(fields)) {
      const v = obj?.[f.name]
      if (v == null) continue
      if (f.type === 'upload' || f.type === 'relationship') visit(f, v)
      else if (f.type === 'group') walkRefs(f.fields, v, visit)
      else if (f.type === 'array') for (const r of v) walkRefs(f.fields, r, visit)
      else if (f.type === 'blocks') for (const r of v) walkRefs(blockDef(f, r)?.fields ?? [], r, visit)
    }
  }

  /** Replace ids by the documents they point at, `depth` levels deep */
  async function populate(collection, docs, depth, user) {
    if (depth <= 0 || !docs.length) return
    const wanted = new Map()
    const collect = (fields, obj) =>
      walkRefs(fields, obj, (f, v) => {
        if (!wanted.has(f.relationTo)) wanted.set(f.relationTo, new Set())
        for (const id of Array.isArray(v) ? v : [v]) if (Number.isInteger(id)) wanted.get(f.relationTo).add(id)
      })
    for (const d of docs) collect(collection.fields, d)

    const found = new Map()
    for (const [slug, ids] of wanted) {
      const target = collectionBySlug[slug]
      if (!target || !ids.size) continue
      // photos and documents are always shown where they are used; related items follow the usual read rules
      const access = target.upload ? { allowed: true } : resolve(target.access.read, user, target)
      if (!access.allowed) continue
      const rows = await models[slug].findAll({ where: { id: { [Op.in]: [...ids] } } })
      let list = rows.map((r) => docFromRow(target, r))
      if (access.where) {
        const nodes = parseWhere(access.where)
        list = list.filter((d) => matches(d, nodes))
      }
      await populate(target, list, depth - 1, user)
      for (const d of list) found.set(`${slug}:${d.id}`, d)
    }

    const assign = (fields, obj) => {
      for (const f of flatFields(fields)) {
        const v = obj?.[f.name]
        if (v == null) continue
        if (f.type === 'upload' || f.type === 'relationship') {
          const pick = (id) => found.get(`${f.relationTo}:${id}`) ?? null
          obj[f.name] = Array.isArray(v) ? v.map(pick).filter(Boolean) : pick(v)
        } else if (f.type === 'group') assign(f.fields, v)
        else if (f.type === 'array') for (const r of v) assign(f.fields, r)
        else if (f.type === 'blocks') for (const r of v) assign(blockDef(f, r)?.fields ?? [], r)
      }
    }
    for (const d of docs) assign(collection.fields, d)
  }

  /* ------------------------------------------------------------------ reading */

  const asNodes = (where) => (Array.isArray(where) ? where : parseWhere(where))

  async function find(slug, opts = {}) {
    const { where, sort, depth = 0, locale = DEFAULT_LOCALE, user = null, overrideAccess = false } = opts
    const collection = collectionBySlug[slug]
    if (!collection) throw notFound(`Unknown collection "${slug}".`)
    const access = overrideAccess ? { allowed: true } : resolve(collection.access.read, user, collection)
    if (!access.allowed) throw denied(user)

    const limit = clamp(Number.isFinite(Number(opts.limit)) ? Number(opts.limit) : 10, 0, MAX_LIMIT) || MAX_LIMIT
    const page = Math.max(1, Math.floor(Number(opts.page) || 1))
    const nodes = [...asNodes(where)]
    if (!overrideAccess) assertQueryable(collection, nodes, user)
    if (access.where) nodes.push(...parseWhere(access.where))

    const { sql, js } = splitWhere(collection, nodes)
    const sorts = parseSort(sort, collection.defaultSort)
    const inSql = sortableInSql(collection, sorts)
    const model = models[slug]

    let docs
    let totalDocs
    if (!js.length && inSql) {
      const res = await model.findAndCountAll({ where: sql, order: sqlOrder(sorts), limit, offset: (page - 1) * limit })
      docs = res.rows.map((r) => docFromRow(collection, r))
      totalDocs = res.count
    } else {
      const rows = await model.findAll({ where: sql, ...(inSql ? { order: sqlOrder(sorts) } : {}) })
      let all = rows.map((r) => docFromRow(collection, r))
      if (js.length) {
        const viewOf = (d) => presentDoc(collection.fields, d, { locale, user: null })
        all = all.filter((d) => matches(viewOf(d), js))
      }
      if (!inSql) {
        const views = new Map(all.map((d) => [d, presentDoc(collection.fields, d, { locale, user: null })]))
        all = sortDocs(all.map((d) => ({ ...views.get(d), __doc: d })), sorts, locale).map((v) => v.__doc)
      }
      totalDocs = all.length
      docs = all.slice((page - 1) * limit, page * limit)
    }

    await populate(collection, docs, clamp(Number(depth) || 0, 0, MAX_DEPTH), user)
    const out = docs.map((d) => presentDoc(collection.fields, d, { locale, user }))
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    return {
      docs: out,
      totalDocs,
      limit,
      totalPages,
      page,
      pagingCounter: (page - 1) * limit + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    }
  }

  async function count(slug, { where, user = null, overrideAccess = false } = {}) {
    const collection = collectionBySlug[slug]
    if (!collection) throw notFound(`Unknown collection "${slug}".`)
    const access = overrideAccess ? { allowed: true } : resolve(collection.access.read, user, collection)
    if (!access.allowed) throw forbidden()
    const nodes = [...asNodes(where)]
    if (!overrideAccess) assertQueryable(collection, nodes, user)
    if (access.where) nodes.push(...parseWhere(access.where))
    const { sql, js } = splitWhere(collection, nodes)
    if (!js.length) return models[slug].count({ where: sql })
    const rows = await models[slug].findAll({ where: sql })
    return rows.map((r) => docFromRow(collection, r)).filter((d) => matches(presentDoc(collection.fields, d, { locale: DEFAULT_LOCALE, user: null }), js)).length
  }

  async function findByID(slug, id, opts = {}) {
    const { depth = 0, locale = DEFAULT_LOCALE, user = null, overrideAccess = false } = opts
    const collection = collectionBySlug[slug]
    if (!collection) throw notFound(`Unknown collection "${slug}".`)
    const numeric = Number(id)
    if (!Number.isInteger(numeric) || numeric < 1) throw notFound()
    const access = overrideAccess ? { allowed: true } : resolve(collection.access.read, user, collection)
    if (!access.allowed) throw denied(user)
    const row = await models[slug].findByPk(numeric)
    if (!row) throw notFound()
    const doc = docFromRow(collection, row)
    if (access.where && !matches(presentDoc(collection.fields, doc, { locale: DEFAULT_LOCALE, user: null }), parseWhere(access.where))) throw notFound()
    await populate(collection, [doc], clamp(Number(depth) || 0, 0, MAX_DEPTH), user)
    return presentDoc(collection.fields, doc, { locale, user })
  }

  /** Raw stored document (all languages, ids not populated) */
  async function getRaw(slug, id) {
    const collection = collectionBySlug[slug]
    const row = await models[slug].findByPk(Number(id))
    return row ? docFromRow(collection, row) : null
  }

  /* ------------------------------------------------------------------ writing */

  async function snapshot(kind, slug, docId, doc, status, user, keep) {
    if (!keep) return
    await versionModel.create({ kind, slug, docId, status, userId: user?.id ?? null, data: doc })
    const old = await versionModel.findAll({ where: { kind, slug, docId }, order: [['id', 'DESC']], offset: keep, attributes: ['id'], raw: true })
    if (old.length) await versionModel.destroy({ where: { id: { [Op.in]: old.map((v) => v.id) } } })
  }

  async function authPrepare(collection, input, { operation, existing }) {
    const errors = []
    const out = {}
    const hasEmail = Object.prototype.hasOwnProperty.call(input, 'email')
    if (operation === 'create' || hasEmail) {
      const e = String(input.email ?? '').trim().toLowerCase()
      if (!emailRe.test(e)) errors.push({ field: 'email', message: 'Enter a valid e-mail address.' })
      else out.email = e
    }
    const hasPassword = input.password !== undefined && input.password !== ''
    if (operation === 'create' && !hasPassword) errors.push({ field: 'password', message: 'This field is required.' })
    if (hasPassword) {
      const p = String(input.password)
      if (p.length < MIN_PASSWORD) errors.push({ field: 'password', message: `Use at least ${MIN_PASSWORD} characters.` })
      else if (p.length > 200) errors.push({ field: 'password', message: 'Too long.' })
      else out.passwordHash = await bcrypt.hash(p, hashRounds)
    }
    if (errors.length) throw validationError(errors)
    return { ...out, existing }
  }

  async function create(slug, input, opts = {}) {
    const { user = null, overrideAccess = false, locale = DEFAULT_LOCALE, upload = null, depth = 0, preserve = null } = opts
    const collection = collectionBySlug[slug]
    if (!collection) throw notFound(`Unknown collection "${slug}".`)
    if (!overrideAccess && !resolve(collection.access.create, user, collection).allowed) throw denied(user)

    const draft = collection.drafts && input?._status === 'draft'
    const clean = await prepare(collection.fields, input, null, { operation: 'create', user, draft, overrideAccess })
    if (collection.drafts) clean._status = draft ? 'draft' : 'published'
    if (collection.auth) {
      const a = await authPrepare(collection, input ?? {}, { operation: 'create' })
      clean.email = a.email
      clean.passwordHash = a.passwordHash
    }
    if (collection.upload && upload) Object.assign(clean, upload)
    if (collection.reference) clean[collection.reference.field] = `${collection.reference.prefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

    let row
    try {
      // seeding / importing keeps the original id and dates (and does not touch updatedAt)
      row = preserve
        ? await models[slug].create({ ...rowFromDoc(collection, clean), id: preserve.id, createdAt: preserve.createdAt, updatedAt: preserve.updatedAt }, { silent: true })
        : await models[slug].create(rowFromDoc(collection, clean))
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        if (upload) await uploads.removeFiles(collection, upload)
        throw uniqueError(collection, err)
      }
      throw err
    }
    const doc = docFromRow(collection, row)
    await snapshot('collection', slug, doc.id, doc, doc._status, user, collection.versions)
    for (const hook of afterCreate) {
      try {
        await hook({ collection, doc })
      } catch (err) {
        logger.error?.(`afterCreate hook failed for ${slug}/${doc.id}:`, err)
      }
    }
    return findByID(slug, doc.id, { locale, depth, user: user ?? null, overrideAccess: true })
  }

  async function update(slug, id, input, opts = {}) {
    const { user = null, overrideAccess = false, locale = DEFAULT_LOCALE, upload = null, depth = 0 } = opts
    const collection = collectionBySlug[slug]
    if (!collection) throw notFound(`Unknown collection "${slug}".`)
    const access = overrideAccess ? { allowed: true } : resolve(collection.access.update, user, collection)
    if (!access.allowed) throw denied(user)

    const row = await models[slug].findByPk(Number(id))
    if (!row) throw notFound()
    const existing = docFromRow(collection, row)
    if (access.where && !matches(existing, parseWhere(access.where))) throw forbidden()

    const draft = collection.drafts && (input?._status ? input._status === 'draft' : existing._status === 'draft')
    const { id: _id, createdAt: _c, updatedAt: _u, _status: _s, ...existingData } = existing
    const clean = await prepare(collection.fields, input, existingData, { operation: 'update', user, draft, overrideAccess })
    if (collection.drafts) clean._status = draft ? 'draft' : 'published'
    if (collection.auth) {
      const a = await authPrepare(collection, input ?? {}, { operation: 'update', existing })
      if (a.email) clean.email = a.email
      if (a.passwordHash) clean.passwordHash = a.passwordHash
    }
    let removed = null
    if (collection.upload && upload) {
      removed = { filename: existing.filename, sizes: existing.sizes }
      Object.assign(clean, upload)
    } else if (collection.upload) {
      // metadata of the stored file is not editable
      for (const k of ['filename', 'mimeType', 'filesize', 'width', 'height', 'sizes']) clean[k] = existing[k]
      if (collection.upload.focalPoint && input && ('focalX' in input || 'focalY' in input)) {
        const pct = (v, fallback) => (Number.isFinite(Number(v)) ? clamp(Number(v), 0, 100) : fallback)
        clean.focalX = pct(input.focalX, existing.focalX ?? 50)
        clean.focalY = pct(input.focalY, existing.focalY ?? 50)
      } else {
        clean.focalX = existing.focalX
        clean.focalY = existing.focalY
      }
    }
    try {
      await row.update(rowFromDoc(collection, clean))
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        if (upload) await uploads.removeFiles(collection, upload)
        throw uniqueError(collection, err)
      }
      throw err
    }
    if (removed) await uploads.removeFiles(collection, removed)
    const doc = docFromRow(collection, row)
    await snapshot('collection', slug, doc.id, doc, doc._status, user, collection.versions)
    return findByID(slug, doc.id, { locale, depth, user, overrideAccess: true })
  }

  async function remove(slug, id, { user = null, overrideAccess = false } = {}) {
    const collection = collectionBySlug[slug]
    if (!collection) throw notFound(`Unknown collection "${slug}".`)
    const access = overrideAccess ? { allowed: true } : resolve(collection.access.delete, user, collection)
    if (!access.allowed) throw denied(user)
    const row = await models[slug].findByPk(Number(id))
    if (!row) throw notFound()
    const doc = docFromRow(collection, row)
    if (access.where && !matches(doc, parseWhere(access.where))) throw forbidden()
    if (collection.auth) {
      if (user && doc.id === user.id) throw badRequest('You cannot delete your own account.')
      if (doc.role === 'super-admin' && (await models[slug].count({ where: { role: 'super-admin' } })) <= 1) throw badRequest('The last super admin cannot be deleted.')
    }
    await row.destroy()
    if (collection.upload) await uploads.removeFiles(collection, doc)
    if (collection.versions) await versionModel.destroy({ where: { kind: 'collection', slug, docId: doc.id } })
    return { id: doc.id }
  }

  /* ------------------------------------------------------------------ globals */

  const globalDefaults = (global) => {
    const data = {}
    for (const f of flatFields(global.fields)) {
      const v = defaultFor(f)
      if (v !== undefined) data[f.name] = v
      else if (f.type === 'array' || f.type === 'blocks') data[f.name] = []
    }
    return data
  }

  async function getGlobalRaw(slug) {
    const global = globalBySlug[slug]
    if (!global) throw notFound(`Unknown global "${slug}".`)
    const row = await globalModel.findOne({ where: { slug } })
    if (!row) return { ...globalDefaults(global), createdAt: null, updatedAt: null }
    return { ...row.data, createdAt: iso(row.createdAt), updatedAt: iso(row.updatedAt) }
  }

  async function findGlobal(slug, { depth = 0, locale = DEFAULT_LOCALE, user = null, overrideAccess = false } = {}) {
    const global = globalBySlug[slug]
    if (!global) throw notFound(`Unknown global "${slug}".`)
    if (!overrideAccess && !resolve(global.access.read, user, global).allowed) throw denied(user)
    const doc = await getGlobalRaw(slug)
    await populate(global, [doc], clamp(Number(depth) || 0, 0, MAX_DEPTH), user)
    return { ...presentDoc(global.fields, doc, { locale, user }), globalType: slug }
  }

  async function updateGlobal(slug, input, { user = null, overrideAccess = false, locale = DEFAULT_LOCALE } = {}) {
    const global = globalBySlug[slug]
    if (!global) throw notFound(`Unknown global "${slug}".`)
    if (!overrideAccess && !resolve(global.access.update, user, global).allowed) throw denied(user)
    const existing = await getGlobalRaw(slug)
    const { createdAt: _c, updatedAt: _u, ...existingData } = existing
    const clean = await prepare(global.fields, input, existingData, { operation: 'update', user, draft: false, overrideAccess })
    const row = await globalModel.findOne({ where: { slug } })
    if (row) await row.update({ data: clean })
    else await globalModel.create({ slug, data: clean })
    await snapshot('global', slug, null, clean, null, user, global.versions)
    return findGlobal(slug, { locale, user, overrideAccess: true })
  }

  /* ------------------------------------------------------------------ versions */

  async function listVersions(kind, slug, docId) {
    const rows = await versionModel.findAll({ where: { kind, slug, docId: docId ?? null }, order: [['id', 'DESC']], attributes: ['id', 'status', 'userId', 'createdAt'], raw: true })
    return rows.map((r) => ({ id: r.id, status: r.status, userId: r.userId, createdAt: iso(r.createdAt) }))
  }

  async function getVersion(kind, slug, docId, versionId) {
    const row = await versionModel.findOne({ where: { id: Number(versionId), kind, slug, docId: docId ?? null } })
    if (!row) throw notFound('Version not found.')
    return { id: row.id, createdAt: iso(row.createdAt), status: row.status, data: row.data }
  }

  return {
    find, findByID, count, create, update, remove, findGlobal, updateGlobal, getRaw, getGlobalRaw,
    listVersions, getVersion, docFromRow, prepare,
    onCreate: (fn) => afterCreate.push(fn),
  }
}
