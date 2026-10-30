import { useLoaderData } from 'react-router'
import { cms } from '@/lib/api'
import { INITIATIVE_CATEGORIES, categoryLabel } from '@/lib/categories'
import { LOCALE } from '@/lib/i18n'
import { mediaAlt, mediaPosition, mediaUrl, photoFit, staticMedia } from '@/lib/media'
import { useHashTarget } from '@/lib/use-hash-target'
import { PageBlocks } from '@/components/blocks/PageBlocks'
import { Reveal } from '@/components/ui/Motion'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { ProjectsExplorer, type ProjectCard } from '@/components/social/ProjectsExplorer'
import { notFound } from './helpers'
import type { Media } from '@/types/cms'

const PATH = '/lokmangal/foundation'

const TEXT = {
  mr: {
    tabs: 'लोकमंगल फाऊंडेशन विभाग', about: 'माहिती', projects: 'प्रकल्प', soon: 'माहिती लवकरच उपलब्ध होईल.',
    projectsEyebrow: 'सर्व प्रकल्प', projectsHeading: (n: string) => `सर्व ${n} सामाजिक उपक्रम`, projectsIntro: 'विषयानुसार निवडा किंवा थेट शोधून प्रत्येक उपक्रमाची सविस्तर माहिती जाणून घ्या.',
    explorer: { all: 'सर्व उपक्रम', search: 'उपक्रम शोधा...', readMore: 'अधिक वाचा', details: 'सविस्तर माहिती', empty: 'या शोधाशी जुळणारा उपक्रम आढळला नाही.', clear: 'सर्व उपक्रम दाखवा', filters: 'विषयानुसार उपक्रम', featured: 'मुख्य उपक्रम', prev: 'मागील', next: 'पुढील', slide: 'उपक्रम' },
  },
  en: {
    tabs: 'Lokmangal Foundation sections', about: 'About', projects: 'Projects', soon: 'Details coming soon.',
    projectsEyebrow: 'All Projects', projectsHeading: (n: string) => `Explore All ${n} Social Initiatives`, projectsIntro: 'Lokmangal Foundation works to improve the quality of life of people in rural areas. Pick a theme or search to read about each initiative in detail.',
    explorer: { all: 'All Projects', search: 'Search initiatives...', readMore: 'Read More', details: 'View details', empty: 'No initiative matches your search.', clear: 'Show all initiatives', filters: 'Initiatives by theme', featured: 'Main initiatives', prev: 'Previous', next: 'Next', slide: 'Initiative' },
  },
}

const DEV = '०१२३४५६७८९'

/** the photo beside the Foundation's introduction (Oct 2026): Rohan Deshmukh speaking at a Lokmangal Foundation event */
const INTRO_PHOTO = staticMedia('/images/lokmangal/lokmangal-foundation-rohan-speech.webp', 1800, 1200, 'Rohan Deshmukh at a Lokmangal Foundation event', 30, 40)

export async function loader() {
  const [page, initiatives] = await Promise.all([
    cms.findOne('pages', { where: { path: { equals: PATH } }, depth: 2 }),
    cms.find('initiatives', { limit: 200, depth: 1, sort: 'order' }).then((r) => r.docs),
  ])
  if (!page) return notFound()
  return { page, initiatives }
}

/** Key Areas card photos taken from the project's gallery (by file name) in place of its cover */
const CARD_PHOTO: Record<string, string> = {
  'annapurna-yojana': 'lmf-annapurna-yojana-02.webp',
}

/**
 * Lokmangal Foundation: माहिती (the page content edited under Pages in the admin) · प्रकल्प (Initiatives). (Oct 2026: the About · Events ·
 * Projects tab bar was removed, and so was the Events section — its Sports events now show under Political Career → Social Activities;
 * the sections keep their #about / #projects anchors, which the menu links to.)
 */
