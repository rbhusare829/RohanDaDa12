/**
 * The shape of the content schema as the backend sends it (GET /api/admin/schema).
 * The admin forms, lists and menus are all built from it — a new field in backend/src/schema appears here by itself.
 */
export type Option = { label: string; value: string }

export type FieldAdmin = {
  description?: string
  position?: 'sidebar'
  readOnly?: boolean
  hidden?: boolean
  initCollapsed?: boolean
  cell?: 'status' | 'boolean' | 'thumb'
}

export interface FieldDef {
  type: string
  name: string
  label?: string
  localized?: boolean
  required?: boolean
  hasMany?: boolean
  unique?: boolean
  column?: boolean
  defaultValue?: unknown
  options?: Option[]
  relationTo?: string
  fields?: FieldDef[]
  blocks?: BlockDef[]
  tabs?: { label: string; fields: FieldDef[] }[]
  labels?: { singular: string; plural: string }
  minRows?: number
  maxRows?: number
  min?: number
  max?: number
  integer?: boolean
  dayOnly?: boolean
  slugFrom?: string
  maxLength?: number
  admin?: FieldAdmin
}

export interface BlockDef {
  slug: string
  labels: { singular: string; plural: string }
  fields: FieldDef[]
}

export interface CollectionDef {
  slug: string
  labels: { singular: string; plural: string }
  admin: { useAsTitle?: string; group?: string; defaultColumns?: string[]; description?: string; hidden?: boolean; export?: boolean; preview?: string }
  drafts: false | { schedule: boolean }
  versions: number
  defaultSort: string
  upload: null | { kind: 'image' | 'file'; mimeTypes: string[]; maxSize: number; private: boolean; focalPoint: boolean; sizes?: string[] }
  auth: boolean
  sqlOnly: boolean
  fields: FieldDef[]
  permissions: { read: boolean; create: boolean; update: boolean; delete: boolean }
}

export interface GlobalDef {
  slug: string
  label: string
  admin: { group?: string; description?: string; preview?: string }
  versions: number
  fields: FieldDef[]
  permissions: { read: boolean; update: boolean }
}

export interface AdminSchema {
  locales: string[]
  defaultLocale: string
  collections: CollectionDef[]
  globals: GlobalDef[]
}

export type AdminUser = { id: number; email: string; name: string | null; role: 'super-admin' | 'editor' | 'media-uploader' }

/* ---------------------------------------------------------------- helpers */

export const flatFields = (fields: FieldDef[]): FieldDef[] => fields.flatMap((f) => (f.type === 'tabs' ? (f.tabs ?? []).flatMap((t) => flatFields(t.fields)) : [f]))

/** "showSideMenu" → "Show Side Menu" */
export const startCase = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase()).replace(/\b(\w)/g, (c) => c.toUpperCase())

export const fieldLabel = (f: FieldDef) => f.label ?? startCase(f.name)

const hasDevanagari = (s: string) => /[ऀ-ॿ]/.test(s)

/** Initial value of a field in a new document / a new row */
export function defaultFor(f: FieldDef, locales: string[]): unknown {
  const dv = f.defaultValue
  switch (f.type) {
    case 'group':
      return defaultsFor(f.fields ?? [], locales)
    case 'array':
    case 'blocks':
      return []
    case 'checkbox':
      return dv === true
    case 'upload':
    case 'relationship':
      return f.hasMany ? [] : null
    default:
      break
  }
  if (f.localized) {
    const out: Record<string, unknown> = Object.fromEntries(locales.map((l) => [l, f.hasMany ? [] : null]))
    if (typeof dv === 'string') out[hasDevanagari(dv) ? 'mr' : 'en'] = dv
    return out
  }
  if (f.hasMany) return Array.isArray(dv) ? dv : []
  if (dv !== undefined && dv !== null) return dv
  return f.type === 'select' ? '' : null
}

export function defaultsFor(fields: FieldDef[], locales: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const f of flatFields(fields)) out[f.name] = defaultFor(f, locales)
  return out
}

/** A value that may be localized ({ en, mr }) → one string to show in a list */
export function plain(value: unknown, locale = 'en'): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map((v) => plain(v, locale)).join(', ')
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>
    const pick = [locale, 'en', 'mr'].map((l) => o[l]).find((v) => v != null && v !== '' && !(Array.isArray(v) && !v.length))
    if (pick !== undefined) return plain(pick, locale)
    if ('title' in o) return plain(o.title, locale)
    if ('filename' in o) return String(o.filename)
  }
  return ''
}

export const titleOf = (c: CollectionDef, doc: Record<string, unknown>) => plain(doc[c.admin.useAsTitle ?? 'id']) || `${c.labels.singular} #${doc.id}`

/** "/blog/{slug}" + a document → "/blog/my-post" (null when a part is missing) */
export function previewUrl(template: string | undefined, doc: Record<string, unknown>): string | null {
  if (!template) return null
  let ok = true
  const url = template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = plain(doc[k])
    if (!v) ok = false
    return encodeURIComponent(v).replace(/%2F/g, '/')
  })
  return ok ? url : null
}

/** A random 24-character id for new rows (the backend keeps ids it receives and makes its own otherwise) */
export const newRowId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')

/** Dotted path lookup in nested objects / arrays ("layout.2.items.0.title") */
export const getAt = (obj: unknown, path: string): unknown => path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj)

export const GROUP_ORDER = ['Content', 'Social Work', 'Blog', 'Media', 'About', 'Inbox', 'Settings']
