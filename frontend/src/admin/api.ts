import axios from 'axios'
import { api, clearCache } from '@/lib/api'
import type { AdminSchema, AdminUser } from './schema'

/** Server answers for validation problems: { message, errors: [{ field, message }] } */
export type FieldProblem = { field: string; message: string }
export type ApiError = { message: string; errors: FieldProblem[]; status: number }

export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: FieldProblem[] } | undefined
    return {
      status: err.response?.status ?? 0,
      message: data?.message ?? (err.response ? `The server answered ${err.response.status}.` : 'Could not reach the server. Check your connection.'),
      errors: data?.errors ?? [],
    }
  }
  return { status: 0, message: err instanceof Error ? err.message : 'Something went wrong.', errors: [] }
}

export type Doc = Record<string, unknown> & { id: number; createdAt?: string; updatedAt?: string; _status?: 'draft' | 'published' }
export type Paginated = { docs: Doc[]; totalDocs: number; totalPages: number; page: number; limit: number; hasNextPage: boolean; hasPrevPage: boolean }
export type Version = { id: number; status: string | null; userId: number | null; createdAt: string }

type Params = Record<string, unknown>

/** Everything the admin asks of the backend (cookie session; the website's cache is cleared after each change) */
export const admin = {
  me: () => api.get<{ user: AdminUser | null; permissions?: { collections: Record<string, { read: boolean; create: boolean; update: boolean; delete: boolean }> }; exp?: number }>('/api/users/me').then((r) => r.data),
  login: (email: string, password: string) => api.post<{ user: AdminUser }>('/api/users/login', { email, password }).then((r) => r.data),
  logout: () => api.post('/api/users/logout').then(() => undefined),
  forgotPassword: (email: string) => api.post<{ message: string }>('/api/users/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token: string, password: string) => api.post('/api/users/reset-password', { token, password }).then((r) => r.data),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/api/users/change-password', { currentPassword, newPassword }).then((r) => r.data),
  schema: () => api.get<AdminSchema>('/api/admin/schema').then((r) => r.data),
  dashboard: () => api.get<{ counts: Record<string, number | null>; recent: { id: number; name: string; subject: string; message: string; status: string; createdAt: string }[] }>('/api/admin/dashboard').then((r) => r.data),

  find: (slug: string, params: Params = {}) => api.get<Paginated>(`/api/${slug}`, { params: { locale: 'en', ...params } }).then((r) => r.data),
  count: (slug: string, where?: Params) => api.get<{ totalDocs: number }>(`/api/${slug}/count`, { params: { where } }).then((r) => r.data.totalDocs),
  get: (slug: string, id: number | string, params: Params = {}) => api.get<Doc>(`/api/${slug}/${id}`, { params: { locale: 'all', depth: 0, ...params } }).then((r) => r.data),
  create: (slug: string, body: unknown) => api.post<{ doc: Doc }>(`/api/${slug}`, body).then((r) => (clearCache(), r.data.doc)),
  update: (slug: string, id: number | string, body: unknown) => api.patch<{ doc: Doc }>(`/api/${slug}/${id}`, body).then((r) => (clearCache(), r.data.doc)),
  remove: (slug: string, id: number | string) => api.delete(`/api/${slug}/${id}`).then(() => (clearCache(), undefined)),

  getGlobal: (slug: string) => api.get<Doc>(`/api/globals/${slug}`, { params: { locale: 'all', depth: 0 } }).then((r) => r.data),
  saveGlobal: (slug: string, body: unknown) => api.post<{ doc: Doc }>(`/api/globals/${slug}`, body).then((r) => (clearCache(), r.data.doc)),

  versions: (slug: string, id?: number | string) => api.get<{ docs: Version[] }>(id === undefined ? `/api/globals/${slug}/versions` : `/api/${slug}/${id}/versions`).then((r) => r.data.docs),
  version: (slug: string, versionId: number, id?: number | string) =>
    api.get<{ data: Record<string, unknown> }>(id === undefined ? `/api/globals/${slug}/versions/${versionId}` : `/api/${slug}/${id}/versions/${versionId}`).then((r) => r.data.data),
}

/** Metadata + file → multipart body for photo / document collections */
export function uploadBody(data: Record<string, unknown>, file?: File | null) {
  const body = new FormData()
  body.set('_payload', JSON.stringify(data))
  if (file) body.set('file', file, file.name)
  return body
}