export default function FoundationPage() {
  const { page, initiatives } = useLoaderData<typeof loader>()
  const locale = LOCALE
  const x = TEXT[locale]
  // "सर्व उपक्रमांकडे परत जा" on a project page comes back to #projects
  useHashTarget()

  // माहिती = the page's own blocks (edited under Pages in the admin); its call-to-action closes the page
  // the introduction (the first Media + text block) always shows INTRO_PHOTO, whatever photo is set in the admin
  const firstMedia = (page.layout ?? []).findIndex((b) => b.blockType === 'mediaText')
  // the Key Areas cards show the cover photo of the project each one links to (/social-work/<slug>), in place of an icon (Oct 2026)
  // (a project whose cover is a tall photo uses a wide one from its own gallery instead — CARD_PHOTO)
  const cover = (url?: string | null) => {
    const it = initiatives.find((i) => url === `/social-work/${i.slug}`)
    const pick = it && CARD_PHOTO[it.slug]
    const fromGallery = pick ? it.gallery?.find((g): g is Media => typeof g === 'object' && g.filename === pick) : undefined
    return fromGallery ?? it?.heroImage
  }
  const blocks = (page.layout ?? []).map((b, i) => {
    // …and without the small "लोकमंगल फाऊंडेशन" label above its heading
    if (i === firstMedia) return { ...b, image: INTRO_PHOTO, eyebrow: null }
    // …and the Key Areas heading without its small "कार्यक्षेत्र" label
    if (b.blockType === 'cards') return { ...b, eyebrow: null, items: (b.items ?? []).map((c) => (c.image ? c : { ...c, image: cover(c.url) ?? c.image })) }
    return b
  })
  /* the closing text box ("या कार्याचा विस्तार…") and the "Impact So Far" figures are left out (Oct 2026) */
  const about = blocks.filter((b) => b.blockType !== 'cta' && b.blockType !== 'content' && b.blockType !== 'stats')
  const closing = blocks.filter((b) => b.blockType === 'cta')

  const projectCards: ProjectCard[] = initiatives.map((it) => ({
    id: it.id, href: `/social-work/${it.slug}`, title: it.title, category: it.category, categoryLabel: categoryLabel(it.category, locale), featured: it.featured,
    stat: it.stat, text: it.excerpt, media: it.heroImage, imageAlt: mediaAlt(it.heroImage, it.title), imageStyle: photoFit(it.heroImage, 1.6, 0.6),
  }))
  const projectCategories = INITIATIVE_CATEGORIES.map((c) => ({ value: c.value, label: categoryLabel(c.value, locale) }))
  const total = locale === 'mr' ? String(projectCards.length).replace(/\d/g, (d) => DEV[Number(d)]) : String(projectCards.length)

  return (
    <>
      <Seo title={page.meta?.title || page.title} description={page.meta?.description || page.subtitle} image={mediaUrl(page.meta?.image, 'card') || mediaUrl(page.bannerImage, 'card')} />
      <InnerPage path={PATH} title={page.title} subtitle={page.subtitle} image={mediaUrl(page.bannerImage, 'hero')} imagePosition={mediaPosition(page.bannerImage)} variant="navy">
        <section id="about" className="scroll-mt-36">
          <PageBlocks blocks={about} design="stitch" plainChapters accent />
        </section>

        <section id="projects" className="mt-4 sm:mt-6 scroll-mt-36">
          {/* same layout as lokmangalfoundation.com/projects → "Explore all social initiatives" */}
          <div className="section !pt-8 sm:!pt-12 relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-stone-200/70 bg-ivory">
            <div aria-hidden className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-saffron-500/5 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -left-20 top-1/2 size-80 rounded-full bg-leaf-600/5 blur-3xl" />
            <div className="container-x relative">
              <Reveal className="section-head is-center relative">
                <p className="eyebrow justify-center">{x.projectsEyebrow}</p>
                <h2 className="h-section">{x.projectsHeading(total)}</h2>
                <p className="lead">{x.projectsIntro}</p>
              </Reveal>
              {projectCards.length ? (
                <ProjectsExplorer items={projectCards} categories={projectCategories} labels={x.explorer} locale={locale} />
              ) : (
                <p className="rounded-2xl bg-cream p-8 text-center text-muted">{x.soon}</p>
              )}
            </div>
          </div>
        </section>

        {closing.length > 0 && (
          <div className="mt-10 sm:mt-20 md:mt-28">
            <PageBlocks blocks={closing} design="stitch" />
          </div>
        )}
      </InnerPage>
    </>
  )
}
