import { loadConfig } from '../config.js'
import { createDatabase } from './index.js'

// npm run migrate — applies any pending database migrations (the server also does this when it starts)
const db = await createDatabase(loadConfig())
try {
  const done = await db.migrate()
  console.log(done.length ? `Applied: ${done.join(', ')}` : 'The database is up to date.')
} finally {
  await db.close()
}
