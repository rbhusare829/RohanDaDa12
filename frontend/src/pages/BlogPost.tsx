import { ArrowLeft, ArrowRight, CalendarDays, CircleCheckBig, Clock, MapPin } from 'lucide-react'
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { cms } from '@/lib/api'
import { articleHeadings, primaryCategory, readTimeLabel } from '@/lib/blog'
import { LOCALE, useTranslations } from '@/lib/i18n'
import { mediaAlt, mediaUrl, photoFit } from '@/lib/media'
import { formatDate, siteUrl, toMarathiDigits } from '@/lib/utils'
import { NewsCard, SectionTitle } from '@/components/blog/BlogParts'
import { PageBanner } from '@/components/layout/PageBanner'
import { Seo } from '@/components/layout/Seo'
import { Img } from '@/components/ui/Img'
import { ReadingProgress, Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import { RichText } from '@/components/ui/RichText'
import { Share } from '@/components/ui/Share'
import { notFound } from './helpers'

export async function loader({ params }: LoaderFunctionArgs) {
  const slug = decodeURIComponent(params.slug ?? '')
  const post = await cms.findOne('posts', { where: { slug: { equals: slug } }, depth: 2 })
  if (!post) return notFound()

  const catIds = (post.categories ?? []).map((c) => (typeof c === 'object' ? c.id : c))
  const notThis = { id: { not_equals: post.id } }
  let related = (
    await cms.find('posts', { limit: 3, depth: 1, sort: '-publishedAt', where: { and: [notThis, ...(catIds.length ? [{ categories: { in: catIds } }] : [])] } })
  ).docs
  if (related.length < 3) {
    // top up with the latest articles from other sections
    const more = (await cms.find('posts', { limit: 3, depth: 1, sort: '-publishedAt', where: { and: [notThis, { id: { not_in: related.map((r) => r.id) } }] } })).docs
    related = [...related, ...more].slice(0, 3)
  }
  return { post, related }
}

const hasMarathi = (s: string) => /[ऀ-ॿ]/.test(s)

/** Newspaper-style article: headline, byline, photo, summary, key points, full story, related articles */
export default function PostPage() {
  const { post, related } = useLoaderData<typeof loader>()
  const locale = LOCALE
  const tb = useTranslations('blog')
  const tc = useTranslations('common')
  const t = useTranslations('pages')

  const url = `${siteUrl()}/blog/${post.slug}`
  const cat = primaryCategory(post)
  // an English page never shows a Marathi-only subtitle or tag (tags are shared by both languages)
  const subtitle = post.subtitle && (locale !== 'mr' || hasMarathi(post.subtitle)) ? post.subtitle : null
  const tags = (post.tags ?? []).filter((tag) => locale === 'mr' || !hasMarathi(tag))
  const headings = articleHeadings(post.content)
  const author = post.author || (locale === 'mr' ? 'रोहन देशमुख' : 'Rohan Deshmukh')
  const num = (n: number) => (locale === 'mr' ? toMarathiDigits(n) : String(n))
  const cover = mediaUrl(post.coverImage, 'hero')
  const coverAlt = typeof post.coverImage === 'object' && post.coverImage?.alt ? post.coverImage.alt : null
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: 'Rohan Subhash Deshmukh' },
    image: cover ? [`${siteUrl()}${cover}`] : undefined,
    mainEntityOfPage: url,
  }

  return (
    <>
      <Seo
        title={post.meta?.title || post.title}
        description={post.meta?.description || post.excerpt}
        image={mediaUrl(post.meta?.image, 'card') || mediaUrl(post.coverImage, 'card')}
        type="article"
        publishedTime={post.publishedAt}
        jsonLd={[articleLd]}
      />
      {/* a thin bar at the top of the screen fills as the article is read */}
      <ReadingProgress />
      <PageBanner
        compact
        light
        title={post.title}
        subtitle={subtitle}
        crumbs={[{ label: t('blog'), href: '/blog' }, ...(cat ? [{ label: cat.title, href: `/blog?category=${cat.slug}` }] : [])]}
      >
        {/* byline */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-charcoal-900/10 pt-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.95rem] text-muted">
            <span className="inline-flex items-center gap-2.5">
              <span aria-hidden className="grid size-8 place-items-center rounded-full bg-saffron-600 text-sm text-white">{author.trim().charAt(0)}</span>
              <span className="text-charcoal-900">{author}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{tb('place')}</span>
            </span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4 text-saffron-600" /><time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt, locale)}</time></span>
            <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{readTimeLabel(post, locale)}</span>
          </div>
          <div className="no-print"><Share url={url} title={post.title} label={tc('share')} compact /></div>
        </div>
      </PageBanner>

      <div className="container-x pb-10 sm:pb-20 pt-6 sm:pt-10 md:pb-24 md:pt-12">
        <div className="grid gap-8 sm:gap-14 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-20">
          <article className="min-w-0 max-w-3xl">
            <Link to="/blog" className="no-print tap-pad inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:gap-3 hover:text-charcoal-900">
              <ArrowLeft className="size-4" /> {tb('back')}
            </Link>

            {cover && (
              /* the cover is the first thing seen: a CSS entrance (it starts with the first paint, it does not wait for the animation code to load) */
              <figure className="animate-fade-up mt-7">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-cream">
                  <Img media={post.coverImage} variant="hero" alt={mediaAlt(post.coverImage, post.title)} fill priority sizes="(max-width:900px) 100vw, 780px" className="object-cover" style={photoFit(post.coverImage, 16 / 9)} />
                </div>
                {coverAlt && coverAlt !== post.title && <figcaption className="mt-3 text-sm text-muted">{coverAlt}</figcaption>}
              </figure>
            )}

            {/* summary */}
            {post.excerpt && (
              <Reveal as="p" className="mt-6 sm:mt-10 border-l-4 border-saffron-500 pl-5 font-display text-[1.2rem] leading-relaxed text-charcoal-900 md:pl-7 md:text-[1.35rem]">
                {post.excerpt}
              </Reveal>
            )}

            {/* key points on phones and tablets (desktop: in the side column) */}
            {headings.length >= 2 && (
              <nav aria-label={tb('keyPoints')} className="mt-6 sm:mt-10 lg:hidden">
                <KeyPoints headings={headings} title={tb('keyPoints')} num={num} />
              </nav>
            )}

            {/* full story */}
            <SectionTitle className="mt-8 sm:mt-12">{tb('fullStory')}</SectionTitle>
            <div id="article-body" className="article-body mt-7">
              <RichText html={post.content} anchors />
            </div>

            {(!!tags.length || !!post.categories?.length) && (
              <div className="no-print mt-8 sm:mt-12 flex flex-wrap gap-2 border-t border-line pt-7">
                {post.categories?.map((c) => typeof c === 'object' && <Link key={c.id} to={`/blog?category=${c.slug}`} className="inline-flex min-h-11 items-center rounded-full bg-charcoal-900 px-4 py-1 text-sm text-white">{c.title}</Link>)}
                {tags.map((tag) => <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="inline-flex min-h-11 items-center rounded-full bg-white px-4 py-1 text-sm text-saffron-700 ring-1 ring-field transition hover:ring-field-hover">#{tag}</Link>)}
              </div>
            )}
            <div className="no-print mt-8 border-t border-line pt-7"><Share url={url} title={post.title} label={tc('share')} /></div>
          </article>

          {headings.length >= 2 && (
            <aside className="no-print hidden lg:sticky lg:top-28 lg:block lg:self-start">
              <nav aria-label={tb('keyPoints')}>
                <KeyPoints headings={headings} title={tb('keyPoints')} num={num} />
              </nav>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section className="no-print mt-12 sm:mt-24 md:mt-28">
            <SectionTitle aside={<Link to="/blog" className="more-link text-sm">{tb('seeAll')} <ArrowRight className="size-4" /></Link>}>
              {tb('more')}
            </SectionTitle>
            <Stagger className="mt-9 grid gap-x-7 gap-y-8 sm:gap-y-12 md:grid-cols-3">{related.map((r) => <StaggerItem key={r.id}><NewsCard post={r} locale={locale} /></StaggerItem>)}</Stagger>
          </section>
        )}
      </div>
    </>
  )
}

/** The article's sub-headings as a numbered jump list */
function KeyPoints({ headings, title, num }: { headings: { id: string; text: string }[]; title: string; num: (n: number) => string }) {
  return (
    <>
      <h2 className="flex items-center gap-2.5 border-b-2 border-charcoal-900 pb-3 text-lg text-charcoal-900"><CircleCheckBig className="size-5 text-saffron-600" /> {title}</h2>
      <ol className="mt-2 divide-y divide-line">
        {headings.map((h, i) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="flex gap-3 py-3 text-[0.97rem] leading-snug text-ink transition hover:text-saffron-700">
              <span className="font-display text-saffron-700">{num(i + 1)}</span>
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </>
  )
}
