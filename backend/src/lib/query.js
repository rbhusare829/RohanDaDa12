import { Op, col as sqlCol, fn, where as sqlWhere } from 'sequelize'
import { flatFields } from '../schema/index.js'
import { fieldAllowed } from './access.js'
import { badRequest, isPlainObject } from './util.js'

/**
 * The query language of the REST API — the same shape Payload CMS used, so the website's client code did not change:
 *   ?where[status][equals]=new
 *   ?where[and][0][categories][contains]=3&where[and][1][_status][equals]=published
 *   ?sort=-publishedAt,title
 *
 * Conditions on fields that have their own database column are executed in SQL; the rest (values inside the
 * document's JSON, localized text…) are checked in JavaScript on the rows SQL returns.
 */
const OPS = ['equals', 'not_equals', 'in', 'not_in', 'contains', 'like', 'exists', 'greater_than', 'greater_than_equal', 'less_than', 'less_than_equal']

const asList = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v == null ? [] : [v])

/* ------------------------------------------------------------------ parsing */

/** where object → list of conditions ANDed together. A condition is a leaf, { and: [lists] } or { or: [lists] }. */
export function parseWhere(where, depth = 0) {
  if (depth > 6) throw badRequest('The query is nested too deeply.')
  if (!where || typeof where !== 'object') return []
  const nodes = []
  for (const [key, val] of Object.entries(where)) {
    if (key === 'and' || key === 'or') {
      const items = Array.isArray(val) ? val : isPlainObject(val) ? Object.values(val) : []
      nodes.push({ [key]: items.map((v) => parseWhere(v, depth + 1)) })
    } else if (isPlainObject(val)) {
      for (const [op, v] of Object.entries(val)) {
        if (!OPS.includes(op)) throw badRequest(`Unknown query operator "${op}".`)
        nodes.push({ field: key, op, value: v })
      }
    } else {
      nodes.push({ field: key, op: 'equals', value: val })
    }
  }
  return nodes
}

/** Every field a query names must exist and be readable by the user (no probing hidden columns) */
export function assertQueryable(collection, nodes, user) {
  const known = knownFields(collection, user)
  const walk = (list) => {
    for (const n of list) {
      if (n.and || n.or) (n.and || n.or).forEach(walk)
      else if (!known.has(String(n.field).split('.')[0])) throw badRequest(`Cannot query by "${n.field}".`)
    }
  }
  walk(nodes)
}

const BUILT_IN = ['id', 'createdAt', 'updatedAt', '_status', 'filename', 'mimeType', 'filesize', 'width', 'height', 'focalX', 'focalY', 'email']

function knownFields(collection, user) {
  const names = new Set(['id', 'createdAt', 'updatedAt'])
  if (collection.drafts) names.add('_status')
  if (collection.upload) ['filename', 'mimeType', 'filesize', 'width', 'height', 'focalX', 'focalY'].forEach((n) => names.add(n))
  if (collection.auth) names.add('email')
  for (const f of flatFields(collection.fields)) if (fieldAllowed(f, 'read', user)) names.add(f.name)
  return names
}

/* ------------------------------------------------------------------ evaluating in JavaScript */

const getPath = (obj, path) => String(path).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)

const isNullish = (v) => v == null || v === 'null'
const sameValue = (a, b) => {
  if (isNullish(a) || isNullish(b)) return isNullish(a) && (isNullish(b) || b === '')
  return String(a) === String(b)
}
const compare = (a, b) => {
  const na = Number(a)
  const nb = Number(b)
  if (a !== '' && b !== '' && Number.isFinite(na) && Number.isFinite(nb) && !/[-:T]/.test(String(a))) return na - nb
  const ta = Date.parse(a)
  const tb = Date.parse(b)
  if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb
  return String(a).localeCompare(String(b))
}

/** With locale=all a localized value is { en, mr } */
const isLocaleMap = (v) => isPlainObject(v) && ('en' in v || 'mr' in v)

