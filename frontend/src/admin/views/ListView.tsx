import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowDown, ArrowUp, Download, FileText, Plus, Search, Trash2, Upload as UploadIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { admin, toApiError, type Doc } from '../api'
import { useAsync, useSchema } from '../context'
import { thumbOf, type MediaDoc } from '../fields/docs'
import { uploadFiles } from '../fields/MediaPicker'
import { formatBytes, formatDate, statusOf } from '../form'
import { fieldLabel, flatFields, plain, titleOf, type CollectionDef, type FieldDef } from '../schema'
import { Button, EmptyState, PageHeading, Pill, Spinner, Unavailable, inputClass, useConfirm, useToast } from '../ui'

/** /admin/collections/:slug — the list of one kind of content */
export function ListView() {
  const { slug = '' } = useParams()
  const { collection } = useSchema()
  const def = collection(slug)
  if (!def || !def.permissions.read) return <Unavailable title="Not found">There is nothing called “{slug}” that you may open.</Unavailable>
  return <CollectionList key={slug} def={def} />
}

/* ---------------------------------------------------------------- columns */

const BUILT_IN_LABELS: Record<string, string> = { _status: 'Status', createdAt: 'Created', updatedAt: 'Updated', filename: 'File', filesize: 'Weight', width: 'Width', email: 'Email', id: 'ID' }
const SORTABLE_BUILT_IN = new Set(['_status', 'createdAt', 'updatedAt', 'filename', 'filesize', 'width', 'email', 'id'])
const SORTABLE_TYPES = new Set(['text', 'email', 'textarea', 'number', 'date', 'select', 'checkbox'])
const TEXT_TYPES = new Set(['text', 'email', 'textarea'])

type Column = { name: string; label: string; field?: FieldDef; sortable: boolean }

function columnsOf(def: CollectionDef): Column[] {
  const byName = new Map(flatFields(def.fields).map((f) => [f.name, f]))
  const names = def.admin.defaultColumns?.length ? def.admin.defaultColumns : [def.admin.useAsTitle ?? 'id', ...flatFields(def.fields).filter((f) => !f.admin?.hidden).map((f) => f.name)].slice(0, 5)
  return [...new Set(names)].map((name) => {
    const field = byName.get(name)
    return { name, field, label: field ? fieldLabel(field) : (BUILT_IN_LABELS[name] ?? name), sortable: field ? SORTABLE_TYPES.has(field.type) : SORTABLE_BUILT_IN.has(name) }
  })
}

/** Which fields the search box looks into */
function searchFields(def: CollectionDef, columns: Column[]): string[] {
  const names = new Set<string>()
  const known = new Map(flatFields(def.fields).map((f) => [f.name, f]))
  const add = (n?: string) => {
    if (!n) return
    const f = known.get(n)
    if (f ? TEXT_TYPES.has(f.type) && !f.hasMany : n === 'filename' || (n === 'email' && def.auth)) names.add(n)
  }
  add(def.admin.useAsTitle)
  columns.forEach((c) => add(c.name))
  for (const n of ['slug', 'path']) add(n)
  if (def.upload) names.add('filename')
  return [...names]
}

/** Dropdown filters: the choice fields of the collection (and the status of items that can be drafts) */
function filtersOf(def: CollectionDef): { name: string; label: string; options: { label: string; value: string }[] }[] {
  const out: { name: string; label: string; options: { label: string; value: string }[] }[] = []
  if (def.drafts) out.push({ name: '_status', label: 'Status', options: [{ label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }] })
  for (const f of def.fields) if (f.type === 'select' && !f.hasMany && !f.admin?.hidden && f.options?.length && out.length < 3) out.push({ name: f.name, label: fieldLabel(f), options: f.options })
  return out
}

/* ---------------------------------------------------------------- cells */

