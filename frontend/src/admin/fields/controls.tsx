import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FieldDef } from '../schema'
import { inputClass } from '../ui'
import { useField } from './useField'

/** The value-editing part of each simple field type. Each binds to one form path. */
type ControlProps = { field: FieldDef; name: string; id: string }

export function TextControl({ field, name, id }: ControlProps) {
  const [value, setValue] = useField<string | null>(name)
  return (
    <input
      id={id}
      type={field.type === 'email' ? 'email' : 'text'}
      value={value ?? ''}
      onChange={(e) => setValue(e.target.value)}
      readOnly={field.admin?.readOnly}
      placeholder={field.slugFrom ? 'Made from the title when left empty' : undefined}
      maxLength={field.maxLength}
      autoComplete="off"
      className={inputClass}
    />
  )
}

export function TextareaControl({ field, name, id }: ControlProps) {
  const [value, setValue] = useField<string | null>(name)
  return (
    <textarea
      id={id}
      value={value ?? ''}
      onChange={(e) => setValue(e.target.value)}
      readOnly={field.admin?.readOnly}
      rows={Math.max(3, Math.min(14, Math.ceil((value ?? '').length / 90) + 1))}
      className={cn(inputClass, 'resize-y leading-relaxed')}
    />
  )
}

export function NumberControl({ field, name, id }: ControlProps) {
  const [value, setValue] = useField<number | null>(name)
  return (
    <input
      id={id}
      type="number"
      inputMode={field.integer ? 'numeric' : 'decimal'}
      step={field.integer ? 1 : 'any'}
      min={field.min}
      max={field.max}
      value={value ?? ''}
      onChange={(e) => setValue(e.target.value === '' ? null : Number(e.target.value))}
      readOnly={field.admin?.readOnly}
      className={cn(inputClass, 'max-w-48')}
    />
  )
}

export function CheckboxControl({ name, id, field }: ControlProps) {
  const [value, setValue] = useField<boolean | null>(name)
  const on = Boolean(value)
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={field.label}
      onClick={() => setValue(!on)}
      disabled={field.admin?.readOnly}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-2 disabled:opacity-50', on ? 'bg-saffron-600' : 'bg-charcoal-900/25')}
    >
      <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', on ? 'left-[1.4rem]' : 'left-0.5')} />
    </button>
  )
}

export function SelectControl({ field, name, id }: ControlProps) {
  const [value, setValue] = useField<string | string[] | null>(name)
  const options = field.options ?? []
  if (field.hasMany) {
    const chosen = Array.isArray(value) ? value : []
    return (
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${id}-label`}>
        {options.map((o) => {
          const on = chosen.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              disabled={field.admin?.readOnly}
              onClick={() => setValue(on ? chosen.filter((v) => v !== o.value) : [...chosen, o.value])}
              className={cn('rounded-full px-3 py-1 text-[0.85rem] font-medium ring-1 transition', on ? 'bg-charcoal-900 text-white ring-charcoal-900' : 'bg-white text-charcoal-800 ring-field hover:bg-cream hover:ring-field-hover')}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    )
  }
  const current = typeof value === 'string' ? value : ''
  return (
    <select id={id} value={current} onChange={(e) => setValue(e.target.value)} disabled={field.admin?.readOnly} className={inputClass}>
      {!field.required && <option value="">—</option>}
      {field.required && !current && <option value="">Choose…</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

/** ISO string ⇄ the value of <input type="date"> / <input type="datetime-local"> */
const toInput = (iso: unknown, dayOnly?: boolean) => {
  if (typeof iso !== 'string' || !iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  if (dayOnly) return iso.slice(0, 10)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
const fromInput = (v: string, dayOnly?: boolean) => (!v ? null : dayOnly ? `${v}T00:00:00.000Z` : new Date(v).toISOString())

export function DateControl({ field, name, id }: ControlProps) {
  const [value, setValue] = useField<string | null>(name)
  return (
    <input
      id={id}
      type={field.dayOnly ? 'date' : 'datetime-local'}
      value={toInput(value, field.dayOnly)}
      onChange={(e) => setValue(fromInput(e.target.value, field.dayOnly))}
      readOnly={field.admin?.readOnly}
      className={cn(inputClass, 'max-w-64')}
    />
  )
}

/** A list of short texts (tags, e-mail addresses): type and press Enter or comma */
export function TagsControl({ name, id }: ControlProps) {
  const [value, setValue] = useField<string[] | null>(name)
  const [draft, setDraft] = useState('')
  const tags = Array.isArray(value) ? value : []

  const add = (raw: string) => {
    const items = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (!items.length) return
    setValue([...tags, ...items.filter((i) => !tags.includes(i))])
    setDraft('')
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && tags.length) setValue(tags.slice(0, -1))
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-field bg-white p-1.5 focus-within:border-saffron-700 focus-within:ring-2 focus-within:ring-saffron-700">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-charcoal-900/[0.07] py-0.5 pl-2.5 pr-1 text-[0.85rem]">
          {t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => setValue(tags.filter((x) => x !== t))} className="grid size-5 place-items-center rounded-full hover:bg-charcoal-900/15">
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey} onBlur={() => add(draft)} placeholder={tags.length ? '' : 'Type and press Enter'} className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-[0.9rem] outline-none" />
    </div>
  )
}
