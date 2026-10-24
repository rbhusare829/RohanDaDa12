import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { L, createDoc, signedIn, startServer } from './helpers.js'

const valid = (extra = {}) => ({ name: 'Asha Patil', mobile: '98765 43210', email: 'asha@example.com', subject: 'Hello', message: 'A message', office: '1', ...extra })
const toForm = (fields, file) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(fields)) f.set(k, String(v))
  if (file) f.set('attachment', new Blob([file.buffer], { type: file.type }), file.name)
  return f
}

describe('contact form', () => {
  let srv
  let admin
  before(async () => {
    srv = await startServer()
    admin = await signedIn(srv)
    await createDoc(admin, 'offices', { name: L('Head office'), notifyEmails: ['office@test.local'] })
    await admin.post('/api/globals/site-settings', { json: { siteName: L('Site'), formNotifyEmails: ['default@test.local'] } })
  })
  after(() => srv.stop())

  const submit = (fields, file, opts) => srv.client().post('/api/forms/contact', { form: toForm(fields, file), ...opts })

  it('saves the message, and e-mails the office it was sent to', async () => {
    const res = await submit(valid())
    assert.equal(res.status, 200)
    assert.deepEqual(res.data, { ok: true })
    const list = await admin.get('/api/contact-messages?sort=-createdAt')
    assert.equal(list.data.totalDocs, 1)
    const m = list.data.docs[0]
    assert.equal(m.name, 'Asha Patil')
    assert.equal(m.mobile, '98765 43210')
    assert.equal(m.status, 'new')
    assert.equal(m.office, 1)
    await new Promise((r) => setTimeout(r, 50))
    const mail = srv.mails.at(-1)
    assert.deepEqual(mail.to, ['office@test.local'])
    assert.match(mail.subject, /New contact message: Asha Patil/)
    assert.match(mail.html, /A message/)
  })

  it('falls back to the default recipients when the office has none', async () => {
    await admin.patch('/api/offices/1', { json: { notifyEmails: [] } })
    await submit(valid({ subject: 'Second' }))
    await new Promise((r) => setTimeout(r, 50))
    assert.deepEqual(srv.mails.at(-1).to, ['default@test.local'])
  })

  it('escapes what visitors type before it goes into the e-mail', async () => {
    await submit(valid({ subject: 'X', message: '<script>alert(1)</script>' }))
    await new Promise((r) => setTimeout(r, 50))
    assert.ok(!srv.mails.at(-1).html.includes('<script>'))
    assert.match(srv.mails.at(-1).html, /&lt;script&gt;/)
  })

  it('answers with the error codes the form translates', async () => {
    const res = await submit({ name: '', mobile: '12345', email: 'nope', subject: '', office: '' })
    assert.equal(res.status, 400)
    assert.equal(res.data.ok, false)
    assert.deepEqual(res.data.errors, { name: 'required', mobile: 'invalidMobile', email: 'invalidEmail', subject: 'required', office: 'required' })
    // an empty address is "required"; a wrong one is "invalidEmail"
    assert.equal((await submit(valid({ email: '' }))).data.errors.email, 'required')
  })

  it('accepts +91 and spaced numbers; rejects numbers not starting with 6-9', async () => {
    assert.equal((await submit(valid({ mobile: '+91 98765 43210' }))).status, 200)
    assert.equal((await submit(valid({ mobile: '1234567890' }))).status, 400)
  })

  it('rejects an office that does not exist', async () => {
    const res = await submit(valid({ office: '999' }))
    assert.equal(res.status, 400)
    assert.equal(res.data.errors.office, 'required')
  })

  it('quietly accepts but does not store a bot that fills the honeypot field', async () => {
    const before = (await admin.get('/api/contact-messages')).data.totalDocs
    const res = await submit(valid({ website: 'http://spam.example' }))
    assert.deepEqual(res.data, { ok: true })
    assert.equal((await admin.get('/api/contact-messages')).data.totalDocs, before)
  })

  it('refuses an attachment that is not what it claims to be, and one that is too big', async () => {
    const bad = await submit(valid(), { buffer: Buffer.from('MZ\x90 not a pdf'), type: 'application/pdf', name: 'cv.pdf' })
    assert.equal(bad.status, 400)
    assert.equal(bad.data.errors.attachment, 'fileType')
    const big = await submit(valid(), { buffer: Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(6 * 1024 * 1024)]), type: 'application/pdf', name: 'big.pdf' })
    assert.equal(big.status, 400)
    assert.equal(big.data.errors.attachment, 'fileTooBig')
  })

  it('does not leave a file behind when the form is invalid', async () => {
    const before = (await admin.get('/api/form-uploads')).data.totalDocs
    await submit({ ...valid(), email: 'bad' }, { buffer: Buffer.from('%PDF-1.4\nok'), type: 'application/pdf', name: 'x.pdf' })
    assert.equal((await admin.get('/api/form-uploads')).data.totalDocs, before)
  })

  it('nobody creates contact messages through the generic API — only the form endpoint does', async () => {
    assert.equal((await srv.client().post('/api/contact-messages', { json: valid() })).status, 403)
    assert.equal((await admin.post('/api/contact-messages', { json: valid() })).status, 403)
  })

  it('verifies the reCAPTCHA token when a secret is configured', async () => {
    const s = await startServer({ env: { RECAPTCHA_SECRET_KEY: 'secret' } })
    try {
      const a = await signedIn(s)
      await createDoc(a, 'offices', { name: L('O') })
      const realFetch = globalThis.fetch
      let verified = 0
      globalThis.fetch = async (url, init) => {
        if (String(url).includes('recaptcha')) {
          verified++
          const ok = String(init.body).includes('response=good')
          return new Response(JSON.stringify({ success: ok, score: ok ? 0.9 : 0.1, action: 'contact' }))
        }
        return realFetch(url, init)
      }
      try {
        const bad = await s.client().post('/api/forms/contact', { form: toForm(valid({ captcha: 'bad' })) })
        assert.equal(bad.status, 400)
        assert.match(bad.data.message, /captcha/i)
        const good = await s.client().post('/api/forms/contact', { form: toForm(valid({ captcha: 'good' })) })
        assert.equal(good.status, 200)
        assert.equal(verified, 2)
      } finally {
        globalThis.fetch = realFetch
      }
    } finally {
      await s.stop()
    }
  })
})

