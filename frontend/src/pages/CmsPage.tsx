import { redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { cms } from '@/lib/api'
import { LOCALE } from '@/lib/i18n'
import { mediaPosition, mediaUrl } from '@/lib/media'
import { REMOVED_REDIRECTS, isRemovedPath } from '@/lib/removed'
import { FamilyBackground } from '@/components/about/FamilyBackground'
import { IntroJourney } from '@/components/about/IntroJourney'
import { Manifesto } from '@/components/vision/Manifesto'
import { PageBlocks } from '@/components/blocks/PageBlocks'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { cleanPath, notFound } from './helpers'

/** कौटुंबिक पार्श्वभूमी: family members shown in the spotlight layout */
const FAMILY_PATH = '/about/biography'
/** स्वपरिचय: journey-map layout, sibling pages as tabs on the banner */
const INTRO_PATH = '/about/introduction'
/** Vision (New India Manifesto): its own layout (redesign, Oct 2026) */
const VISION_PATH = '/vision'
/** pages shown with the Stitch page header (Oct 2026): navy band or warm ivory band */
const STITCH_HEADER: Record<string, 'navy' | 'light'> = { [INTRO_PATH]: 'navy', [FAMILY_PATH]: 'navy', [VISION_PATH]: 'navy', '/political-career': 'navy' }

/** Any page made in the admin under Pages (Biography, Political Career, Vision, Appeal, legal pages…), found by its address */
export async function loader({ params }: LoaderFunctionArgs) {
  const path = cleanPath(params['*'] ?? '')
  if (REMOVED_REDIRECTS[path]) return redirect(REMOVED_REDIRECTS[path])
  if (isRemovedPath(path)) return notFound()
  const page = await cms.findOne('pages', { where: { path: { equals: path } }, depth: 2 })
  if (!page) return notFound()
  return { page, path }
}

export default function CmsPage() {
  const { page, path } = useLoaderData<typeof loader>()
  const img = mediaUrl(page.meta?.image, 'card') || mediaUrl(page.bannerImage, 'card')
  return (
    <>
      <Seo title={page.meta?.title || page.title} description={page.meta?.description || page.subtitle} image={img} />
      <InnerPage path={path} title={page.title} subtitle={page.subtitle} image={mediaUrl(page.bannerImage, 'hero')} imagePosition={mediaPosition(page.bannerImage)} variant={STITCH_HEADER[path]}>
        {path === FAMILY_PATH ? <FamilyBackground blocks={page.layout} locale={LOCALE} /> : path === INTRO_PATH ? <IntroJourney blocks={page.layout} locale={LOCALE} /> : path === VISION_PATH ? <Manifesto blocks={page.layout} /> : <PageBlocks blocks={page.layout} design={STITCH_HEADER[path] ? 'stitch' : undefined} />}
      </InnerPage>
    </>
  )
}
