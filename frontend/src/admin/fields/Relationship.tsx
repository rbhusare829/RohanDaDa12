import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { admin, type Doc } from '../api'
import { useSchema } from '../context'
import { titleOf, type FieldDef } from '../schema'
import { inputClass } from '../ui'
import { rememberDocs, useDocs } from './docs'
import { useField } from './useField'

/** Pick related items (categories, posts, an initiative…): type to search, click to choose */
export function RelationshipControl({ field, name, id }: { field: FieldDef; name: string; id: string }) {
  const [value, setValue] = useField<number | number[] | null>(name)
  const { collection } = useSchema()
  const target = collection(field.relationTo ?? '')
  const multiple = Boolean(field.hasMany)
  const ids = (multiple ? (Array.isArray(value) ? value : []) : value ? [value] : []) as number[]
  const chosen = useDocs(field.relationTo ?? '', ids)

  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Doc[]>([])
  const box = useRef<HTMLDivElement>(null)
  const titleField = target?.admin.useAsTitle ?? 'id'

  useEffect(() => {
    if (!open || !field.relationTo) return
    let live = true
    const timer = setTimeout(() => {
      admin
        .find(field.relationTo!, { limit: 20, depth: 0, sort: target?.defaultSort, where: q.trim() ? { [titleField]: { like: q.trim() } } : undefined })
        .then((res) => {
          if (!live) return
          rememberDocs(field.relationTo!, res.docs)
          setResults(res.docs)
        })
        .catch(() => live && setResults([]))
    }, q ? 250 : 0)
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [open, q, field.relationTo, titleField, target?.defaultSort])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const choose = (d: Doc) => {
    if (multiple) setValue(ids.includes(d.id) ? ids.filter((x) => x !== d.id) : [...ids, d.id])
    else {
      setValue(d.id)
      setOpen(false)
    }
  }
  const label = (d: Doc) => (target ? titleOf(target, d) : `#${d.id}`)
  const readOnly = Boolean(field.admin?.readOnly)

  return (
    <div ref={box} className="relative">
      <div className="flex flex-wrap items-center gap-1.5">
        {ids.map((docId) => {
          const d = chosen.find((x) => x.id === docId)
          return (
            <span key={docId} className="inline-flex max-w-full items-center gap-1 rounded-full bg-charcoal-900/[0.07] py-0.5 pl-3 pr-1 text-[0.88rem]">
              <span className="truncate">{d ? label(d) : `#${docId}`}</span>
              {!readOnly && (
                <button type="button" aria-label="Remove" onClick={() => setValue(multiple ? ids.filter((x) => x !== docId) : null)} className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-charcoal-900/15">
                  <X className="size-3" />
                </button>
              )}
            </span>
          )
        })}
        {!readOnly && (
          <button type="button" id={id} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={cn(inputClass, 'flex w-auto min-w-44 items-center justify-between gap-2 text-left text-charcoal-900/75')}>
            {multiple ? 'Add…' : ids.length ? 'Change…' : 'Choose…'}
            <ChevronDown className="size-4" aria-hidden />
          </button>
        )}
        {readOnly && !ids.length && <span id={id} className="text-[0.9rem] text-charcoal-800/75">—</span>}
      </div>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-[min(26rem,100%)] rounded-xl bg-white p-2 shadow-xl ring-1 ring-charcoal-900/10">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${target?.labels.plural.toLowerCase() ?? ''}…`} className={cn(inputClass, 'mb-1.5')} />
          <ul role="listbox" className="max-h-64 overflow-y-auto">
            {results.map((d) => {
              const on = ids.includes(d.id)
              return (
                <li key={d.id} role="option" aria-selected={on}>
                  <button type="button" onClick={() => choose(d)} className={cn('flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[0.9rem] transition hover:bg-cream', on && 'bg-saffron-50 font-semibold')}>
                    <span className="truncate">{label(d)}</span>
                    {d._status === 'draft' && <span className="shrink-0 text-[0.72rem] text-charcoal-800/75">draft</span>}
                  </button>
                </li>
              )
            })}
            {!results.length && <li className="px-3 py-4 text-center text-[0.88rem] text-charcoal-800/75">Nothing found.</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
