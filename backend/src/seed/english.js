/**
 * The site is shown in English only (Oct 2026). Some content had its text only in the Marathi field, so English
 * visitors saw Marathi (Vision → "How it works", 18 Lokmangal projects, photo descriptions). english.json holds the
 * English for those texts; fillEnglish() puts it into every empty English field whose Marathi text it knows.
 * Text that is never empty in English is left alone, so nothing an editor wrote is replaced.
 */
import { readFileSync } from 'node:fs'

const TRANSLATIONS = JSON.parse(readFileSync(new URL('./english.json', import.meta.url), 'utf8'))
const DEVANAGARI = /[ऀ-ॿ]/
const DIGITS = '०१२३४५६७८९'
const unescape = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && !v.length)

/** the English for a Marathi text (plain or a single <p>…</p>), or undefined */
export function toEnglish(mr) {
  if (typeof mr !== 'string') return undefined
  if (!DEVANAGARI.test(mr)) return mr // already English, only saved in the Marathi field
  if (TRANSLATIONS[mr.trim()]) return TRANSLATIONS[mr.trim()]
  const para = /^<p>([\s\S]*)<\/p>$/.exec(mr.trim())
  const inner = para && TRANSLATIONS[unescape(para[1]).trim()]
  return inner ? `<p>${escape(inner)}</p>` : undefined
}

/** fills empty English fields in place; returns how many it filled. Also turns card numbers "०१" into "01". */
export function fillEnglish(value) {
  let filled = 0
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk)
    if (!node || typeof node !== 'object') return
    if ('en' in node && 'mr' in node && isEmpty(node.en) && !isEmpty(node.mr)) {
      const en = toEnglish(node.mr)
      if (en !== undefined) { node.en = en; filled++ }
    }
    if (typeof node.icon === 'string' && /^[०-९]+$/.test(node.icon)) {
      node.icon = node.icon.replace(/[०-९]/g, (d) => String(DIGITS.indexOf(d)))
      filled++
    }
    for (const v of Object.values(node)) walk(v)
  }
  walk(value)
  return filled
}
