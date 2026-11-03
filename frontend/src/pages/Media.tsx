import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { cms } from '@/lib/api'
import { LOCALE, useTranslations } from '@/lib/i18n'
import { mediaAlt, mediaUrl, toGallery } from '@/lib/media'
import { formatDate, pageNumber } from '@/lib/utils'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { Gallery } from '@/components/ui/Gallery'
import { Img } from '@/components/ui/Img'
import { FilterChips, Pagination } from '@/components/ui/Pagination'
import { YouTube } from '@/components/ui/YouTube'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import { notFound, searchOf } from './helpers'

/* ---------------------------------------------------------------- Photo Gallery: one card per album */

/** albums left off the website (Oct 2026: "व्यक्तिमत्त्व आणि नेतृत्व / Leadership & Portraits"); they stay in the admin */
const HIDDEN_ALBUMS = ['leadership-portraits']

export async function photosLoader() {
  const res = await cms.find('albums', { limit: 60, depth: 1, sort: '-date' })
  return { ...res, docs: res.docs.filter((a) => !HIDDEN_ALBUMS.includes(a.slug ?? '')) }
}

export function PhotosPage() {
  const res = useLoaderData<typeof photosLoader>()
  const t = useTranslations('pages')
  const albums = res.docs
  return (
    <>
      <Seo title={t('photoGallery')} />
      <InnerPage path="/media/photos" title={t('photoGallery')} variant="navy">
        {/* Gallery (Modern Teal + Saffron): image first, no frames — each album is its cover photo, tall, with the title, a line of
            description and "View album" in Cloud White over a charcoal fade at its foot; a saffron bar that grows under the pointer */}
        <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {albums.map((a) => {
            const cover = a.cover ?? (a.photos?.[0] as never)
            return (
              <StaggerItem key={a.id}>
                <Link
                  to={`/media/photos/${a.slug}`}
                  className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-xl bg-charcoal-950 text-paper transition-[translate] duration-300 ease-soft motion-safe:hover:-translate-y-1 active:scale-[0.99] sm:aspect-[3/4]"
                >
                  <Img
                    media={cover}
                    variant="card"
                    alt={mediaAlt(a.cover, a.title)}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                    className="-z-10 object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal-950 via-charcoal-950/55 via-35% to-transparent to-65%" />

                  <div className="p-5 sm:p-6">
                    <span aria-hidden className="mb-3 block h-1 w-10 rounded-full bg-gold transition-all duration-300 group-hover:w-16" />
                    <h2 className="font-display text-xl font-bold leading-snug text-paper sm:text-2xl">
                      {a.title}
                    </h2>
                    {a.description && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-paper/85">
                        {a.description}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-paper">
                      <span className="border-b border-paper/40 pb-0.5 transition-colors group-hover:border-gold">{LOCALE === 'mr' ? 'अल्बम पहा' : 'View album'}</span>
                      <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
        {!albums.length && <p className="rounded-2xl bg-cream p-8 text-center text-muted">{t('contentComing')}</p>}
      </InnerPage>
    </>
  )
}

/* ---------------------------------------------------------------- one album */

export async function albumLoader({ params }: LoaderFunctionArgs) {
  const slug = decodeURIComponent(params.slug ?? '')
  if (HIDDEN_ALBUMS.includes(slug)) return notFound()
  const album = await cms.findOne('albums', { where: { slug: { equals: slug } }, depth: 1 })
  return album ?? notFound()
}

export function AlbumPage() {
  const a = useLoaderData<typeof albumLoader>()
  const t = useTranslations('pages')
  return (
    <>
      <Seo title={a.title} description={a.description} image={mediaUrl(a.cover, 'card')} />
      <InnerPage path={`/media/photos/${a.slug}`} title={a.title} subtitle={a.description || undefined} crumbs={[{ label: t('media') }, { label: t('photoGallery'), href: '/media/photos' }, { label: a.title }]} variant="navy">
        <Reveal className="mb-8">
          <Link to="/media/photos" className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-charcoal-900 shadow-sm ring-1 ring-line transition hover:ring-gold">
            <ArrowLeft className="size-4 text-charcoal-900 transition-transform group-hover:-translate-x-0.5" />
            {t('photoGallery')}
          </Link>
        </Reveal>
        <Gallery images={toGallery(a.photos, a.title)} layout="masonry" wide />
      </InnerPage>
    </>
  )
}

/* ---------------------------------------------------------------- Video Gallery */

export async function videosLoader({ request }: LoaderFunctionArgs) {
  const sp = searchOf(request)
  const playlist = sp.get('playlist')
  const page = pageNumber(sp.get('page'))
  const all = await cms.find('videos', { limit: 500, depth: 0 })
  const playlists = [...new Set(all.docs.map((v) => v.playlist).filter(Boolean))] as string[]
  const res = await cms.find('videos', { where: playlist ? { playlist: { equals: playlist } } : undefined, limit: 12, page, sort: '-publishedAt' })
  return { playlists, res, playlist }
}

export function VideosPage() {
  const { playlists, res, playlist } = useLoaderData<typeof videosLoader>()
  const t = useTranslations('pages')
  const tc = useTranslations('common')
  const locale = LOCALE
  return (
    <>
      <Seo title={t('videoGallery')} />
      <InnerPage path="/media/videos" title={t('videoGallery')}>
        {playlists.length > 1 && <FilterChips param="playlist" base="/media/videos" active={playlist} items={[{ label: tc('all'), value: '' }, ...playlists.map((p) => ({ label: p, value: p }))]} />}
        <Stagger className="grid gap-6 md:grid-cols-2">
          {res.docs.map((v) => (
            <StaggerItem key={v.id}>
              <YouTube url={v.youtubeUrl} />
              <h2 className="mt-3 text-lg text-[#182126]">{v.title}</h2>
              <p className="text-sm text-muted">{[v.playlist, formatDate(v.publishedAt, locale)].filter(Boolean).join(' · ')}</p>
            </StaggerItem>
          ))}
        </Stagger>
        {!res.docs.length && <p className="rounded-2xl bg-cream p-8 text-center text-muted">{t('contentComing')}</p>}
        <Pagination page={res.page ?? 1} totalPages={res.totalPages} base="/media/videos" query={{ playlist }} />
      </InnerPage>
    </>
  )
}
