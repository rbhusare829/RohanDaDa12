import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import { ScrollRow } from './ScrollRow'

export function Pagination({ page, totalPages, base, query = {} }: { page: number; totalPages: number; base: string; query?: Record<string, string | null | undefined> }) {
  if (totalPages <= 1) return null
  const href = (p: number) => {
    const q = new URLSearchParams(Object.entries({ ...query, page: p > 1 ? String(p) : undefined }).filter(([, v]) => v) as [string, string][])
    const s = q.toString()
    return `${base}${s ? `?${s}` : ''}`
  }
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 && <Link to={href(page - 1)} className="btn-icon size-11" aria-label="Previous"><ChevronLeft className="size-4" /></Link>}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-muted">…</span>}
          <Link to={href(p)} aria-current={p === page ? 'page' : undefined} className={cn('grid size-11 place-items-center rounded-xl border font-semibold transition-[color,background-color,border-color,scale] duration-200 active:scale-[0.94]', p === page ? 'border-btn bg-btn text-white' : 'border-field hover:border-field-hover hover:bg-cream')}>{p}</Link>
        </span>
      ))}
      {page < totalPages && <Link to={href(page + 1)} className="btn-icon size-11" aria-label="Next"><ChevronRight className="size-4" /></Link>}
    </nav>
  )
}

/** Category / playlist chips: one row that scrolls sideways (with a fade where more is waiting) on phones, wrapping on larger screens */
export function FilterChips({ items, active, base, param = 'category' }: { items: { label: string; value: string }[]; active?: string | null; base: string; param?: string }) {
  return (
    // the row's own padding keeps the focus ring from being clipped; the margins take that padding back so the spacing stays as it was
    <ScrollRow className="-mx-4 -mt-1.5 mb-[2.125rem] flex gap-2 px-4 py-1.5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
      {items.map((it) => {
        const on = (active ?? '') === it.value
        return (
          <Link key={it.value || 'all'} to={it.value ? `${base}?${param}=${encodeURIComponent(it.value)}` : base} aria-current={on ? 'true' : undefined}
            className={cn('inline-flex min-h-11 shrink-0 items-center rounded-xl border px-4 py-2 text-[0.95rem] font-medium transition-[color,background-color,border-color,scale] duration-200 active:scale-[0.96]', on ? 'border-btn bg-btn text-white' : 'border-field bg-white text-muted hover:border-field-hover hover:text-charcoal-900')}>
            {it.label}
          </Link>
        )
      })}
    </ScrollRow>
  )
}
