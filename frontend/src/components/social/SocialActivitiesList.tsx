import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTIVITIES, type Activity, type Text } from '@/lib/social-activities'
import { m, type Variants } from 'motion/react'

/* Scroll-in animations (Oct 2026), once per activity; <MotionConfig reducedMotion="user"> (RootLayout) keeps them still for visitors
   who ask their device for reduced motion. The photo slides in from its own side, the words rise one after another, the red-and-saffron
   bar draws itself, and the fact tiles pop in in turn. */
const EASE = [0.22, 1, 0.36, 1] as const
const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }
const draw: Variants = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, ease: EASE } } }
const pop: Variants = { hidden: { opacity: 0, y: 12, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } } }
const photo = (fromRight: boolean): Variants => ({
  hidden: { opacity: 0, x: fromRight ? 48 : -48, scale: 0.96 },
  show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.75, ease: EASE } },
})
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.2 } } as const

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
 * Each activity in the homepage's colours: the whole photo (never cropped) on one side,
 * and on the other the navy title with the red and saffron bars, the tagline, the story and the key
 * facts on light-blue tiles. Photo and words swap sides from one activity to the next on wide screens; on phones the photo comes
 * first. A link with #<activity> (the homepage cards) lands on that activity.
 * `extra`: more activities in the same design after the four (the Lokmangal Sports events, Oct 2026).
 */
export function SocialActivitiesList({ locale = 'mr', extra = [] }: { locale?: 'mr' | 'en'; extra?: Activity[] }) {
  const isMr = locale !== 'en'
  const t = (x: Text) => (isMr ? x.mr : x.en)
  useHashTarget()
  const list = [...ACTIVITIES, ...extra]

  return (
    <>
      {/* each activity is its own card — white and light blue in turn, a red-to-saffron strip on top — so one never runs into the next */}
      <div className="space-y-8 sm:space-y-12">
        {list.map((a, i) => {
          const flip = i % 2 === 1
          const tinted = i % 2 === 1
          return (
            <article
              key={a.id}
              id={a.id}
              aria-labelledby={`${a.id}-title`}
              className={cn(
                'relative scroll-mt-28 overflow-clip rounded-3xl border border-stone-200/90 shadow-[0_18px_45px_-28px_rgba(0,13,61,0.35)]',
                tinted ? 'bg-[#f0f6fc]' : 'bg-white',
              )}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-saffron-500" />
              <m.div {...inView} variants={group} className="grid grid-cols-1 items-start gap-6 p-5 pt-7 sm:gap-8 sm:p-8 sm:pt-10 lg:grid-cols-12 lg:gap-12 lg:p-10 lg:pt-12">
                {/* the whole photo: shown in full, a soft blurred copy of it filling any space around it */}
                <m.div variants={photo(flip)} className={cn('lg:sticky lg:top-28 lg:col-span-5', flip && 'lg:order-2')}>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-[#000d3d] shadow-sm transition-shadow duration-500 hover:shadow-xl">
                    {a.image ? (
                      <>
                        {!a.fill && <img src={a.image} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-xl" />}
                        {/* `fill`: the photo edge to edge, no blurred border */}
                        <img
                          src={a.image}
                          alt={t(a.title)}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          className={cn('relative size-full transition-transform duration-700 ease-out group-hover:scale-105', a.fill ? 'object-cover' : 'object-contain')}
                          style={a.fill && a.position ? { objectPosition: a.position } : undefined}
                        />
                      </>
                    ) : (
                      // no photo yet: the title on the navy panel
                      <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center">
                        <Trophy aria-hidden className="size-12 text-saffron-400" />
                        <span className="font-display text-xl font-bold text-white">{t(a.title)}</span>
                      </div>
                    )}
                  </div>
                </m.div>

                {/* the words */}
                <m.div variants={group} className={cn('lg:col-span-7', flip && 'lg:order-1')}>
                  <m.h2 variants={rise} id={`${a.id}-title`} className="font-display text-2xl font-bold leading-tight tracking-tight text-[#000d3d] sm:text-3xl lg:text-4xl">
                    {t(a.title)}
                  </m.h2>
                  <m.div variants={draw} className="mt-2.5 mb-5 flex origin-left items-center gap-1.5">
                    <span className="h-1 w-14 rounded-full bg-red-600" />
                    <span className="h-1 w-3 rounded-full bg-saffron-500" />
                  </m.div>
                  <m.p variants={rise} className="font-display text-lg font-bold text-slate-800">{t(a.tagline)}</m.p>
                  <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                    {(isMr ? a.body.mr : a.body.en).map((p, k) => (
                      <m.p key={k} variants={rise}>{p}</m.p>
                    ))}
                  </div>
                  <m.dl variants={group} className="mt-7 grid gap-3 sm:grid-cols-2">
                    {a.facts.map((f, k) => (
                      <m.div key={k} variants={pop} className={cn('rounded-xl border border-stone-200 p-4', tinted ? 'bg-white' : 'bg-[#f0f6fc]', 'transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md')}>
                        <dt className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">{t(f.label)}</dt>
                        <dd className="mt-1 text-sm font-semibold leading-snug text-[#000d3d]">{t(f.value)}</dd>
                      </m.div>
                    ))}
                  </m.dl>
                </m.div>
              </m.div>
            </article>
          )
        })}
      </div>
    </>
  )
}
