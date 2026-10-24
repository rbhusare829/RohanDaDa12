import en from '@/i18n/messages/en.json'
import mr from '@/i18n/messages/mr.json'
import type { Locale } from './api'

/**
 * The website default language is Marathi (mr), with bilingual capability (mr / en).
 * When LOCALE is 'mr', all CMS collections, globals, and navigation load real Marathi content.
 * When LOCALE is 'en', English content is loaded.
 */
export const getLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rd_locale')
    if (saved === 'en' || saved === 'mr') return saved
    const match = document.cookie.match(/(?:^|;\s*)rd_locale=([a-z]+)/)
    if (match && (match[1] === 'en' || match[1] === 'mr')) return match[1] as Locale
  }
  return 'mr'
}

export const setLocale = (locale: Locale) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rd_locale', locale)
    document.cookie = `rd_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }
}

export const LOCALE: Locale = typeof window !== 'undefined' ? getLocale() : 'mr'

const dictionaries: Record<Locale, unknown> = { en, mr }

type Vars = Record<string, string | number>

const lookup = (locale: Locale, ns: string, key: string): string | undefined => {
  const node = (dictionaries[locale] as Record<string, Record<string, string>>)[ns]
  const value = node?.[key]
  return typeof value === 'string' ? value : undefined
}

export interface Translator {
  (key: string, vars?: Vars): string
  has: (key: string) => boolean
}

/** `const t = translations('common'); t('readMore')`, with {placeholders}: t('showing', { count: 3 }) */
export function translations(ns: string, locale: Locale = LOCALE): Translator {
  const t = ((key: string, vars?: Vars) => {
    const text = lookup(locale, ns, key) ?? lookup('en', ns, key) ?? key
    return vars ? text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : text
  }) as Translator
  t.has = (key) => lookup(locale, ns, key) !== undefined
  return t
}

/** Hook form of translations(): the dictionaries never change at runtime, so this is a plain function call */
export const useTranslations = (ns: string, locale: Locale = LOCALE) => translations(ns, locale)

export type { Locale }
