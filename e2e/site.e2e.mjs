/**
 * Public-website end-to-end test, in a real browser. Every address in /sitemap.xml must open without console errors,
 * failed requests, broken images or sideways scrolling; unknown addresses must answer 404; the contact form must
 * validate and send (the test message is removed from the inbox afterwards).
 *
 *   npm run preview     (production mode gives the real 404 statuses; `npm run dev` works too, minus those)
 *   npm run e2e:site
 */
import { chromium } from 'playwright-core'
import assert from 'node:assert/strict'

const BASE = (process.env.E2E_URL || 'http://localhost:3000').replace(/\/$/, '')
const EMAIL = process.env.E2E_EMAIL || 'admin@rohandeshmukh.in'
const PASSWORD = process.env.E2E_PASSWORD || 'ChangeMe@123'
const channel = process.env.E2E_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chrome')

const browser = await chromium.launch({ channel, headless: true })
const failures = []
const fail = (m) => (failures.push(m), console.log('  ✖', m))
const ok = (m) => console.log('  ✔', m)

/* ---------------------------------------------------------------- every page in the sitemap */
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text()
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
console.log(`• ${urls.length} addresses in the sitemap`)

async function visit(ctx, pathname, label) {
  const page = await ctx.newPage()
  const problems = []
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text().slice(0, 160)}`) })
  page.on('pageerror', (e) => problems.push(`page error: ${e.message.slice(0, 160)}`))
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) problems.push(`${r.status()} ${r.url().replace(BASE, '').slice(0, 100)}`) })
  const res = await page.goto(BASE + pathname, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(300)
  const facts = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelectorAll('h1').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc.slice(-60)),
    noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
  }))
  if (res.status() !== 200) problems.push(`status ${res.status()}`)
  if (!facts.title.trim()) problems.push('no <title>')
  if (facts.h1 !== 1) problems.push(`${facts.h1} <h1> elements`)
  if (facts.overflow > 0) problems.push(`sideways scroll +${facts.overflow}px`)
  if (facts.broken.length) problems.push(`broken images: ${facts.broken.join(', ')}`)
  if (facts.noAlt) problems.push(`${facts.noAlt} images without alt`)
  await page.close()
  if (problems.length) fail(`${label} ${pathname}: ${problems.join(' · ')}`)
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } })
for (const u of urls) await visit(desktop, u, 'desktop')
if (!failures.length) ok(`all ${urls.length} pages are clean on a desktop screen`)

const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const before = failures.length
for (const u of ['/', '/about/biography', '/social-work', '/blog', '/events', '/media/photos', '/contact']) await visit(phone, u, 'phone')
if (failures.length === before) ok('the main pages are clean on a phone screen')

/* ---------------------------------------------------------------- real 404s */
for (const u of ['/does-not-exist-xyz', '/blog/no-such-post', '/social-work/no-such-initiative']) {
  const res = await fetch(BASE + u)
  if (res.status === 404) ok(`${u} answers 404`)
  else fail(`${u} answered ${res.status} (expected 404 — in \`npm run dev\` Vite answers 200 for every address; use \`npm run preview\`)`)
}

/* ---------------------------------------------------------------- contact form */
console.log('• contact form')
const page = await phone.newPage()
await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
await page.getByRole('button', { name: /submit/i }).click()
await page.waitForSelector('form [aria-invalid="true"]')
// the first invalid field is tied to a visible message (aria-describedby), whatever colour it is drawn in
const messageId = await page.locator('form [aria-invalid="true"]').first().getAttribute('aria-describedby')
assert.ok(messageId && (await page.locator(`#${messageId}`).innerText()).trim(), 'the first invalid field has no visible message')
ok('an empty form shows what is missing, next to each field')
const stamp = `e2e-${Date.now()}`
await page.fill('#f-name', `Test Person ${stamp}`)
await page.fill('#f-mobile', '9876543210')
await page.fill('#f-email', 'test@example.com')
await page.fill('#f-subject', `Subject ${stamp}`)
await page.selectOption('#f-office', { index: 1 })
await page.fill('#f-message', 'This message was sent by the end-to-end test.')
await page.getByRole('checkbox').check()
await page.getByRole('button', { name: /submit/i }).click()
try {
  await page.waitForSelector('[role=status]', { timeout: 15000 })
  ok('the message was sent')
} catch {
  fail('the contact form did not confirm the message')
}

// the message is in the admin inbox — remove it again
const admin = await desktop.newPage()
await admin.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' })
await admin.fill('input[type=email]', EMAIL)
await admin.fill('input[type=password]', PASSWORD)
await admin.click('button[type=submit]')
await admin.waitForURL(`${BASE}/admin`)
const removed = await admin.evaluate(async (stamp) => {
  const h = { 'X-Requested-With': 'XMLHttpRequest' }
  const list = await (await fetch(`/api/contact-messages?limit=20&depth=0&where[subject][like]=${stamp}`, { credentials: 'include' })).json()
  for (const d of list.docs) await fetch(`/api/contact-messages/${d.id}`, { method: 'DELETE', credentials: 'include', headers: h })
  return list.docs.length
}, stamp)
try {
  assert.equal(removed, 1)
  ok('it arrived in the admin inbox (and was removed)')
} catch {
  fail(`the test message was not found in the inbox (found ${removed})`)
}

await browser.close()
console.log(failures.length ? `\n${failures.length} problem(s)` : '\nall good')
process.exit(failures.length ? 1 : 0)
