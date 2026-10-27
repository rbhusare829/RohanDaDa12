import { Form, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { cms, type Where } from '@/lib/api'
import { useTranslations, LOCALE } from '@/lib/i18n'
import { cn, pageNumber, siteUrl, toMarathiDigits } from '@/lib/utils'
import { FrontHeading, FrontLatest, FrontLead, FrontRecent, FrontRow, FrontTopics } from '@/components/blog/BlogFront'
import { Stagger, StaggerItem } from '@/components/ui/Motion'
import { QuickShare } from '@/components/blog/QuickShare'
import { PageBanner } from '@/components/layout/PageBanner'
import { Seo } from '@/components/layout/Seo'
import { Pagination } from '@/components/ui/Pagination'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { searchOf } from './helpers'

const PER_PAGE = 10

/** Newspaper-style blog front page: masthead + lead story + latest list, then sections, article list and sidebar */
export async function loader({ request }: LoaderFunctionArgs) {
  const sp = searchOf(request)
  const category = sp.get('category')
  const tag = sp.get('tag')
  const q = sp.get('q')?.trim() || null
  const page = pageNumber(sp.get('page'))

  const [cats, latest] = await Promise.all([
    cms.find('categories', { limit: 50, sort: 'title' }).then((r) => r.docs),
    cms.find('posts', { limit: 6, depth: 1, sort: '-publishedAt' }).then((r) => r.docs),
  ])
  const activeCat = category ? cats.find((x) => x.slug === category) : undefined
  const and: Where[] = []
  if (activeCat) and.push({ categories: { contains: activeCat.id } })
  if (tag) and.push({ tags: { contains: tag } })
  if (q) and.push({ or: [{ title: { like: q } }, { excerpt: { like: q } }] })
  const res = await cms.find('posts', { where: and.length ? { and } : undefined, limit: PER_PAGE, page, depth: 1, sort: '-publishedAt' })
  return { cats, latest, res, category, tag, q, page, activeCatTitle: activeCat?.title ?? null }
}

export default function BlogPage() {
  const { cats, latest, res, category, tag, q, page, activeCatTitle } = useLoaderData<typeof loader>()
  const t = useTranslations('blog')
  const tc = useTranslations('common')
  const locale = LOCALE
  const posts = res.docs

  // front page (no filter, first page) opens with the lead story
  const isFront = !activeCatTitle && !tag && !q && page === 1
  const [lead, ...rest] = latest
  const num = (n: number) => (locale === 'mr' ? toMarathiDigits(n) : String(n))
  const shareUrl = (slug: string) => `${siteUrl()}/blog/${slug}`
  const listTitle = q ? t('results', { q }) : activeCatTitle ? activeCatTitle : tag ? `#${tag}` : t('allList')

  return (
    <>
      <Seo title={t('title')} description={t('intro')} />
      <PageBanner title={t('title')} subtitle={t('intro')} crumbs={[{ label: t('title') }]} path="/blog" variant="navy" />

      <div className="container-x pb-10 sm:pb-20 pt-8 sm:pt-12 md:pb-28 md:pt-16">
        {/* top stories */}
        {isFront && lead && (
          <section className="pb-10 sm:pb-16 md:pb-20">
            <FrontHeading label={<><Sparkles className="size-3.5" />{t('topBadge')}</>}>{t('topStories')}</FrontHeading>
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <div className={rest.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
                <FrontLead post={lead} locale={locale} badge={t('lead')} readFull={t('readFull')} />
              </div>
              {rest.length > 0 && (
                <div className="lg:col-span-5">
                  <FrontLatest posts={rest.slice(0, 4)} locale={locale} title={t('latestUpdates')} footer={t('daily')} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* sections + search — stays at the top while scrolling */}
        <div className="relative z-30 mb-8 sm:mb-12 md:sticky md:top-[4.5rem] lg:top-20">
          <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-[0_12px_30px_-12px_rgba(9,20,34,0.18)] backdrop-blur md:flex-row md:items-center md:gap-6 md:px-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-charcoal-900 sm:inline-flex"><span className="grid size-8 place-items-center rounded-lg bg-saffron-500/10 text-saffron-700"><SlidersHorizontal className="size-4" /></span> {t('sections')}</span>
              {/* padding keeps the focus ring from being clipped by the scrolling row */}
              <ScrollRow className="-mx-1 -my-1.5 flex min-w-0 gap-2 px-1 py-1.5">
                {[{ slug: '', title: tc('all') }, ...cats].map((c) => {
                  const on = (category ?? '') === c.slug && !tag && !q
                  return (
                    <Link key={c.slug || 'all'} to={c.slug ? `/blog?category=${c.slug}` : '/blog'} aria-current={on ? 'true' : undefined}
                      className={cn('inline-flex min-h-11 shrink-0 items-center rounded-full px-4 py-1.5 text-sm font-semibold transition', on ? 'bg-gradient-to-r from-saffron-600 to-saffron-500 text-white shadow-md shadow-saffron-500/25' : 'text-charcoal-800 hover:bg-saffron-50 hover:text-saffron-700')}>
                      {c.title}
                    </Link>
                  )
                })}
              </ScrollRow>
            </div>
            <Form action="/blog" method="get" className="flex h-11 items-center gap-2 rounded-full bg-ivory px-4 ring-1 ring-field transition hover:ring-field-hover focus-within:bg-white focus-within:ring-2 focus-within:ring-saffron-700 md:w-80" role="search">
              <Search className="size-4 shrink-0 text-saffron-600" />
              <input name="q" defaultValue={q ?? ''} key={q ?? ''} placeholder={t('searchPlaceholder')} className="h-full min-w-0 flex-1 bg-transparent text-base outline-none sm:text-sm" aria-label={t('searchPlaceholder')} />
            </Form>
          </div>
        </div>

        {/* article list + sidebar */}
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-12 lg:gap-10">
          <section className="min-w-0 lg:col-span-8">
            <FrontHeading aside={<span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500 ring-1 ring-stone-200">{t('showing', { count: num(posts.length) })}</span>}>
              {listTitle}
            </FrontHeading>
            <Stagger className="flex flex-col gap-5">
              {posts.map((post) => (
                <StaggerItem key={post.id}>
                  <FrontRow post={post} locale={locale} readMore={t('readMore')} share={<QuickShare url={shareUrl(post.slug)} title={post.title} label={tc('share')} />} />
                </StaggerItem>
              ))}
            </Stagger>
            {!posts.length && <p className="rounded-2xl bg-white py-8 sm:py-14 text-center text-muted ring-1 ring-stone-200">{tc('noResults')}</p>}
            <Pagination page={res.page ?? 1} totalPages={res.totalPages} base="/blog" query={{ category, tag, q }} />
          </section>

          <aside className="flex flex-col gap-6 lg:sticky lg:top-44 lg:col-span-4 lg:self-start">
            {cats.length > 0 && <FrontTopics cats={cats} active={category} title={t('topics')} allLabel={t('allTopics')} />}
            <FrontRecent posts={latest.slice(0, 5)} locale={locale} title={t('recent')} />
          </aside>
        </div>
      </div>
    </>
  )
}
