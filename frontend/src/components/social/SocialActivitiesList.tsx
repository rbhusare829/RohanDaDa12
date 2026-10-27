import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTIVITIES, num, type Text } from '@/lib/social-activities'
import { AccentBar, Reveal } from '@/components/ui/Motion'

/**
 * A link to one activity (/social-activities#yuva-sahitya-sammelan, from the homepage cards) lands on it. The browser's own jump can
 * come before the photos above it have their height, so the page aims again once they have settled — unless the visitor has
 * started scrolling by then.
 */
function useHashTarget() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return
    let moved = false
    const stop = () => (moved = true)
    const go = () => !moved && document.getElementById(id)?.scrollIntoView({ block: 'start' })
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchstart', stop, { passive: true, once: true })
    const raf = requestAnimationFrame(go)
    const timers = [250, 700].map((ms) => window.setTimeout(go, ms))
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
    }
  }, [hash, pathname])
}

/**
 * The four social activities in full (Oct 2026) — the "सामाजिक उपक्रम / Social Activities" tab of the Political Career page.
 * Links to the four activities first, then each activity in the homepage's colours: the whole photo (never cropped) on one side,
 * and on the other the navy title with the red and saffron bars, the tagline, the story and the key
 * facts on light-blue tiles. Photo and words swap sides from one activity to the next on wide screens; on phones the photo comes
 * first. A link with #<activity> (the homepage cards) lands on that activity.
 */
export function SocialActivitiesList({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const isMr = locale !== 'en'
  const t = (x: Text) => (isMr ? x.mr : x.en)
  const { search } = useLocation()
  useHashTarget()

  return (
    <>
      {/* the four activities, to jump to */}
      <nav aria-label={isMr ? 'उपक्रम' : 'Activities'} className="mb-14 sm:mb-16">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIVITIES.map((a, i) => (
            <li key={a.id}>
              <Link
                to={{ search, hash: a.id }}
                className="group flex h-full items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400 hover:shadow-md"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-sm font-extrabold tabular-nums text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                  {num(i, isMr)}
                </span>
                <span className="min-w-0 flex-1 font-display text-sm font-bold leading-snug text-[#000d3d] group-hover:text-red-600">{t(a.title)}</span>
                <ArrowDown aria-hidden className="size-4 shrink-0 text-red-600 transition-transform group-hover:translate-y-0.5" />
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-16 sm:space-y-24">
        {ACTIVITIES.map((a, i) => {
          const flip = i % 2 === 1
          return (
            <article key={a.id} id={a.id} aria-labelledby={`${a.id}-title`} className="scroll-mt-8">
              <Reveal className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
                {/* the whole photo: shown in full, a soft blurred copy of it filling any space around it */}
                <div className={cn('lg:sticky lg:top-28 lg:col-span-5', flip && 'lg:order-2')}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-[#000d3d] shadow-sm">
                    <img src={a.image} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-xl" />
                    <img src={a.image} alt={t(a.title)} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" className="relative size-full object-contain" />
                  </div>
                </div>

                {/* the words */}
                <div className={cn('lg:col-span-7', flip && 'lg:order-1')}>
                  <h2 id={`${a.id}-title`} className="font-display text-2xl font-bold leading-tight tracking-tight text-[#000d3d] sm:text-3xl lg:text-4xl">
                    {t(a.title)}
                  </h2>
                  <AccentBar className="mt-2.5 mb-5" />
                  <p className="font-display text-lg font-bold text-slate-800">{t(a.tagline)}</p>
                  <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                    {(isMr ? a.body.mr : a.body.en).map((p, k) => (
                      <p key={k}>{p}</p>
                    ))}
                  </div>
                  <dl className="mt-7 grid gap-3 sm:grid-cols-2">
                    {a.facts.map((f, k) => (
                      <div key={k} className="rounded-xl border border-stone-200 bg-[#f0f6fc] p-4">
                        <dt className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">{t(f.label)}</dt>
                        <dd className="mt-1 text-sm font-semibold leading-snug text-[#000d3d]">{t(f.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
              {i < ACTIVITIES.length - 1 && <div aria-hidden className="mt-16 h-px bg-stone-200 sm:mt-24" />}
            </article>
          )
        })}
      </div>
    </>
  )
}
