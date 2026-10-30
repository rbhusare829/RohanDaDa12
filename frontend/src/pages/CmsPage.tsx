import { redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { cms } from '@/lib/api'
import { LOCALE } from '@/lib/i18n'
import { mediaPosition, mediaUrl } from '@/lib/media'
import { REMOVED_REDIRECTS, isRemovedPath } from '@/lib/removed'
import { FamilyBackground } from '@/components/about/FamilyBackground'
import { IntroJourney } from '@/components/about/IntroJourney'
import { AboutTabs } from '@/components/about/AboutTabs'
import { LokmangalParivar } from '@/components/about/LokmangalParivar'
import { Manifesto } from '@/components/vision/Manifesto'
import { PoliticalCareerTabs } from '@/components/political/PoliticalCareerTabs'
import { PageBlocks } from '@/components/blocks/PageBlocks'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { cleanPath, notFound } from './helpers'

/** कौटुंबिक पार्श्वभूमी: family members shown in the spotlight layout */
const FAMILY_PATH = '/about/biography'
/** स्वपरिचय: journey-map layout, sibling pages as tabs on the banner */
const INTRO_PATH = '/about/introduction'
/** लोकमंगल परिवार: sectors with their institutions (Oct 2026) */
const PARIVAR_PATH = '/lokmangal/parivar'
/** Vision (New India Manifesto): its own layout (redesign, Oct 2026) */
const VISION_PATH = '/vision'
/** pages shown with the Stitch page header (Oct 2026): navy band or warm ivory band */
/** राजकीय कारकीर्द: its own content and the Social Activities, as two tabs (Oct 2026) */
const POLITICAL_PATH = '/political-career'
const STITCH_HEADER: Record<string, 'navy' | 'light'> = { [INTRO_PATH]: 'navy', [FAMILY_PATH]: 'navy', [PARIVAR_PATH]: 'navy', [VISION_PATH]: 'navy', [POLITICAL_PATH]: 'navy' }

/** Any page made in the admin under Pages (Biography, Political Career, Vision, Appeal, legal pages…), found by its address */
export async function loader({ params }: LoaderFunctionArgs) {
  const path = cleanPath(params['*'] ?? '')
  if (REMOVED_REDIRECTS[path]) return redirect(REMOVED_REDIRECTS[path])
  if (isRemovedPath(path)) return notFound()
  const page = await cms.findOne('pages', { where: { path: { equals: path } }, depth: 2 })
  if (!page) return notFound()
  // Political Career → Social Activities tab: the Lokmangal Sports events are shown below the activities (Oct 2026)
  const sportsEvents = path === POLITICAL_PATH ? await cms.find('events', { where: { group: { equals: 'sports' } }, limit: 50, depth: 1, sort: 'createdAt' }).then((r) => r.docs).catch(() => []) : []
  // परिचय: its Family Background tab shows that page's content
  const familyPage = path === INTRO_PATH ? await cms.findOne('pages', { where: { path: { equals: FAMILY_PATH } }, depth: 2 }).catch(() => null) : null
  return { page, path, sportsEvents, familyPage }
}

export default function CmsPage() {
  const { page, path, sportsEvents, familyPage } = useLoaderData<typeof loader>()
  const img = mediaUrl(page.meta?.image, 'card') || mediaUrl(page.bannerImage, 'card')
  return (
    <>
      <Seo title={page.meta?.title || page.title} description={page.meta?.description || page.subtitle} image={img} />
      <InnerPage
        path={path}
        title={path === VISION_PATH ? (LOCALE === 'mr' ? 'व्हिजन' : 'Vision') : page.title}
        subtitle={page.subtitle}
        image={mediaUrl(page.bannerImage, 'hero')}
        imagePosition={mediaPosition(page.bannerImage)}
        variant={STITCH_HEADER[path]}
        fullWidth={path === INTRO_PATH}
      >
        {path === INTRO_PATH ? <AboutTabs intro={<IntroJourney blocks={page.layout} locale={LOCALE} />} family={<FamilyBackground blocks={familyPage?.layout} locale={LOCALE} />} locale={LOCALE} /> : path === PARIVAR_PATH ? <LokmangalParivar blocks={page.layout} locale={LOCALE} /> : path === VISION_PATH ? <Manifesto blocks={page.layout} /> : path === POLITICAL_PATH ? <PoliticalCareerTabs career={<PageBlocks blocks={page.layout} design="stitch" plainChapters />} sportsEvents={sportsEvents} locale={LOCALE} /> : <PageBlocks blocks={page.layout} design={STITCH_HEADER[path] ? 'stitch' : undefined} />}
      </InnerPage>
    </>
  )
}
