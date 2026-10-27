import { ArrowRight } from 'lucide-react'
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { cms } from '@/lib/api'
import { INITIATIVE_CATEGORIES, categoryLabel } from '@/lib/categories'
import { LOCALE, useTranslations } from '@/lib/i18n'
import { mediaAlt, photoFit } from '@/lib/media'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { CountUp } from '@/components/ui/CountUp'
import { Img } from '@/components/ui/Img'
import { FilterChips } from '@/components/ui/Pagination'
import { searchOf } from './helpers'

export async function loader({ request }: LoaderFunctionArgs) {
  const category = searchOf(request).get('category')
  const docs = (await cms.find('initiatives', { limit: 200, depth: 1, sort: 'order' })).docs
  return { docs, category }
}

export default function SocialWorkPage() {
  const { docs, category } = useLoaderData<typeof loader>()
  const t = useTranslations('pages')
  const tc = useTranslations('common')
  const locale = LOCALE
  const used = INITIATIVE_CATEGORIES.filter((c) => docs.some((d) => d.category === c.value))
  const groups = used.filter((c) => !category || c.value === category).map((c) => ({ ...c, items: docs.filter((d) => d.category === c.value) }))
  const subtitle = locale === 'mr' ? 'लोकमंगल फाऊंडेशनच्या माध्यमातून राबविलेले उपक्रम — विभागानुसार' : 'Initiatives run through Lokmangal Foundation — by category'

  return (
    <>
      <Seo title={t('socialWork')} />
      <InnerPage path="/social-work" title={t('socialWork')} subtitle={subtitle} variant="navy">
        <FilterChips base="/social-work" active={category} items={[{ label: tc('all'), value: '' }, ...used.map((c) => ({ label: categoryLabel(c.value, locale), value: c.value }))]} />
        <div className="space-y-10 sm:space-y-20">
          {groups.map((g) => (
            <section key={g.value} aria-labelledby={`cat-${g.value}`}>
              <div className="mb-8 flex items-center gap-4">
                <h2 id={`cat-${g.value}`} className="text-[1.6rem] leading-tight text-charcoal-900 md:text-[2rem]">{categoryLabel(g.value, locale)}</h2>
                <span className="h-px flex-1 bg-line" />
                <span className="text-sm text-muted">{g.items.length}</span>
              </div>
              <div className="grid gap-x-7 gap-y-8 sm:gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((it) => (
                  <Link key={it.id} to={`/social-work/${it.slug}`} className="tile group">
                    <div className="tile-media aspect-[16/10]">
                      <Img media={it.heroImage} variant="card" alt={mediaAlt(it.heroImage, it.title)} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" style={photoFit(it.heroImage, 1.6, 0.6)} />
                      {it.counters?.[0] && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-charcoal-900/90 px-3 py-1 text-sm text-white backdrop-blur">
                          <b className="text-saffron-300"><CountUp value={it.counters[0].value} /></b> {it.counters[0].label}
                        </span>
                      )}
                    </div>
                    <div className="tile-body">
                      <h3 className="tile-title text-xl">{it.title}</h3>
                      <p className="tile-text line-clamp-3">{it.excerpt}</p>
                      <span className="more-link mt-auto pt-4">{tc('moreInfo')} <ArrowRight className="size-4" /></span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </InnerPage>
    </>
  )
}
