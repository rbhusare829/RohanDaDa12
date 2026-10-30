import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabId = 'intro' | 'family'

/**
 * The परिचय page's two tabs (Oct 2026) — परिचय / Introduction and कौटुंबिक पार्श्वभूमी / Family Background — on the same page, in the same
 * light-blue pill bar as the Political Career page (the open tab in red with white words), centred in its own band above the content.
 * The open tab is in the address (?tab=family), so it can be linked to and survives a refresh; the old Family Background address
 * (/about/biography) comes here with that tab open. Arrow keys move between the tabs.
 */
export function AboutTabs({ intro, family, locale = 'mr' }: { intro: ReactNode; family: ReactNode; locale?: 'mr' | 'en' }) {
  const isMr = locale !== 'en'
  const [params, setParams] = useSearchParams()
  const active: TabId = params.get('tab') === 'family' ? 'family' : 'intro'
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ intro: null, family: null })

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: 'intro', label: isMr ? 'परिचय' : 'Introduction', icon: User },
    { id: 'family', label: isMr ? 'कौटुंबिक पार्श्वभूमी' : 'Family Background', icon: Users },
  ]

  const open = (id: TabId) => {
    if (id === active) return
    const next = new URLSearchParams(params)
    if (id === 'family') next.set('tab', 'family')
    else next.delete('tab')
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const onKey = (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const i = tabs.findIndex((t) => t.id === active)
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    open(tabs[j].id)
    refs.current[tabs[j].id]?.focus()
  }

  return (
    <>
      <div className="container-x flex justify-center py-6 sm:py-8">
        <div
          role="tablist"
          aria-label={isMr ? 'परिचय व कौटुंबिक पार्श्वभूमी' : 'Introduction and family background'}
          onKeyDown={onKey}
          className="grid w-full max-w-md grid-cols-2 gap-1.5 rounded-full bg-[#f0f6fc] p-1.5 shadow-sm ring-1 ring-stone-200 sm:inline-flex sm:w-auto sm:max-w-none"
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const selected = id === active
            return (
              <button
                key={id}
                ref={(el) => {
                  refs.current[id] = el
                }}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={selected}
                aria-controls={`panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => open(id)}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-3 text-[13px] font-bold transition-all duration-300 sm:gap-2 sm:px-7 sm:text-base',
                  selected ? 'bg-red-600 text-white shadow-md' : 'text-[#000d3d] hover:bg-white hover:text-red-600',
                )}
              >
                <Icon aria-hidden className="size-4.5 shrink-0" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} tabIndex={0} className="focus:outline-none">
        {active === 'intro' ? intro : <div className="container-x pb-12 pt-2 sm:pb-20 md:pb-28">{family}</div>}
      </div>
    </>
  )
}
