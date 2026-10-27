import { ArrowRight, HandHeart } from 'lucide-react'
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { cms } from '@/lib/api'
import { INITIATIVE_CATEGORIES, categoryLabel } from '@/lib/categories'
import { LOCALE, useTranslations } from '@/lib/i18n'
import { mediaAlt, mediaUrl, photoFit } from '@/lib/media'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { CountUp } from '@/components/ui/CountUp'
import { Img } from '@/components/ui/Img'
import { DrawRule, Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
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
        <div className="space-y-20">
          {groups.map((g) => (
            <section key={g.value} aria-labelledby={`cat-${g.value}`}>
              <Reveal className="mb-8 flex items-center gap-4">
                <h2 id={`cat-${g.value}`} className="text-[1.6rem] leading-tight text-charcoal-900 md:text-[2rem]">{categoryLabel(g.value, locale)}</h2>
                <DrawRule />
                <span className="text-sm text-muted">{g.items.length}</span>
              </Reveal>
              {/* phones: a compact list (square photo beside the words) instead of tall cards — 23 initiatives are an easy scroll */}
              <Stagger className="grid gap-x-7 gap-y-7 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3">
                {g.items.map((it) => (
                  <StaggerItem key={it.id}>
                  <Link to={`/social-work/${it.slug}`} className="tile group h-full max-sm:flex-row max-sm:items-start max-sm:gap-4">
                    <div className="tile-media aspect-[16/10] max-sm:aspect-square max-sm:w-28 max-sm:shrink-0">
                      <Img media={it.heroImage} variant="card" alt={mediaAlt(it.heroImage, it.title)} fill sizes="(max-width:640px) 112px, (max-width:1024px) 50vw, 33vw" className="object-cover" style={photoFit(it.heroImage, 1.6, 0.6)} />
                      {/* an initiative without a photo yet: a quiet icon instead of an empty box */}
                      {!mediaUrl(it.heroImage, 'card') && (
                        <span aria-hidden className="absolute inset-0 grid place-items-center text-saffron-600">
                          <HandHeart className="size-9" strokeWidth={1.5} />
                        </span>
                      )}
                      {it.counters?.[0] && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-charcoal-900/90 px-3 py-1 text-sm text-white backdrop-blur max-sm:hidden">
                          <b className="text-saffron-300"><CountUp value={it.counters[0].value} /></b> {it.counters[0].label}
                        </span>
                      )}
                    </div>
                    <div className="tile-body max-sm:min-w-0 max-sm:flex-1 max-sm:pt-0">
                      {/* on a phone the key number moves out of the small photo, above the title */}
                      {it.counters?.[0] && (
                        <p className="mb-1 text-xs font-bold text-saffron-700 sm:hidden">
                          {it.counters[0].value} {it.counters[0].label}
                        </p>
                      )}
                      <h3 className="tile-title text-xl max-sm:text-[1.05rem] max-sm:leading-snug">{it.title}</h3>
                      <p className="tile-text line-clamp-3 max-sm:mt-1 max-sm:line-clamp-2 max-sm:text-sm">{it.excerpt}</p>
                      <span className="more-link mt-auto pt-4 max-sm:pt-2">{tc('moreInfo')} <ArrowRight className="size-4" /></span>
                    </div>
                  </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          ))}
        </div>
      </InnerPage>
    </>
  )
}
