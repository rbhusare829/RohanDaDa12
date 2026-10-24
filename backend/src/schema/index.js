import { Pages } from './collections/pages.js'
import { contentCollections } from './collections/content.js'
import { mediaCollections } from './collections/media.js'
import { inboxCollections } from './collections/inbox.js'
import { Users } from './collections/users.js'
import { globals } from './globals.js'

export { INITIATIVE_CATEGORIES, ALBUM_CATEGORIES } from './collections/content.js'
export { SECTIONS } from './collections/pages.js'

/** Order here is the order of the admin menu inside each group */
export const collections = [Pages, ...contentCollections, ...mediaCollections, ...inboxCollections, Users]
export { globals }

export const collectionBySlug = Object.fromEntries(collections.map((c) => [c.slug, c]))
export const globalBySlug = Object.fromEntries(globals.map((g) => [g.slug, g]))

/** Table name for a collection: "contact-messages" → "contact_messages" */
export const tableName = (slug) => slug.replace(/-/g, '_')

/**
 * Fields as stored on the document, flattening the layout-only "tabs" wrappers.
 * (Groups, arrays and blocks keep their own nesting.)
 */
export const flatFields = (fields) => fields.flatMap((f) => (f.type === 'tabs' ? f.tabs.flatMap((t) => flatFields(t.fields)) : [f]))
