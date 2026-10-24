import { createContext, useContext, useId, useMemo, useState, type DragEvent, type ReactNode } from 'react'
import { get, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { defaultsFor, fieldLabel, flatFields, newRowId, plain, type BlockDef, type FieldDef } from '../schema'
import { Button, IconButton, Pill } from '../ui'
import { CheckboxControl, DateControl, NumberControl, SelectControl, TagsControl, TextControl, TextareaControl } from './controls'
import { RelationshipControl } from './Relationship'
import { RichTextControl } from './RichText'
import { UploadControl } from './Upload'

/* ---------------------------------------------------------------- language of the form */

type LocaleState = { locale: string; locales: string[] }
const LocaleContext = createContext<LocaleState>({ locale: 'en', locales: ['en', 'mr'] })
export const LocaleProvider = LocaleContext.Provider
export const useEditLocale = () => useContext(LocaleContext)

/** Text fields that hold a sentence, not a word: they take the whole row */
const WIDE_TEXT = new Set(['title', 'subtitle', 'heading', 'subheading', 'headline', 'question', 'stat', 'caption', 'intro'])

/* ---------------------------------------------------------------- errors */

/** First message for a field: on the field itself or on one of its language values */
export function errorMessage(errors: unknown, path: string): string | undefined {
  for (const p of [path, `${path}.en`, `${path}.mr`]) {
    const e = get(errors, p) as { message?: string } | undefined
    if (e?.message) return e.message
  }
  return undefined
}

/** True when anything at or below this path has an error */
export const hasErrorAt = (errors: unknown, path: string): boolean => {
  const e = get(errors, path)
  return Boolean(e && typeof e === 'object' && Object.keys(e).length)
}

/* ---------------------------------------------------------------- the shell around one field */

function Shell({ field, path, children, wide }: { field: FieldDef; path: string; children: (id: string) => ReactNode; wide?: boolean }) {
  const id = useId()
  const { formState: { errors } } = useFormContext()
  const { locale } = useEditLocale()
  const message = errorMessage(errors, path)
  const isSwitch = field.type === 'checkbox'
  return (
    <div className={cn('min-w-0', wide && 'col-span-full')} data-field={path}>
      <div className={cn('mb-1.5 flex flex-wrap items-baseline gap-x-2', isSwitch && 'mb-0 items-center')}>
        <label id={`${id}-label`} htmlFor={id} className="text-[0.88rem] font-semibold text-charcoal-900">
          {fieldLabel(field)}
          {field.required && <span className="ml-0.5 text-saffron-600" aria-hidden>*</span>}
        </label>
        {field.localized && <span className="rounded bg-charcoal-900/10 px-1.5 py-px text-[0.68rem] font-bold uppercase tracking-wide text-charcoal-800">{locale}</span>}
        {isSwitch && <div className="ml-auto">{children(id)}</div>}
      </div>
      {field.admin?.description && <p className="mb-1.5 text-[0.8rem] leading-snug text-charcoal-800/75">{field.admin.description}</p>}
      {!isSwitch && children(id)}
      {message && <p className="mt-1 text-[0.82rem] font-medium text-danger" role="alert">{message}</p>}
    </div>
  )
}

/** Controls for the simple field types; the name already has the language added for localized fields */
function Control({ field, name, id }: { field: FieldDef; name: string; id: string }) {
  const props = { field, name, id }
  switch (field.type) {
    case 'text':
    case 'email':
      return field.hasMany ? <TagsControl {...props} /> : <TextControl {...props} />
    case 'textarea':
      return <TextareaControl {...props} />
    case 'number':
      return <NumberControl {...props} />
    case 'checkbox':
      return <CheckboxControl {...props} />
    case 'select':
      return <SelectControl {...props} />
    case 'date':
      return <DateControl {...props} />
    case 'richText':
      return <RichTextControl name={name} id={id} />
    case 'upload':
      return <UploadControl {...props} />
    case 'relationship':
      return <RelationshipControl {...props} />
    default:
      return <p className="text-danger">Unsupported field type “{field.type}”.</p>
  }
}

/** One field of the form, whatever its type */
export function FieldRenderer({ field, path }: { field: FieldDef; path: string }) {
  const { locale } = useEditLocale()
  if (field.admin?.hidden) return null
  switch (field.type) {
    case 'tabs':
      return <TabsField field={field} path={path} />
    case 'group':
      return <GroupField field={field} path={path} />
    case 'array':
      return <ArrayField field={field} path={path} />
    case 'blocks':
      return <BlocksField field={field} path={path} />
    default: {
      const wide = ['richText', 'textarea', 'upload', 'relationship'].includes(field.type) || Boolean(field.hasMany) || (field.type === 'text' && WIDE_TEXT.has(field.name))
      const name = field.localized ? `${path}.${locale}` : path
      return (
        <Shell field={field} path={path} wide={wide}>
          {(id) => <Control key={name} field={field} name={name} id={id} />}
        </Shell>
      )
    }
  }
}

/** A list of fields as a grid (two columns on wide screens, wide fields take the full width) */
export function FieldList({ fields, prefix = '', single }: { fields: FieldDef[]; prefix?: string; single?: boolean }) {
  return (
    <div className={cn('grid gap-x-5 gap-y-5', !single && 'md:grid-cols-2')}>
      {fields.map((f) => (
        <FieldRenderer key={f.name || f.tabs?.map((t) => t.label).join()} field={f} path={f.type === 'tabs' ? prefix : prefix ? `${prefix}.${f.name}` : f.name} />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- tabs, groups */

function TabsField({ field, path }: { field: FieldDef; path: string }) {
  const tabs = field.tabs ?? []
  const { formState: { errors } } = useFormContext()
  const [active, setActive] = useState(0)
  const errored = tabs.map((t) => flatFields(t.fields).some((f) => hasErrorAt(errors, path ? `${path}.${f.name}` : f.name)))
  // when saving fails, jump to the first tab that has a problem
  const [shownErrors, setShownErrors] = useState('')
  const signature = errored.map(Number).join('')
  if (signature !== shownErrors) {
    setShownErrors(signature)
    if (errored.some(Boolean) && !errored[active]) setActive(errored.findIndex(Boolean))
  }
  if (tabs.length === 1) {
    return (
      <div className="col-span-full min-w-0">
        <h2 className="mb-4 border-b border-charcoal-900/15 pb-2 font-display text-[1.25rem]">{tabs[0].label}</h2>
        <FieldList fields={tabs[0].fields} prefix={path} />
      </div>
    )
  }
  return (
    <div className="col-span-full min-w-0">
      <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto border-b border-charcoal-900/15">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn('relative -mb-px shrink-0 border-b-2 px-4 py-2.5 text-[0.92rem] font-semibold transition', active === i ? 'border-saffron-600 text-charcoal-900' : 'border-transparent text-charcoal-800/75 hover:text-charcoal-900')}
          >
            {t.label}
            {errored[i] && <span className="ml-1.5 inline-block size-2 rounded-full bg-danger align-middle" aria-label="has problems" />}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} role="tabpanel" hidden={active !== i}>
          <FieldList fields={t.fields} prefix={path} />
        </div>
      ))}
    </div>
  )
}

function GroupField({ field, path }: { field: FieldDef; path: string }) {
  return (
    <fieldset className="col-span-full min-w-0 rounded-xl border border-charcoal-900/12 p-4">
      <legend className="px-2 text-[0.9rem] font-semibold text-charcoal-900">{fieldLabel(field)}</legend>
      {field.admin?.description && <p className="mb-3 text-[0.8rem] text-charcoal-800/75">{field.admin.description}</p>}
      <FieldList fields={field.fields ?? []} prefix={path} />
    </fieldset>
  )
}

/* ---------------------------------------------------------------- rows: arrays and blocks */

/** Copy of a row for "duplicate": new ids all the way down */
const cloneWithNewIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cloneWithNewIds)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === 'id' && typeof v === 'string' ? newRowId() : cloneWithNewIds(v)]))
  }
  return value
}

