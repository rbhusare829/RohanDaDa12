/**
 * Admin end-to-end test, in a real browser: create a post (validation, draft, publish), see it on the website, edit,
 * history / restore, the leave-with-unsaved-changes guard, search in both languages, bulk delete, photo upload + focal point,
 * homepage block edit, sign out.
 *
 *   1. start the site:   npm run dev      (or npm run preview)
 *   2. run this:         npm run e2e      (E2E_URL, E2E_EMAIL, E2E_PASSWORD, E2E_CHANNEL can be set; see e2e/README.md)
 *
 * It leaves the content as it found it (the test post and test photo are deleted, the homepage edit is undone).
 */
import { chromium } from 'playwright-core'
import { mkdirSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const here = path.dirname(fileURLToPath(import.meta.url))
const BASE = (process.env.E2E_URL || 'http://localhost:3000').replace(/\/$/, '')
const EMAIL = process.env.E2E_EMAIL || 'admin@rohandeshmukh.in'
const PASSWORD = process.env.E2E_PASSWORD || 'ChangeMe@123'
const OUT = path.join(here, '.shots')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: process.env.E2E_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chrome'), headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const problems = []
const expected = [] // problems that are part of the test (e.g. a validation 400)
page.on('console', (m) => { if (m.type() === 'error' && !/status of 4\d\d/.test(m.text())) problems.push(`console: ${m.text().slice(0, 240)}`) })
page.on('pageerror', (e) => problems.push('PAGEERROR ' + e.message.slice(0, 240)))
page.on('response', (r) => { if (r.status() >= 500) problems.push(`${r.status()} ${r.request().method()} ${r.url().slice(0, 120)}`) })

const ok = (msg) => console.log('  ✔', msg)
const step = (s) => console.log('•', s)
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` })
const toastText = async () => (await page.locator('[aria-live=polite] [role=status], [aria-live=polite] [role=alert]').allTextContents()).join(' | ')

/* ---------------------------------------------------------------- sign in */
step('sign in')
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' })
await page.fill('input[type=email]', EMAIL)
await page.fill('input[type=password]', PASSWORD)
await page.click('button[type=submit]')
await page.waitForURL(BASE + '/admin')
ok('signed in')

// leftovers of an earlier run would clash on the slug
const removed = await page.evaluate(async () => {
  const h = { 'X-Requested-With': 'XMLHttpRequest' }
  const list = await (await fetch('/api/posts?limit=50&depth=0&where[slug][like]=e2e', { credentials: 'include' })).json()
  for (const d of list.docs) await fetch('/api/posts/' + d.id, { method: 'DELETE', credentials: 'include', headers: h })
  return list.docs.length
})
if (removed) console.log('  (removed ' + removed + ' leftover test post(s))')

/* ---------------------------------------------------------------- new post: validation */
step('new post — publishing an empty form shows what is missing')
await page.goto(BASE + '/admin/collections/posts/create', { waitUntil: 'networkidle' })
await page.waitForSelector('form')
await page.getByRole('button', { name: 'Publish' }).click()
await page.waitForSelector('[data-field="title"] [role=alert]')
const titleError = await page.textContent('[data-field="title"] [role=alert]')
assert.match(titleError, /required/i)
assert.ok(await page.locator('form >> text=/need attention|needs attention/').first().isVisible())
ok(`title error: "${titleError.trim()}"`)
await shot('01-validation')

/* ---------------------------------------------------------------- fill the form */
step('fill the form (English, Marathi, cover photo, rich text, tags)')
await page.fill('[data-field="title"] input', 'E2E Test Post')
await page.fill('[data-field="excerpt"] textarea', 'A short summary written by the end-to-end test.')
// the error disappears once the field is edited
assert.equal(await page.locator('[data-field="title"] [role=alert]').count(), 0)
ok('the error clears when the field is edited')

// cover photo from the library
await page.locator('[data-field="coverImage"]').getByRole('button', { name: /Choose a photo/ }).click()
await page.waitForSelector('[role=dialog] ul button')
await page.locator('[role=dialog] ul button').first().click()
await page.waitForSelector('[data-field="coverImage"] img')
ok('cover photo chosen from the library')

// rich text
const editor = page.locator('[data-field="content"] .ProseMirror')
await editor.click()
await page.keyboard.type('Hello from the editor. ')
await page.getByRole('button', { name: 'Bold', exact: true }).click()
await page.keyboard.type('This part is bold.')
await page.getByRole('button', { name: 'Bold', exact: true }).click()
await page.keyboard.press('Enter')
await page.getByRole('button', { name: 'Heading', exact: true }).click()
await page.keyboard.type('A heading')
await page.keyboard.press('Enter')
await page.keyboard.type('Second paragraph.')
const html = await editor.innerHTML()
assert.match(html, /<strong>This part is bold\.<\/strong>/)
assert.match(html, /<h2[^>]*>A heading<\/h2>/)
ok('rich text typed with bold and a heading')

// tags
await page.locator('[data-field="tags"] input').fill('e2e, playwright')
await page.keyboard.press('Enter')
assert.equal(await page.locator('[data-field="tags"] span:has-text("playwright")').count(), 1)
ok('tags added')

// Marathi
await page.getByRole('button', { name: 'मराठी' }).click()
await page.fill('[data-field="title"] input', 'चाचणी लेख')
await page.getByRole('button', { name: 'English' }).click()
assert.equal(await page.inputValue('[data-field="title"] input'), 'E2E Test Post')
ok('language switch keeps both titles')
await shot('02-filled')

/* ---------------------------------------------------------------- save as draft */
step('save as draft')
await page.getByRole('button', { name: 'Save draft' }).click()
await page.waitForURL(/\/admin\/collections\/posts\/\d+$/, { timeout: 15000 })
const postId = page.url().split('/').pop()
await page.waitForSelector('text=All changes saved')
await page.locator('main').getByText('draft', { exact: true }).first().waitFor({ timeout: 10000 })
ok(`saved as draft (post #${postId}), pill shows draft`)
const slug = await page.inputValue('[data-field="slug"] input')
assert.equal(slug, 'e2e-test-post')
ok(`slug made from the title: ${slug}`)

step('a draft is not on the website')
const pub = await ctx.newPage()
await pub.goto(`${BASE}/blog/${slug}`, { waitUntil: 'networkidle' })
assert.ok(await pub.locator('text=/not found/i').first().isVisible())
ok('public page says not found')

/* ---------------------------------------------------------------- publish */
step('publish')
await page.getByRole('button', { name: 'Publish' }).click()
await page.waitForSelector('text=Published.')
await page.locator('main').getByText('published', { exact: true }).first().waitFor({ timeout: 10000 })
ok('published')
await pub.goto(`${BASE}/blog/${slug}`, { waitUntil: 'networkidle' })
await pub.waitForSelector('h1')
assert.equal((await pub.textContent('h1')).trim(), 'E2E Test Post')
assert.ok(await pub.locator('article strong:has-text("This part is bold.")').count() > 0, 'bold text on the public page')
assert.ok(await pub.locator('article h2:has-text("A heading")').count() > 0, 'heading on the public page')
ok('the public page shows the title, bold text and heading')
const live = await page.getByRole('link', { name: /View on website/ }).getAttribute('href')
assert.equal(live, `/blog/${slug}`)
ok('"View on website" link points to it')
await shot('03-published')

/* ---------------------------------------------------------------- edit + history */
step('edit, save, history and restore')
await page.fill('[data-field="title"] input', 'E2E Test Post (edited)')
assert.ok(await page.locator('text=Unsaved changes').isVisible())
await page.getByRole('button', { name: 'Update' }).click()
await page.waitForSelector('text=Published.')
await page.waitForSelector('text=All changes saved')
await pub.reload({ waitUntil: 'networkidle' })
await pub.waitForSelector('h1')
assert.equal((await pub.textContent('h1')).trim(), 'E2E Test Post (edited)')
ok('an edit shows on the website (cache is cleared by the save)')

await page.getByRole('button', { name: 'History' }).click()
await page.waitForSelector('[role=dialog] li')
const versions = await page.locator('[role=dialog] li').count()
assert.ok(versions >= 3, `expected at least 3 versions, got ${versions}`)
ok(`${versions} versions in the history`)
await shot('04-history')
await page.locator('[role=dialog] li').last().getByRole('button', { name: 'Restore' }).click() // the oldest: the draft
await page.waitForSelector('[role=dialog]', { state: 'detached' })
assert.ok(await page.locator('text=/Showing the version saved on/').isVisible())
assert.equal(await page.inputValue('[data-field="title"] input'), 'E2E Test Post')
assert.ok(await page.locator('text=Unsaved changes').isVisible())
ok('restoring puts the old version in the form and marks it unsaved')

step('leaving with unsaved changes asks first')
await page.getByRole('link', { name: 'Posts', exact: true }).first().click()
await page.waitForSelector('[role=dialog] >> text=Leave without saving?')
await shot('05-leave-guard')
await page.getByRole('button', { name: 'Stay here' }).click()
await page.waitForSelector('[role=dialog]', { state: 'detached' })
assert.match(page.url(), /\/posts\/\d+$/)
ok('"Stay here" keeps the page')
// put the edited title back so nothing is lost, then leave freely
await page.fill('[data-field="title"] input', 'E2E Test Post (edited)')
await page.getByRole('button', { name: 'Update' }).click()
await page.waitForSelector('text=All changes saved')

/* ---------------------------------------------------------------- list: search + bulk delete */
step('list: search and bulk delete')
await page.getByRole('link', { name: 'Cancel' }).click()
await page.waitForSelector('table')
await page.fill('input[type=search]', 'e2e test')
await page.waitForTimeout(900)
assert.equal(await page.locator('tbody tr').count(), 1)
ok('search finds the new post (English text)')
await page.fill('input[type=search]', 'चाचणी')
await page.waitForTimeout(900)
assert.equal(await page.locator('tbody tr').count(), 1)
ok('search also finds it by its Marathi title')
await page.locator('tbody tr input[type=checkbox]').check()
await page.getByRole('button', { name: /Delete/ }).first().click()
await page.waitForSelector('[role=dialog]')
await page.locator('[role=dialog]').getByRole('button', { name: 'Delete' }).click()
await page.waitForSelector('text=1 deleted.')
await pub.goto(`${BASE}/blog/${slug}`, { waitUntil: 'networkidle' })
assert.ok(await pub.locator('text=/not found/i').first().isVisible())
ok('deleted; the public page is gone')
await pub.close()

/* ---------------------------------------------------------------- photo upload */
step('photo library: upload, focal point, delete')
await page.goto(BASE + '/admin/collections/media', { waitUntil: 'networkidle' })
await page.waitForSelector('text=Upload photos')
const before = Number((await page.textContent('[aria-live=polite]'))?.match(/\d+/)?.[0] ?? 0)
const seed = path.join(here, '..', 'backend', 'src', 'seed', 'media')
const sample = readdirSync(seed).find((f) => /\.(jpe?g|png|webp)$/i.test(f))
await page.locator('input[type=file][multiple]').setInputFiles(path.join(seed, sample))
await page.waitForSelector('text=/1 photo uploaded/')
await page.waitForTimeout(800)
const after = Number((await page.textContent('[aria-live=polite]'))?.match(/\d+/)?.[0] ?? 0)
assert.equal(after, before + 1)
ok(`uploaded ${sample} (${before} → ${after} photos)`)
await page.locator('ul.grid > li a').first().click()
await page.waitForSelector('text=Focal point')
const box = await page.locator('img[alt]').first().boundingBox()
await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.75)
assert.match(await page.textContent('text=/Focal point:/'), /25% across, 75% down|2\d% across, 7\d% down/)
ok('focal point set by clicking the photo')
await page.getByRole('button', { name: 'Save' }).click()
await page.waitForSelector('text=Saved.')
await shot('06-photo')
await page.getByRole('button', { name: 'Delete' }).click()
await page.locator('[role=dialog]').getByRole('button', { name: 'Delete' }).click()
await page.waitForURL(/\/admin\/collections\/media$/)
ok('photo deleted')

/* ---------------------------------------------------------------- homepage block */
step('homepage: edit a block and restore through History')
await page.goto(BASE + '/admin/globals/home', { waitUntil: 'networkidle' })
await page.waitForSelector('text=Sections')
const original = await page.evaluate(async () => (await (await fetch('/api/globals/home?locale=en&depth=0', { credentials: 'include' })).json()).sections?.[1]?.heading)
await page.locator('li:has-text("About block") button[aria-expanded]').first().click()
const headingInput = page.locator('li:has-text("About block") [data-field$=".heading"] input').first()
await headingInput.waitFor()
await headingInput.fill('Changed by the test')
await page.getByRole('button', { name: 'Save' }).click()
await page.waitForSelector('text=Saved.')
const changed = await page.evaluate(async () => (await (await fetch('/api/globals/home?locale=en&depth=0', { credentials: 'include' })).json()).sections?.[1]?.heading)
assert.equal(changed, 'Changed by the test')
ok('the block heading changed through the API')
await page.getByRole('button', { name: 'History' }).click()
await page.waitForSelector('[role=dialog] li')
await page.locator('[role=dialog] li').nth(1).getByRole('button', { name: 'Restore' }).click()
await page.waitForSelector('[role=dialog]', { state: 'detached' })
await page.getByRole('button', { name: 'Save' }).click()
await page.waitForSelector('text=Saved.')
const restored = await page.evaluate(async () => (await (await fetch('/api/globals/home?locale=en&depth=0', { credentials: 'include' })).json()).sections?.[1]?.heading)
assert.equal(restored, original)
ok(`restored from History (“${original}”)`)

/* ---------------------------------------------------------------- account + sign out */
step('account page and sign out')
await page.goto(BASE + '/admin/account', { waitUntil: 'networkidle' })
await page.fill('input[autocomplete=name]', 'Super Admin')
await page.getByRole('button', { name: 'Sign out' }).click()
await page.waitForURL(/\/admin\/login/)
await page.goto(BASE + '/admin/collections/posts', { waitUntil: 'networkidle' })
assert.match(page.url(), /\/admin\/login/)
ok('signed out; protected pages send you to the login')

console.log('\nproblems:', problems.length ? '\n' + problems.join('\n') : 'none')
await browser.close()
