/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** reCAPTCHA v3 site key for the contact form (empty = no captcha) */
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  /** Google Analytics measurement id (empty = no analytics) */
  readonly VITE_GA_ID?: string
  /** Backend address, only when the website is hosted separately from the API */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