describe('inbox management', () => {
  let srv
  let admin
  before(async () => {
    srv = await startServer()
    admin = await signedIn(srv)
    await createDoc(admin, 'offices', { name: L('Office') })
    for (const [name, subject] of [['Alice', '=HYPERLINK("http://evil","x")'], ['Bob', 'Plain, with "quotes"'], ['Carol', 'Third']]) {
      await srv.client().post('/api/forms/contact', { form: toForm(valid({ name, subject })) })
    }
  })
  after(() => srv.stop())

  it('lists, filters by status and searches by name', async () => {
    assert.equal((await admin.get('/api/contact-messages')).data.totalDocs, 3)
    const first = (await admin.get('/api/contact-messages?sort=createdAt')).data.docs[0]
    await admin.patch(`/api/contact-messages/${first.id}`, { json: { status: 'resolved', internalNotes: 'Called back' } })
    assert.equal((await admin.get('/api/contact-messages?where[status][equals]=new')).data.totalDocs, 2)
    assert.equal((await admin.get('/api/contact-messages?where[or][0][name][like]=bob&where[or][1][email][like]=bob')).data.totalDocs, 1)
  })

  it('does not let staff alter what the visitor wrote beyond the schema (status and notes only matter)', async () => {
    const m = (await admin.get('/api/contact-messages')).data.docs[0]
    const res = await admin.patch(`/api/contact-messages/${m.id}`, { json: { status: 'bogus' } })
    assert.equal(res.status, 400)
  })

  it('exports CSV for Excel: BOM, quoted fields, no spreadsheet formulas', async () => {
    const res = await admin.get('/api/contact-messages/export', { raw: true })
    assert.equal(res.status, 200)
    assert.match(res.headers.get('content-type'), /text\/csv/)
    const text = res.body.toString('utf8')
    assert.equal(text.charCodeAt(0), 0xfeff)
    assert.ok(text.slice(1).startsWith('id,createdAt,name,mobile,email,subject,office,message,attachment,status,internalNotes'))
    assert.ok(text.includes("'=HYPERLINK"), 'formula neutralised')
    assert.ok(text.includes('"Plain, with ""quotes"""'))
  })

  it('only staff can export', async () => {
    assert.equal((await srv.client().get('/api/contact-messages/export')).status, 401)
  })

  it('the dashboard counts new messages and lists the latest', async () => {
    const d = (await admin.get('/api/admin/dashboard')).data
    assert.equal(d.counts.newMessages, 2)
    assert.equal(d.recent.length, 3)
  })
})
