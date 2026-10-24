import { Router } from 'express'
import multer from 'multer'
import { body, validationResult } from 'express-validator'
import { collectionBySlug } from '../schema/index.js'
import { asyncHandler } from '../lib/util.js'

const MAX_FILE = 5 * 1024 * 1024
const validMobile = (m) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(String(m ?? '').replace(/\s/g, ''))

/**
 * POST /api/forms/contact — the Contact page form.
 * Protection, in order: per-address rate limit (5 / 10 minutes) → honeypot field → reCAPTCHA v3 (when a secret is set) →
 * validation → the attachment is checked by its real content → saved, and the office is e-mailed.
 * Answer: { ok: true } or { ok: false, message?, errors?: { field: code } } — the codes the form translates.
 */
export function formsRoutes({ cfg, db, documents, uploads, logger }, { limiters }) {
  const r = Router()
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE, files: 1, fields: 20, fieldSize: 20_000 } }).fields([
    { name: 'attachment', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])

  async function captchaOk(token, action) {
    if (!cfg.recaptchaSecret) return true
    try {
      const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: cfg.recaptchaSecret, response: String(token ?? '') }),
        signal: AbortSignal.timeout(8000),
      }).then((x) => x.json())
      return Boolean(res.success) && (res.score ?? 0) >= 0.5 && (!res.action || res.action === action)
    } catch {
      return false
    }
  }

  const rules = [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('required'),
    body('mobile').trim().custom(validMobile).withMessage('invalidMobile'),
    body('email').trim().notEmpty().withMessage('required').bail().isEmail().withMessage('invalidEmail').bail().isLength({ max: 160 }).withMessage('invalidEmail'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('required'),
    body('office').isInt({ min: 1 }).withMessage('required'),
  ]

  r.post(
    '/contact',
    limiters.form,
    (req, res, next) =>
      upload(req, res, (err) => {
        if (!err) return next()
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ ok: false, errors: { attachment: 'fileTooBig' } })
        next(err)
      }),
    asyncHandler(async (req, res, next) => {
      const raw = req.body ?? {}
      if (String(raw.website ?? '').length > 0) return res.json({ ok: true }) // bots get a quiet "thanks"
      if (!(await captchaOk(raw.captcha, 'contact'))) return res.status(400).json({ ok: false, message: 'Captcha verification failed. Please retry.' })
      next()
    }),
    rules,
    asyncHandler(async (req, res) => {
      const raw = req.body
      const errors = {}
      for (const e of validationResult(req).array()) errors[e.path] ??= e.msg

      const office = Number(raw.office)
      if (!errors.office && !(await documents.getRaw('offices', office))) errors.office = 'required'

      const file = req.files?.attachment?.[0] ?? req.files?.file?.[0]
      let storedFile = null
      if (!Object.keys(errors).length && file?.size > 0) {
        try {
          storedFile = await uploads.saveFile(collectionBySlug['form-uploads'], db.models['form-uploads'], file)
        } catch {
          errors.attachment = 'fileType'
        }
      }
      if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors })

      let attachment = null
      try {
        if (storedFile) attachment = (await documents.create('form-uploads', {}, { overrideAccess: true, upload: storedFile, locale: 'all' })).id
        await documents.create(
          'contact-messages',
          {
            name: raw.name,
            mobile: String(raw.mobile).replace(/\s+/g, ' ').trim(),
            email: raw.email,
            subject: raw.subject,
            message: String(raw.message ?? '').slice(0, 5000),
            office,
            attachment,
          },
          { overrideAccess: true, locale: 'all' },
        )
        res.json({ ok: true })
      } catch (err) {
        // do not leave an orphaned attachment behind
        if (attachment) await documents.remove('form-uploads', attachment, { overrideAccess: true }).catch(() => {})
        else if (storedFile) await uploads.removeFiles(collectionBySlug['form-uploads'], storedFile)
        logger.error?.('Contact form could not be saved:', err)
        res.status(500).json({ ok: false, message: 'error' })
      }
    }),
  )

  return r
}
