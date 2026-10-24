import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { HttpError, badRequest, unauthorized } from './util.js'
import { collectionBySlug } from '../schema/index.js'

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12) // compared when the e-mail is unknown, so timing does not reveal which e-mails exist
const ISSUER = 'rohan-website'

/**
 * Admin sign-in: bcrypt-hashed passwords, a JWT in an httpOnly cookie, lock-out after repeated failures.
 * A token stops working when the user's password changes (it carries the tail of the password hash).
 */
export function createAuth({ cfg, db }) {
  const Users = db.models.users
  const { maxLoginAttempts, lockTimeMs } = collectionBySlug.users.auth
  const fingerprint = (row) => row.passwordHash.slice(-12)

  const publicUser = (row) => ({ id: row.id, email: row.email, name: row.data?.name ?? null, role: row.role })

  const sign = (row, extra = {}, expiresIn = cfg.jwtExpiresInSeconds) =>
    jwt.sign({ sub: row.id, pv: fingerprint(row), ...extra }, cfg.jwtSecret, { expiresIn, issuer: ISSUER })

  async function login(email, password) {
    const row = await Users.findOne({ where: { email: String(email).trim().toLowerCase() } })
    if (!row) {
      await bcrypt.compare(String(password), DUMMY_HASH)
      throw unauthorized('The e-mail or password you entered is incorrect.')
    }
    if (row.lockUntil && row.lockUntil.getTime() > Date.now()) {
      const minutes = Math.ceil((row.lockUntil.getTime() - Date.now()) / 60000)
      throw new HttpError(423, `Too many failed attempts. This account is locked for ${minutes} more minute${minutes === 1 ? '' : 's'}.`)
    }
    const ok = await bcrypt.compare(String(password), row.passwordHash)
    if (!ok) {
      const attempts = row.loginAttempts + 1
      await row.update(attempts >= maxLoginAttempts ? { loginAttempts: 0, lockUntil: new Date(Date.now() + lockTimeMs) } : { loginAttempts: attempts })
      throw unauthorized('The e-mail or password you entered is incorrect.')
    }
    if (row.loginAttempts || row.lockUntil) await row.update({ loginAttempts: 0, lockUntil: null })
    return row
  }

  /** Token (from the cookie or an Authorization header) → the signed-in user, or null */
  async function userFromToken(token) {
    if (!token) return null
    let payload
    try {
      payload = jwt.verify(token, cfg.jwtSecret, { issuer: ISSUER })
    } catch {
      return null
    }
    if (payload.purpose) return null // reset-password tokens are not sessions
    const row = await Users.findByPk(payload.sub)
    if (!row || payload.pv !== fingerprint(row)) return null
    return { ...publicUser(row), tokenExp: payload.exp }
  }

  const issueSession = (row) => sign(row)
  const cookieOptions = () => ({
    httpOnly: true,
    secure: cfg.cookieSecure,
    sameSite: cfg.cookieSameSite,
    path: '/',
    maxAge: cfg.jwtExpiresInSeconds * 1000,
  })

  /** One-hour link for "forgot password" */
  const resetToken = (row) => sign(row, { purpose: 'reset' }, 3600)

  async function resetPassword(token, password) {
    let payload
    try {
      payload = jwt.verify(token, cfg.jwtSecret, { issuer: ISSUER })
    } catch {
      throw badRequest('This reset link is invalid or has expired. Ask for a new one.')
    }
    const row = payload.purpose === 'reset' ? await Users.findByPk(payload.sub) : null
    if (!row || payload.pv !== fingerprint(row)) throw badRequest('This reset link has already been used or has expired. Ask for a new one.')
    if (String(password).length < 8) throw badRequest('Use at least 8 characters.')
    await row.update({ passwordHash: await bcrypt.hash(String(password), cfg.bcryptRounds), loginAttempts: 0, lockUntil: null })
    return row
  }

  async function changePassword(userId, currentPassword, newPassword) {
    const row = await Users.findByPk(userId)
    if (!row || !(await bcrypt.compare(String(currentPassword), row.passwordHash))) throw badRequest('The current password is not correct.')
    if (String(newPassword).length < 8) throw badRequest('Use at least 8 characters.')
    await row.update({ passwordHash: await bcrypt.hash(String(newPassword), cfg.bcryptRounds) })
    return row
  }

  return { login, userFromToken, issueSession, cookieOptions, resetToken, resetPassword, changePassword, publicUser, Users }
}
