import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { forbidden } from '../lib/util.js'

const originOf = (url) => {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/** Origins allowed to call the API from a browser (the site itself, plus CORS_ORIGINS for a separately hosted frontend) */
export const allowedOrigins = (cfg) =>
  new Set([cfg.publicUrl, ...cfg.corsOrigins, ...(cfg.production ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000'])].map(originOf).filter(Boolean))

/**
 * Security headers. The content-security-policy spells out what the site is allowed to load:
 * its own files, YouTube (videos + thumbnails), Instagram reels, Facebook page plugin and post photos (fbcdn.net), Google Maps and reCAPTCHA.
 */
export function securityHeaders(cfg) {
  const s3Origin = cfg.storage.driver === 's3' ? originOf(cfg.storage.s3.publicUrl || cfg.storage.s3.endpoint || `https://${cfg.storage.s3.bucket}.s3.${cfg.storage.s3.region}.amazonaws.com`) : null
  const blobOrigin = cfg.storage.driver === 'vercel-blob' ? originOf(cfg.storage.blob.publicUrl || `https://${cfg.storage.blob.token.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]?.toLowerCase()}.public.blob.vercel-storage.com`) : null
  const files = [s3Origin, blobOrigin].filter(Boolean)
  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://www.googletagmanager.com', 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:', 'https://i.ytimg.com', 'https://*.fbcdn.net', 'https://www.google-analytics.com', 'https://*.googletagmanager.com', ...files],
        'media-src': ["'self'", 'blob:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", 'https://www.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com', ...files],
        'frame-src': [
          'https://www.youtube-nocookie.com',
          'https://www.youtube.com',
          'https://www.instagram.com',
          'https://www.facebook.com',
          'https://www.google.com',
        ],
        'worker-src': ["'self'", 'blob:'],
        'manifest-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        ...(cfg.cookieSecure ? { 'upgrade-insecure-requests': [] } : {}),
      },
    },
    // third-party iframes (YouTube, Instagram, Maps) must keep working
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: cfg.cookieSecure ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
}

export const corsMiddleware = (cfg) => {
  const allowed = allowedOrigins(cfg)
  return cors({
    origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Requested-With', 'Authorization'],
    maxAge: 600,
  })
}

/**
 * Cookie-authenticated writes must come from the site itself:
 *  - the request carries the custom X-Requested-With header (a cross-site form post cannot add it), and
 *  - if the browser sent an Origin, it is one of ours.
 */
export const csrfGuard = (cfg) => {
  const allowed = allowedOrigins(cfg)
  return (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || !req.cookies?.[cfg.cookieName]) return next()
    if (req.get('x-requested-with') !== 'XMLHttpRequest') return next(forbidden('Blocked: this request did not come from the website.'))
    const origin = req.get('origin')
    if (origin && !allowed.has(origin) && originOf(`${req.protocol}://${req.get('host')}`) !== origin) return next(forbidden('Blocked: unexpected request origin.'))
    next()
  }
}

/**
 * Rate limits (per address):
 *   read   1200 / minute        generous: a visitor browsing the site never gets near it
 *   write  300 / 15 minutes     admin edits and uploads
 *   login  10 failed / 15 min   failures only; a correct sign-in does not count
 */
export function rateLimiters(cfg) {
  const disabled = cfg.rateLimitDisabled
  const make = (opts) =>
    rateLimit({
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      skip: () => disabled,
      message: { message: 'Too many requests. Please wait a little and try again.' },
      ...opts,
    })
  return {
    read: make({ windowMs: 60_000, limit: 1200, skip: (req) => disabled || !['GET', 'HEAD'].includes(req.method) }),
    write: make({ windowMs: 15 * 60_000, limit: 300, skip: (req) => disabled || ['GET', 'HEAD', 'OPTIONS'].includes(req.method) }),
    login: make({ windowMs: 15 * 60_000, limit: 10, skipSuccessfulRequests: true }),
    form: make({ windowMs: 10 * 60_000, limit: 5, message: { ok: false, message: 'Too many submissions. Please try again later.' } }),
  }
}
