import { loadConfig } from './config.js'
import { createApp } from './app.js'
import { startJobs } from './jobs/index.js'

const cfg = loadConfig()
const { app, ctx, close } = await createApp({ cfg })
const jobs = startJobs(ctx)

const server = app.listen(cfg.port, () => {
  console.log(`Rohan Deshmukh website API  →  http://localhost:${cfg.port}   (${cfg.nodeEnv}, ${cfg.db.dialect}${cfg.serveFrontend ? ', serving the website' : ''})`)
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
