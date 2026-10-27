import { ArrowRight } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { cms } from '@/lib/api'
import { LOCALE, useTranslations } from '@/lib/i18n'
import { photoFit } from '@/lib/media'
import { NewsCard, SectionTitle } from '@/components/blog/BlogParts'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { CardSlider, type SlideCard } from '@/components/ui/CardSlider'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'

/** All events: Lokmangal initiatives slider, key events/campaigns (incl. New India Manifesto) and the latest blog posts */
export async function loader() {
  const [initiatives, events, vision, posts] = await Promise.all([
    cms.find('initiatives', { limit: 200, depth: 1, sort: 'order' }).then((r) => r.docs),
    cms.find('events', { limit: 50, depth: 1, sort: '-createdAt' }).then((r) => r.docs),
    cms.findOne('pages', { where: { path: { equals: '/vision' } }, depth: 1 }),
    cms.find('posts', { limit: 3, depth: 1, sort: '-publishedAt' }).then((r) => r.docs),
  ])
  return { initiatives, events, vision, posts }
}

export default function EventsPage() {
  const { initiatives, events, vision, posts } = useLoaderData<typeof loader>()
  const t = useTranslations('events')
  const tc = useTranslations('common')
  const locale = LOCALE

  const slides: SlideCard[] = initiatives.map((it) => ({
    href: `/social-work/${it.slug}`,
    title: it.title,
    text: it.excerpt,
    media: it.heroImage,
    imageStyle: photoFit(it.heroImage, 2, 0.6),
  }))

  const featured: SlideCard[] = [
    ...events.map((e) => ({ href: `/events/${e.slug}`, title: e.title, text: e.description, media: e.coverImage, imageStyle: photoFit(e.coverImage, 2, 0.6), meta: t('event') })),
    ...(vision
      ? [{ href: '/vision', title: locale === 'mr' ? 'न्यू इंडिया मॅनिफेस्टो' : 'The New India Manifesto', text: t('manifestoText'), media: vision.bannerImage, imageStyle: photoFit(vision.bannerImage, 2, 0.6), meta: t('campaign') }]
      : []),
  ]

  return (
    <>
      <Seo title={t('title')} description={t('intro')} />
      <InnerPage path="/events" title={t('title')} subtitle={t('intro')} sideMenu={false} variant="navy">
        <section>
          <Reveal>
            <SectionTitle>{t('initiatives')}</SectionTitle>
            <p className="lead mb-9 mt-4 max-w-3xl">{t('initiativesIntro')}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <CardSlider cards={slides} readMore={t('readMore')} prevLabel={t('prev')} nextLabel={t('next')} />
          </Reveal>
        </section>

        {featured.length > 0 && (
          <section className="mt-10 sm:mt-20 md:mt-24">
            <Reveal>
              <SectionTitle>{t('featured')}</SectionTitle>
            </Reveal>
            <Reveal className="mt-9" delay={0.08}>
              <CardSlider cards={featured} readMore={t('readMore')} prevLabel={t('prev')} nextLabel={t('next')} />
            </Reveal>
          </section>
        )}

        {posts.length > 0 && (
          <section className="mt-10 sm:mt-20 md:mt-24">
            <Reveal>
              <SectionTitle aside={<Link to="/blog" className="tap-pad inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-saffron-700 hover:text-btn-hover">{tc('viewAll')} <ArrowRight className="size-4" /></Link>}>
                {t('blog')}
              </SectionTitle>
            </Reveal>
            <Stagger className="mt-9 grid gap-x-7 gap-y-8 sm:gap-y-12 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <StaggerItem key={post.id}><NewsCard post={post} locale={locale} /></StaggerItem>)}</Stagger>
          </section>
        )}
      </InnerPage>
    </>
  )
}
