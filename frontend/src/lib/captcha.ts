/** Google reCAPTCHA v3 for the contact form (only when VITE_RECAPTCHA_SITE_KEY is set; otherwise no captcha at all) */
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export const captchaEnabled = Boolean(SITE_KEY)

let loading: Promise<void> | null = null

/** Loads Google's script once (called when the form first appears, so the token is quick to get on submit) */
export function loadCaptcha(): Promise<void> {
  if (!SITE_KEY) return Promise.resolve()
  loading ??= new Promise<void>((resolve) => {
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => resolve() // blocked: the form still works, the server decides
    document.head.appendChild(s)
  })
  return loading
}

export async function captchaToken(action: string): Promise<string | null> {
  if (!SITE_KEY) return null
  await loadCaptcha()
  const g = window.grecaptcha
  if (!g) return null
  return new Promise((resolve) => g.ready(() => g.execute(SITE_KEY, { action }).then(resolve, () => resolve(null))))
}
