import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { ADMIN, L, createDoc, signedIn, startServer } from './helpers.js'

describe('sign-in and sessions', () => {
  let srv
  before(async () => {
    srv = await startServer()
  })
  after(() => srv.stop())

  it('rejects a wrong password with a message that does not reveal whether the e-mail exists', async () => {
    const c = srv.client()
    const wrong = await c.login(ADMIN.email, 'nope-nope-nope')
    const unknown = await c.login('nobody@test.local', 'nope-nope-nope')
    assert.equal(wrong.status, 401)
    assert.equal(unknown.status, 401)
    assert.equal(wrong.data.message, unknown.data.message)
  })

  it('signs in with an httpOnly cookie and answers /me', async () => {
    const c = srv.client()
    const res = await c.login()
    assert.equal(res.status, 200)
    assert.equal(res.data.user.email, ADMIN.email)
    assert.equal(res.data.user.role, 'super-admin')
    assert.ok(!('passwordHash' in res.data.user))
    const set = res.headers.getSetCookie().find((x) => x.startsWith('rd_token='))
    assert.match(set, /HttpOnly/i)
    assert.match(set, /SameSite=Lax/i)
    const me = await c.get('/api/users/me')
    assert.equal(me.data.user.email, ADMIN.email)
    assert.equal(me.data.permissions.collections.users.create, true)
    assert.equal(me.headers.get('cache-control'), 'private, no-store')
  })

  it('answers /me with null when nobody is signed in', async () => {
    const me = await srv.client().get('/api/users/me')
    assert.equal(me.status, 200)
    assert.equal(me.data.user, null)
  })

  it('signs out', async () => {
    const c = await signedIn(srv)
    assert.equal((await c.post('/api/users/logout')).status, 200)
    assert.equal((await c.get('/api/users/me')).data.user, null)
  })

  it('validates the login body', async () => {
    const res = await srv.client().post('/api/users/login', { json: { email: 'not-an-email', password: '' } })
    assert.equal(res.status, 400)
    assert.ok(res.data.errors.some((e) => e.field === 'email'))
  })

  it('locks the account after 5 wrong passwords', async () => {
    const c = srv.client()
    await createDoc(await signedIn(srv), 'users', { email: 'lock@test.local', password: 'Another-Pass-1', role: 'editor' })
    for (let i = 0; i < 5; i++) assert.equal((await c.login('lock@test.local', 'wrong-wrong')).status, 401)
    const locked = await c.login('lock@test.local', 'Another-Pass-1')
    assert.equal(locked.status, 423)
    assert.match(locked.data.message, /locked/i)
  })

  it('requires the X-Requested-With header for writes made with the session cookie (CSRF)', async () => {
    const c = await signedIn(srv)
    const res = await c.post('/api/categories', { json: { title: L('Nope'), slug: 'nope' }, csrf: false })
    assert.equal(res.status, 403)
    const ok = await c.post('/api/categories', { json: { title: L('Fine') } })
    assert.equal(ok.status, 201)
  })

  it('rejects writes from a foreign origin', async () => {
    const c = await signedIn(srv)
    const res = await c.post('/api/categories', { json: { title: L('Evil') }, headers: { Origin: 'https://evil.example' } })
    assert.equal(res.status, 403)
  })

  it('invalidates old sessions when the password is changed', async () => {
    const admin = await signedIn(srv)
    await createDoc(admin, 'users', { email: 'pw@test.local', password: 'First-Pass-123', role: 'editor' })
    const a = await signedIn(srv, { email: 'pw@test.local', password: 'First-Pass-123' })
    const b = await signedIn(srv, { email: 'pw@test.local', password: 'First-Pass-123' })
    const res = await a.post('/api/users/change-password', { json: { currentPassword: 'First-Pass-123', newPassword: 'Second-Pass-456' } })
    assert.equal(res.status, 200)
    assert.equal((await a.get('/api/users/me')).data.user.email, 'pw@test.local') // this session got a fresh cookie
    assert.equal((await b.get('/api/users/me')).data.user, null) // the other one is signed out
    assert.equal((await srv.client().login('pw@test.local', 'First-Pass-123')).status, 401)
    assert.equal((await srv.client().login('pw@test.local', 'Second-Pass-456')).status, 200)
  })

  it('refuses a wrong current password when changing it', async () => {
    const c = await signedIn(srv)
    const res = await c.post('/api/users/change-password', { json: { currentPassword: 'wrong-wrong-1', newPassword: 'Whatever-123' } })
    assert.equal(res.status, 400)
  })

  it('password reset: e-mails a one-hour link, works once, and never reveals unknown addresses', async () => {
    const admin = await signedIn(srv)
    await createDoc(admin, 'users', { email: 'reset@test.local', password: 'Old-Password-1', role: 'editor' })
    const before = srv.mails.length
    const unknown = await srv.client().post('/api/users/forgot-password', { json: { email: 'ghost@test.local' } })
    const known = await srv.client().post('/api/users/forgot-password', { json: { email: 'reset@test.local' } })
    assert.equal(unknown.status, 200)
    assert.equal(known.status, 200)
    assert.equal(unknown.data.message, known.data.message)
    await new Promise((r) => setTimeout(r, 50))
    assert.equal(srv.mails.length, before + 1)
    const link = srv.mails.at(-1).html.match(/token=([^"]+)"/)[1]
    const token = decodeURIComponent(link)
    const c = srv.client()
    const done = await c.post('/api/users/reset-password', { json: { token, password: 'Brand-New-Pass-7' } })
    assert.equal(done.status, 200)
    assert.equal((await c.get('/api/users/me')).data.user.email, 'reset@test.local')
    const again = await srv.client().post('/api/users/reset-password', { json: { token, password: 'Yet-Another-Pass-8' } })
    assert.equal(again.status, 400) // the link was used up
    assert.equal((await srv.client().login('reset@test.local', 'Brand-New-Pass-7')).status, 200)
  })

  it('a reset token cannot be used as a session', async () => {
    const admin = await signedIn(srv)
    await createDoc(admin, 'users', { email: 'tok@test.local', password: 'Some-Password-1', role: 'editor' })
    await srv.client().post('/api/users/forgot-password', { json: { email: 'tok@test.local' } })
    await new Promise((r) => setTimeout(r, 50))
    const token = decodeURIComponent(srv.mails.at(-1).html.match(/token=([^"]+)"/)[1])
    const me = await srv.client().get('/api/users/me', { headers: { Authorization: `JWT ${token}` } })
    assert.equal(me.data.user, null)
  })
})

describe('roles', () => {
  let srv
  let admin
  before(async () => {
    srv = await startServer()
    admin = await signedIn(srv)
    await createDoc(admin, 'users', { email: 'editor@test.local', password: 'Editor-Pass-1', role: 'editor', name: 'Ed' })
    await createDoc(admin, 'users', { email: 'media@test.local', password: 'Media-Pass-12', role: 'media-uploader' })
  })
  after(() => srv.stop())

  it('an editor can write content but cannot manage users or change their own role', async () => {
    const c = await signedIn(srv, { email: 'editor@test.local', password: 'Editor-Pass-1' })
    assert.equal((await c.post('/api/categories', { json: { title: L('From editor') } })).status, 201)
    assert.equal((await c.post('/api/users', { json: { email: 'x@test.local', password: 'Xxxxxxxx-1', role: 'editor' } })).status, 403)
    const me = (await c.get('/api/users/me')).data.user
    const res = await c.patch(`/api/users/${me.id}`, { json: { name: 'Edited', role: 'super-admin' } })
    assert.equal(res.status, 200)
    assert.equal(res.data.doc.name, 'Edited')
    assert.equal(res.data.doc.role, 'editor') // the role field ignored the change
  })

  it('an editor sees only their own user record', async () => {
    const c = await signedIn(srv, { email: 'editor@test.local', password: 'Editor-Pass-1' })
    const list = await c.get('/api/users')
    assert.equal(list.data.totalDocs, 1)
    assert.equal(list.data.docs[0].email, 'editor@test.local')
  })

  it('a media uploader can manage albums but not posts', async () => {
    const c = await signedIn(srv, { email: 'media@test.local', password: 'Media-Pass-12' })
    assert.equal((await c.post('/api/videos', { json: { title: L('Clip'), youtubeUrl: 'https://youtu.be/abcdefghijk' } })).status, 201)
    assert.equal((await c.post('/api/posts', { json: { title: L('Nope') } })).status, 403)
    assert.equal((await c.get('/api/contact-messages')).status, 403)
  })

  it('visitors cannot write or read protected collections', async () => {
    const v = srv.client()
    assert.equal((await v.post('/api/categories', { json: { title: L('x') } })).status, 401)
    assert.equal((await v.get('/api/contact-messages')).status, 401)
    assert.equal((await v.get('/api/users')).status, 401)
    assert.equal((await v.get('/api/media')).status, 401)
    assert.equal((await v.get('/api/quotes')).status, 401)
  })

  it('the last super admin cannot be deleted, and nobody deletes themselves', async () => {
    const me = (await admin.get('/api/users/me')).data.user
    assert.equal((await admin.delete(`/api/users/${me.id}`)).status, 400)
  })

  it('never exposes password hashes, in any response', async () => {
    const list = await admin.get('/api/users?limit=50')
    assert.ok(list.data.docs.length >= 3)
    assert.ok(!JSON.stringify(list.data).includes('passwordHash'))
    const q = await admin.get('/api/users?where[passwordHash][like]=a')
    assert.equal(q.status, 400) // cannot even query by it
  })
})
