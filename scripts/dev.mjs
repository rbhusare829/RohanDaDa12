/**
 * One command for the whole site:
 *   npm run dev       development: the backend restarts and the website reloads when you change code
 *   npm run preview   production mode: builds the website (only after code changes) and serves everything from the backend
 *
 *   1. makes the .env files from the .env.example files (with a fresh JWT_SECRET) the first time
 *   2. loads the website content into an empty database (first run only, a few seconds)
 *   3. starts the backend (API + admin sign-in) and the website
 */
import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { createRequire } from 'node:module'
import net from 'node:net'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const backend = path.join(root, 'backend')
const frontend = path.join(root, 'frontend')
const prod = process.argv.includes('--prod')
const require = createRequire(import.meta.url)

/** Path of a tool's command-line file inside the frontend's dependencies (packages hide their internals from require.resolve) */
const bin = (pkg, file) => path.join(path.dirname(require.resolve(`${pkg}/package.json`, { paths: [frontend] })), file)

/* ---------------------------------------------------------------- helpers */

const tag = (name, color) => `\x1b[${color}m${name.padEnd(4)}\x1b[0m`
const log = (name, color, line) => console.log(`${tag(name, color)} ${line}`)

const portBusy = (port) =>
  new Promise((resolve) => {
    const t = net.createServer().once('error', () => resolve(true)).once('listening', () => t.close(() => resolve(false))).listen(port)
  })

async function waitFor(url, seconds = 120) {
  const end = Date.now() + seconds * 1000
  while (Date.now() < end) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
      if (res.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`${url} did not answer within ${seconds}s`)
}

/** newest modification time of a file or folder tree */
function newest(p) {
  if (!existsSync(p)) return 0
  const st = statSync(p)
  return st.isDirectory() ? Math.max(0, ...readdirSync(p).map((f) => newest(path.join(p, f)))) : st.mtimeMs
}

/* ---------------------------------------------------------------- environment files */

for (const dir of [backend, frontend]) {
  const env = path.join(dir, '.env')
  if (existsSync(env)) continue
  copyFileSync(path.join(dir, '.env.example'), env)
  console.log(`✓ created ${path.relative(root, env)}`)
}
const backendEnv = path.join(backend, '.env')
const envText = readFileSync(backendEnv, 'utf8')
if (/^JWT_SECRET=\s*$/m.test(envText)) {
  writeFileSync(backendEnv, envText.replace(/^JWT_SECRET=\s*$/m, `JWT_SECRET=${randomBytes(48).toString('hex')}`))
  console.log('✓ generated a JWT_SECRET in backend/.env')
}

/* ---------------------------------------------------------------- processes */

const children = []
let stopping = false

function kill(child) {
  if (!child.pid || child.exitCode !== null) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  else child.kill('SIGTERM')
}

function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const c of children) kill(c)
  setTimeout(() => process.exit(code), 300)
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))

function run(name, color, args, { cwd, env = {}, longRunning = false } = {}) {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, FORCE_COLOR: '1', ...env }, stdio: ['ignore', 'pipe', 'pipe'] })
  const pipe = (stream) => {
    let buf = ''
    stream.on('data', (d) => {
      buf += d.toString()
      const lines = buf.split(/\r?\n/)
      buf = lines.pop() ?? ''
      for (const l of lines) if (l.trim()) log(name, color, l)
    })
  }
  pipe(child.stdout)
  pipe(child.stderr)
  const done = new Promise((resolve, reject) => {
    child.on('exit', (code) => {
      if (longRunning) {
        if (!stopping) {
          log(name, color, `stopped (exit code ${code})`)
          stop(code ?? 1)
        }
        resolve(code)
      } else code === 0 ? resolve(code) : reject(new Error(`${name} exited with ${code}`))
    })
  })
  if (longRunning) children.push(child)
  return done
}

/* ---------------------------------------------------------------- start */

try {
  const apiPort = prod ? 3000 : 3001
  const checks = prod ? [[3000, 'the site']] : [[3000, 'the website'], [3001, 'the backend']]
  for (const [port, name] of checks) {
    if (await portBusy(port)) {
      console.error(`\n✖ Port ${port} (${name}) is already in use — the site is probably already running in another window.`)
      console.error('  Stop it with Ctrl+C, close that window, and run this again.\n')
      process.exit(1)
    }
  }

  // content: the first run loads everything (a few seconds); later runs find it there
  await run('seed', '35', ['src/seed/index.js', '--if-empty'], { cwd: backend })

  if (prod) {
    const dist = path.join(frontend, 'dist', 'index.html')
    const sourceTime = Math.max(...['src', 'public', 'index.html', 'package.json', 'vite.config.ts', '.env'].map((p) => newest(path.join(frontend, p))))
    if (!existsSync(dist) || statSync(dist).mtimeMs < sourceTime) {
      console.log('🏗️  Building the website (about a minute, only after code changes)…')
      const vite = bin('vite', 'bin/vite.js')
      const tsc = bin('typescript', 'bin/tsc')
      await run('tsc ', '33', [tsc, '--noEmit'], { cwd: frontend })
      await run('vite', '33', [vite, 'build'], { cwd: frontend })
    } else console.log('✓ Using the existing website build')

    run('site', '36', ['src/server.js'], { cwd: backend, longRunning: true, env: { NODE_ENV: 'production', PORT: String(apiPort), PUBLIC_URL: 'http://localhost:3000', SERVE_FRONTEND: 'true' } })
    await waitFor(`http://localhost:${apiPort}/api/health`)
  } else {
    run('api ', '36', ['--watch', 'src/server.js'], { cwd: backend, longRunning: true, env: { PORT: String(apiPort), PUBLIC_URL: 'http://localhost:3000', SERVE_FRONTEND: 'false', TRUST_PROXY: 'loopback' } })
    await waitFor(`http://localhost:${apiPort}/api/health`)
    run('web ', '32', [bin('vite', 'bin/vite.js'), '--port', '3000', '--strictPort'], { cwd: frontend, longRunning: true, env: { BACKEND_URL: `http://localhost:${apiPort}` } })
    await waitFor('http://localhost:3000/')
  }

  console.log('\n  Website      → http://localhost:3000')
  console.log('  Admin panel  → http://localhost:3000/admin')
  console.log(`  Content API  → http://localhost:${apiPort}/api\n`)
} catch (e) {
  console.error(e?.message ?? e)
  stop(1)
}
