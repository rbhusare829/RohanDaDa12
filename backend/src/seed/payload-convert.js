import { collections, flatFields, globals } from '../schema/index.js'
import { LOCALES, isEmptyValue } from '../lib/localize.js'
import { escapeHtml, isPlainObject } from '../lib/util.js'

/**
 * Turns content exported from the old Payload CMS (REST API, all languages, relationships left as ids) into this
 * application's own document format. Pure functions — no database, no network — so they are easy to test.
 *
 *   rich text   Lexical JSON → HTML
 *   everything  is walked with the schema, so only known fields survive and every value has the shape the API expects
 */

/* ------------------------------------------------------------------ rich text: Lexical → HTML */

const FORMATS = [
  [1, 'strong'],
  [2, 'em'],
  [4, 's'],
  [8, 'u'],
]

const textNode = (n) => {
  let html = escapeHtml(n.text ?? '')
  for (const [bit, tag] of FORMATS) if ((n.format ?? 0) & bit) html = `<${tag}>${html}</${tag}>`
  return html
}

export function lexicalToHtml(node, media = new Map()) {
  const kids = (n) => (n.children ?? []).map((c) => lexicalToHtml(c, media)).join('')
  switch (node?.type) {
    case 'root':
      return kids(node)
    case 'paragraph': {
      const inner = kids(node)
      return `<p>${inner || '<br>'}</p>`
    }
    case 'heading': {
      const tag = ['h2', 'h3', 'h4'].includes(node.tag) ? node.tag : node.tag === 'h1' ? 'h2' : 'h4'
      return `<${tag}>${kids(node)}</${tag}>`
    }
    case 'quote':
      return `<blockquote><p>${kids(node)}</p></blockquote>`
    case 'list': {
      const tag = node.tag === 'ol' ? 'ol' : 'ul'
      return `<${tag}>${kids(node)}</${tag}>`
    }
    case 'listitem':
      return `<li>${kids(node)}</li>`
    case 'text':
      return textNode(node)
    case 'linebreak':
      return '<br>'
    case 'link':
    case 'autolink': {
      const url = node.fields?.url ?? node.url
      if (!url) return kids(node)
      return `<a href="${escapeHtml(url)}"${node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${kids(node)}</a>`
    }
    case 'horizontalrule':
      return '<hr>'
    case 'upload': {
      const id = typeof node.value === 'object' ? node.value?.id : node.value
      const m = media.get(id)
      if (!m) return '' // the photo no longer exists
      const dims = m.width && m.height ? ` width="${m.width}" height="${m.height}"` : ''
      return `<figure><img src="/uploads/${encodeURIComponent(m.filename)}" alt="${escapeHtml(m.alt ?? '')}"${dims} loading="lazy"></figure>`
    }
    default:
      return kids(node)
  }
}

const isLexical = (v) => isPlainObject(v) && isPlainObject(v.root) && v.root.type === 'root'
const isLangMap = (v) => isPlainObject(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => LOCALES.includes(k))
const firstOf = (map) => LOCALES.map((l) => map[l]).find((x) => x != null && x !== '') ?? null

/* ------------------------------------------------------------------ fields */

function convertValue(f, v, ctx) {
  if (v == null) return v

  if (f.type === 'group') return convertFields(f.fields, v, ctx)
  if (f.type === 'array') return (Array.isArray(v) ? v : []).map((row) => ({ ...(row.id ? { id: String(row.id) } : {}), ...convertFields(f.fields, row, ctx) }))
  if (f.type === 'blocks') {
    return (Array.isArray(v) ? v : [])
      .map((row) => {
        const def = f.blocks.find((b) => b.slug === row.blockType)
        if (!def) return null
        return { ...(row.id ? { id: String(row.id) } : {}), blockType: def.slug, ...(row.blockName ? { blockName: row.blockName } : {}), ...convertFields(def.fields, row, ctx) }
      })
      .filter(Boolean)
  }

  // Payload stores "nothing entered" for a localized field as {}
  if (isPlainObject(v) && Object.keys(v).length === 0) return f.localized ? Object.fromEntries(LOCALES.map((l) => [l, null])) : null

  const leaf = (x) => {
    if (f.type === 'richText') return isLexical(x) ? lexicalToHtml(x.root, ctx.media) : typeof x === 'string' ? x : null
    return x
  }

  if (f.localized) {
    // Payload (locale=all): { mr, en }; keep only the languages this site knows
    const map = isLangMap(v) ? v : { en: v }
    return Object.fromEntries(LOCALES.map((l) => [l, leaf(map[l] ?? null)]))
  }
  // a field that was language-specific in Payload but is not here (e.g. the SEO image): take the first language that has a value
  if (isLangMap(v)) return leaf(firstOf(v))
  return leaf(v)
}

function convertFields(fields, obj, ctx) {
  const out = {}
  for (const f of flatFields(fields)) {
    if (!isPlainObject(obj) || !(f.name in obj)) continue
    out[f.name] = convertValue(f, obj[f.name], ctx)
  }
  return out
}

/** Media documents: the stored file's facts + alt / caption (the file itself and its smaller copies are made at import) */
function convertMedia(doc) {
  const text = (v) => (isLangMap(v) ? Object.fromEntries(LOCALES.map((l) => [l, v[l] ?? null])) : isPlainObject(v) ? { en: null, mr: null } : { en: v ?? null, mr: null })
  return {
    id: doc.id,
    alt: text(doc.alt),
    caption: text(doc.caption),
    filename: doc.filename,
    mimeType: doc.mimeType,
    filesize: doc.filesize,
    width: doc.width,
    height: doc.height,
    focalX: doc.focalX ?? 50,
    focalY: doc.focalY ?? 50,
    folder: null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/** Collections that are carried over (accounts are not: passwords cannot be exported, create users in the new admin) */
const SKIP = new Set(['users', 'media-folders', 'form-uploads'])

/**
 * raw = { collections: { slug: [doc…] }, globals: { slug: doc } } as returned by Payload's REST API
 * → { collections, globals } in this application's format
 */
export function convertBundle(raw) {
  const media = new Map((raw.collections.media ?? []).map((m) => [m.id, { filename: m.filename, width: m.width, height: m.height, alt: isLangMap(m.alt) ? firstOf(m.alt) : m.alt }]))
  const ctx = { media }
  const out = { collections: {}, globals: {} }

  for (const c of collections) {
    if (SKIP.has(c.slug)) continue
    const docs = raw.collections[c.slug] ?? []
    out.collections[c.slug] = docs.map((doc) => {
      if (c.slug === 'media') return convertMedia(doc)
      const converted = { id: doc.id, ...convertFields(c.fields, doc, ctx) }
      if (c.drafts) converted._status = doc._status === 'draft' ? 'draft' : 'published'
      if (c.upload) Object.assign(converted, { filename: doc.filename, mimeType: doc.mimeType, filesize: doc.filesize })
      converted.createdAt = doc.createdAt
      converted.updatedAt = doc.updatedAt
      return converted
    })
  }
  for (const g of globals) {
    if (raw.globals[g.slug]) out.globals[g.slug] = convertFields(g.fields, raw.globals[g.slug], ctx)
  }
  return out
}

export { isEmptyValue }
