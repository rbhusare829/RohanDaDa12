import type { Category, Post } from '@/types/cms'
import { toMarathiDigits } from './utils'

/** Plain text of a piece of HTML. Every tag becomes a space, so formatted runs count as separate words — as before, which keeps the reading times unchanged */
export const htmlText = (html?: string | null): string =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

/** Estimated reading time in minutes (≈180 words a minute for Marathi/English news prose) */
export const readMinutes = (post: Pick<Post, 'content' | 'excerpt'>): number => {
  const words = (htmlText(post.content) || post.excerpt || '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 180))
}

/** "३ मिनिटे वाचन" / "3 min read" */
export const readTimeLabel = (post: Pick<Post, 'content' | 'excerpt'>, locale: string) => {
  const n = readMinutes(post)
  return locale === 'mr' ? `${toMarathiDigits(n)} मिनिटे वाचन` : `${n} min read`
}

/** Section headings (h2/h3) of an article, in order — the "key points" box; the ids match the ones RichText adds */
export const articleHeadings = (html?: string | null): { id: string; text: string }[] => {
  const out: { id: string; text: string }[] = []
  for (const m of (html ?? '').matchAll(/<(h[23])>([\s\S]*?)<\/\1>/g)) {
    const text = htmlText(m[2])
    out.push({ id: `sec-${out.length + 1}`, text })
  }
  return out.filter((h) => h.text)
}

/** First category of a post (populated), if any */
export const primaryCategory = (post: Post): Category | null => {
  const c = post.categories?.find((x) => typeof x === 'object')
  return (c as Category) ?? null
}

/** Long newspaper date, e.g. "Tuesday, 13 October 2026" */
export const longDate = (d: Date, locale: string) =>
  new Intl.DateTimeFormat(locale === 'mr' ? 'mr-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(d)
