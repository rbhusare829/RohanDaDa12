import { randomBytes } from 'node:crypto'

/** Error with an HTTP status, turned into a JSON response by the error middleware */
export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message)
    this.status = status
    Object.assign(this, extra)
  }
}
export const badRequest = (message, extra) => new HttpError(400, message, extra)
export const unauthorized = (message = 'You must be logged in to do this.') => new HttpError(401, message)
export const forbidden = (message = 'You are not allowed to perform this action.') => new HttpError(403, message)
export const notFound = (message = 'Not found.') => new HttpError(404, message)

/** Validation failure: `errors` is a list of { field, message } (field = dotted path such as "layout.0.items.2.title") */
export const validationError = (errors) =>
  new HttpError(400, `The following fields are invalid: ${[...new Set(errors.map((e) => e.field))].join(', ')}`, { errors })

/** 24-character id for rows inside arrays / blocks (same shape the content already uses) */
export const rowId = () => randomBytes(12).toString('hex')

/** URL-safe slug that keeps Devanagari letters and their vowel signs */
export const slugify = (s) =>
  String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

/** Page paths are stored as "/about/biography": one leading slash, no trailing slash, lower case */
export const normalizePath = (v) => {
  const s = String(v ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase()
  return s ? `/${s}` : ''
}

export const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Wraps an async route handler so a rejected promise reaches the error middleware (Express 4 does not do this itself) */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
