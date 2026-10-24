import { useCallback, useLayoutEffect, useRef, type ElementType, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const CURRENT = '[aria-current]:not([aria-current="false"]), [aria-selected="true"]'

/**
 * A row that scrolls sideways (filter chips, tabs). Instead of ending in a hard cut it shows a soft fade on the side where more is
 * waiting, and it keeps the current item (aria-current / aria-selected) in view — when it first shows and whenever the current item
 * changes. A row with room to spare — a wide screen, or `md:flex-wrap` — does not overflow, so it has no fade (and no mask that
 * could clip a focus ring).
 */
export function ScrollRow({ as: Tag = 'div', className, children, ...rest }: { as?: ElementType } & HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const room = el.scrollWidth - el.clientWidth
    const left = room > 1 && el.scrollLeft > 2
    const right = room > 1 && el.scrollLeft < room - 2
    el.style.setProperty('--fade-l', left ? '1' : '0')
    el.style.setProperty('--fade-r', right ? '1' : '0')
    el.toggleAttribute('data-fade', left || right)
  }, [])

  /** Scroll sideways so the current item sits centered in view */
  const reveal = useCallback((instant: boolean) => {
    const el = ref.current
    const here = el?.querySelector<HTMLElement>(CURRENT)
    if (!el || !here || el.scrollWidth <= el.clientWidth) return
    const item = here.getBoundingClientRect()
    const row = el.getBoundingClientRect()
    const left = el.scrollLeft + item.left - row.left - (el.clientWidth - item.width) / 2
    const calm = instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left, behavior: calm ? 'auto' : 'smooth' })
  }, [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    reveal(true)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    for (const child of el.children) ro.observe(child)
    const mo = new MutationObserver(() => reveal(false))
    mo.observe(el, { subtree: true, attributes: true, attributeFilter: ['aria-current', 'aria-selected'] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [reveal, update])

  return (
    <Tag ref={ref} onScroll={update} className={cn('no-scrollbar scroll-fade overflow-x-auto', className)} {...rest}>
      {children}
    </Tag>
  )
}
