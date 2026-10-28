import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowUp, X } from 'lucide-react'
import { useLayout } from '@/lib/layout'
import { useTranslations } from '@/lib/i18n'
import { mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Img } from '../ui/Img'

/** back-to-top button (Supriya Sule circular style) */
export function FloatingButtons() {
  const t = useTranslations('common')
  const [show, setShow] = useState(false)
  useEffect(() => {
    const f = () => setShow(window.scrollY > 500)
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('backToTop')}
        tabIndex={show ? 0 : -1}
        className={cn(
          'grid size-10 sm:size-11 place-items-center rounded-full bg-[#000d3d] text-white shadow-[0_6px_20px_rgba(0,13,61,0.35)] border border-white/20 transition-all duration-300 hover:bg-saffron-600 hover:scale-105 active:scale-95',
          show ? 'translate-y-0 opacity-100 pointer-events-auto' : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <ArrowUp className="size-4 sm:size-5" />
      </button>
    </div>
  )
}

/** The optional announcement popup (Settings → Site popup): shown once per visit, within its start / end dates */
export function SitePopup() {
  const { popup } = useLayout()
  const t = useTranslations('common')
  const now = Date.now()
  const active = popup.enabled && (!popup.startDate || new Date(popup.startDate).getTime() <= now) && (!popup.endDate || new Date(popup.endDate).getTime() >= now)
  // a changed popup is shown again, to visitors who closed the previous one
  const key = String(popup.updatedAt ?? '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!active) return
    let seen = false
    try {
      seen = sessionStorage.getItem('rd-popup') === key
    } catch {
      /* storage blocked: show it */
    }
    if (seen) return
    const id = setTimeout(() => setOpen(true), (popup.delaySeconds ?? 2) * 1000)
    return () => clearTimeout(id)
  }, [active, key, popup.delaySeconds])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function close() {
    setOpen(false)
    try {
      sessionStorage.setItem('rd-popup', key)
    } catch {
      /* storage blocked */
    }
  }

  const image = mediaUrl(popup.image, 'card')
  return (
    <AnimatePresence>
      {active && open && (
        <m.div
          className="fixed inset-0 z-[80] grid place-items-center bg-charcoal-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={popup.title ?? undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <m.div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={close} aria-label={t('close')} className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/90 shadow" autoFocus>
              <X className="size-5" />
            </button>
            {image && (
              <div className="relative aspect-[4/3] w-full">
                <Img src={image} alt={popup.title ?? ''} fill className="object-cover" />
              </div>
            )}
            {(popup.title || popup.text || popup.linkUrl) && (
              <div className="p-6">
                {popup.title && <h2 className="font-display text-2xl text-charcoal-900">{popup.title}</h2>}
                {popup.text && <p className="mt-2 text-muted">{popup.text}</p>}
                {popup.linkUrl && (
                  <a href={popup.linkUrl} onClick={close} className="btn btn-primary mt-5">
                    {popup.linkLabel || '→'}
                  </a>
                )}
              </div>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
