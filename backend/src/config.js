import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

export const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const projectRoot = path.resolve(backendRoot, '..')

/** Load backend/.env (never overrides variables that are already set, e.g. by the host or by tests) */
dotenv.config({ path: path.join(backendRoot, '.env'), quiet: true })

const bool = (v, fallback = false) => (v === undefined || v === '' ? fallback : /^(1|true|yes|on)$/i.test(String(v)))
const int = (v, fallback) => (Number.isFinite(Number(v)) && v !== '' && v !== undefined ? Number(v) : fallback)
const trimSlash = (u) => String(u || '').replace(/\/+$/, '')
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean)

/** mysql://user:pass@host:3306/name or postgres://… → connection parts */
function parseDatabaseUrl(url) {
  try {
    const u = new URL(url)
    const scheme = u.protocol.replace(':', '')
    const dialect = scheme.startsWith('mysql') ? 'mysql' : /^postgres(ql)?$/.test(scheme) ? 'postgres' : 'sqlite'
    return {
      dialect,
      url: dialect === 'postgres' ? url : undefined,
      ssl: dialect === 'postgres' && /sslmode=(require|verify)/.test(u.search),
      host: u.hostname,
      port: u.port ? Number(u.port) : dialect === 'postgres' ? 5432 : 3306,
      name: decodeURIComponent(u.pathname.replace(/^\//, '')),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
    }
  } catch {
    return {}
  }
}

/** Reads the environment each time, so tests can change variables before building an app */
export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development'
  const production = nodeEnv === 'production'
  // on Vercel the production address (and each preview deployment's own address) is known without being set
  const vercelUrl = (host) => (host ? `https://${host}` : '')
  const publicUrl = trimSlash(env.PUBLIC_URL || vercelUrl(env.VERCEL_ENV === 'production' ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL) || (production ? '' : 'http://localhost:3000'))
  // Vercel + Neon: DATABASE_URL_UNPOOLED is the direct connection (the pooled one cannot keep a session); DB_URL wins over both
  const dbUrl = env.DB_URL || (env.DB_DIALECT === 'postgres' || /^postgres/.test(env.DATABASE_URL || '') ? env.DATABASE_URL_UNPOOLED || env.DATABASE_URL : env.DATABASE_URL)
  const fromUrl = dbUrl ? parseDatabaseUrl(dbUrl) : {}
  const dialect = (env.DB_DIALECT || fromUrl.dialect || 'sqlite').toLowerCase()
  const frontendDist = path.resolve(backendRoot, env.FRONTEND_DIST || '../frontend/dist')

  const cfg = {
    nodeEnv,
    production,
    test: nodeEnv === 'test',
    port: int(env.PORT, 3001),
    logRequests: bool(env.LOG_REQUESTS, !production),
    rateLimitDisabled: bool(env.RATE_LIMIT_DISABLED, nodeEnv === 'test'),
    autoMigrate: bool(env.AUTO_MIGRATE, !env.VERCEL), // on Vercel the build step migrates (backend/scripts/vercel-prepare.mjs)
    publicUrl,
    corsOrigins: [...list(env.CORS_ORIGINS), vercelUrl(env.VERCEL_URL), vercelUrl(env.VERCEL_BRANCH_URL), vercelUrl(env.VERCEL_PROJECT_PRODUCTION_URL)].filter(Boolean).map(trimSlash),
    trustProxy: env.TRUST_PROXY === undefined || env.TRUST_PROXY === '' ? (env.VERCEL ? 1 : false) : /^\d+$/.test(env.TRUST_PROXY) ? Number(env.TRUST_PROXY) : bool(env.TRUST_PROXY, false) ? true : env.TRUST_PROXY,

    bcryptRounds: nodeEnv === 'test' ? 4 : 12, // password hashing cost (kept low only in tests)
    jwtSecret: env.JWT_SECRET || '',
    jwtExpiresInSeconds: int(env.JWT_EXPIRES_HOURS, 8) * 3600,
    cookieName: env.COOKIE_NAME || 'rd_token',
    cookieSecure: bool(env.COOKIE_SECURE, publicUrl.startsWith('https://')),
    cookieSameSite: (env.COOKIE_SAMESITE || 'lax').toLowerCase(),

    db: {
      dialect,
      sqlitePath: env.SQLITE_PATH === ':memory:' ? ':memory:' : path.resolve(backendRoot, env.SQLITE_PATH || 'data/rohan.sqlite'),
      url: fromUrl.url,
      // PostgreSQL only: the schema that holds this site's tables (kept apart from anything else in the same database)
      schema: env.DB_SCHEMA || (dialect === 'postgres' ? 'public' : undefined),
      host: env.DB_HOST || fromUrl.host || 'localhost',
      port: int(env.DB_PORT, fromUrl.port || (dialect === 'postgres' ? 5432 : 3306)),
      name: env.DB_NAME || fromUrl.name || 'rohan',
      user: env.DB_USER || fromUrl.user || 'root',
      password: env.DB_PASSWORD ?? fromUrl.password ?? '',
      ssl: bool(env.DB_SSL, fromUrl.ssl ?? false),
      poolMax: int(env.DB_POOL_MAX, env.VERCEL ? 3 : 10),
    },

    storage: {
      // on Vercel (BLOB_READ_WRITE_TOKEN set by the Blob integration) files go to Vercel Blob unless STORAGE_DRIVER says otherwise
      driver: (env.STORAGE_DRIVER || (env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob' : 'local')).toLowerCase(),
      dir: path.resolve(backendRoot, env.UPLOAD_DIR || 'uploads'),
      s3: {
        bucket: env.S3_BUCKET || '',
        region: env.S3_REGION || 'ap-south-1',
        endpoint: env.S3_ENDPOINT || undefined,
        accessKeyId: env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: env.S3_SECRET_ACCESS_KEY || '',
        forcePathStyle: bool(env.S3_FORCE_PATH_STYLE, false),
        prefix: String(env.S3_PREFIX || '').replace(/^\/+|\/+$/g, ''),
        publicUrl: trimSlash(env.S3_PUBLIC_URL || ''),
      },
      blob: {
        token: env.BLOB_READ_WRITE_TOKEN || '',
        // https://<store>.public.blob.vercel-storage.com — worked out from the token when not given
        publicUrl: trimSlash(env.BLOB_PUBLIC_URL || ''),
        prefix: String(env.BLOB_PREFIX ?? 'site').replace(/^\/+|\/+$/g, ''),
      },
    },

    mail: {
      host: env.SMTP_HOST || '',
      port: int(env.SMTP_PORT, 587),
      secure: bool(env.SMTP_SECURE, false),
      user: env.SMTP_USER || '',
      pass: env.SMTP_PASS || '',
      from: env.EMAIL_FROM || 'Rohan Deshmukh <noreply@rohandeshmukh.in>',
    },

    recaptchaSecret: env.RECAPTCHA_SECRET_KEY || '',
    // the Facebook Page whose latest posts the home page shows: read with the Page's access token (kept on the server, see the README)
    facebook: {
      pageId: env.FACEBOOK_PAGE_ID || '',
      pageToken: env.FACEBOOK_PAGE_TOKEN || '',
      graphUrl: trimSlash(env.FACEBOOK_GRAPH_URL || 'https://graph.facebook.com'),
      graphVersion: env.FACEBOOK_GRAPH_VERSION || 'v25.0',
    },
    admin: { email: env.ADMIN_EMAIL || 'admin@rohandeshmukh.in', password: env.ADMIN_PASSWORD || 'ChangeMe@123' },

    frontendDist,
    serveFrontend: bool(env.SERVE_FRONTEND, existsSync(path.join(frontendDist, 'index.html'))),
    backupCron: env.BACKUP_CRON === undefined ? (dialect === 'sqlite' && production && !env.VERCEL ? '30 2 * * *' : '') : env.BACKUP_CRON,
    /** running as a Vercel function: no long-lived process (no scheduled jobs), read-only disk except /tmp */
    serverless: Boolean(env.VERCEL),
    backupDir: path.resolve(backendRoot, env.BACKUP_DIR || 'backups'),
    backupKeep: int(env.BACKUP_KEEP, 14),
  }

  if (!cfg.jwtSecret) {
    if (production) throw new Error('JWT_SECRET must be set in production (a long random string)')
    cfg.jwtSecret = 'dev-only-secret-change-me'
  }
  if (production && cfg.jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters in production')
  if (cfg.storage.driver === 'vercel-blob' && !cfg.storage.blob.token) throw new Error('STORAGE_DRIVER=vercel-blob needs BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob)')
  if (!['sqlite', 'mysql', 'postgres'].includes(dialect)) throw new Error(`DB_DIALECT must be sqlite, mysql or postgres (got "${dialect}")`)
  if (cfg.serverless && dialect === 'sqlite') throw new Error('On Vercel the site needs a real database: set DATABASE_URL to a PostgreSQL (e.g. Neon) or MySQL address — an SQLite file would be lost after every request')
  if (cfg.storage.driver === 's3' && (!cfg.storage.s3.bucket || !cfg.storage.s3.accessKeyId)) {
    throw new Error('STORAGE_DRIVER=s3 needs S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY')
  }
  return cfg
}
