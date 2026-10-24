import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FaqAccordion({ items, columns = 1 }: { items: { q: string; a: React.ReactNode }[]; columns?: 1 | 2 }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    /* open question list: thin rules between questions, no boxes */
    <div className={cn('grid border-t border-line', columns === 2 && 'lg:grid-cols-2 lg:items-start lg:gap-x-12')}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i} className="border-b border-line">
            <h3 className="font-sans">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="group flex w-full items-start gap-4 py-5 text-left md:py-6">
                <span className="font-display text-lg text-saffron-600">{String(i + 1).padStart(2, '0')}</span>
                <span className={cn('flex-1 text-[1.15rem] leading-snug transition-colors group-hover:text-saffron-700', isOpen ? 'text-saffron-700' : 'text-charcoal-900')}>{it.q}</span>
                <Plus className={cn('mt-1 size-5 shrink-0 text-saffron-600 transition-transform', isOpen && 'rotate-45')} />
              </button>
            </h3>
            <div className={cn('grid transition-[grid-template-rows] duration-300', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <div className="pb-6 pl-[2.6rem] pr-8 leading-relaxed text-muted">{it.a}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
