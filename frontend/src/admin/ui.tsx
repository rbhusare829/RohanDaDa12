import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------- buttons */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-saffron-600 text-white hover:bg-saffron-700 disabled:bg-saffron-300',
  secondary: 'bg-white text-charcoal-900 ring-1 ring-charcoal-900/15 hover:bg-cream disabled:text-charcoal-900/60',
  ghost: 'text-charcoal-800 hover:bg-charcoal-900/[0.06] disabled:text-charcoal-900/60',
  danger: 'bg-danger text-white hover:brightness-90 disabled:opacity-60',
}

export function Button({ variant = 'secondary', size = 'md', loading, className, children, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md'; loading?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed',
        size === 'sm' ? 'min-h-8 px-3 text-[0.82rem]' : 'min-h-10 px-4 text-[0.9rem]',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function IconButton({ label, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={cn('grid size-8 place-items-center rounded-md text-charcoal-800 transition hover:bg-charcoal-900/[0.07] disabled:opacity-30', className)} {...rest}>
      {children}
    </button>
  )
}

/* ---------------------------------------------------------------- pieces */

export const inputClass = 'w-full rounded-lg border border-field bg-white px-3 py-2 text-[0.92rem] text-charcoal-900 outline-none transition placeholder:text-charcoal-900/50 hover:border-field-hover focus:border-saffron-700 focus:ring-2 focus:ring-saffron-700 disabled:bg-charcoal-900/[0.04] read-only:bg-charcoal-900/[0.04]'

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid place-items-center py-16 text-charcoal-800/70" role="status">
      <Loader2 className="size-6 animate-spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-xl bg-white p-5 shadow-[0_1px_2px_rgb(20_33_61/0.06)] ring-1 ring-charcoal-900/[0.07]', className)}>{children}</div>
}

const PILL: Record<string, string> = {
  published: 'bg-success-soft text-success',
  scheduled: 'bg-info-soft text-info',
  draft: 'bg-warning-soft text-warning',
  new: 'bg-saffron-100 text-saffron-700',
  'in-progress': 'bg-info-soft text-info',
  resolved: 'bg-success-soft text-success',
  spam: 'bg-danger-soft text-danger',
  yes: 'bg-success-soft text-success',
  no: 'bg-charcoal-900/[0.05] text-charcoal-800/75',
}
export function Pill({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold', PILL[tone] ?? 'bg-charcoal-900/[0.07] text-charcoal-800')}>{children}</span>
}

export function PageHeading({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[1.9rem] leading-tight text-charcoal-900">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[0.92rem] text-charcoal-800/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-charcoal-900/20 bg-white/60 p-10 text-center text-charcoal-800/70">{children}</div>
}

/** A page that cannot be shown: unknown address, no permission, a failed load */
export function Unavailable({ title = 'Not available', children, retry }: { title?: string; children?: ReactNode; retry?: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-[1.7rem] text-charcoal-900">{title}</h1>
      {children && <p className="mt-2 text-charcoal-800/70">{children}</p>}
      <div className="mt-5 flex items-center justify-center gap-4">
        {retry && <Button onClick={retry}>Try again</Button>}
        <Link to="/admin" className="font-semibold text-saffron-700 underline underline-offset-4">Back to the dashboard</Link>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- modal */

/** A dialog: closes with Esc or a click outside, keeps keyboard focus inside while open, returns focus afterwards */
export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  const id = useId()
  const panel = useRef<HTMLDivElement>(null)
  // the latest onClose, without restarting the focus handling every time the parent renders
  const closeNow = useRef(onClose)
  useEffect(() => {
    closeNow.current = onClose
  })
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    const focusable = () => [...(panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])]
    ;(focusable()[0] ?? panel.current)?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeNow.current()
      } else if (e.key === 'Tab') {
        const items = focusable()
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <m.div className="fixed inset-0 z-[70] grid place-items-center bg-charcoal-950/60 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <m.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            tabIndex={-1}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className={cn('flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none', wide ? 'max-w-5xl' : 'max-w-lg')}
          >
            <div className="flex items-center justify-between gap-4 border-b border-charcoal-900/10 px-5 py-3.5">
              <h2 id={id} className="font-display text-[1.25rem] text-charcoal-900">{title}</h2>
              <IconButton label="Close" onClick={onClose}><X className="size-5" /></IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-charcoal-900/10 bg-charcoal-900/[0.02] px-5 py-3">{footer}</div>}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

/* ---------------------------------------------------------------- confirm */

type ConfirmOptions = { title: string; message: ReactNode; confirmLabel?: string; danger?: boolean }
type ConfirmFn = (o: ConfirmOptions) => Promise<boolean>
const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false))

/** `const confirm = useConfirm(); if (await confirm({ title, message })) …` */
export const useConfirm = () => useContext(ConfirmContext)

/* ---------------------------------------------------------------- toasts */

type Toast = { id: number; tone: 'success' | 'error' | 'info'; text: string }
type ToastFn = (text: string, tone?: Toast['tone']) => void
const ToastContext = createContext<ToastFn>(() => {})
export const useToast = () => useContext(ToastContext)

/** Toasts + confirm dialogs for everything inside the admin */
export function Feedback({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null)
  const counter = useRef(0)

  const toast = useCallback<ToastFn>((text, tone = 'success') => {
    const id = ++counter.current
    setToasts((t) => [...t, { id, tone, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 3500)
  }, [])

  const confirm = useCallback<ConfirmFn>((o) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })), [])
  const answer = (v: boolean) => {
    dialog?.resolve(v)
    setDialog(null)
  }
  const value = useMemo(() => toast, [toast])

  return (
    <ToastContext.Provider value={value}>
      <ConfirmContext.Provider value={confirm}>
        {children}
        <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
          <AnimatePresence>
            {toasts.map((t) => (
              <m.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 text-[0.9rem] font-medium shadow-lg',
                  t.tone === 'success' && 'bg-success text-white',
                  t.tone === 'error' && 'bg-danger text-white',
                  t.tone === 'info' && 'bg-white text-charcoal-900 ring-1 ring-charcoal-900/10',
                )}
                role={t.tone === 'error' ? 'alert' : 'status'}
              >
                {t.tone === 'success' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : t.tone === 'error' ? <AlertTriangle className="mt-0.5 size-4 shrink-0" /> : <Info className="mt-0.5 size-4 shrink-0" />}
                <span className="min-w-0">{t.text}</span>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
        <Modal
          open={Boolean(dialog)}
          onClose={() => answer(false)}
          title={dialog?.title ?? ''}
          footer={
            <>
              <Button onClick={() => answer(false)}>Cancel</Button>
              <Button variant={dialog?.danger ? 'danger' : 'primary'} onClick={() => answer(true)}>{dialog?.confirmLabel ?? 'Confirm'}</Button>
            </>
          }
        >
          <div className="text-[0.95rem] text-charcoal-800">{dialog?.message}</div>
        </Modal>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  )
}
