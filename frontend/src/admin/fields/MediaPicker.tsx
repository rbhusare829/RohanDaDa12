import { useCallback, useRef, useState, type DragEvent } from 'react'
import { Check, FileText, Loader2, Search, Upload as UploadIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { admin, toApiError, uploadBody, type Doc } from '../api'
import { useAsync, useSchema } from '../context'
import { plain } from '../schema'
import { Button, Modal, inputClass, useToast } from '../ui'
import { rememberDocs, thumbOf, type MediaDoc } from './docs'

const PAGE = 36

/** Uploads files one after another; failures are reported and do not stop the rest */
export async function uploadFiles(slug: string, files: File[], onProgress?: (done: number, total: number) => void): Promise<{ docs: Doc[]; failed: { name: string; message: string }[] }> {
  const docs: Doc[] = []
  const failed: { name: string; message: string }[] = []
  for (const [i, file] of files.entries()) {
    try {
      docs.push(await admin.create(slug, uploadBody({}, file)))
    } catch (e) {
      failed.push({ name: file.name, message: toApiError(e).message })
    }
    onProgress?.(i + 1, files.length)
  }
  rememberDocs(slug, docs)
  return { docs, failed }
}

/**
 * The photo (or PDF) library as a dialog: search, upload new files by drag & drop or the button, then pick one or several.
 */
export function MediaPicker({ open, onClose, collection = 'media', multiple, selected, onPick }: { open: boolean; onClose: () => void; collection?: 'media' | 'documents'; multiple?: boolean; selected: number[]; onPick: (docs: Doc[]) => void }) {
  const toast = useToast()
  const { collection: collectionDef } = useSchema()
  const canUpload = collectionDef(collection)?.permissions.create
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [chosen, setChosen] = useState<Doc[]>([])
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null)
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const list = useAsync(
    () =>
      admin.find(collection, {
        limit: PAGE,
        page,
        sort: '-createdAt',
        depth: 0,
        // the library searches the file name and the description (photos) or the title (documents)
        where: q.trim() ? { or: [{ filename: { like: q.trim() } }, { [collection === 'media' ? 'alt' : 'title']: { like: q.trim() } }] } : undefined,
        locale: 'all',
      }),
    [collection, page, q, open],
  )
  const docs = list.data?.docs ?? []
  const isImage = collection === 'media'

  const toggle = (d: Doc) => {
    if (!multiple) {
      onPick([d])
      onClose()
      return
    }
    setChosen((c) => (c.some((x) => x.id === d.id) ? c.filter((x) => x.id !== d.id) : [...c, d]))
  }

  const upload = useCallback(
    async (files: File[]) => {
      if (!files.length || !canUpload) return
      setBusy({ done: 0, total: files.length })
      const { docs: created, failed } = await uploadFiles(collection, files, (done, total) => setBusy({ done, total }))
      setBusy(null)
      for (const f of failed) toast(`${f.name}: ${f.message}`, 'error')
      if (created.length) {
        toast(`${created.length} file${created.length === 1 ? '' : 's'} uploaded.`)
        if (multiple) setChosen((c) => [...c, ...created])
        else {
          onPick([created[0]])
          onClose()
          return
        }
        setPage(1)
        list.reload()
      }
    },
    [canUpload, collection, list, multiple, onClose, onPick, toast],
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    void upload([...e.dataTransfer.files])
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isImage ? 'Choose a photo' : 'Choose a document'}
      wide
      footer={
        multiple ? (
          <>
            <span className="mr-auto text-[0.9rem] text-charcoal-800/70">{chosen.length ? `${chosen.length} selected` : 'Click photos to select them'}</span>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!chosen.length}
              onClick={() => {
                onPick(chosen)
                setChosen([])
                onClose()
              }}
            >
              Add {chosen.length || ''} selected
            </Button>
          </>
        ) : undefined
      }
    >
      <div onDragOver={(e) => (e.preventDefault(), canUpload && setDrag(true))} onDragLeave={() => setDrag(false)} onDrop={onDrop} className={cn('relative -m-1 rounded-xl p-1 transition', drag && 'bg-saffron-50 ring-2 ring-dashed ring-saffron-400')}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="relative min-w-52 flex-1">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-800/75" aria-hidden />
            <input value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} placeholder={isImage ? 'Search by file name or description…' : 'Search by name…'} className={cn(inputClass, 'pl-9')} />
          </label>
          {canUpload && (
            <>
              <input ref={input} type="file" multiple={Boolean(multiple)} accept={isImage ? 'image/*' : 'application/pdf'} className="hidden" onChange={(e) => (void upload([...(e.target.files ?? [])]), (e.target.value = ''))} />
              <Button variant="primary" onClick={() => input.current?.click()} loading={Boolean(busy)}>
                <UploadIcon className="size-4" /> {busy ? `Uploading ${busy.done}/${busy.total}…` : 'Upload'}
              </Button>
            </>
          )}
        </div>

        {list.loading && !docs.length ? (
          <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-charcoal-800/75" /></div>
        ) : !docs.length ? (
          <p className="rounded-xl border border-dashed border-charcoal-900/20 p-10 text-center text-charcoal-800/70">{q ? 'Nothing matches your search.' : canUpload ? 'Nothing here yet. Drop files here or press Upload.' : 'Nothing here yet.'}</p>
        ) : (
          <ul className={cn('grid gap-3', isImage ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2')}>
            {docs.map((d) => {
              const m = d as MediaDoc
              const on = chosen.some((x) => x.id === d.id) || (multiple ? false : selected.includes(d.id))
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => toggle(d)}
                    aria-pressed={on}
                    className={cn('group relative block w-full overflow-hidden rounded-lg text-left ring-2 transition', on ? 'ring-saffron-500' : 'ring-transparent hover:ring-charcoal-900/20', isImage ? 'aspect-square bg-cream' : 'flex items-center gap-3 bg-white p-3 ring-charcoal-900/10')}
                  >
                    {isImage ? (
                      <img src={thumbOf(m) ?? ''} alt={plain(m.alt)} loading="lazy" className="size-full object-cover" />
                    ) : (
                      <>
                        <FileText className="size-8 shrink-0 text-saffron-600" aria-hidden />
                        <span className="min-w-0"><span className="block truncate font-medium">{plain(m.title) || m.filename}</span><span className="block truncate text-[0.8rem] text-charcoal-800/75">{m.filename}</span></span>
                      </>
                    )}
                    {on && <span className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-saffron-600 text-white shadow"><Check className="size-4" /></span>}
                    {isImage && <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4 text-[0.72rem] text-white opacity-0 transition group-hover:opacity-100">{m.filename}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {(list.data?.totalPages ?? 1) > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span className="text-[0.85rem] text-charcoal-800/70">Page {page} of {list.data?.totalPages}</span>
            <Button size="sm" disabled={!list.data?.hasNextPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
