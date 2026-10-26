/**
 * Brings an existing site's content up to date with the October 2026 release, in one go:
 * runs each content:* script in order (each one is safe to run again and never overwrites an edit made in the admin).
 *
 *   npm run content:update        ← run once on the server, after deploying the new code, with the production .env
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const steps = ['hero-covers.mjs', 'intro-education.mjs', 'home-highlights.mjs', 'restore-initiatives.mjs', 'english-text.mjs', 'project-photos.mjs', 'home-text.mjs', 'intro-know-more.mjs', 'rd-content.mjs']
for (const step of steps) {
  console.log(`\n▶ ${step}`)
  const { status } = spawnSync(process.execPath, [path.join(here, step)], { stdio: 'inherit' })
  if (status !== 0) {
    console.error(`\n✖ ${step} failed — stopped here. Nothing after it was run; fix the problem and run "npm run content:update" again.`)
    process.exit(status ?? 1)
  }
}
console.log('\n✓ All content updates done.')