/** A short description of a row, to read in its collapsed header */
function summaryOf(row: Record<string, unknown> | undefined): string {
  if (!row) return ''
  for (const k of ['heading', 'eyebrow', 'title', 'question', 'label', 'name', 'place', 'value', 'kicker', 'leaderName']) {
    const v = plain(row[k])
    if (v) return v
  }
  if (Array.isArray(row.slides) && row.slides.length) return `${row.slides.length} slides`
  for (const k of ['text', 'subheading', 'intro', 'body', 'caption']) {
    const v = plain(row[k]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (v) return v.slice(0, 70)
  }
  return plain(row.youtubeUrl) || plain(row.url)
}

/** Drag & drop plus up / down buttons (keyboard friendly) for rearranging rows */
function useSortable(move: (from: number, to: number) => void) {
  const [from, setFrom] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const [armed, setArmed] = useState<number | null>(null)
  return {
    over,
    from,
    rowProps: (i: number) => ({
      draggable: armed === i,
      onDragStart: (e: DragEvent) => {
        setFrom(i)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(i))
      },
      onDragOver: (e: DragEvent) => {
        if (from === null) return
        e.preventDefault()
        setOver(i)
      },
      onDrop: (e: DragEvent) => {
        e.preventDefault()
        if (from !== null && from !== i) move(from, i)
        setFrom(null)
        setOver(null)
        setArmed(null)
      },
      onDragEnd: () => {
        setFrom(null)
        setOver(null)
        setArmed(null)
      },
    }),
    handleProps: (i: number) => ({
      onMouseDown: () => setArmed(i),
      onMouseUp: () => setArmed(null),
      onTouchStart: () => setArmed(i),
    }),
  }
}

