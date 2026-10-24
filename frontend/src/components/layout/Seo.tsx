import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router'
import { useLayout } from '@/lib/layout'
import { mediaUrl } from '@/lib/media'
import { siteUrl } from '@/lib/utils'

type Props = {
  title?: string | null
  /** the title is used as it is (the home page), instead of "Title | Site name" */
  absoluteTitle?: boolean
  description?: string | null
  /** address of the share image; the site's default share image when empty */
  image?: string | null
  type?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: object[]
  publishedTime?: string | null
}

/**
 * The page's <title>, description and share tags (react-helmet-async). The backend already put the same tags into the
 * HTML it sent (for crawlers and link previews); the first time this runs, those copies are removed so nothing is doubled.
 */
export function Seo({ title, absoluteTitle, description, image, type = 'website', noindex, jsonLd, publishedTime }: Props) {
  const { settings } = useLayout()
  const { pathname } = useLocation()
  const siteName = settings.siteName
  const fullTitle = !title ? siteName : absoluteTitle ? title : `${title} | ${siteName}`
  const desc = description ?? settings.tagline ?? undefined
  const img = image ?? mediaUrl(settings.defaultShareImage, 'card')
  const imgUrl = img ? (/^https?:\/\//.test(img) ? img : `${siteUrl()}${img}`) : undefined
  const canonical = `${siteUrl()}${pathname === '/' ? '' : pathname}`

  useEffect(() => {
    document.head.querySelectorAll('[data-ssr-meta]').forEach((el) => el.remove())
  }, [])

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={canonical} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      {imgUrl && <meta property="og:image" content={imgUrl} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@rohandeshmukhh" />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      {imgUrl && <meta name="twitter:image" content={imgUrl} />}
      {jsonLd?.map((ld, i) => <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>)}
    </Helmet>
  )
}

/** Structured data about Rohan for search engines (on every page) */
export function PersonSchema() {
  const { settings } = useLayout()
  const social = Object.values(settings.social ?? {}).filter((v): v is string => typeof v === 'string' && Boolean(v))
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Rohan Subhash Deshmukh',
    alternateName: 'रोहन सुभाष देशमुख',
    url: siteUrl(),
    birthPlace: 'Solapur, Maharashtra',
    sameAs: social,
    email: settings.email ?? undefined,
    telephone: settings.phone ?? undefined,
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(person)}</script>
    </Helmet>
  )
}
