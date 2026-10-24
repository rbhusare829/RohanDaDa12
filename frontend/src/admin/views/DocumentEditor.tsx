import { useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useWatch, type FieldValues } from 'react-hook-form'
import { Link, useBlocker, useNavigate } from 'react-router'
import { ArrowLeft, ExternalLink, History as HistoryIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { admin, toApiError, uploadBody, type Doc } from '../api'
import { useAuth, useSchema } from '../context'
import type { MediaDoc } from '../fields/docs'
import { FieldList, LocaleProvider } from '../fields/FieldRenderer'
import { applyServerErrors, formatDate, hasLocalizedFields, statusOf, toFormValues } from '../form'
import { plain, previewUrl, type CollectionDef, type GlobalDef } from '../schema'
import { Button, Card, Modal, Pill, inputClass, useConfirm, useToast } from '../ui'
import { HistoryDialog } from './History'
import { UploadPanel, type Focal } from './UploadPanel'

const LOCALE_NAMES: Record<string, string> = { en: 'English', mr: 'मराठी' }

type SaveMode = 'draft' | 'published' | 'save'

/** The current time, refreshed every half minute (to tell whether a publish date is still ahead) */
function useNow(everyMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), everyMs)
    return () => clearInterval(id)
  }, [everyMs])
  return now
}

type Props = {
  collection?: CollectionDef
  global?: GlobalDef
  /** the stored document; null when a new one is being made */
  doc: Doc | null
}

/**
 * The edit form of a document or a global — built from the schema. Drafts and scheduled publishing, the language switch,
 * the version history, the photo / file panel, delete, "view on the website", and a warning before leaving with unsaved changes.
 */
