import { Router } from 'express'
import multer from 'multer'
import { body, validationResult } from 'express-validator'
import { collectionBySlug } from '../schema/index.js'
import { asyncHandler } from '../lib/util.js'

const MAX_FILE = 5 * 1024 * 1024
const validMobile = (m) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(String(m ?? '').replace(/\s/g, ''))

/**
 * Public Form Endpoints:
 * - POST /api/forms/contact — general contact messages
 * - POST /api/forms/grievance — कामाचे निवेदन (citizen grievance / work request)
 * - POST /api/forms/appointment — भेटीची विनंती (appointment / meeting request)
 * - POST /api/forms/invitation — शुभकार्य आमंत्रण (event / wedding invitation)
 *
 * Protection: rate limit → honeypot → optional reCAPTCHA v3 → validation → optional file upload → database record
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

  const handleUpload = (req, res, next) =>
    upload(req, res, (err) => {
      if (!err) return next()
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ ok: false, errors: { attachment: 'fileTooBig' } })
      next(err)
    })

  const handleHoneypot = (action) =>
    asyncHandler(async (req, res, next) => {
      const raw = req.body ?? {}
      if (String(raw.website ?? '').length > 0) return res.json({ ok: true }) // bots get a quiet "thanks"
      if (!(await captchaOk(raw.captcha, action))) return res.status(400).json({ ok: false, message: 'Captcha verification failed. Please retry.' })
      next()
    })

  /* ---------------------------------------------------- 1. Contact Form */
  const contactRules = [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('required'),
    body('mobile').trim().custom(validMobile).withMessage('invalidMobile'),
    body('email').trim().notEmpty().withMessage('required').bail().isEmail().withMessage('invalidEmail').bail().isLength({ max: 160 }).withMessage('invalidEmail'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('required'),
    body('office').isInt({ min: 1 }).withMessage('required'),
  ]

  r.post(
    '/contact',
    limiters.form,
    handleUpload,
    handleHoneypot('contact'),
    contactRules,
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
        if (attachment) await documents.remove('form-uploads', attachment, { overrideAccess: true }).catch(() => {})
        else if (storedFile) await uploads.removeFiles(collectionBySlug['form-uploads'], storedFile)
        logger.error?.('Contact form could not be saved:', err)
        res.status(500).json({ ok: false, message: 'error' })
      }
    }),
  )

  /* ---------------------------------------------------- 2. कामाचे निवेदन (Grievance) */
  const grievanceRules = [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('required'),
    body('mobile').trim().custom(validMobile).withMessage('invalidMobile'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('required'),
    body('description').trim().isLength({ min: 1, max: 5000 }).withMessage('required'),
  ]

  r.post(
    '/grievance',
    limiters.form,
    handleUpload,
    handleHoneypot('grievance'),
    grievanceRules,
    asyncHandler(async (req, res) => {
      const raw = req.body
      const errors = {}
      for (const e of validationResult(req).array()) errors[e.path] ??= e.msg

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
        const doc = await documents.create(
          'grievances',
          {
            name: raw.name.trim(),
            mobile: String(raw.mobile).replace(/\s+/g, ' ').trim(),
            inConstituency: raw.inConstituency === 'no' ? 'no' : 'yes',
            subject: raw.subject.trim(),
            description: String(raw.description ?? '').slice(0, 5000).trim(),
            address: String(raw.address ?? '').slice(0, 1000).trim(),
            email: String(raw.email ?? '').trim(),
            attachment,
          },
          { overrideAccess: true, locale: 'all' },
        )
        res.json({ ok: true, referenceNo: doc.referenceNo, id: doc.id })
      } catch (err) {
        if (attachment) await documents.remove('form-uploads', attachment, { overrideAccess: true }).catch(() => {})
        else if (storedFile) await uploads.removeFiles(collectionBySlug['form-uploads'], storedFile)
        logger.error?.('Grievance form could not be saved:', err)
        res.status(500).json({ ok: false, message: 'error' })
      }
    }),
  )

  /* ---------------------------------------------------- 3. भेटीची विनंती (Appointment) */
  const appointmentRules = [
    body('name').trim().isLength({ min: 1, max: 120 }).withMessage('required'),
    body('mobile').trim().custom(validMobile).withMessage('invalidMobile'),
    body('address').trim().isLength({ min: 1, max: 1000 }).withMessage('required'),
    body('reason').trim().isLength({ min: 1, max: 5000 }).withMessage('required'),
  ]

  r.post(
    '/appointment',
    limiters.form,
    handleUpload,
    handleHoneypot('appointment'),
    appointmentRules,
    asyncHandler(async (req, res) => {
      const raw = req.body
      const errors = {}
      for (const e of validationResult(req).array()) errors[e.path] ??= e.msg

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
        const doc = await documents.create(
          'appointments',
          {
            name: raw.name.trim(),
            mobile: String(raw.mobile).replace(/\s+/g, ' ').trim(),
            address: String(raw.address ?? '').slice(0, 1000).trim(),
            reason: String(raw.reason ?? '').slice(0, 5000).trim(),
            preferredDate: String(raw.preferredDate ?? '').trim(),
            preferredTime: String(raw.preferredTime ?? '').trim(),
            attachment,
          },
          { overrideAccess: true, locale: 'all' },
        )
        res.json({ ok: true, referenceNo: doc.referenceNo, id: doc.id })
      } catch (err) {
        if (attachment) await documents.remove('form-uploads', attachment, { overrideAccess: true }).catch(() => {})
        else if (storedFile) await uploads.removeFiles(collectionBySlug['form-uploads'], storedFile)
        logger.error?.('Appointment form could not be saved:', err)
        res.status(500).json({ ok: false, message: 'error' })
      }
    }),
  )

  /* ---------------------------------------------------- 4. शुभकार्य आमंत्रण (Invitation) */
  const invitationRules = [
    body('organizerName').trim().isLength({ min: 1, max: 120 }).withMessage('required'),
    body('mobile').trim().custom(validMobile).withMessage('invalidMobile'),
    body('eventTitle').trim().isLength({ min: 1, max: 200 }).withMessage('required'),
    body('eventDate').trim().isLength({ min: 1, max: 50 }).withMessage('required'),
    body('location').trim().isLength({ min: 1, max: 1000 }).withMessage('required'),
  ]

  r.post(
    '/invitation',
    limiters.form,
    handleUpload,
    handleHoneypot('invitation'),
    invitationRules,
    asyncHandler(async (req, res) => {
      const raw = req.body
      const errors = {}
      for (const e of validationResult(req).array()) errors[e.path] ??= e.msg

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
        const doc = await documents.create(
          'invitations',
          {
            organizerName: raw.organizerName.trim(),
            mobile: String(raw.mobile).replace(/\s+/g, ' ').trim(),
            eventTitle: raw.eventTitle.trim(),
            eventDate: raw.eventDate.trim(),
            eventTime: String(raw.eventTime ?? '').trim(),
            location: String(raw.location ?? '').slice(0, 1000).trim(),
            description: String(raw.description ?? '').slice(0, 5000).trim(),
            attachment,
          },
          { overrideAccess: true, locale: 'all' },
        )
        res.json({ ok: true, referenceNo: doc.referenceNo, id: doc.id })
      } catch (err) {
        if (attachment) await documents.remove('form-uploads', attachment, { overrideAccess: true }).catch(() => {})
        else if (storedFile) await uploads.removeFiles(collectionBySlug['form-uploads'], storedFile)
        logger.error?.('Invitation form could not be saved:', err)
        res.status(500).json({ ok: false, message: 'error' })
      }
    }),
  )

  return r
}
