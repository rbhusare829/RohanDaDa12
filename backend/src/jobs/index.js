import { mkdir, readdir, rm } from 'node:fs/promises'
import path from 'node:path'
import cron from 'node-cron'

/**
 * Scheduled jobs (node-cron). The one job today: a nightly copy of the SQLite database file,
 * keeping the newest BACKUP_KEEP copies. (A MySQL server is backed up by its own tools — see the README.)
 * Set BACKUP_CRON="" to turn it off, or a cron expression such as "30 2 * * *" (02:30 every night) to change it.
 */
export function startJobs({ cfg, db, logger = console }) {
  const tasks = []

  if (cfg.backupCron && cfg.db.dialect === 'sqlite' && cfg.db.sqlitePath !== ':memory:') {
    if (!cron.validate(cfg.backupCron)) {
      logger.warn?.(`BACKUP_CRON "${cfg.backupCron}" is not a valid cron expression — backups are off.`)
    } else {
      tasks.push(
        cron.schedule(cfg.backupCron, async () => {
          try {
            await mkdir(cfg.backupDir, { recursive: true })
            const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16)
            const file = path.join(cfg.backupDir, `rohan-${stamp}.sqlite`)
            // VACUUM INTO writes a consistent copy even while the site is being used
            await db.sequelize.query(`VACUUM INTO '${file.replace(/'/g, "''")}'`)
            const old = (await readdir(cfg.backupDir)).filter((f) => /^rohan-.*\.sqlite$/.test(f)).sort().reverse().slice(cfg.backupKeep)
            await Promise.all(old.map((f) => rm(path.join(cfg.backupDir, f), { force: true })))
            logger.info?.(`[backup] database saved to ${file}`)
          } catch (err) {
            logger.error?.('[backup] failed:', err)
          }
        }),
      )
      logger.info?.(`[backup] nightly SQLite backup scheduled (${cfg.backupCron}) → ${cfg.backupDir}`)
    }
  }

  return { stop: () => tasks.forEach((t) => t.stop()) }
}
