import { validationResult } from 'express-validator'
import { validationError } from '../lib/util.js'

/**
 * Reads the session cookie (or "Authorization: JWT <token>" for scripts) and sets req.user — signed in or not.
 * The public website sends "X-Public-View: 1" with every read, so a signed-in editor browsing the site sees what
 * a visitor sees (no drafts, no scheduled posts) while the admin keeps its own view.
 */
export const authenticate = ({ cfg, auth }) => async (req, _res, next) => {
  try {
    if (req.get('x-public-view') === '1' && ['GET', 'HEAD'].includes(req.method)) {
      req.user = null
      // an editor browsing the website gets a visitor's answer, but their browser should not keep it (they expect to see a change at once)
      req.hasSession = Boolean(req.cookies?.[cfg.cookieName])
      return next()
    }
    const header = req.get('authorization')
    const token = req.cookies?.[cfg.cookieName] || (header?.startsWith('Bearer ') ? header.slice(7) : header?.startsWith('JWT ') ? header.slice(4) : null)
    req.user = await auth.userFromToken(token)
    next()
  } catch (err) {
    next(err)
  }
}

/** API responses: visitors' reads may be cached briefly; anything for a signed-in user (or an editor browsing the website) never is */
export const cacheHeaders = (req, res, next) => {
  if (['GET', 'HEAD'].includes(req.method)) {
    if (req.user || req.hasSession || /^\/users\/|^\/admin\//.test(req.path)) res.set('Cache-Control', 'private, no-store')
    else res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
  } else {
    res.set('Cache-Control', 'no-store')
  }
  next()
}

/** express-validator result → the API's validation error format */
export const validate = (req, _res, next) => {
  const result = validationResult(req)
  if (result.isEmpty()) return next()
  next(validationError(result.array().map((e) => ({ field: e.path, message: e.msg }))))
}

export const requireUser = (req, _res, next) => {
  if (!req.user) return next(Object.assign(new Error('You must be logged in to do this.'), { status: 401 }))
  next()
}

export const errorHandler = ({ cfg, logger }) => (err, req, res, next) => {
  if (res.headersSent) return next(err)
  let status = err.status || err.statusCode || 500
  let message = err.message
  if (err.type === 'entity.parse.failed') {
    status = 400
    message = 'The request body is not valid JSON.'
  } else if (err.type === 'entity.too.large') {
    status = 413
    message = 'The request is too large.'
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413
    message = 'The file is too large.'
  } else if (err.name?.startsWith('Multer') || err.code?.startsWith?.('LIMIT_')) {
    status = 400
  }
  if (status >= 500) {
    logger.error?.(`${req.method} ${req.originalUrl} →`, err)
    if (cfg.production) message = 'Something went wrong on our side. Please try again.'
  }
  const body = { message }
  if (err.errors) body.errors = err.errors
  if (req.originalUrl.startsWith('/api') || req.accepts(['json', 'html']) === 'json') return res.status(status).json(body)
  res.status(status).type('text/plain').send(message)
}

export const requestLogger = ({ cfg, logger }) => (req, res, next) => {
  if (cfg.test || !cfg.logRequests) return next()
  const start = process.hrtime.bigint()
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6
    if (/^\/(assets|fonts|images|uploads)\//.test(req.path)) return
    logger.info?.(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(0)}ms`)
  })
  next()
}