type RowShellProps = {
  index: number
  count: number
  title: ReactNode
  summary?: string
  hidden?: boolean
  collapsed: boolean
  hasError: boolean
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onRemove: () => void
  sortable: ReturnType<typeof useSortable>
  children: ReactNode
  canRemove: boolean
}

function RowShell(p: RowShellProps) {
  return (
    <li
      {...p.sortable.rowProps(p.index)}
      className={cn('min-w-0 rounded-xl bg-white ring-1 transition', p.hasError ? 'ring-danger' : 'ring-charcoal-900/12', p.sortable.over === p.index && p.sortable.from !== p.index && 'ring-2 ring-saffron-500', p.sortable.from === p.index && 'opacity-50')}
    >
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 sm:flex-nowrap">
        <span {...p.sortable.handleProps(p.index)} className="grid size-8 cursor-grab place-items-center rounded-md text-charcoal-800/75 hover:bg-charcoal-900/[0.06] active:cursor-grabbing" aria-hidden title="Drag to reorder">
          <GripVertical className="size-4" />
        </span>
        <button type="button" onClick={p.onToggle} aria-expanded={!p.collapsed} className="flex min-w-0 flex-1 basis-[calc(100%-2.5rem)] items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left hover:bg-charcoal-900/[0.04] sm:basis-auto">
          <span className="font-display text-[0.95rem] text-saffron-600 tabular-nums">{String(p.index + 1).padStart(2, '0')}</span>
          <span className="min-w-0 break-words text-[0.9rem] font-semibold text-charcoal-900 sm:shrink-0">{p.title}</span>
          {p.summary && <span className="hidden min-w-0 truncate text-[0.88rem] text-charcoal-800/75 sm:block">{p.summary}</span>}
          {p.hidden && <Pill tone="draft">Hidden</Pill>}
          {p.hasError && <Pill tone="spam">Problem</Pill>}
          <ChevronDown className={cn('ml-auto size-4 shrink-0 text-charcoal-800/75 transition', !p.collapsed && 'rotate-180')} aria-hidden />
        </button>
        {/* on a phone the buttons take a row of their own under the title */}
        <div className="flex items-center gap-0.5 max-sm:w-full max-sm:justify-end">
          <IconButton label="Move up" onClick={p.onMoveUp} disabled={p.index === 0}><ChevronUp className="size-4" /></IconButton>
          <IconButton label="Move down" onClick={p.onMoveDown} disabled={p.index === p.count - 1}><ChevronDown className="size-4" /></IconButton>
          <IconButton label="Duplicate" onClick={p.onDuplicate}><Copy className="size-4" /></IconButton>
          <IconButton label="Remove" onClick={p.onRemove} disabled={!p.canRemove} className="text-danger hover:bg-danger-soft"><Trash2 className="size-4" /></IconButton>
        </div>
      </div>
      {!p.collapsed && <div className="border-t border-charcoal-900/10 p-4">{p.children}</div>}
    </li>
  )
}

