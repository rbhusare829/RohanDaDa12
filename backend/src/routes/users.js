import { Router } from 'express'
import { body } from 'express-validator'
import { permissionsFor } from '../lib/access.js'
import { asyncHandler } from '../lib/util.js'
import { collections } from '../schema/index.js'
import { requireUser, validate } from '../middleware/core.js'

/** Sign-in, sign-out, "who am I", password reset and password change. User records themselves use the generic /api/users routes. */
export function usersRoutes({ cfg, auth, mailer, logger }, { limiters }) {
  const r = Router()

  const setSession = (res, row) => {
    const token = auth.issueSession(row)
    res.cookie(cfg.cookieName, token, auth.cookieOptions())
    return token
  }

  const permissions = (user) => ({
    collections: Object.fromEntries(collections.map((c) => [c.slug, permissionsFor(c, user)])),
  })

  r.post(
    '/login',
    limiters.login,
    [body('email').trim().isEmail().withMessage('Enter a valid e-mail address.'), body('password').isString().isLength({ min: 1, max: 200 }).withMessage('Enter your password.')],
    validate,
    asyncHandler(async (req, res) => {
      const row = await auth.login(req.body.email, req.body.password)
      const token = setSession(res, row)
      res.json({ message: 'Signed in.', user: auth.publicUser(row), token })
    }),
  )

  r.post('/logout', (req, res) => {
    const { maxAge: _maxAge, ...options } = auth.cookieOptions()
    res.clearCookie(cfg.cookieName, options)
    res.json({ message: 'Signed out.' })
  })

  r.get('/me', (req, res) => {
    if (!req.user) return res.json({ user: null })
    const { tokenExp, ...user } = req.user
    res.json({ user, permissions: permissions(req.user), exp: tokenExp })
  })

  r.post(
    '/forgot-password',
    limiters.login,
    [body('email').trim().isEmail().withMessage('Enter a valid e-mail address.')],
    validate,
    asyncHandler(async (req, res) => {
      const row = await auth.Users.findOne({ where: { email: req.body.email.toLowerCase() } })
      if (row) {
        const origin = cfg.publicUrl || `${req.protocol}://${req.get('host')}`
        const link = `${origin}/admin/reset-password?token=${encodeURIComponent(auth.resetToken(row))}`
        mailer
          .send({
            to: row.email,
            subject: 'Reset your admin password',
            html: `<p>Someone asked to reset the password of your admin account on the Rohan Deshmukh website.</p><p><a href="${link}">Choose a new password</a> (the link works for one hour). If this was not you, ignore this e-mail.</p>`,
          })
          .catch((err) => logger.error?.('Could not send the password reset e-mail:', err.message))
      }
      // same answer whether or not the address exists
      res.json({ message: 'If that e-mail address has an account, a reset link is on its way.' })
    }),
  )

  r.post(
    '/reset-password',
    limiters.login,
    [body('token').isString().isLength({ min: 10, max: 2000 }), body('password').isString().isLength({ min: 8, max: 200 }).withMessage('Use at least 8 characters.')],
    validate,
    asyncHandler(async (req, res) => {
      const row = await auth.resetPassword(req.body.token, req.body.password)
      setSession(res, row)
      res.json({ message: 'Your password has been changed.', user: auth.publicUser(row) })
    }),
  )

  r.post(
    '/change-password',
    requireUser,
    [body('currentPassword').isString().isLength({ min: 1, max: 200 }), body('newPassword').isString().isLength({ min: 8, max: 200 }).withMessage('Use at least 8 characters.')],
    validate,
    asyncHandler(async (req, res) => {
      const row = await auth.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword)
      setSession(res, row)
      res.json({ message: 'Your password has been changed.' })
    }),
  )

  return r
}
