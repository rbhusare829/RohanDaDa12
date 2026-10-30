import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowUp, MessageCircle, X } from 'lucide-react'
import { Link } from 'react-router'
import { useLayout } from '@/lib/layout'
import { useTranslations } from '@/lib/i18n'
import { mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Img } from '../ui/Img'

/** back-to-top button + quick connect FAB (inspired by subhashdeshmukh.com) */
export function FloatingButtons() {
  const t = useTranslations('common')
  const [show, setShow] = useState(false)
  useEffect(() => {
    const f = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3">
      {/* Floating Quick Connect Button */}
      <Link
        to="/contact"
        aria-label="रोहनदादांशी संपर्क साधा"
        className="group relative flex items-center justify-center size-12 sm:size-13 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 text-white shadow-[0_8px_25px_rgba(234,88,12,0.45)] border-2 border-white transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-25 pointer-events-none" />
        <MessageCircle className="size-6 transition-transform duration-300 group-hover:rotate-12 relative z-10" />
        <span className="absolute right-full mr-3 whitespace-nowrap rounded-xl bg-[#000d3d] px-3.5 py-1.5 text-xs font-bold text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none border border-white/10">
          थेट संपर्क साधा
        </span>
      </Link>

      {/* Back to Top Button */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label={t('backToTop')}
        tabIndex={show ? 0 : -1}
        className={cn(
          'grid size-10 sm:size-11 place-items-center rounded-full bg-[#000d3d] text-white shadow-[0_6px_20px_rgba(0,13,61,0.35)] border border-white/20 transition-all duration-300 hover:bg-orange-600 hover:scale-105 active:scale-95',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={close}
              aria-label={t('close')}
              className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              <X className="size-4" />
            </button>
            {image && (
              <div className="relative aspect-[16/9] w-full">
                <Img media={popup.image} alt={popup.title ?? ''} fill className="object-cover" />
              </div>
            )}
            <div className="p-6">
              {popup.title && <h3 className="font-display text-xl font-bold text-[#000d3d]">{popup.title}</h3>}
              {popup.text && <p className="mt-2 text-sm leading-relaxed text-slate-600">{popup.text}</p>}
              {popup.linkLabel && popup.linkUrl && (
                <div className="mt-4">
                  <a
                    href={popup.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#000d3d]"
                  >
                    {popup.linkLabel}
                  </a>
                </div>
              )}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  )
}
