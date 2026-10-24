import type { FieldValues, UseFormSetError } from 'react-hook-form'
import type { FieldProblem } from './api'
import { defaultFor, flatFields, newRowId, type FieldDef } from './schema'

/** Helpers between the stored documents (what the API sends) and the values of an edit form */

const isObject = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

/** A related item may arrive as the whole document (populated): the form only keeps its id */
const idOf = (v: unknown) => (isObject(v) ? (v.id as number | undefined) ?? null : v ?? null)

function mergeField(f: FieldDef, value: unknown, locales: string[]): unknown {
  if (value === undefined) return defaultFor(f, locales)
  switch (f.type) {
    case 'group':
      return mergeFields(f.fields ?? [], isObject(value) ? value : {}, locales)
    case 'array':
      return (Array.isArray(value) ? value : []).map((row) => {
        const r = isObject(row) ? row : {}
        return { id: typeof r.id === 'string' && r.id ? r.id : newRowId(), ...mergeFields(f.fields ?? [], r, locales) }
      })
    case 'blocks':
      return (Array.isArray(value) ? value : []).map((row) => {
        const r = isObject(row) ? row : {}
        const def = f.blocks?.find((b) => b.slug === r.blockType)
        // a section type the schema no longer knows is kept as it is, so saving never loses it silently
        return { ...(def ? mergeFields(def.fields, r, locales) : r), id: typeof r.id === 'string' && r.id ? r.id : newRowId(), blockType: r.blockType }
      })
    case 'checkbox':
      return Boolean(value)
    default:
      break
  }
  if (f.localized) {
    const o = isObject(value) ? value : {}
    return Object.fromEntries(locales.map((l) => [l, o[l] ?? (f.hasMany ? [] : null)]))
  }
  if (f.type === 'upload' || f.type === 'relationship') return f.hasMany ? (Array.isArray(value) ? value.map(idOf) : []) : idOf(value)
  if (f.hasMany) return Array.isArray(value) ? value : []
  return value
}

function mergeFields(fields: FieldDef[], doc: Record<string, unknown>, locales: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of flatFields(fields)) out[f.name] = mergeField(f, doc[f.name], locales)
  return out
}

/** The stored document (or nothing, for a new one) → the values the form starts with: every field present, in its right shape */
export const toFormValues = (fields: FieldDef[], doc: Record<string, unknown> | null | undefined, locales: string[]) => mergeFields(fields, doc ?? {}, locales)

/** Does any field of the form hold text per language? (the language switch is only shown then) */
export function hasLocalizedFields(fields: FieldDef[]): boolean {
  return flatFields(fields).some((f) => f.localized || (f.fields && hasLocalizedFields(f.fields)) || (f.blocks && f.blocks.some((b) => hasLocalizedFields(b.fields))))
}

/** Server validation problems → form errors. Returns the path of the first one, to scroll to. */
export function applyServerErrors(setError: UseFormSetError<FieldValues>, problems: FieldProblem[]): string | null {
  let first: string | null = null
  for (const p of problems) {
    if (!p.field) continue
    setError(p.field, { type: 'server', message: p.message })
    first ??= p.field
  }
  return first
}

export const formatBytes = (n?: number | null) => {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

const DATE = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const DATETIME = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export const formatDate = (iso: unknown, withTime = false) => {
  if (typeof iso !== 'string' || !iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : (withTime ? DATETIME : DATE).format(d)
}

/** "published", "draft", or "scheduled" (published with a date in the future) */
export const statusOf = (doc: Record<string, unknown>, schedules: boolean): 'published' | 'draft' | 'scheduled' => {
  if (doc._status === 'draft') return 'draft'
  if (schedules && typeof doc.publishedAt === 'string' && new Date(doc.publishedAt).getTime() > Date.now()) return 'scheduled'
  return 'published'
}