export function DocumentEditor({ collection, global, doc: initialDoc }: Props) {
  const def = (collection ?? global)!
  const { schema } = useSchema()
  const { user, reload: reloadUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const locales = schema.locales

  const slug = def.slug
  const isGlobal = !collection
  const drafts = collection?.drafts || false
  const upload = collection?.upload ?? null
  const auth = collection?.auth ?? false
  const fields = def.fields
  const editsSelf = Boolean(auth && initialDoc && initialDoc.id === user?.id)

  const [doc, setDoc] = useState<Doc | null>(initialDoc)
  const isNew = !isGlobal && !doc
  const canSave = collection ? (doc ? collection.permissions.update : collection.permissions.create) : Boolean(global?.permissions.update)
  const canDelete = Boolean(collection && doc && collection.permissions.delete && !editsSelf)

  const startValues = (source: Doc | null): FieldValues => ({ ...toFormValues(fields, source, locales), ...(auth ? { email: source?.email ?? '', password: '' } : {}) })
  const [initial] = useState(() => startValues(initialDoc))
  const form = useForm<FieldValues>({ defaultValues: initial })

  const [locale, setLocale] = useState(schema.defaultLocale)
  const [file, setFile] = useState<File | null>(null)
  const [focal, setFocal] = useState<Focal>({ x: (initialDoc as MediaDoc | null)?.focalX ?? 50, y: (initialDoc as MediaDoc | null)?.focalY ?? 50 })
  const [fileError, setFileError] = useState<string | undefined>()
  const [saving, setSaving] = useState<SaveMode | null>(null)
  const [restoredFrom, setRestoredFrom] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const allowLeave = useRef(false)

  const storedFocal = { x: (doc as MediaDoc | null)?.focalX ?? 50, y: (doc as MediaDoc | null)?.focalY ?? 50 }
  const unsaved = form.formState.isDirty || Boolean(file) || restoredFrom !== null || focal.x !== storedFocal.x || focal.y !== storedFocal.y

  /* ---- leaving with unsaved changes */
  const unsavedNow = useRef(unsaved)
  useEffect(() => {
    unsavedNow.current = unsaved
  })
  const blocker = useBlocker(({ currentLocation, nextLocation }) => unsavedNow.current && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname)
  useEffect(() => {
    if (!unsaved) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [unsaved])

  /* ---- finding a field that has a problem */
  const locate = (path: string) => {
    const m = path.match(/^(.*)\.(en|mr)$/)
    const base = m ? m[1] : path
    if (m && locales.includes(m[2])) setLocale(m[2])
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(`[data-field="${base.replace(/"/g, '\\"')}"]`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el?.querySelector<HTMLElement>('input, textarea, select, [contenteditable="true"], button')?.focus({ preventScroll: true })
      }),
    )
  }

  /* ---- saving */
  const persist = async (values: FieldValues, mode: SaveMode) => {
    setBanner(null)
    setFileError(undefined)
    if (upload && !doc && !file) {
      setFileError('Choose a file to upload.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(mode)
    try {
      const body: Record<string, unknown> = { ...values }
      if (auth && !body.password) delete body.password
      if (drafts) body._status = mode === 'draft' ? 'draft' : 'published'
      if (upload?.focalPoint) Object.assign(body, { focalX: focal.x, focalY: focal.y })
      const payload = upload ? uploadBody(body, file) : body
      const saved = isGlobal ? await admin.saveGlobal(slug, body) : doc ? await admin.update(slug, doc.id, payload) : await admin.create(slug, payload)

      form.reset(startValues(saved))
      setDoc(saved)
      setFile(null)
      setRestoredFrom(null)
      setFocal({ x: (saved as MediaDoc).focalX ?? 50, y: (saved as MediaDoc).focalY ?? 50 })
      const scheduled = drafts && statusOf(saved, Boolean(drafts.schedule)) === 'scheduled'
      toast(mode === 'draft' ? 'Saved as a draft.' : drafts ? (scheduled ? 'Scheduled. It appears on the website on the chosen date.' : 'Published.') : isNew ? 'Created.' : 'Saved.')
      if (auth && saved.id === user?.id) void reloadUser()
      if (isNew) {
        allowLeave.current = true
        navigate(`/admin/collections/${slug}/${saved.id}`, { replace: true })
      }
    } catch (e) {
      const err = toApiError(e)
      const fileProblem = err.errors.find((p) => p.field === 'file')
      if (fileProblem) setFileError(fileProblem.message)
      const first = applyServerErrors(form.setError, err.errors.filter((p) => p.field !== 'file'))
      setBanner(err.errors.length ? `${err.message} ${err.errors.length === 1 ? 'One field needs attention.' : `${err.errors.length} fields need attention.`}` : err.message)
      if (first) locate(first)
      else if (fileProblem) window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(null)
    }
  }
  // the server does all the validating: problems it reported earlier must not stop the next attempt
  const submit = (mode: SaveMode) => () => {
    form.clearErrors()
    return persist(form.getValues(), mode)
  }

  // what the main button does (and Ctrl+S)
  const mainMode: SaveMode = drafts ? 'published' : 'save'
  const mainSave = () => void submit(mainMode)()
  const mainSaveNow = useRef(mainSave)
  useEffect(() => {
    mainSaveNow.current = mainSave
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (canSave) mainSaveNow.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canSave])

  /* ---- delete, history */
  const title = collection && doc ? plain(doc[collection.admin.useAsTitle ?? 'id']) || `${collection.labels.singular} #${doc.id}` : collection ? `New ${collection.labels.singular.toLowerCase()}` : (global?.label ?? '')

  const remove = async () => {
    if (!collection || !doc) return
    const ok = await confirm({
      title: `Delete this ${collection.labels.singular.toLowerCase()}?`,
      message: <>“{title}” will be removed for good{upload ? ', together with its file' : ''}. This cannot be undone.</>,
      confirmLabel: 'Delete',
      danger: true,
    })
    if (!ok) return
    try {
      await admin.remove(slug, doc.id)
      allowLeave.current = true
      toast('Deleted.')
      navigate(`/admin/collections/${slug}`)
    } catch (e) {
      toast(toApiError(e).message, 'error')
    }
  }

  const unpublish = async () => {
    const ok = await confirm({ title: 'Switch back to a draft?', message: 'It will disappear from the website until you publish it again.', confirmLabel: 'Switch to draft' })
    if (ok) void submit('draft')()
  }

  const restore = async (versionId: number, savedAt: string) => {
    const data = await admin.version(slug, versionId, isGlobal ? undefined : doc?.id)
    // the form shows the old version; the saved values stay the baseline, so the form counts as changed until saved
    form.reset(startValues(data as Doc), { keepDefaultValues: true })
    setRestoredFrom(savedAt)
    setBanner(null)
    toast(`The version from ${formatDate(savedAt, true)} is in the form. Press save to keep it.`, 'info')
  }

  /* ---- what the header shows */
  const publishedAtValue = useWatch({ control: form.control, name: 'publishedAt' }) as string | undefined
  const now = useNow()
  const willSchedule = Boolean(drafts && drafts.schedule && publishedAtValue && new Date(publishedAtValue).getTime() > now)
  const status = doc && drafts ? statusOf(doc, Boolean(drafts.schedule)) : null
  const liveLink = doc && status !== 'draft' ? previewUrl(def.admin.preview, isGlobal ? {} : doc) : null
  const mainFields = fields.filter((f) => f.admin?.position !== 'sidebar')
  const sideFields = fields.filter((f) => f.admin?.position === 'sidebar' && !f.admin.hidden)
  const errors = form.formState.errors

  return (
    <FormProvider {...form}>
      <LocaleProvider value={{ locale, locales }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            mainSave()
          }}
          noValidate
        >
          <div className="mb-6">
            {collection && (
              <Link to={`/admin/collections/${slug}`} className="mb-2 inline-flex items-center gap-1.5 text-[0.88rem] text-charcoal-800/70 hover:text-saffron-700">
                <ArrowLeft className="size-4" aria-hidden /> {collection.labels.plural}
              </Link>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="break-words font-display text-[1.9rem] leading-tight text-charcoal-900">{title}</h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.88rem] text-charcoal-800/70">
                  {status && <Pill tone={status}>{status}</Pill>}
                  {def.admin.description && !doc && <span>{def.admin.description}</span>}
                  {doc?.updatedAt && <span>Last saved {formatDate(doc.updatedAt, true)}</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {hasLocalizedFields(fields) && (
                  <div role="group" aria-label="Language of the text fields" className="inline-flex rounded-lg bg-charcoal-900/[0.08] p-0.5">
                    {locales.map((l) => (
                      <button
                        key={l}
                        type="button"
                        aria-pressed={locale === l}
                        onClick={() => setLocale(l)}
                        className={cn('rounded-md px-3.5 py-1.5 text-[0.88rem] font-semibold transition', locale === l ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-800/70 hover:text-charcoal-900')}
                      >
                        {LOCALE_NAMES[l] ?? l}
                      </button>
                    ))}
                  </div>
                )}
                {liveLink && (
                  <a href={liveLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3.5 text-[0.9rem] font-semibold ring-1 ring-charcoal-900/15 hover:bg-cream">
                    View on website <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                )}
                {def.versions > 0 && (doc || isGlobal) && (
                  <Button onClick={() => setHistoryOpen(true)}><HistoryIcon className="size-4" aria-hidden /> History</Button>
                )}
                {canDelete && (
                  <Button variant="ghost" className="text-danger hover:bg-danger-soft" onClick={() => void remove()}><Trash2 className="size-4" aria-hidden /> Delete</Button>
                )}
              </div>
            </div>
          </div>

          {!canSave && <p className="mb-5 rounded-lg bg-charcoal-900/[0.06] px-4 py-3 text-[0.92rem]" role="status">You can look at this, but your account is not allowed to change it.</p>}
          {restoredFrom && <p className="mb-5 rounded-lg bg-saffron-50 px-4 py-3 text-[0.92rem] text-saffron-700" role="status">Showing the version saved on {formatDate(restoredFrom, true)}. Nothing has changed on the website yet — press save to keep it, or leave this page to drop it.</p>}
          {banner && <p className="mb-5 rounded-lg bg-danger-soft px-4 py-3 text-[0.92rem] font-medium text-danger" role="alert">{banner}</p>}

          <fieldset disabled={!canSave || saving !== null} className="m-0 min-w-0 border-0 p-0">
            <div className={cn('grid items-start gap-6', sideFields.length > 0 && 'lg:grid-cols-[minmax(0,1fr)_21rem]')}>
              <div className="min-w-0 space-y-6">
                {upload && (
                  <UploadPanel upload={upload} doc={doc as MediaDoc | null} file={file} onFile={setFile} focal={focal} onFocal={setFocal} error={fileError} disabled={!canSave} />
                )}
                {auth && (
                  <Card>
                    <h2 className="mb-3 font-display text-[1.2rem]">Sign-in details</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-[0.88rem] font-semibold">Email <span className="text-saffron-600" aria-hidden>*</span></span>
                        <input type="email" autoComplete="off" className={inputClass} {...form.register('email')} />
                        {errors.email?.message && <span className="mt-1 block text-[0.82rem] font-medium text-danger" role="alert">{String(errors.email.message)}</span>}
                      </label>
                      {editsSelf ? (
                        <p className="self-end pb-2 text-[0.88rem] text-charcoal-800/70">To change your own password, use <Link to="/admin/account" className="font-semibold text-saffron-700 underline">My account</Link>.</p>
                      ) : (
                        <label className="block">
                          <span className="mb-1.5 block text-[0.88rem] font-semibold">Password {isNew && <span className="text-saffron-600" aria-hidden>*</span>}</span>
                          <input type="password" autoComplete="new-password" className={inputClass} {...form.register('password')} />
                          <span className="mt-1 block text-[0.78rem] text-charcoal-800/75">{isNew ? 'At least 8 characters.' : 'Leave empty to keep the current password.'}</span>
                          {errors.password?.message && <span className="mt-1 block text-[0.82rem] font-medium text-danger" role="alert">{String(errors.password.message)}</span>}
                        </label>
                      )}
                    </div>
                  </Card>
                )}
                {mainFields.length > 0 && (
                  <Card className="p-5 md:p-6">
                    <FieldList fields={mainFields} />
                  </Card>
                )}
              </div>

              {sideFields.length > 0 && (
                <aside aria-label="Settings of this item" className="min-w-0 space-y-6 lg:sticky lg:top-6">
                  <Card>
                    <FieldList fields={sideFields} single />
                  </Card>
                  {doc && (
                    <Card className="text-[0.82rem]">
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                        {!isGlobal && (<><dt className="text-charcoal-800/75">ID</dt><dd>{doc.id}</dd></>)}
                        {doc.createdAt && (<><dt className="text-charcoal-800/75">Created</dt><dd>{formatDate(doc.createdAt, true)}</dd></>)}
                        {doc.updatedAt && (<><dt className="text-charcoal-800/75">Saved</dt><dd>{formatDate(doc.updatedAt, true)}</dd></>)}
                      </dl>
                    </Card>
                  )}
                </aside>
              )}
            </div>
          </fieldset>

          {canSave && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal-900/10 bg-white/95 backdrop-blur lg:left-64">
              <div className="mx-auto flex max-w-[78rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-9">
                <p className={cn('text-[0.88rem]', unsaved ? 'font-semibold text-saffron-700' : 'text-charcoal-800/75')} role="status">
                  {unsaved ? '● Unsaved changes' : doc ? 'All changes saved' : 'Nothing entered yet'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {collection && <Link to={`/admin/collections/${slug}`} className="rounded-lg px-3 py-2 text-[0.9rem] font-semibold text-charcoal-800 hover:bg-charcoal-900/[0.06]">Cancel</Link>}
                  {drafts ? (
                    <>
                      {status === 'draft' || isNew ? (
                        <Button loading={saving === 'draft'} disabled={saving !== null} onClick={() => void submit('draft')()}>Save draft</Button>
                      ) : (
                        <Button loading={saving === 'draft'} disabled={saving !== null} onClick={() => void unpublish()}>Switch to draft</Button>
                      )}
                      <Button type="submit" variant="primary" loading={saving === 'published'} disabled={saving !== null}>
                        {isNew || status === 'draft' ? (willSchedule ? 'Schedule' : 'Publish') : willSchedule ? 'Reschedule' : 'Update'}
                      </Button>
                    </>
                  ) : (
                    <Button type="submit" variant="primary" loading={saving === 'save'} disabled={saving !== null}>{isNew ? 'Create' : 'Save'}</Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>

        {def.versions > 0 && (
          <HistoryDialog
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
            load={() => admin.versions(slug, isGlobal ? undefined : doc?.id)}
            onRestore={restore}
          />
        )}

        <Modal
          open={blocker.state === 'blocked'}
          onClose={() => blocker.reset?.()}
          title="Leave without saving?"
          footer={
            <>
              <Button onClick={() => blocker.reset?.()}>Stay here</Button>
              <Button variant="danger" onClick={() => blocker.proceed?.()}>Leave and lose the changes</Button>
            </>
          }
        >
          <p className="text-[0.95rem]">You changed something and have not saved it yet.</p>
        </Modal>
      </LocaleProvider>
    </FormProvider>
  )
}
