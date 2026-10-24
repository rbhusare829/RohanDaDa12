import { randomBytes } from 'node:crypto'
import { loadConfig } from '../config.js'
import { createApp } from '../app.js'
import { resetAdmin } from './load.js'

/**
 * Lost the admin password and no e-mail set up for the "Forgot password?" link? Run, in the backend folder or from the root:
 *
 *   npm run admin -- --email you@example.com                     sets a new random password and prints it
 *   npm run admin -- --email you@example.com --password '…'      sets the password you give (8 characters or more)
 *   npm run admin -- --email new@example.com --name 'Name'       an unknown e-mail address is created as a super admin
 */
const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}

const email = opt('email')
if (!email || args.includes('--help')) {
  console.log('Usage: npm run admin -- --email you@example.com [--password "…"] [--name "…"]')
  process.exit(email ? 0 : 1)
}
const password = opt('password') ?? randomBytes(12).toString('base64url')
if (password.length < 8) {
  console.error('✖ The password needs at least 8 characters.')
  process.exit(1)
}

const { ctx, close } = await createApp({ cfg: loadConfig() })
try {
  const result = await resetAdmin(ctx, { email, password, name: opt('name') })
  console.log(`✓ ${result.created ? 'Created the super admin' : 'New password set for'} ${result.email}`)
  if (opt('password') === undefined) console.log(`  Password: ${password}   (shown once — change it in "My account" after signing in)`)
} catch (err) {
  console.error('✖', err.errors?.map((e) => `${e.field}: ${e.message}`).join('; ') || err.message)
  process.exitCode = 1
} finally {
  await close()
}
