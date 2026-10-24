export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const youtubeId = (url?: string | null): string | null => {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/)
  return m ? m[1] : null
}

export const isExternal = (url?: string | null) => Boolean(url && /^(https?:)?\/\//.test(url))

const mrDigits = '०१२३४५६७८९'
export const toMarathiDigits = (s: string | number) => String(s).replace(/\d/g, (d) => mrDigits[+d])

export const formatDate = (iso: string | null | undefined, locale: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

/** The address of the website as the visitor sees it (links to share, canonical tags) */
export const siteUrl = () => window.location.origin

/** Paths on this site never carry a language prefix (the site is English only) */
export const localizedHref = (path: string) => path

/** Parses "1" / 1 / null into a positive page number */
export const pageNumber = (v: string | null | undefined) => Math.max(1, Math.floor(Number(v) || 1))