function useRows(path: string, initCollapsed: boolean) {
  const { control, getValues } = useFormContext()
  const api = useFieldArray({ control, name: path, keyName: 'rhfKey' })
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [original] = useState<Set<string>>(() => new Set(api.fields.map((f) => f.rhfKey)))
  // rows that were there when the form opened start collapsed (when the field asks for it); rows added later start open
  const isCollapsed = (key: string) => (key in open ? !open[key] : initCollapsed && original.has(key))
  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: isCollapsed(key) }))
  const move = (from: number, to: number) => {
    if (to >= 0 && to < api.fields.length) api.move(from, to)
  }
  return { api, isCollapsed, toggle, move, values: () => (getValues(path) ?? []) as Record<string, unknown>[] }
}

function RowsHeader({ field, count, children }: { field: FieldDef; count: number; children?: ReactNode }) {
  return (
    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
      <div>
        <span className="text-[0.95rem] font-semibold text-charcoal-900">{fieldLabel(field)}</span>
        <span className="ml-2 text-[0.8rem] text-charcoal-800/75">{count} {count === 1 ? 'item' : 'items'}{field.maxRows ? ` · up to ${field.maxRows}` : ''}</span>
        {field.admin?.description && <p className="text-[0.8rem] text-charcoal-800/75">{field.admin.description}</p>}
      </div>
      {children}
    </div>
  )
}

function ArrayField({ field, path }: { field: FieldDef; path: string }) {
  const { formState: { errors } } = useFormContext()
  const rows = useRows(path, Boolean(field.admin?.initCollapsed))
  const { fields: items, append, insert, remove } = rows.api
  const sortable = useSortable(rows.move)
  const singular = field.labels?.singular ?? 'Item'
  const watched = useWatch({ name: path }) as Record<string, unknown>[] | undefined
  const atMax = field.maxRows != null && items.length >= field.maxRows
  const { locales } = useEditLocale()
  const message = errorMessage(errors, path)

  const add = () => append({ id: newRowId(), ...defaultsFor(field.fields ?? [], locales) })

  return (
    <div className="col-span-full min-w-0" data-field={path}>
      <RowsHeader field={field} count={items.length}>
        <Button size="sm" onClick={add} disabled={atMax}><Plus className="size-4" /> Add {singular.toLowerCase()}</Button>
      </RowsHeader>
      {message && <p className="mb-1 text-[0.82rem] font-medium text-danger" role="alert">{message}</p>}
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-charcoal-900/20 px-4 py-4 text-center text-[0.88rem] text-charcoal-800/75">Nothing here yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <RowShell
              key={item.rhfKey}
              index={i}
              count={items.length}
              title={singular}
              summary={summaryOf(watched?.[i])}
              collapsed={rows.isCollapsed(item.rhfKey) && !hasErrorAt(errors, `${path}.${i}`)}
              hasError={hasErrorAt(errors, `${path}.${i}`)}
              onToggle={() => rows.toggle(item.rhfKey)}
              onMoveUp={() => rows.move(i, i - 1)}
              onMoveDown={() => rows.move(i, i + 1)}
              onDuplicate={() => !atMax && insert(i + 1, cloneWithNewIds(rows.values()[i]) as Record<string, unknown>)}
              onRemove={() => remove(i)}
              canRemove={!field.minRows || items.length > field.minRows}
              sortable={sortable}
            >
              <FieldList fields={field.fields ?? []} prefix={`${path}.${i}`} />
            </RowShell>
          ))}
        </ul>
      )}
    </div>
  )
}