function matchLeaf(actual, op, expected) {
  // a condition on a localized value holds when it holds in any language
  const flat = isLocaleMap(actual) ? Object.values(actual) : actual
  const values = Array.isArray(flat) ? flat.flat() : [flat]
  const isList = Array.isArray(actual) || (isLocaleMap(actual) && Object.values(actual).some(Array.isArray))
  switch (op) {
    case 'equals':
    case 'contains':
      return isList || op === 'equals'
        ? values.some((v) => sameValue(v, expected)) || (isNullish(expected) && values.length === 0)
        : values.some((v) => typeof v === 'string' && v.toLowerCase().includes(String(expected).toLowerCase()))
    case 'not_equals':
      return !(values.some((v) => sameValue(v, expected)) || (isNullish(expected) && values.length === 0))
    case 'in':
      return asList(expected).some((e) => values.some((v) => sameValue(v, e)))
    case 'not_in':
      return !asList(expected).some((e) => values.some((v) => sameValue(v, e)))
    case 'like':
      return values.some((v) => v != null && String(v).toLowerCase().includes(String(expected).toLowerCase()))
    case 'exists': {
      const has = values.some((v) => v != null && v !== '')
      return String(expected) === 'false' ? !has : has
    }
    case 'greater_than':
      return actual != null && compare(actual, expected) > 0
    case 'greater_than_equal':
      return actual != null && compare(actual, expected) >= 0
    case 'less_than':
      return actual != null && compare(actual, expected) < 0
    case 'less_than_equal':
      return actual != null && compare(actual, expected) <= 0
    default:
      return false
  }
}

export function matches(view, nodes) {
  return nodes.every((n) => {
    if (n.and) return n.and.every((list) => matches(view, list))
    if (n.or) return n.or.some((list) => matches(view, list))
    return matchLeaf(getPath(view, n.field), n.op, n.value)
  })
}

/* ------------------------------------------------------------------ translating to SQL */

const KIND = { text: 'string', email: 'string', select: 'string', textarea: 'string', number: 'number', checkbox: 'boolean', date: 'date', upload: 'number', relationship: 'number' }

/** Column name → value kind, for the fields of a collection that have their own column */
function columnKinds(collection) {
  const kinds = { id: 'number', createdAt: 'date', updatedAt: 'date' }
  if (collection.drafts) kinds._status = 'string'
  if (collection.upload) Object.assign(kinds, { filename: 'string', mimeType: 'string', filesize: 'number', width: 'number', height: 'number', focalX: 'number', focalY: 'number' })
  if (collection.auth) kinds.email = 'string'
  for (const f of flatFields(collection.fields)) if (f.column) kinds[f.name] = KIND[f.type]
  return kinds
}

function coerce(kind, v) {
  if (isNullish(v)) return null
  if (kind === 'number') {
    const n = Number(v)
    if (!Number.isFinite(n)) throw badRequest(`"${v}" is not a number.`)
    return n
  }
  if (kind === 'boolean') return v === true || v === 'true' || v === '1' || v === 1
  if (kind === 'date') {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) throw badRequest(`"${v}" is not a valid date.`)
    return d
  }
  return String(v)
}

const likePattern = (v) => `%${String(v).replace(/[%_\\]/g, ' ')}%`

