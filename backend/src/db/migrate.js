import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Umzug, SequelizeStorage } from 'umzug'

const here = path.dirname(fileURLToPath(import.meta.url))
const dir = path.join(here, 'migrations')

/**
 * Runs the pending migrations in src/db/migrations (alphabetical order).
 * Each file exports `up({ sequelize, queryInterface })` and must be safe to run twice
 * (check `describeTable` before adding a column): a fresh install builds its tables from the current models
 * in 001-initial, so later migrations may find their column already there.
 */
export async function runMigrations(sequelize) {
  const files = readdirSync(dir).filter((f) => /^\d+.*\.js$/.test(f)).sort()
  const umzug = new Umzug({
    migrations: files.map((file) => ({
      name: file,
      up: async () => (await import(pathToFileURL(path.join(dir, file)).href)).up({ sequelize, queryInterface: sequelize.getQueryInterface() }),
      down: async () => {},
    })),
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize, tableName: 'schema_migrations' }),
    logger: undefined,
  })
  const done = await umzug.up()
  return done.map((m) => m.name)
}