function BlocksField({ field, path }: { field: FieldDef; path: string }) {
  const { formState: { errors } } = useFormContext()
  const rows = useRows(path, Boolean(field.admin?.initCollapsed))
  const { fields: items, append, insert, remove } = rows.api
  const sortable = useSortable(rows.move)
  const watched = useWatch({ name: path }) as (Record<string, unknown> & { blockType?: string })[] | undefined
  const defs = useMemo(() => field.blocks ?? [], [field.blocks])
  const [menu, setMenu] = useState(false)
  const { locales } = useEditLocale()
  const message = errorMessage(errors, path)
  const byType = useMemo(() => Object.fromEntries(defs.map((b) => [b.slug, b])) as Record<string, BlockDef>, [defs])

  const add = (def: BlockDef) => {
    append({ id: newRowId(), blockType: def.slug, ...defaultsFor(def.fields, locales) })
    setMenu(false)
  }

  return (
    <div className="col-span-full min-w-0" data-field={path}>
      <RowsHeader field={field} count={items.length}>
        <div className="relative">
          <Button size="sm" variant="primary" onClick={() => setMenu((m) => !m)} aria-expanded={menu}><Plus className="size-4" /> Add section</Button>
          {menu && (
            <>
              <button type="button" aria-label="Close menu" className="fixed inset-0 z-20 cursor-default" onClick={() => setMenu(false)} />
              <ul className="absolute right-0 z-30 mt-1 max-h-80 w-64 overflow-y-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-charcoal-900/10">
                {defs.map((b) => (
                  <li key={b.slug}>
                    <button type="button" onClick={() => add(b)} className="w-full rounded-lg px-3 py-2 text-left text-[0.9rem] hover:bg-cream">{b.labels.singular}</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </RowsHeader>
      {message && <p className="mb-1 text-[0.82rem] font-medium text-danger" role="alert">{message}</p>}
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-charcoal-900/20 px-4 py-6 text-center text-[0.88rem] text-charcoal-800/75">No sections yet. Press “Add section”.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => {
            const row = watched?.[i]
            const def = byType[(row?.blockType ?? (item as unknown as { blockType?: string }).blockType) as string]
            return (
              <RowShell
                key={item.rhfKey}
                index={i}
                count={items.length}
                title={def?.labels.singular ?? 'Section'}
                summary={summaryOf(row)}
                hidden={row?.hidden === true}
                collapsed={rows.isCollapsed(item.rhfKey) && !hasErrorAt(errors, `${path}.${i}`)}
                hasError={hasErrorAt(errors, `${path}.${i}`)}
                onToggle={() => rows.toggle(item.rhfKey)}
                onMoveUp={() => rows.move(i, i - 1)}
                onMoveDown={() => rows.move(i, i + 1)}
                onDuplicate={() => insert(i + 1, cloneWithNewIds(rows.values()[i]) as Record<string, unknown>)}
                onRemove={() => remove(i)}
                canRemove
                sortable={sortable}
              >
                {def ? <FieldList fields={def.fields} prefix={`${path}.${i}`} /> : <p className="text-danger">Unknown section type.</p>}
              </RowShell>
            )
          })}
        </ul>
      )}
    </div>
  )
}
