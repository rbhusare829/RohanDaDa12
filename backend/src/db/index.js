import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { Sequelize } from 'sequelize'
import { buildModels } from './models.js'
import { runMigrations } from './migrate.js'

/**
 * Opens the database: SQLite for local development (a single file, zero setup),
 * MySQL or PostgreSQL (e.g. Neon on Vercel) for production. Same models and same code for all three.
 */
export function createSequelize(cfg) {
  const { db } = cfg
  if (db.dialect === 'mysql') {
    return new Sequelize(db.name, db.user, db.password, {
      host: db.host,
      port: db.port,
      dialect: 'mysql',
      logging: false,
      timezone: '+00:00',
      dialectOptions: { charset: 'utf8mb4', ...(db.ssl ? { ssl: { rejectUnauthorized: true } } : {}) },
      define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
      pool: { max: 10, min: 0, idle: 10_000, acquire: 30_000 },
    })
  }
  if (db.dialect === 'postgres') {
    const options = {
      dialect: 'postgres',
      logging: false,
      // every table lives in db.schema (e.g. "site"), so the site can share a database with other apps without touching their tables
      define: db.schema && db.schema !== 'public' ? { schema: db.schema } : {},
      dialectOptions: db.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
      pool: { max: db.poolMax, min: 0, idle: 10_000, acquire: 30_000 },
    }
    return db.url ? new Sequelize(db.url, options) : new Sequelize(db.name, db.user, db.password, { ...options, host: db.host, port: db.port })
  }
  if (db.sqlitePath !== ':memory:') mkdirSync(path.dirname(db.sqlitePath), { recursive: true })
  return new Sequelize({ dialect: 'sqlite', storage: db.sqlitePath, logging: false })
}

export async function createDatabase(cfg) {
  const sequelize = createSequelize(cfg)
  await sequelize.authenticate()
  if (cfg.db.dialect === 'sqlite') {
    // WAL: readers never block the writer; busy_timeout: wait instead of failing when two requests write at once
    if (cfg.db.sqlitePath !== ':memory:') await sequelize.query('PRAGMA journal_mode = WAL')
    await sequelize.query('PRAGMA busy_timeout = 5000')
    await sequelize.query('PRAGMA synchronous = NORMAL')
  }
  if (cfg.db.dialect === 'postgres' && cfg.db.schema && cfg.db.schema !== 'public') {
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${cfg.db.schema.replace(/"/g, '""')}"`)
  }
  const models = buildModels(sequelize)
  /**
   * PostgreSQL only: after rows were inserted with their own ids (the bundled content keeps the old site's ids), move each
   * table's id counter past the highest id — otherwise the next new row would be given an id that is already taken.
   * SQLite and MySQL do this by themselves.
   */
  const syncIdCounters = async () => {
    if (cfg.db.dialect !== 'postgres') return
    for (const model of [...Object.values(models.models), models.globalModel, models.versionModel]) {
      if (!model?.getTableName || !model.rawAttributes?.id?.autoIncrement) continue
      const t = model.getTableName()
      const qualified = typeof t === 'string' ? `"${t}"` : `"${t.schema}"."${t.tableName}"`
      await sequelize.query(`SELECT setval(pg_get_serial_sequence('${qualified.replace(/'/g, "''")}', 'id'), COALESCE((SELECT MAX(id) FROM ${qualified}), 0) + 1, false)`)
    }
  }
  return {
    sequelize,
    ...models,
    syncIdCounters,
    dialect: cfg.db.dialect,
    migrate: () => runMigrations(sequelize),
    close: () => sequelize.close(),
  }
}