function Cell({ col, doc, def }: { col: Column; doc: Doc; def: CollectionDef }) {
  const { collection } = useSchema()
  const value = doc[col.name]
  const f = col.field

  if (col.name === '_status') return <Pill tone={statusOf(doc, Boolean(def.drafts && def.drafts.schedule))}>{statusOf(doc, Boolean(def.drafts && def.drafts.schedule))}</Pill>
  if (col.name === 'createdAt' || col.name === 'updatedAt') return <span className="whitespace-nowrap text-charcoal-800/75">{formatDate(value, true)}</span>
  if (col.name === 'filesize') return <span className="whitespace-nowrap text-charcoal-800/75">{formatBytes(value as number)}</span>
  if (col.name === 'width') return <span className="whitespace-nowrap text-charcoal-800/75">{value ? `${String(value)} × ${String(doc.height)}` : '—'}</span>
  if (!f) return <span>{plain(value) || '—'}</span>

  switch (f.type) {
    case 'upload': {
      const items = (Array.isArray(value) ? value : value ? [value] : []) as (MediaDoc | number)[]
      const first = items.find((i): i is MediaDoc => typeof i === 'object')
      if (f.hasMany) return <span className="text-charcoal-800/75">{items.length ? `${items.length} ${f.relationTo === 'media' ? 'photos' : 'files'}` : '—'}</span>
      if (!first) return <span className="text-charcoal-800/75">—</span>
      return f.relationTo === 'media' ? (
        <img src={thumbOf(first) ?? ''} alt="" loading="lazy" className="h-10 w-14 rounded object-cover ring-1 ring-charcoal-900/10" />
      ) : (
        <span className="inline-flex items-center gap-1.5"><FileText className="size-4 text-saffron-600" aria-hidden />{first.filename}</span>
      )
    }
    case 'relationship': {
      const target = collection(f.relationTo ?? '')
      const items = (Array.isArray(value) ? value : value ? [value] : []) as (Doc | number)[]
      const names = items.map((i) => (typeof i === 'object' ? (target ? titleOf(target, i) : plain(i)) : `#${i}`)).filter(Boolean)
      return <span>{names.length ? names.join(', ') : '—'}</span>
    }
    case 'select': {
      const label = f.options?.find((o) => o.value === value)?.label ?? plain(value)
      if (!label) return <span className="text-charcoal-800/75">—</span>
      return f.admin?.cell === 'status' ? <Pill tone={String(value)}>{label}</Pill> : <span>{label}</span>
    }
    case 'checkbox':
      return <Pill tone={value ? 'yes' : 'no'}>{value ? 'Yes' : 'No'}</Pill>
    case 'date':
      return <span className="whitespace-nowrap text-charcoal-800/75">{formatDate(plain(value), !f.dayOnly)}</span>
    default: {
      const text = plain(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      return <span className="line-clamp-2 break-words">{text || '—'}</span>
    }
  }
}

/* ---------------------------------------------------------------- the list */

function CollectionList({ def }: { def: CollectionDef }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [params, setParams] = useSearchParams()
  const isPhotos = def.upload?.kind === 'image'
  const pageSize = isPhotos ? 48 : 20

  const columns = useMemo(() => columnsOf(def), [def])
  const searchOn = useMemo(() => searchFields(def, columns), [def, columns])
  const filters = useMemo(() => filtersOf(def), [def])

  const q = params.get('q') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const sort = params.get('sort') || def.defaultSort
  const chosen = Object.fromEntries(filters.map((f) => [f.name, params.get(`f_${f.name}`) ?? ''])) as Record<string, string>
  const chosenKey = JSON.stringify(chosen)

  const [draft, setDraft] = useState(q)
  const typing = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const change = (patch: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (!keepPage && !('page' in patch)) next.delete('page')
    setParams(next, { replace: true })
    setSelected(new Set())
  }

  const where = useMemo(() => {
    const clauses: Record<string, unknown>[] = []
    if (q.trim() && searchOn.length) clauses.push({ or: searchOn.map((n) => ({ [n]: { like: q.trim() } })) })
    for (const [name, value] of Object.entries(JSON.parse(chosenKey) as Record<string, string>)) if (value) clauses.push({ [name]: { equals: value } })
    return clauses.length ? { and: clauses } : undefined
  }, [q, searchOn, chosenKey])
  const whereKey = JSON.stringify(where ?? null)

  const list = useAsync(
    () => admin.find(def.slug, { where, sort, page, limit: pageSize, depth: 1, locale: 'all' }),
    [def.slug, whereKey, sort, page],
  )
  const docs = list.data?.docs ?? []
  const total = list.data?.totalDocs ?? 0
  const pages = list.data?.totalPages ?? 1

  const canDelete = def.permissions.delete
  const allOnPage = docs.length > 0 && docs.every((d) => selected.has(d.id))
  const toggle = (id: number) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const onSearch = (value: string) => {
    setDraft(value)
    clearTimeout(typing.current)
    typing.current = setTimeout(() => change({ q: value.trim() }), 300)
  }

  const bulkDelete = async () => {
    const ids = [...selected]
    const noun = ids.length === 1 ? def.labels.singular.toLowerCase() : def.labels.plural.toLowerCase()
    const ok = await confirm({ title: `Delete ${ids.length} ${noun}?`, message: 'They will be removed for good. This cannot be undone.', confirmLabel: 'Delete', danger: true })
    if (!ok) return
    setDeleting(true)
    let done = 0
    const failed: string[] = []
    for (const id of ids) {
      try {
        await admin.remove(def.slug, id)
        done++
      } catch (e) {
        failed.push(`#${id}: ${toApiError(e).message}`)
      }
    }
    setDeleting(false)
    setSelected(new Set())
    if (done) toast(`${done} deleted.`)
    if (failed.length) toast(failed.slice(0, 3).join(' · '), 'error')
    const left = Math.max(0, total - done)
    if (page > 1 && left <= (page - 1) * pageSize) change({ page: String(page - 1) }, true)
    else list.reload()
  }

  const toggleSort = (name: string) => {
    const next = sort === name ? `-${name}` : sort === `-${name}` ? '' : name
    change({ sort: next === '' ? null : next })
  }

  const exportHref = def.admin.export ? api.getUri({ url: `/api/${def.slug}/export`, params: { where, sort } }) : null
  const filtered = Boolean(q.trim()) || Object.values(chosen).some(Boolean)

  return (
    <div>
      <PageHeading
        title={def.labels.plural}
        description={def.admin.description}
        actions={
          <>
            {exportHref && <a href={exportHref} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-4 text-[0.9rem] font-semibold ring-1 ring-charcoal-900/15 hover:bg-cream"><Download className="size-4" aria-hidden /> Export CSV</a>}
            {def.permissions.create && !isPhotos && (
              <Link to={`/admin/collections/${def.slug}/create`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-saffron-600 px-4 text-[0.9rem] font-semibold text-white hover:bg-saffron-700"><Plus className="size-4" aria-hidden /> {def.upload ? 'Upload' : `New ${def.labels.singular.toLowerCase()}`}</Link>
            )}
          </>
        }
      />

      {isPhotos && def.permissions.create && <PhotoDropZone slug={def.slug} onDone={() => (change({ page: null, sort: null, q: null }), list.reload())} />}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {searchOn.length > 0 && (
          <label className="relative min-w-56 flex-1 sm:max-w-sm">
            <span className="sr-only">Search {def.labels.plural}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-800/75" aria-hidden />
            <input type="search" value={draft} onChange={(e) => onSearch(e.target.value)} placeholder={`Search ${def.labels.plural.toLowerCase()}…`} className={cn(inputClass, 'pl-9')} />
          </label>
        )}
        {filters.map((f) => (
          <label key={f.name} className="flex items-center gap-2 text-[0.88rem]">
            <span className="text-charcoal-800/70">{f.label}</span>
            <select value={chosen[f.name]} onChange={(e) => change({ [`f_${f.name}`]: e.target.value })} className={cn(inputClass, 'w-auto min-w-32')}>
              <option value="">All</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        ))}
        {filtered && <button type="button" onClick={() => (setDraft(''), setParams(new URLSearchParams(), { replace: true }))} className="text-[0.88rem] font-semibold text-saffron-700 hover:underline">Clear filters</button>}
        <span className="ml-auto text-[0.88rem] text-charcoal-800/75" aria-live="polite">{list.data ? `${total} ${total === 1 ? def.labels.singular.toLowerCase() : def.labels.plural.toLowerCase()}` : ''}</span>
      </div>

      {selected.size > 0 && canDelete && (
        <div className="sticky top-2 z-20 mb-3 flex flex-wrap items-center gap-3 rounded-xl bg-charcoal-900 px-4 py-2.5 text-white shadow-lg lg:top-4" role="status">
          <span className="font-semibold">{selected.size} selected</span>
          <Button variant="danger" size="sm" loading={deleting} onClick={() => void bulkDelete()}><Trash2 className="size-3.5" aria-hidden /> Delete</Button>
          <button type="button" onClick={() => setSelected(new Set())} className="text-[0.88rem] text-white/80 hover:text-white hover:underline">Clear selection</button>
          {isPhotos && <button type="button" onClick={() => setSelected(new Set(docs.map((d) => d.id)))} className="text-[0.88rem] text-white/80 hover:text-white hover:underline">Select all on this page</button>}
        </div>
      )}

      {list.error ? (
        <Unavailable title="Could not load the list" retry={list.reload}>{list.error}</Unavailable>
      ) : list.loading && !list.data ? (
        <Spinner />
      ) : docs.length === 0 ? (
        <EmptyState>
          {filtered ? 'Nothing matches your search.' : <>Nothing here yet.{def.permissions.create && !isPhotos && <> <Link to={`/admin/collections/${def.slug}/create`} className="font-semibold text-saffron-700 underline">Add the first one</Link>.</>}</>}
        </EmptyState>
      ) : isPhotos ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6" aria-busy={list.loading}>
          {docs.map((d) => {
            const m = d as MediaDoc
            const on = selected.has(d.id)
            return (
              <li key={d.id} className={cn('group relative overflow-hidden rounded-xl bg-white ring-2 transition', on ? 'ring-saffron-500' : 'ring-charcoal-900/[0.07] hover:ring-charcoal-900/25')}>
                <Link to={`/admin/collections/${def.slug}/${d.id}`} className="block">
                  <span className="block aspect-square bg-cream"><img src={thumbOf(m) ?? ''} alt={plain(m.alt)} loading="lazy" className="size-full object-cover" /></span>
                  <span className="block truncate px-2.5 pb-0.5 pt-2 text-[0.82rem] font-medium">{m.filename}</span>
                  <span className="block truncate px-2.5 pb-2 text-[0.74rem] text-charcoal-800/75">{plain(m.alt) || `${m.width ?? '?'} × ${m.height ?? '?'} · ${formatBytes(m.filesize)}`}</span>
                </Link>
                {canDelete && (
                  <label className={cn('absolute left-2 top-2 grid size-7 cursor-pointer place-items-center rounded-md bg-white/90 shadow transition', on ? 'opacity-100' : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100')}>
                    <span className="sr-only">Select {m.filename}</span>
                    <input type="checkbox" checked={on} onChange={() => toggle(d.id)} className="size-4 accent-saffron-600" />
                  </label>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_2px_rgb(20_33_61/0.06)] ring-1 ring-charcoal-900/[0.07]" aria-busy={list.loading}>
          <table className="w-full min-w-[40rem] text-left text-[0.92rem]">
            <thead>
              <tr className="border-b border-charcoal-900/10 text-[0.78rem] uppercase tracking-wide text-charcoal-800/75">
                {canDelete && (
                  <th scope="col" className="w-10 px-4 py-3">
                    <input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={() => setSelected(allOnPage ? new Set() : new Set(docs.map((d) => d.id)))} className="size-4 accent-saffron-600" />
                  </th>
                )}
                {columns.map((c) => {
                  const asc = sort === c.name
                  const desc = sort === `-${c.name}`
                  return (
                    <th key={c.name} scope="col" aria-sort={asc ? 'ascending' : desc ? 'descending' : undefined} className="px-4 py-3 font-semibold">
                      {c.sortable ? (
                        <button type="button" onClick={() => toggleSort(c.name)} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-charcoal-900">
                          {c.label}
                          {asc ? <ArrowUp className="size-3.5" aria-hidden /> : desc ? <ArrowDown className="size-3.5" aria-hidden /> : null}
                        </button>
                      ) : (
                        c.label
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-900/[0.07]">
              {docs.map((d) => (
                <tr key={d.id} className={cn('transition hover:bg-cream/50', selected.has(d.id) && 'bg-saffron-50')}>
                  {canDelete && (
                    <td className="px-4 py-3 align-middle">
                      <input type="checkbox" aria-label={`Select ${titleOf(def, d)}`} checked={selected.has(d.id)} onChange={() => toggle(d.id)} className="size-4 accent-saffron-600" />
                    </td>
                  )}
                  {columns.map((c, i) => (
                    <td key={c.name} className="max-w-[22rem] px-4 py-3 align-middle">
                      {i === 0 ? (
                        <Link to={`/admin/collections/${def.slug}/${d.id}`} className="font-semibold text-charcoal-900 hover:text-saffron-700 hover:underline">
                          <FirstCell col={c} doc={d} def={def} />
                        </Link>
                      ) : (
                        <Cell col={c} doc={d} def={def} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button size="sm" disabled={page <= 1} onClick={() => change({ page: String(page - 1) }, true)}>Previous</Button>
          <span className="text-[0.88rem] text-charcoal-800/70">Page {page} of {pages}</span>
          <Button size="sm" disabled={page >= pages} onClick={() => change({ page: String(page + 1) }, true)}>Next</Button>
        </nav>
      )}
    </div>
  )
}

/** The first column is the link to the item: its title, or whatever the column shows */
function FirstCell({ col, doc, def }: { col: Column; doc: Doc; def: CollectionDef }): ReactNode {
  const f = col.field
  if (f && ['text', 'email', 'textarea'].includes(f.type)) return <span className="break-words">{plain(doc[col.name]) || titleOf(def, doc)}</span>
  if (col.name === 'filename' || col.name === 'email') return <span className="break-all">{plain(doc[col.name]) || titleOf(def, doc)}</span>
  return <Cell col={col} doc={doc} def={def} />
}

/* ---------------------------------------------------------------- bulk upload (photo library) */

function PhotoDropZone({ slug, onDone }: { slug: string; onDone: () => void }) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null)

  const upload = async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (files.length && !images.length) return toast('Only photos can be uploaded here.', 'error')
    if (!images.length) return
    setBusy({ done: 0, total: images.length })
    const { docs, failed } = await uploadFiles(slug, images, (done, total) => setBusy({ done, total }))
    setBusy(null)
    for (const f of failed.slice(0, 4)) toast(`${f.name}: ${f.message}`, 'error')
    if (docs.length) {
      toast(`${docs.length} photo${docs.length === 1 ? '' : 's'} uploaded.`)
      onDone()
    }
  }

  return (
    <div
      onDragOver={(e) => (e.preventDefault(), setDrag(true))}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => (e.preventDefault(), setDrag(false), void upload([...e.dataTransfer.files]))}
      className={cn('mb-5 flex flex-wrap items-center gap-4 rounded-xl border-2 border-dashed bg-white px-5 py-4 transition', drag ? 'border-saffron-500 bg-saffron-50' : 'border-field')}
    >
      <UploadIcon className="size-6 shrink-0 text-saffron-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Upload photos</p>
        <p className="text-[0.85rem] text-charcoal-800/70">Drop many photos here at once, or choose them. Each is made web-ready (WebP) with smaller copies for cards and banners.</p>
      </div>
      <input ref={input} type="file" accept="image/*" multiple aria-label="Choose photos to upload" className="sr-only" tabIndex={-1} onChange={(e) => (void upload([...(e.target.files ?? [])]), (e.target.value = ''))} />
      <Button variant="primary" loading={Boolean(busy)} onClick={() => input.current?.click()}>{busy ? `Uploading ${busy.done}/${busy.total}…` : 'Choose photos'}</Button>
    </div>
  )
}
