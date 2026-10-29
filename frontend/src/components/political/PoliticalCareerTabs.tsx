import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { HandHeart, Landmark } from 'lucide-react'
import type { Event } from '@/types/cms'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/media'
import type { Activity } from '@/lib/social-activities'
import { SocialActivitiesList } from '@/components/social/SocialActivitiesList'

type TabId = 'career' | 'social'

/** photos for events that have no cover photo in the admin yet, by event address */
const EVENT_PHOTOS: Record<string, string> = {
  'rural-sports-competitions': '/images/social-activities/rural-sports-competitions.webp', // CM Cup (मुख्यमंत्री चषक) sports, Rohan with the players
  'international-womens-lawn-tennis-tournament': '/images/social-activities/international-womens-lawn-tennis-tournament.webp', // tournament artwork
}

/** an event (in the visitor's language, from the admin) as one more activity, shown in the same design as the four */
const toActivity = (e: Event): Activity => {
  const same = (x?: string | null) => ({ mr: x ?? '', en: x ?? '' })
  const paras = (e.body || e.description || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return {
    id: e.slug,
    image: mediaUrl(e.coverImage, 'card') ?? EVENT_PHOTOS[e.slug] ?? '',
    // the sports photos fill their frame edge to edge (no blurred border)
    fill: e.slug in EVENT_PHOTOS,
    title: same(e.title),
    tagline: same(e.tagline || e.description),
    body: { mr: paras, en: paras },
    facts: (e.facts ?? []).map((f) => ({ label: same(f.label), value: same(f.value) })),
  }
}

/**
 * Political Career page (Oct 2026): two tabs in the homepage's colours — a light-blue pill bar, the open tab in red with white
 * text, the other in navy (red on hover) — "राजकीय कारकीर्द / Political Career" (the page's own
 * content, from the admin) and "सामाजिक उपक्रम / Social Activities" (the four activities). The open tab is in the address
 * (?tab=social), so it can be linked to and survives a refresh; the homepage's Social Activities cards open the second tab at their
 * activity (/political-career?tab=social#…). Arrow keys move between the tabs.
 */
export function PoliticalCareerTabs({ career, sportsEvents = [], locale = 'mr' }: { career: ReactNode; sportsEvents?: Event[]; locale?: 'mr' | 'en' }) {
  const isMr = locale !== 'en'
  const [params, setParams] = useSearchParams()
  const active: TabId = params.get('tab') === 'social' ? 'social' : 'career'
  const refs = useRef<Record<TabId, HTMLButtonElement | null>>({ career: null, social: null })

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
          role="tablist"
          aria-label={isMr ? 'राजकीय कारकीर्द व सामाजिक उपक्रम' : 'Political career and social activities'}
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
                  selected
                    ? 'bg-red-600 text-white shadow-md'
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

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} tabIndex={0} className="focus:outline-none">
        {active === 'career' ? (
          career
        ) : (
          // the four activities, then the Lokmangal Sports events in the same design (moved from the Lokmangal Foundation page, Oct 2026)
          <SocialActivitiesList locale={locale} extra={sportsEvents.map(toActivity)} />
        )}
      </div>
    </>
  )
}
