import { useEffect, useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { useForm, type FieldError, type UseFormRegisterReturn } from 'react-hook-form'
import axios from 'axios'
import { CheckCircle2, Loader2, Paperclip, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'
import { captchaEnabled, captchaToken, loadCaptcha } from '@/lib/captcha'
import { useTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type Values = { name: string; mobile: string; email: string; subject: string; office: string; message: string; consent: boolean; website: string }

const MAX_FILE = 5 * 1024 * 1024
const mobileOk = (v: string) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, ''))
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

/**
 * The Contact page form (React Hook Form; site colours, Oct 2026 — the page draws the card around it). Validated in the browser first, and again by the backend, which answers
 * with the same error codes ("required", "invalidMobile", "fileType"…) shown under the fields.
 */
export function ContactForm({ offices }: { offices: { value: string; label: string }[] }) {
  const t = useTranslations('forms')
  const {
    register, handleSubmit, setError, clearErrors, reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { office: offices.length === 1 ? offices[0].value : '', consent: false, website: '' } })
  const [sent, setSent] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    void loadCaptcha()
  }, [])

  const required = { required: 'required' } as const

  const onSubmit = handleSubmit(async (v) => {
    setBanner(null)
    const body = new FormData()
    for (const k of ['name', 'mobile', 'email', 'subject', 'office', 'message', 'website'] as const) body.set(k, v[k] ?? '')
    if (file) body.set('attachment', file, file.name)
    const token = await captchaToken('contact')
    if (token) body.set('captcha', token)
    try {
      const res = await api.post('/api/forms/contact', body, { validateStatus: () => true })
      const data = res.data as { ok?: boolean; message?: string; errors?: Record<string, string> } | undefined
      if (data?.ok) {
        reset()
        setFile(null)
        setSent(true)
        trackEvent('generate_lead', { form: 'contact' })
        return
      }
      if (data?.errors) {
        for (const [field, code] of Object.entries(data.errors)) {
          if (field === 'attachment') setFileError(code)
          else setError(field as keyof Values, { type: 'server', message: code })
        }
        return
      }
      // a real failure (too many tries, captcha, server): a general message. Field mistakes are shown under their fields.
      setBanner(data?.message && data.message !== 'error' ? data.message : t('error'))
    } catch (e) {
      setBanner(axios.isAxiosError(e) && e.response?.data?.message ? String(e.response.data.message) : t('error'))
    }
  })

  if (sent)
    return (
      <div className="animate-tab-in flex flex-col items-center rounded-2xl bg-ivory px-6 py-12 text-center ring-1 ring-saffron-200" role="status">
        <span className="animate-pop-in grid size-16 place-items-center rounded-full bg-gradient-to-br from-saffron-600 to-saffron-500 text-white shadow-lg shadow-saffron-500/30">
          <CheckCircle2 className="size-8" />
        </span>
        <p className="animate-fade-up mt-5 font-display text-2xl font-bold text-charcoal-950" style={{ animationDelay: '180ms' }}>{t('success')}</p>
      </div>
    )

  return (
    <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register('website')} />

      <Field id="name" label={t('name')} required error={errors.name} inputProps={{ autoComplete: 'name', ...register('name', { ...required, maxLength: 120 }) }} />
      <Field
        id="mobile" label={t('mobile')} required error={errors.mobile}
        inputProps={{ type: 'tel', inputMode: 'tel', autoComplete: 'tel', ...register('mobile', { ...required, validate: (v) => mobileOk(v) || 'invalidMobile' }) }}
      />
      <Field
        id="email" label={t('email')} required error={errors.email}
        inputProps={{ type: 'email', autoComplete: 'email', ...register('email', { ...required, validate: (v) => emailOk(v) || 'invalidEmail' }) }}
      />
      <Field id="subject" label={t('subject')} required error={errors.subject} inputProps={register('subject', { ...required, maxLength: 200 })} />

      <Field id="office" label={t('office')} required error={errors.office} full as="select" selectProps={{ ...register('office', required) }} options={offices} />
      <Field id="message" label={t('message')} error={errors.message} full as="textarea" textareaProps={{ rows: 5, ...register('message', { maxLength: 5000 }) }} />

      <div className="md:col-span-2">
        <label htmlFor="f-attachment" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-charcoal-900"><Paperclip className="size-4 text-saffron-600" /> {t('attachment')}</label>
        <input
          id="f-attachment"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          aria-invalid={Boolean(fileError)}
          aria-describedby={fileError ? 'f-attachment-error' : undefined}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            setFileError(null)
            setFile(null)
            if (!f) return
            if (f.size > MAX_FILE) {
              setFileError('fileTooBig')
              e.target.value = ''
            } else if (!/\.(pdf|jpe?g|png|webp)$/i.test(f.name)) {
              setFileError('fileType')
              e.target.value = ''
            } else setFile(f)
          }}
          className="block w-full cursor-pointer rounded-xl border-2 border-dashed border-saffron-200 bg-ivory px-4 py-3 text-sm text-gray-600 transition hover:border-saffron-400 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-charcoal-950 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-saffron-600"
        />
        {fileError && <p id="f-attachment-error" className="animate-field-error mt-1 text-sm text-danger">{t.has(fileError) ? t(fileError) : fileError}</p>}
      </div>

      {banner && (
        <p className="animate-field-error rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger md:col-span-2" role="alert">{banner}</p>
      )}

      <div className="md:col-span-2">
        {/* the whole line is the touch area (44px high); the box itself is 24px with a clear edge */}
        <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-muted">
          <input
            type="checkbox"
            className="check -mt-0.5"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'f-consent-error' : undefined}
            {...register('consent', { required: 'required', onChange: () => clearErrors('consent') })}
          />
          <span>{t('consent')}</span>
        </label>
        {errors.consent && <p id="f-consent-error" className="animate-field-error mt-1 text-sm text-danger">{t.has('required') ? t('required') : 'required'}</p>}
      </div>
      <div className="md:col-span-2">
        <button type="submit" disabled={isSubmitting} className="btn min-w-44 text-base disabled:opacity-60 max-sm:w-full">
          {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> {t('sending')}</> : <>{t('submit')} <Send className="size-4" /></>}
        </button>
        {captchaEnabled && (
          <p className="mt-3 text-xs text-muted">
            Protected by reCAPTCHA — Google <a className="underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy</a> &amp; <a className="underline" href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Terms</a>.
          </p>
        )}
      </div>
    </form>
  )
}

