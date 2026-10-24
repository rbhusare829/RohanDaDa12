import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { admin, toApiError } from './api'
import type { AdminSchema, AdminUser, CollectionDef, GlobalDef } from './schema'
import { Spinner } from './ui'

/* ---------------------------------------------------------------- session */

type Auth = {
  status: 'loading' | 'out' | 'in'
  user: AdminUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** after the account's own details changed */
  reload: () => Promise<void>
}
const AuthContext = createContext<Auth | null>(null)
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Knows who is signed in. Looks at the session when the admin opens, and signs out when the backend says it has ended. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: Auth['status']; user: AdminUser | null }>({ status: 'loading', user: null })
  const navigate = useNavigate()

  const reload = useCallback(async () => {
    try {
      const { user } = await admin.me()
      setState({ status: user ? 'in' : 'out', user })
    } catch {
      setState({ status: 'out', user: null })
    }
  }, [])

  useEffect(() => {
    // loading the session is "subscribing to the server": the answer arrives asynchronously
    const id = setTimeout(() => void reload(), 0)
    return () => clearTimeout(id)
  }, [reload])

  useEffect(() => {
    const onExpired = () => {
      setState({ status: 'out', user: null })
      navigate('/admin/login?expired=1', { replace: true })
    }
    window.addEventListener('rd:unauthorized', onExpired)
    return () => window.removeEventListener('rd:unauthorized', onExpired)
  }, [navigate])

  const value = useMemo<Auth>(
    () => ({
      ...state,
      reload,
      login: async (email, password) => {
        const { user } = await admin.login(email, password)
        setState({ status: 'in', user })
      },
      logout: async () => {
        await admin.logout().catch(() => {})
        setState({ status: 'out', user: null })
      },
    }),
    [state, reload],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* ---------------------------------------------------------------- schema */

type SchemaCtx = {
  schema: AdminSchema
  collection: (slug: string) => CollectionDef | undefined
  global: (slug: string) => GlobalDef | undefined
}
const SchemaContext = createContext<SchemaCtx | null>(null)
export const useSchema = () => {
  const ctx = useContext(SchemaContext)
  if (!ctx) throw new Error('useSchema must be used inside <SchemaProvider>')
  return ctx
}

/** Loads the content schema once after sign-in (every form, list and menu is built from it) */
export function SchemaProvider({ children }: { children: ReactNode }) {
  const [schema, setSchema] = useState<AdminSchema | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    let live = true
    admin.schema().then((s) => live && setSchema(s)).catch((e) => live && setError(toApiError(e).message))
    return () => {
      live = false
    }
    // the schema depends on what the signed-in user may do
  }, [user?.id, user?.role])

  const value = useMemo<SchemaCtx | null>(
    () => (schema ? { schema, collection: (s) => schema.collections.find((c) => c.slug === s), global: (s) => schema.globals.find((g) => g.slug === s) } : null),
    [schema],
  )
  if (error) return <p className="p-10 text-danger" role="alert">Could not load the admin: {error}</p>
  if (!value) return <Spinner />
  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>
}

/* ---------------------------------------------------------------- data loading */

export type Async<T> = { data: T | null; loading: boolean; error: string | null; reload: () => void }

/** Runs an async function when its dependencies change; the latest call wins */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): Async<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)
  const latest = useRef(0)

  useEffect(() => {
    const run = ++latest.current
    const start = setTimeout(() => {
      setState((s) => ({ ...s, loading: true, error: null }))
      fn()
        .then((data) => run === latest.current && setState({ data, loading: false, error: null }))
        .catch((e) => run === latest.current && setState((s) => ({ ...s, loading: false, error: toApiError(e).message })))
    }, 0)
    return () => clearTimeout(start)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  return { ...state, reload: () => setTick((t) => t + 1) }
}
