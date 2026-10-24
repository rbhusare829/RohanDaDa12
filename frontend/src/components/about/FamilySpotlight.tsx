import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Img } from '@/components/ui/Img'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SpotlightMember = { key: string; name: string; title: string; relation: string; thumb?: string | null; initials: string }

/**
 * Family "spotlight": a row of member chips; the chosen member's story shows in one large card below.
 * Every story is in the HTML (search engines, no-JS); the others are just hidden.
 */
export function FamilySpotlight({ members, panels, labels }: { members: SpotlightMember[]; panels: { media: ReactNode; body: ReactNode }[]; labels: { list: string; prev: string; next: string } }) {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const count = members.length

  const go = (i: number, focus = false) => {
    const next = (i + count) % count
    setActive(next)
    if (focus) tabs.current[next]?.focus()
  }

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (step) {
      e.preventDefault()
      go(active + step, true)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      go(e.key === 'Home' ? 0 : count - 1, true)
    }
  }

  return (
    <div>
      <div role="tablist" aria-label={labels.list} onKeyDown={onKey} className="flex flex-wrap gap-3">
        {members.map((m, i) => {
          const on = i === active
          return (
            <button
              key={m.key}
              ref={(el) => {
                tabs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`fam-tab-${m.key}`}
              aria-selected={on}
              aria-controls={`fam-panel-${m.key}`}
              tabIndex={on ? 0 : -1}
              onClick={() => go(i)}
              className={cn(
                'flex min-w-0 max-w-full items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-5 text-left transition',
                on ? 'border-btn bg-btn text-white' : 'border-field bg-white text-charcoal-900 hover:border-field-hover hover:bg-cream',
              )}
            >
              <span className={cn('relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-semibold', on ? 'bg-white/25 text-white' : 'bg-cream text-saffron-700')}>
                {m.thumb ? <Img src={m.thumb} alt="" fill className="object-cover object-top" /> : m.initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.95rem] font-semibold leading-snug">{m.name}</span>
                <span className={cn('block text-sm leading-snug', on ? 'text-white' : 'text-muted')}>{m.relation}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-10 border-t border-line pt-10 md:mt-12 md:pt-12">
        {members.map((m, i) => (
          <div
            key={m.key}
            role="tabpanel"
            id={`fam-panel-${m.key}`}
            aria-labelledby={`fam-tab-${m.key}`}
            hidden={i !== active}
            className={cn(i === active && 'animate-fade-up')}
          >
            <div className="grid items-start gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-14">
              {panels[i]?.media}
              <div className="min-w-0 md:py-2">
                <p className="eyebrow">{m.relation}</p>
                <h3 className="mt-2 text-[1.7rem] leading-snug text-charcoal-900 md:text-[2.2rem]">{m.title}</h3>
                <div className="mt-4">{panels[i]?.body}</div>
                {count > 1 && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button type="button" onClick={() => go(active - 1)} className="btn px-5 py-2">
                      <ArrowLeft className="size-4" /> {labels.prev}
                    </button>
                    <button type="button" onClick={() => go(active + 1)} className="btn px-5 py-2">
                      {labels.next} <ArrowRight className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
