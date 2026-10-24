import { collectionBySlug, flatFields } from '../schema/index.js'
import { fieldAllowed } from './access.js'
import { isEmptyHtml } from './sanitize.js'
import { isPlainObject } from './util.js'

export const LOCALES = ['en', 'mr']
export const DEFAULT_LOCALE = 'en'
export const isLocale = (l) => LOCALES.includes(l)

/** A value counts as "not filled in": null, blank text, an empty list or HTML without text */
export const isEmptyValue = (v) => {
  if (v == null) return true
  if (typeof v === 'string') return !v.trim() || isEmptyHtml(v)
  if (Array.isArray(v)) return v.length === 0
  return false
}

/**
 * Localized fields are stored as { en, mr }. For the requested language return its value, or — when it is empty —
 * the other language's (an English page with a missing field shows the Marathi text instead of a gap).
 */
export function pickLocale(value, locale) {
  if (!isPlainObject(value)) return value
  const keys = Object.keys(value)
  if (keys.length && !keys.every((k) => LOCALES.includes(k))) return value // not a language map after all
  for (const l of [locale, ...LOCALES.filter((x) => x !== locale)]) if (!isEmptyValue(value[l])) return value[l]
  return value[locale] ?? null
}

const blockFields = (field, row) => field.blocks.find((b) => b.slug === row?.blockType)?.fields ?? []

/**
 * Prepares a document for output:
 *   - removes fields the user is not allowed to read (field-level `access.read`)
 *   - with a locale (not "all"): picks each localized field's text for that language
 * It also walks into populated relationships / uploads using the target collection's own fields.
 */
export function presentDoc(fields, doc, { locale, user }) {
  if (!isPlainObject(doc)) return doc
  const out = { ...doc }
  for (const f of flatFields(fields)) {
    if (!(f.name in out)) continue
    if (!fieldAllowed(f, 'read', user)) {
      delete out[f.name]
      continue
    }
    out[f.name] = presentValue(f, out[f.name], { locale, user })
  }
  return out
}

function presentValue(f, value, ctx) {
  if (value == null) return value
  const { locale } = ctx
  if (f.localized && locale !== 'all') value = pickLocale(value, locale)
  switch (f.type) {
    case 'group':
      return presentDoc(f.fields, value, ctx)
    case 'array':
      return Array.isArray(value) ? value.map((row) => presentDoc(f.fields, row, ctx)) : value
    case 'blocks':
      return Array.isArray(value) ? value.map((row) => presentDoc(blockFields(f, row), row, ctx)) : value
    case 'upload':
    case 'relationship': {
      const target = collectionBySlug[f.relationTo]
      const one = (v) => (isPlainObject(v) && target ? presentCollectionDoc(target, v, ctx) : v)
      return Array.isArray(value) ? value.map(one) : one(value)
    }
    default:
      return value
  }
}

/** A populated document of a collection (also keeps the built-in upload fields such as url and sizes) */
export const presentCollectionDoc = (collection, doc, ctx) => presentDoc(collection.fields, doc, ctx)
