import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Stagger, StaggerItem } from '../ui/Motion'
import { cn } from '@/lib/utils'
import { ACTIVITIES, SOCIAL_ACTIVITIES_PATH, num, type Text } from '@/lib/social-activities'

/**
 * Social Activities (Supriya Sule layout, Oct 2026), below Key Focus Areas: the centred header used across the homepage
 * (red label, navy title, red and saffron bars), then the four activities as photo cards in a mosaic — the first one large,
 * two small, one wide — with the number, title and tagline over a navy fade. Tablets show two columns; phones one row to swipe
 * through. Each card opens that activity on the Social Activities page (/social-activities#…), where its full story and key facts are;
 * "सर्व सामाजिक उपक्रम / All social activities" under the cards opens the page at the top.
 */
export function SupriyaSocialActivitiesSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const isMr = locale !== 'en'
  const t = (x: Text) => (isMr ? x.mr : x.en)
  const mosaic = ['lg:col-span-2 lg:row-span-2', '', '', 'lg:col-span-2']

  return (
    <section className="bg-white border-t border-stone-200 py-16 sm:py-24" aria-labelledby="social-activities-title">
      <div className="container-x">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-600">
            {isMr ? 'सामाजिक उपक्रम' : 'Social Activities'}
          </span>
          <h2 id="social-activities-title" className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#000d3d]">
            {isMr ? 'लोकांशी थेट नात्यावर उभे नेतृत्व' : 'Leadership built on a direct bond with people'}
          </h2>
          <div className="mt-2.5 mb-4 flex justify-center items-center gap-1.5">
            <span className="h-1 w-14 rounded-full bg-red-600" />
            <span className="h-1 w-3 rounded-full bg-saffron-500" />
          </div>
          <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
            {isMr
              ? 'तरुणांच्या कल्पना, गावातील उद्योजक, विद्यार्थ्यांची प्रतिभा आणि नवे लेखक — समाजातील प्रत्येक घटकाला संधी देणारे उपक्रम.'
              : 'Young ideas, village entrepreneurs, student talent and new writers — activities that open doors for every part of society.'}
          </p>
        </div>

        <Stagger
          as="ol"
          className="-mx-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(16rem,1fr))]"
        >
          {ACTIVITIES.map((a, i) => {
            const big = i === 0
            return (
              <StaggerItem as="li" key={a.id} className={cn('w-[82%] shrink-0 snap-start sm:w-auto', mosaic[i])}>
                <Link
                  to={`${SOCIAL_ACTIVITIES_PATH}#${a.id}`}
                  className="group relative isolate flex h-full min-h-[22rem] w-full flex-col justify-end overflow-hidden rounded-2xl bg-[#000d3d] text-left text-white shadow-sm ring-1 ring-stone-200/60 transition-shadow duration-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/60 sm:min-h-[19rem] lg:min-h-0"
                >
                  <img
                    src={a.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
                    style={{ objectPosition: a.position }}
                  />
                  {/* navy fade (the homepage colour) so the words read on any photo */}
                  <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#000d3d] via-[#000d3d]/45 to-transparent" />
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-red-600 to-saffron-500 transition-transform duration-500 group-hover:scale-x-100" />
                  <div className={cn('p-5 sm:p-6', big && 'lg:p-9')}>
                    <p className="mb-3 flex items-center gap-2.5 text-xs font-extrabold tabular-nums tracking-[0.2em] text-saffron-400">
                      {num(i, isMr)}
                      <span aria-hidden className="h-0.5 w-8 rounded-full bg-red-500 transition-all duration-500 group-hover:w-12" />
                    </p>
                    <h3 className={cn('font-display font-bold leading-tight text-white', big ? 'text-2xl lg:text-[2.1rem]' : 'text-xl')}>{t(a.title)}</h3>
                    <p className={cn('mt-2 leading-relaxed text-white/80', big ? 'text-[0.95rem] lg:text-lg' : 'text-sm')}>{t(a.tagline)}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
                      <span className="border-b border-white/40 pb-0.5 transition-colors group-hover:border-saffron-400 group-hover:text-saffron-300">
                        {isMr ? 'अधिक वाचा' : 'Read more'}
                      </span>
                      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-saffron-300" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            to={SOCIAL_ACTIVITIES_PATH}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#000d3d]"
          >
            {isMr ? 'सर्व सामाजिक उपक्रम' : 'All social activities'} <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