type FieldProps = {
  id: string
  label: string
  required?: boolean
  error?: FieldError
  full?: boolean
  as?: 'input' | 'textarea' | 'select'
  inputProps?: InputHTMLAttributes<HTMLInputElement> & Partial<UseFormRegisterReturn>
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement> & Partial<UseFormRegisterReturn>
  selectProps?: SelectHTMLAttributes<HTMLSelectElement> & Partial<UseFormRegisterReturn>
  options?: { value: string; label: string }[]
}

function Field({ id, label, required, error, full, as = 'input', inputProps, textareaProps, selectProps, options }: FieldProps) {
  const t = useTranslations('forms')
  const fieldId = `f-${id}`
  // a 3.1:1 edge (UX pass) on the warm field, a clear orange ring while typing, red when something is wrong
  const cls = cn(
    'w-full rounded-xl border bg-ivory px-4 py-3 text-charcoal-950 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-4',
    error ? 'border-danger focus:ring-danger-soft' : 'border-field hover:border-field-hover focus:border-saffron-600 focus:ring-saffron-100',
  )
  const message = error?.message
  const errorId = `${fieldId}-error`
  const aria = { 'aria-invalid': Boolean(error), 'aria-required': required || undefined, 'aria-describedby': message ? errorId : undefined } as const
  return (
    <div className={cn(full && 'md:col-span-2')}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-charcoal-900">
        {label} {required && <span aria-hidden className="text-saffron-700">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea id={fieldId} className={cls} {...aria} {...textareaProps} />
      ) : as === 'select' ? (
        <select id={fieldId} className={cls} {...aria} defaultValue="" {...selectProps}>
          <option value="" disabled>—</option>
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input id={fieldId} className={cls} {...aria} {...inputProps} />
      )}
      {message && <p id={errorId} className="animate-field-error mt-1 text-sm text-danger">{t.has(message) ? t(message) : message}</p>}
    </div>
  )
}
