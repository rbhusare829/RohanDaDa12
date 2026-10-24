import nodemailer from 'nodemailer'
import { escapeHtml } from './util.js'

/**
 * E-mail through any SMTP server (set SMTP_HOST, SMTP_USER, SMTP_PASS…). Without SMTP settings nothing is sent:
 * the message is only written to the log, so forms and the admin keep working on a development machine.
 */
export function createMailer({ cfg, logger = console }) {
  const configured = Boolean(cfg.mail.host)
  const transport = configured
    ? nodemailer.createTransport({
        host: cfg.mail.host,
        port: cfg.mail.port,
        secure: cfg.mail.secure,
        auth: cfg.mail.user ? { user: cfg.mail.user, pass: cfg.mail.pass } : undefined,
      })
    : null

  async function send({ to, subject, html, text }) {
    const recipients = [to].flat().filter(Boolean)
    if (!recipients.length) return { sent: false, reason: 'no recipient' }
    if (!transport) {
      logger.info?.(`[mail] SMTP is not configured — not sent: "${subject}" → ${recipients.join(', ')}`)
      return { sent: false, reason: 'smtp not configured' }
    }
    await transport.sendMail({ from: cfg.mail.from, to: recipients, subject, html, text })
    return { sent: true }
  }

  return { send, configured }
}

/**
 * New form submission → e-mail the office it was sent to (or the default recipients from Site settings).
 * Grievances also get an acknowledgement with their reference number.
 */
export function createNotifier({ cfg, documents, mailer, logger = console }) {
  return async function notify({ collection, doc }) {
    if (!collection.notify) return
    const settings = await documents.getGlobalRaw('site-settings')
    let to = []
    if (doc.office) {
      const office = await documents.getRaw('offices', doc.office)
      to = office?.notifyEmails ?? []
    }
    if (!to.length) to = settings.formNotifyEmails ?? []

    const { label, fields } = collection.notify
    const rows = fields.map((f) => `<tr><td style="padding:4px 12px 4px 0"><b>${escapeHtml(f)}</b></td><td>${escapeHtml(doc[f])}</td></tr>`).join('')
    const adminUrl = `${cfg.publicUrl || ''}/admin/collections/${collection.slug}/${doc.id}`
    if (to.length) {
      await mailer.send({
        to,
        subject: `[Website] New ${label}: ${doc.name ?? ''}`.replace(/[\r\n]+/g, ' '),
        html: `<h2>New ${escapeHtml(label)}</h2><table>${rows}</table><p><a href="${escapeHtml(adminUrl)}">Open in admin panel</a></p>`,
      })
    }
    if (doc.email && doc.referenceNo) {
      await mailer.send({
        to: doc.email,
        subject: `We have received your message — reference no. ${doc.referenceNo}`,
        html: `<p>Hello ${escapeHtml(doc.name)},</p><p>Thank you, we have received your message. Your reference number is <b>${escapeHtml(doc.referenceNo)}</b>. Our team will get in touch with you soon.</p><p>— Office of Rohan Subhash Deshmukh</p>`,
      })
    }
    logger.info?.(`[mail] notification handled for ${collection.slug}/${doc.id}`)
  }
}
