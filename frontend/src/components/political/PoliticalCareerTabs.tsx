import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { HandHeart, Landmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SocialActivitiesList } from '@/components/social/SocialActivitiesList'

type TabId = 'career' | 'social'

/**
 * Political Career page (Oct 2026): two tabs in the homepage's colours — a light-blue pill bar, the open tab in red with white
 * text, the other in navy (red on hover) — "राजकीय कारकीर्द / Political Career" (the page's own
 * content, from the admin) and "सामाजिक उपक्रम / Social Activities" (the four activities). The open tab is in the address
 * (?tab=social), so it can be linked to and survives a refresh; the homepage's Social Activities cards open the second tab at their
 * activity (/political-career?tab=social#…). Arrow keys move between the tabs.
 */
export function PoliticalCareerTabs({ career, locale = 'mr' }: { career: ReactNode; locale?: 'mr' | 'en' }) {
  const isMr = locale !== 'en'
  const [params, setParams] = useSearchParams()
  const active: TabId = params.get('tab') === 'social' ? 'social' : 'career'
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ career: null, social: null })
  // the red pill slides from one tab to the other (it follows the open tab's position and width, also when the window is resized)
  const bar = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)
  useLayoutEffect(() => {
    const el = refs.current[active]
    const box = bar.current
    if (!el || !box) return
    const measure = () => setPill({ x: el.offsetLeft, w: el.offsetWidth })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    ro.observe(el)
    return () => ro.disconnect()
  }, [active, locale])

  const tabs: { id: TabId; label: string; icon: typeof Landmark }[] = [
    { id: 'career', label: isMr ? 'राजकीय कारकीर्द' : 'Political Career', icon: Landmark },
    { id: 'social', label: isMr ? 'सामाजिक उपक्रम' : 'Social Activities', icon: HandHeart },
  ]

  const open = (id: TabId) => {
    if (id === active) return
    const next = new URLSearchParams(params)
    if (id === 'social') next.set('tab', 'social')
    else next.delete('tab')
    setParams(next, { preventScrollReset: true })
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const i = tabs.findIndex((t) => t.id === active)
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    open(tabs[j].id)
    refs.current[tabs[j].id]?.focus()
  }

  return (
    <>
      <div className="mb-12 flex justify-center sm:mb-14">
        <div
          ref={bar}
          role="tablist"
          aria-label={isMr ? 'राजकीय कारकीर्द व सामाजिक उपक्रम' : 'Political career and social activities'}
          onKeyDown={onKey}
          className="relative grid w-full max-w-md grid-cols-2 gap-1.5 rounded-full bg-[#f0f6fc] p-1.5 shadow-sm ring-1 ring-stone-200 sm:inline-flex sm:w-auto sm:max-w-none"
        >
          {pill && (
            <span
              aria-hidden
              className="absolute inset-y-1.5 left-0 rounded-full bg-red-600 shadow-md transition-[transform,width] duration-300 ease-soft motion-reduce:transition-none"
              style={{ width: pill.w, transform: `translateX(${pill.x}px)` }}
            />
          )}
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
                  'relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-3 text-[13px] font-bold transition-[color,background-color] duration-300 sm:gap-2 sm:px-7 sm:text-base',
                  selected
                    ? cn('text-white', !pill && 'bg-red-600') // until the sliding pill has measured itself, the tab carries its own red
                    : 'text-[#000d3d] hover:bg-white hover:text-red-600',
                )}
              >
                <Icon aria-hidden className="size-4.5 shrink-0" />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div key={active} role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} tabIndex={0} className="animate-tab-in rounded-2xl">
        {active === 'career' ? career : <SocialActivitiesList locale={locale} />}
      </div>
    </>
  )
}
