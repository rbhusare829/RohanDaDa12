import { useState } from 'react'
import { ArrowLeft, ArrowRight, FileText, ImagePlus, Trash2 } from 'lucide-react'
import { plain, type FieldDef } from '../schema'
import { Button, IconButton } from '../ui'
import { MediaPicker } from './MediaPicker'
import { thumbOf, useDocs, type MediaDoc } from './docs'
import { useField } from './useField'

/** A photo or PDF field: shows what is chosen; "Choose" opens the library (with upload) */
export function UploadControl({ field, name, id }: { field: FieldDef; name: string; id: string }) {
  const [value, setValue] = useField<number | number[] | null>(name)
  const [open, setOpen] = useState(false)
  const target = (field.relationTo ?? 'media') as 'media' | 'documents'
  const multiple = Boolean(field.hasMany)
  const readOnly = Boolean(field.admin?.readOnly)
  const ids = (multiple ? (Array.isArray(value) ? value : []) : value ? [value] : []) as number[]
  const docs = useDocs(target, ids)
  const isImage = target === 'media'

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ids.length) return
    const next = [...ids]
    next.splice(to, 0, next.splice(from, 1)[0])
    setValue(next)
  }

  return (
    <div id={id}>
      {ids.length > 0 && (
        <ul className={isImage ? 'mb-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5' : 'mb-3 space-y-2'}>
          {ids.map((docId, i) => {
            const d = docs.find((x) => x.id === docId) as MediaDoc | undefined
            return (
              <li key={`${docId}-${i}`} className={isImage ? 'group relative aspect-square overflow-hidden rounded-lg bg-cream ring-1 ring-charcoal-900/10' : 'flex items-center gap-3 rounded-lg bg-white p-2.5 ring-1 ring-charcoal-900/10'}>
                {isImage ? (
                  d ? <img src={thumbOf(d) ?? ''} alt={plain(d.alt)} className="size-full object-cover" loading="lazy" /> : <span className="grid size-full place-items-center text-[0.75rem] text-charcoal-800/75">#{docId}</span>
                ) : (
                  <>
                    <FileText className="size-6 shrink-0 text-saffron-600" aria-hidden />
                    {d?.url ? (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-[0.9rem] hover:underline">{plain(d.title) || d.filename}</a>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-[0.9rem]">{d ? plain(d.title) || d.filename : `Document #${docId}`}</span>
                    )}
                  </>
                )}
                {!readOnly && (
                  <span className={isImage ? 'absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100' : 'flex shrink-0 gap-0.5'}>
                    {multiple && <IconButton label="Move earlier" className={isImage ? 'text-white hover:bg-white/20' : ''} onClick={() => move(i, i - 1)} disabled={i === 0}><ArrowLeft className="size-4" /></IconButton>}
                    <IconButton label="Remove" className={isImage ? 'text-white hover:bg-white/20' : ''} onClick={() => setValue(multiple ? ids.filter((_, k) => k !== i) : null)}><Trash2 className="size-4" /></IconButton>
                    {multiple && <IconButton label="Move later" className={isImage ? 'text-white hover:bg-white/20' : ''} onClick={() => move(i, i + 1)} disabled={i === ids.length - 1}><ArrowRight className="size-4" /></IconButton>}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {readOnly ? (
        !ids.length && <span className="text-[0.9rem] text-charcoal-800/75">—</span>
      ) : (
        <>
          <Button onClick={() => setOpen(true)}>
            <ImagePlus className="size-4" /> {ids.length ? (multiple ? (isImage ? 'Add photos' : 'Add documents') : isImage ? 'Change photo' : 'Change document') : isImage ? (multiple ? 'Choose photos' : 'Choose a photo') : 'Choose a document'}
          </Button>
          <MediaPicker
            open={open}
            onClose={() => setOpen(false)}
            collection={target}
            multiple={multiple}
            selected={ids}
            onPick={(picked) => {
              const next = picked.map((d) => d.id)
              setValue(multiple ? [...ids, ...next.filter((n) => !ids.includes(n))] : next[0] ?? null)
            }}
          />
        </>
      )}
    </div>
  )
}
