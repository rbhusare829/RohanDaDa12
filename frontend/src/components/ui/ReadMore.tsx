import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** phones only — on tablets and desktops the text is always shown in full */
const PHONE = '(max-width: 767.98px)'
/** height of the short version: about six lines of body text */
const SHORT = 168
/** a paragraph only gets the button when the hidden part is worth it (more than ~2 lines) */
const SLACK = 48

const matches = () => typeof window !== 'undefined' && window.matchMedia(PHONE).matches

/**
 * On phones, long text starts as its first few lines (fading out at the bottom) with a "Read more" button that opens the rest smoothly
 * ("Read less" closes it again). Short text, and every text on a tablet or desktop, is shown as it is — no button (Oct 2026).
 */
export function ReadMore({ children, className }: { children: ReactNode; className?: string }) {
  const t = useTranslations('common')
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const [phone, setPhone] = useState(matches)
  const [full, setFull] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(PHONE)
    const update = () => setPhone(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // the text's full height, measured before the first paint (no flash of the long version) and again whenever the width changes
  useLayoutEffect(() => {
    const el = box.current
    const inner = el?.firstElementChild
    if (!el || !inner) return
    const measure = () => setFull(inner.getBoundingClientRect().height)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(inner)
    return () => ro.disconnect()
  }, [])

  const clamp = phone && full > SHORT + SLACK

  const toggle = () => {
    setOpen((o) => !o)
    // closing a long text: bring its start back into view if the reader had scrolled past it
    if (open && box.current) {
      const top = box.current.getBoundingClientRect().top
      if (top < 80) window.scrollBy({ top: top - 96, behavior: 'smooth' })
    }
  }

  return (
    <div className={className}>
      <div
        id={id}
        ref={box}
        style={clamp ? { maxHeight: open ? full : SHORT } : undefined}
        className={cn(
          clamp && 'overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
          clamp && !open && '[mask-image:linear-gradient(to_bottom,#000_55%,transparent)]',
        )}
      >
        <div>{children}</div>
      </div>
      {clamp && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={toggle}
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-bold text-saffron-700 transition-colors hover:text-saffron-800"
        >
          {open ? t('readLess') : t('readMore')}
          <ChevronDown aria-hidden className={cn('size-4 transition-transform duration-300', open && 'rotate-180')} />
        </button>
      )}
    </div>
  )
}
