import { useEffect, useRef, useState, type DragEvent, type MouseEvent } from 'react'
import { Crosshair, ExternalLink, FileText, Upload as UploadIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaDoc } from '../fields/docs'
import { formatBytes } from '../form'
import type { CollectionDef } from '../schema'
import { Button, Card } from '../ui'

export type Focal = { x: number; y: number }

type Props = {
  upload: NonNullable<CollectionDef['upload']>
  doc: MediaDoc | null
  file: File | null
  onFile: (file: File | null) => void
  focal: Focal
  onFocal: (focal: Focal) => void
  error?: string
  disabled?: boolean
}

/** What the file field of a photo / PDF collection looks like: the file, a way to choose or replace it, and the focal point of photos */
export function UploadPanel({ upload, doc, file, onFile, focal, onFocal, error, disabled }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const objectUrl = useRef<string | null>(null)
  const isImage = upload.kind === 'image'

  // the temporary address of a chosen photo is released when it is replaced and when the panel closes
  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    },
    [],
  )

  const choose = (picked: File | undefined) => {
    if (!picked) return
    setProblem(null)
    if (picked.size > upload.maxSize) return setProblem(`This file is ${formatBytes(picked.size)}. The largest allowed is ${formatBytes(upload.maxSize)}.`)
    if (upload.mimeTypes.length && picked.type && !upload.mimeTypes.includes(picked.type)) return setProblem(`“${picked.name}” is not an accepted file type.`)
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = isImage && picked.type.startsWith('image/') ? URL.createObjectURL(picked) : null
    setPreview(objectUrl.current)
    onFile(picked)
    if (isImage) onFocal({ x: 50, y: 50 })
  }

  /** back to the file that is stored */
  const undo = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
    setPreview(null)
    setProblem(null)
    onFile(null)
    onFocal({ x: doc?.focalX ?? 50, y: doc?.focalY ?? 50 })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDrag(false)
    if (!disabled) choose(e.dataTransfer.files[0])
  }

  const pickFocal = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled || !upload.focalPoint) return
    const box = e.currentTarget.getBoundingClientRect()
    onFocal({ x: Math.round(((e.clientX - box.left) / box.width) * 100), y: Math.round(((e.clientY - box.top) / box.height) * 100) })
  }

  const shown = preview ?? (isImage ? doc?.sizes?.hero?.url || doc?.url || null : null)
  const message = problem ?? error

  return (
    <Card>
      <h2 className="mb-3 font-display text-[1.2rem]">{isImage ? 'Photo' : 'File'}</h2>
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          {shown ? (
            <div
              onClick={pickFocal}
              className={cn('relative inline-block max-w-full overflow-hidden rounded-xl bg-cream ring-1 ring-charcoal-900/10', upload.focalPoint && !disabled && 'cursor-crosshair')}
              title={upload.focalPoint ? 'Click the most important part of the photo (the focal point)' : undefined}
            >
              <img src={shown} alt={doc?.filename ?? file?.name ?? ''} className="block max-h-[26rem] w-auto max-w-full" />
              {upload.focalPoint && (
                <span aria-hidden className="pointer-events-none absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgb(242_107_29),0_2px_10px_rgb(0_0_0/0.45)]" style={{ left: `${focal.x}%`, top: `${focal.y}%` }} />
              )}
            </div>
          ) : (
            <div className="flex min-h-40 items-center gap-4 rounded-xl bg-charcoal-900/[0.04] p-5">
              <FileText className="size-10 shrink-0 text-saffron-600" aria-hidden />
              <div className="min-w-0 text-[0.92rem]">
                <p className="truncate font-semibold">{file?.name ?? doc?.filename ?? 'No file yet'}</p>
                {(file || doc) && <p className="text-charcoal-800/75">{formatBytes(file?.size ?? doc?.filesize)}</p>}
                {!file && doc?.url && !upload.private && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-semibold text-saffron-700 hover:underline">Open <ExternalLink className="size-3.5" /></a>
                )}
              </div>
            </div>
          )}
          {isImage && upload.focalPoint && shown && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.82rem] text-charcoal-800/70">
              <Crosshair className="size-4" aria-hidden /> Focal point: {focal.x}% across, {focal.y}% down — the part kept when the photo is cropped to a card or a banner.
              {(focal.x !== 50 || focal.y !== 50) && !disabled && (
                <button type="button" onClick={() => onFocal({ x: 50, y: 50 })} className="font-semibold text-saffron-700 hover:underline">Reset to centre</button>
              )}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {!disabled && (
            <div
              onDragOver={(e) => (e.preventDefault(), setDrag(true))}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={cn('rounded-xl border-2 border-dashed p-4 text-center transition', drag ? 'border-saffron-500 bg-saffron-50' : 'border-field')}
            >
              <input ref={input} type="file" accept={upload.mimeTypes.join(',')} aria-label={isImage ? 'Choose a photo' : 'Choose a file'} className="sr-only" tabIndex={-1} onChange={(e) => (choose(e.target.files?.[0]), (e.target.value = ''))} />
              <UploadIcon className="mx-auto size-6 text-charcoal-800/75" aria-hidden />
              <p className="mt-2 text-[0.88rem] text-charcoal-800/75">{doc ? 'Drop a new file here to replace this one, or' : 'Drop the file here, or'}</p>
              <Button className="mt-2" onClick={() => input.current?.click()}>{doc ? 'Choose a replacement' : 'Choose a file'}</Button>
              <p className="mt-2 text-[0.75rem] text-charcoal-800/75">Up to {formatBytes(upload.maxSize)}{isImage ? ' · converted to WebP automatically' : ''}</p>
            </div>
          )}
          {file && (
            <p className="rounded-lg bg-saffron-50 px-3 py-2 text-[0.85rem] text-saffron-700">
              New file: <strong>{file.name}</strong> ({formatBytes(file.size)}). It is stored when you save.
              <button type="button" className="ml-2 font-semibold underline" onClick={undo}>Undo</button>
            </p>
          )}
          {doc && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.82rem]">
              <dt className="text-charcoal-800/75">File</dt><dd className="min-w-0 break-all">{doc.filename}</dd>
              {isImage && doc.width ? (<><dt className="text-charcoal-800/75">Size</dt><dd>{doc.width} × {doc.height} px</dd></>) : null}
              <dt className="text-charcoal-800/75">Weight</dt><dd>{formatBytes(doc.filesize)}</dd>
              {doc.url && !upload.private && (<><dt className="text-charcoal-800/75">Address</dt><dd className="min-w-0 break-all">{doc.url}</dd></>)}
            </dl>
          )}
        </div>
      </div>
      {message && <p className="mt-3 text-[0.85rem] font-medium text-danger" role="alert">{message}</p>}
    </Card>
  )
}
