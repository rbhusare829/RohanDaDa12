/**
 * Field builders for the declarative content schema.
 *
 * The schema (src/schema/*) is the single source of truth for
 *   - the database  (src/db/models.js turns every collection into a Sequelize model),
 *   - validation, population and localisation (src/lib/documents.js),
 *   - the admin panel forms (served to the React admin as JSON by GET /api/admin/schema).
 *
 * A field is a plain object `{ type, name, ...options }`. Common options:
 *   label        shown in the admin (defaults to the name, e.g. "Show Side Menu")
 *   required     must have a value (for a localized field: in at least one language)
 *   localized    stored per language as { en, mr } and resolved for the requested locale
 *   unique       value must be unique in the collection
 *   column       keep the value in its own database column (so it can be filtered / sorted in SQL)
 *   hasMany      the value is a list (text / select / upload / relationship)
 *   defaultValue value (or function returning one) used for new documents
 *   admin        { description, position: 'sidebar', readOnly, hidden, initCollapsed, cell }
 *   access       { read, update } roles that may read / change the field (default: everyone)
 */

const options = (list) => list.map((o) => (typeof o === 'string' ? { label: o, value: o } : o))

export const text = (name, o = {}) => ({ type: 'text', name, ...o })
export const textarea = (name, o = {}) => ({ type: 'textarea', name, ...o })
export const email = (name, o = {}) => ({ type: 'email', name, ...o })
export const number = (name, o = {}) => ({ type: 'number', name, ...o })
export const checkbox = (name, o = {}) => ({ type: 'checkbox', name, ...o })
export const date = (name, o = {}) => ({ type: 'date', name, ...o })
export const richText = (name, o = {}) => ({ type: 'richText', name, ...o })
export const select = (name, list, o = {}) => ({ type: 'select', name, options: options(list), ...o })
export const upload = (name, relationTo, o = {}) => ({ type: 'upload', name, relationTo, ...o })
export const relationship = (name, relationTo, o = {}) => ({ type: 'relationship', name, relationTo, ...o })
export const array = (name, fields, o = {}) => ({ type: 'array', name, fields, ...o })
export const blocks = (name, defs, o = {}) => ({ type: 'blocks', name, blocks: defs, ...o })
export const group = (name, fields, o = {}) => ({ type: 'group', name, fields, ...o })
/** Layout only: shows fields in tabs, the values live directly on the document */
export const tabs = (list) => ({ type: 'tabs', tabs: list })

/** URL-safe slug, filled from another field (the title) when left empty */
export const slugField = (from = 'title') =>
  text('slug', {
    required: true,
    unique: true,
    column: true,
    slugFrom: from,
    admin: { position: 'sidebar', description: 'URL part, e.g. "annapurna-yojana". Auto-filled from the title if empty.' },
  })

export const linkFields = [
  text('label', { localized: true }),
  text('url', { admin: { description: 'Internal path like /about/biography or full https:// link' } }),
  checkbox('newTab', { defaultValue: false }),
]

export const counterArray = (name = 'counters', label = 'Impact counters') =>
  array(
    name,
    [
      text('value', { localized: true, required: true, admin: { description: 'e.g. ३,२२१+ (Marathi) / 3,221+ (English)' } }),
      text('label', { localized: true, required: true }),
    ],
    { label },
  )

export const publishedDate = date('publishedAt', {
  column: true,
  defaultValue: () => new Date().toISOString(),
  admin: { position: 'sidebar' },
})

/** SEO tab shared by pages, posts, initiatives and the homepage */
export const seoTab = {
  label: 'SEO',
  fields: [
    group(
      'meta',
      [
        text('title', { localized: true, admin: { description: 'Browser tab / search result title. Leave empty to use the page title.' } }),
        textarea('description', { localized: true, admin: { description: 'Search result and share description (about 150 characters).' } }),
        upload('image', 'media', { admin: { description: 'Image shown when the page is shared (1200×630 recommended).' } }),
      ],
      { label: 'SEO' },
    ),
  ],
}

export const ROLES = { superAdmin: 'super-admin', editor: 'editor', mediaUploader: 'media-uploader' }
