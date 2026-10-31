import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHashTarget } from '@/lib/use-hash-target'
import { ACTIVITIES, type Activity, type Text } from '@/lib/social-activities'
import { m } from 'motion/react'
import { draw, group, inView, photo, rise } from '@/lib/scroll-motion'

/** activities shown on a white band (the rest sit on the page's own background) */
const WHITE = new Set(['chhota-udyojak-motha-udyojak', 'yuva-sahitya-sammelan', 'rural-sports-competitions'])

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
      {/* no cards (Oct 2026): each activity sits straight on the page, a thin line between one and the next.
          Phones: title → photo → words. Wide screens: the photo on one side (swapping from one activity to the next), title and words on the other. */}
      <div className="divide-y divide-stone-200">
        {list.map((a, i) => {
          const flip = i % 2 === 1
          return (
            <article
              key={a.id}
              id={a.id}
              aria-labelledby={`${a.id}-title`}
              className={cn(
                'scroll-mt-28 py-8 first:pt-0 last:pb-0 sm:py-12',
                // a white band across the full width of the page behind this activity
                WHITE.has(a.id) && 'bg-white shadow-[0_0_0_100vmax_#fff] [clip-path:inset(0_-100vmax)] last:-mb-10 last:pb-18 sm:last:-mb-20 sm:last:pb-32 md:last:-mb-28 md:last:pb-40', // the last one runs on to the footer (no cream strip under it)
              )}
            >
              <m.div {...inView} variants={group} className="grid grid-cols-1 items-start gap-x-12 gap-y-5 lg:grid-cols-12 lg:gap-y-0">
                {/* the title (first on phones) */}
                <m.div variants={group} className={cn('lg:col-span-7 lg:row-start-1', flip ? 'lg:col-start-1' : 'lg:col-start-6')}>
                  <m.h2 variants={rise} id={`${a.id}-title`} className="font-display text-2xl font-bold leading-tight tracking-tight text-[#000d3d] sm:text-3xl lg:text-4xl">
                    {t(a.title)}
                  </m.h2>
                  <m.div variants={draw} className="mt-2.5 flex origin-left items-center gap-1.5 lg:mb-5">
                    <span className="h-1 w-14 rounded-full bg-red-600" />
                    <span className="h-1 w-3 rounded-full bg-saffron-500" />
                  </m.div>
                </m.div>

                {/* the whole photo: shown in full, a soft blurred copy of it filling any space around it */}
                <m.div variants={photo(flip)} className={cn('lg:sticky lg:top-28 lg:col-span-5 lg:row-span-2 lg:row-start-1', flip ? 'lg:col-start-8' : 'lg:col-start-1')}>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#000d3d] shadow-[0_10px_28px_-12px_rgba(0,13,61,0.35)] transition-shadow duration-500 hover:shadow-[0_18px_40px_-14px_rgba(0,13,61,0.45)]">
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

                {/* the words: tagline, story, key facts on light-blue boxes */}
                <m.div variants={group} className={cn('lg:col-span-7 lg:row-start-2', flip ? 'lg:col-start-1' : 'lg:col-start-6')}>
                  <m.p variants={rise} className="font-display text-lg font-bold text-slate-800">{t(a.tagline)}</m.p>
                  <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-700 sm:text-base">
                    {(isMr ? a.body.mr : a.body.en).map((p, k) => (
                      <m.p key={k} variants={rise}>{p}</m.p>
                    ))}
                  </div>
                  {a.facts.length > 0 && (
                    <m.dl variants={group} className="mt-6 grid gap-3 sm:grid-cols-2">
                      {a.facts.map((f, k) => (
                        <m.div key={k} variants={rise} className="rounded-xl border border-stone-200 bg-[#f0f6fc] p-4 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md">
                          <dt className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">{t(f.label)}</dt>
                          <dd className="mt-1 text-sm font-semibold leading-snug text-[#000d3d]">{t(f.value)}</dd>
                        </m.div>
                      ))}
                    </m.dl>
                  )}
                </m.div>
              </m.div>
            </article>
          )
        })}
      </div>
    </>
  )
}
