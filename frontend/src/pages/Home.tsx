import { useLoaderData } from 'react-router'
import { cms } from '@/lib/api'
import { useLayout } from '@/lib/layout'
import { mediaUrl } from '@/lib/media'
import { HomeSections, type HomeExtras } from '@/components/home/HomeSections'
import { Seo } from '@/components/layout/Seo'

/** The homepage, plus the extra content some of its sections show (only what the visible sections need) */
export async function loader() {
  const home = await cms.global('home')
  const sections = (home.sections ?? []).filter((s) => !s.hidden)
  const has = (type: string) => sections.some((s) => s.blockType === type)

  const [events, posts, foundationPage, videos] = await Promise.all([
    has('homeEvents') ? cms.find('events', { limit: 50, sort: 'createdAt', depth: 1 }).then((r) => r.docs).catch(() => []) : [],
    cms.find('posts', { limit: 20, sort: '-publishedAt', depth: 1 }).then((r) => r.docs).catch(() => []),
    cms.findOne('pages', { where: { path: { equals: '/lokmangal/foundation' } }, depth: 1 }).catch(() => null),
    cms.find('videos', { limit: 10, sort: '-publishedAt' }).then((r) => r.docs).catch(() => []),
  ])
  const extras: HomeExtras = { events, posts, foundationPage, videos }
  return { home, extras }
}

export default function HomePage() {
  const { home, extras } = useLoaderData<typeof loader>()
  const { settings } = useLayout()
  const meta = home.meta
  return (
    <>
      <Seo title={meta?.title || settings.siteName} absoluteTitle description={meta?.description || settings.tagline} image={mediaUrl(meta?.image, 'card')} />
      <HomeSections sections={home.sections ?? []} extras={extras} />
    </>
  )
}
