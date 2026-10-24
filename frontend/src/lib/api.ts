import axios from 'axios'
import type { Album, Category, Event, Footer, Header, Home, Initiative, Office, Page, Popup, Post, SiteSetting, Video } from '@/types/cms'

/**
 * The website's only door to content: the backend's REST API.
 *  - api  : the Axios client (cookie session, the header the backend requires for writes)
 *  - cms  : typed reads for the public pages; answers are kept for a minute and shared between simultaneous requests
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
  // where[and][0][_status][equals]=published — arrays with indexes, as the backend's query parser expects
  paramsSerializer: { indexes: true },
  timeout: 30_000,
})

/** A 401 from the API means the admin session ended (the admin listens for this) */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !/\/users\/(login|me)/.test(error.config?.url ?? '')) {
      window.dispatchEvent(new CustomEvent('rd:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export type Locale = 'en' | 'mr'
export type Where = Record<string, unknown>
export type FindQuery = { where?: Where; sort?: string; limit?: number; page?: number; depth?: number; locale?: Locale | 'all' }

export type Paginated<T> = {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

export type Collections = {
  pages: Page
  posts: Post
  categories: Category
  initiatives: Initiative
  events: Event
  albums: Album
  videos: Video
  offices: Office
}
export type Globals = { 'site-settings': SiteSetting; header: Header; footer: Footer; home: Home; popup: Popup }

const TTL = 60_000
const cache = new Map<string, { at: number; data: unknown }>()
const inflight = new Map<string, Promise<unknown>>()

/** Forget everything read so far (the admin calls this after saving, so the website shows the change at once) */
export const clearCache = () => cache.clear()

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const key = api.getUri({ url, params })
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return hit.data as T
  let pending = inflight.get(key)
  if (!pending) {
    pending = api
      // "public view": an editor who is signed in sees the website like any visitor (no drafts)
      .get(url, { params, headers: { 'X-Public-View': '1' } })
      .then((res) => {
        cache.set(key, { at: Date.now(), data: res.data })
        return res.data
      })
      .finally(() => inflight.delete(key))
    inflight.set(key, pending)
  }
  return pending as Promise<T>
}

const getActiveLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rd_locale')
    if (saved === 'en' || saved === 'mr') return saved
    const match = document.cookie.match(/(?:^|;\s*)rd_locale=([a-z]+)/)
    if (match && (match[1] === 'en' || match[1] === 'mr')) return match[1] as Locale
  }
  return 'mr'
}

export const DEFAULT_LOCALE: Locale = getActiveLocale()
const toParams = (q: FindQuery = {}) => ({ locale: q.locale ?? getActiveLocale(), ...q })

export const cms = {
  find<K extends keyof Collections>(collection: K, q?: FindQuery) {
    return get<Paginated<Collections[K]>>(`/api/${collection}`, toParams(q))
  },
  /** First match or null */
  async findOne<K extends keyof Collections>(collection: K, q: FindQuery) {
    return (await this.find(collection, { ...q, limit: 1 })).docs[0] ?? null
  },
  findByID<K extends keyof Collections>(collection: K, id: number | string, q?: Pick<FindQuery, 'depth' | 'locale'>) {
    return get<Collections[K]>(`/api/${collection}/${id}`, toParams(q))
  },
  global<K extends keyof Globals>(slug: K, q?: Pick<FindQuery, 'depth' | 'locale'>) {
    return get<Globals[K]>(`/api/globals/${slug}`, { locale: q?.locale ?? getActiveLocale(), depth: 2, ...q })
  },
}
