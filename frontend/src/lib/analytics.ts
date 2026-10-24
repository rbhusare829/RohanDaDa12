/** Google Analytics 4 (only when VITE_GA_ID is set). A single-page site must report each page change itself. */
const ID = import.meta.env.VITE_GA_ID

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> }
  }
}

let started = false

export function initAnalytics() {
  if (!ID || started) return
  started = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', ID, { send_page_view: false })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ID)}`
  document.head.appendChild(s)
}

export function trackPage(path: string, title: string) {
  window.gtag?.('event', 'page_view', { page_path: path, page_title: title, page_location: window.location.href })
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.gtag?.('event', name, params)
}