function leafToSql(kinds, n) {
  const kind = kinds[n.field]
  if (!kind) return null
  const col = n.field
  switch (n.op) {
    case 'equals':
      return { [col]: coerce(kind, n.value) }
    case 'not_equals': {
      const v = coerce(kind, n.value)
      return v === null ? { [col]: { [Op.ne]: null } } : { [Op.or]: [{ [col]: { [Op.ne]: v } }, { [col]: null }] }
    }
    case 'in':
      return { [col]: { [Op.in]: asList(n.value).map((v) => coerce(kind, v)) } }
    case 'not_in':
      return { [Op.or]: [{ [col]: { [Op.notIn]: asList(n.value).map((v) => coerce(kind, v)) } }, { [col]: null }] }
    case 'contains':
    case 'like':
      // LOWER() on both sides: case-insensitive on every database (PostgreSQL's LIKE is case-sensitive; SQLite and MySQL's are not)
      return kind === 'string' ? sqlWhere(fn('LOWER', sqlCol(col)), { [Op.like]: likePattern(n.value).toLowerCase() }) : n.op === 'contains' ? { [col]: coerce(kind, n.value) } : null
    case 'exists':
      return String(n.value) === 'false' ? { [col]: null } : { [col]: { [Op.ne]: null } }
    case 'greater_than':
      return { [col]: { [Op.gt]: coerce(kind, n.value) } }
    case 'greater_than_equal':
      return { [col]: { [Op.gte]: coerce(kind, n.value) } }
    case 'less_than':
      return { [col]: { [Op.lt]: coerce(kind, n.value) } }
    case 'less_than_equal':
      return { [col]: { [Op.lte]: coerce(kind, n.value) } }
    default:
      return null
  }
}

function toSql(kinds, n) {
  if (n.and || n.or) {
    const key = n.and ? 'and' : 'or'
    const parts = []
    for (const list of n[key]) {
      const lp = list.map((x) => toSql(kinds, x))
      if (lp.includes(null)) return null
      parts.push(lp.length === 1 ? lp[0] : { [Op.and]: lp })
    }
    return parts.length ? { [key === 'and' ? Op.and : Op.or]: parts } : {}
  }
  return leafToSql(kinds, n)
}

/** Splits the conditions into those SQL can run and those that must be checked in JavaScript */
export function splitWhere(collection, nodes) {
  const kinds = columnKinds(collection)
  const sql = []
  const js = []
  for (const n of nodes) {
    const s = toSql(kinds, n)
    if (s === null) js.push(n)
    else sql.push(s)
  }
  return { sql: sql.length ? { [Op.and]: sql } : {}, js }
}

/* ------------------------------------------------------------------ sorting */

export function parseSort(sort, fallback) {
  const raw = sort || fallback || '-createdAt'
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ field: s.replace(/^-/, ''), dir: s.startsWith('-') ? 'DESC' : 'ASC' }))
}

export const sortableInSql = (collection, sorts) => {
  const kinds = columnKinds(collection)
  return sorts.every((s) => kinds[s.field])
}

/** Records that tie on every sort key follow the direction of the last one: a newest-first list puts the newer record first */
const tieBreak = (sorts) => (sorts.at(-1)?.dir === 'DESC' ? 'DESC' : 'ASC')

export const sqlOrder = (sorts) => [...sorts.map((s) => [s.field, s.dir]), ['id', tieBreak(sorts)]]

export function sortDocs(docs, sorts, locale) {
  const collator = new Intl.Collator(locale === 'mr' ? 'mr' : 'en', { numeric: true, sensitivity: 'base' })
  // with locale=all a localized value is { en, mr }: sort by the requested language, else English, else Marathi
  const pick = (v) => (isLocaleMap(v) ? [locale, 'en', 'mr'].map((l) => v[l]).find((x) => x != null && x !== '') ?? null : v)
  const cmp = (a, b) => {
    if (a == null && b == null) return 0
    if (a == null) return -1
    if (b == null) return 1
    if (typeof a === 'number' && typeof b === 'number') return a - b
    return collator.compare(String(a), String(b))
  }
  return [...docs].sort((x, y) => {
    for (const s of sorts) {
      const r = cmp(pick(getPath(x, s.field)), pick(getPath(y, s.field)))
      if (r) return s.dir === 'DESC' ? -r : r
    }
    const byId = (x.id ?? 0) - (y.id ?? 0)
    return tieBreak(sorts) === 'DESC' ? -byId : byId
  })
}

export { BUILT_IN }
