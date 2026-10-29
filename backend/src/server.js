import { loadConfig } from './config.js'
import { createApp } from './app.js'
import { startJobs } from './jobs/index.js'

const cfg = loadConfig()
const { app, ctx, close } = await createApp({ cfg })
const jobs = startJobs(ctx)

const server = app.listen(cfg.port, () => {
  console.log(`Rohan Deshmukh website API  →  http://localhost:${cfg.port}   (${cfg.nodeEnv}, ${cfg.db.dialect}${cfg.serveFrontend ? ', serving the website' : ''})`)

  // Automatically seed initial content in the background if the database is empty (e.g. first deploy on Render)
  // This runs AFTER server.listen() so Render detects the open port immediately without timeout!
  import('./seed/load.js')
    .then(async ({ isEmpty, readSnapshot, loadSnapshot, ensureAdmin }) => {
      const empty = await isEmpty(ctx)
      const homeRaw = await ctx.documents.getGlobalRaw('home').catch(() => null)
      const needsSeed = empty || !homeRaw?.sections?.length
      if (needsSeed) {
        console.log('Database missing content or globals — seeding initial content in background…')
        const snapshot = await readSnapshot()
        const stats = await loadSnapshot(ctx, snapshot, { strict: false })
        console.log(`✓ Loaded ${stats.documents} documents (${stats.media} photos) and ${stats.globals} settings pages.`)
        const admin = await ensureAdmin(ctx)
        if (admin) console.log(`✓ Created admin account ${admin}`)
      }
    })
    .catch((err) => console.error('Background seed notice:', err.message))
})

// a clean stop: finish the requests in flight, stop the scheduled jobs, close the database
let stopping = false
async function shutdown(signal) {
  if (stopping) return
  stopping = true
  console.log(`\n${signal} received — shutting down…`)
  jobs.stop()
  server.close(async () => {
    await close().catch(() => {})
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err))
