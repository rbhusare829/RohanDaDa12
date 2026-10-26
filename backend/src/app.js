import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'
import qs from 'qs'
import { loadConfig } from './config.js'
import { createDatabase } from './db/index.js'
import { createAuth } from './lib/auth.js'
import { createDocuments } from './lib/documents.js'
import { createMailer, createNotifier } from './lib/mail.js'
import { createStorage } from './lib/storage.js'
import { createUploads } from './lib/uploads.js'
import { asyncHandler } from './lib/util.js'
import { authenticate, cacheHeaders, errorHandler, requestLogger } from './middleware/core.js'
import { corsMiddleware, csrfGuard, rateLimiters, securityHeaders } from './middleware/security.js'
import { adminRoutes } from './routes/admin.js'
import { contentRoutes } from './routes/content.js'
import { facebookRoutes } from './routes/facebook.js'
import { formsRoutes } from './routes/forms.js'
import { siteRoutes } from './routes/site.js'
import { usersRoutes } from './routes/users.js'

const logger = {
  info: (...a) => console.log(...a),
  warn: (...a) => console.warn(...a),
  error: (...a) => console.error(...a),
}

/**
 * Builds the whole application (database, services, routes) without starting a server,
 * so tests can run it on any port and the production entry point (server.js) stays tiny.
 */
export async function createApp({ cfg = loadConfig(), log = logger } = {}) {
  const db = await createDatabase(cfg)
  if (cfg.autoMigrate) await db.migrate()

  const storage = createStorage(cfg)
  const uploads = createUploads({ storage })
  const documents = createDocuments({ db, uploads, logger: log, hashRounds: cfg.bcryptRounds })
  const auth = createAuth({ cfg, db })
  const mailer = createMailer({ cfg, logger: log })
  documents.onCreate(createNotifier({ cfg, documents, mailer, logger: log }))
  const ctx = { cfg, db, storage, uploads, documents, auth, mailer, logger: log }
  const limiters = rateLimiters(cfg)

  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', cfg.trustProxy)
  // same bracket syntax the website's client uses: where[and][0][_status][equals]=published
  app.set('query parser', (str) => qs.parse(str, { arrayLimit: 500, depth: 8, parameterLimit: 1000 }))

  app.use(compression())
  app.use(securityHeaders(cfg))
  app.use(requestLogger({ cfg, logger: log }))

  // uploaded photos and documents (never the private/ folder, which holds form attachments)
  if (storage.driver === 'local') {
    app.use('/uploads/private', (_req, res) => res.status(404).type('text/plain').send('Not found'))
    app.use(
      '/uploads',
      express.static(storage.root, {
        index: false,
        dotfiles: 'deny',
        maxAge: '1y',
        immutable: true,
        setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
      }),
    )
  }

  app.get('/api/health', asyncHandler(async (_req, res) => {
    await db.sequelize.query('SELECT 1')
    res.set('Cache-Control', 'no-store').json({ status: 'ok' })
  }))

  app.use('/api', corsMiddleware(cfg), cookieParser(), express.json({ limit: '5mb' }), authenticate(ctx), csrfGuard(cfg), cacheHeaders, limiters.read, limiters.write)
  app.use('/api/users', usersRoutes(ctx, { limiters }))
  app.use('/api/admin', adminRoutes(ctx))
  app.use('/api/forms', formsRoutes(ctx, { limiters }))
  app.use('/api/facebook', facebookRoutes(ctx))
  app.use('/api', contentRoutes(ctx))
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found.' }))

  app.use(siteRoutes(ctx))
  app.use((_req, res) => res.status(404).type('text/plain').send('Not found'))
  app.use(errorHandler({ cfg, logger: log }))

  return { app, ctx, close: () => db.close() }
}
