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

export async function photosLoader() {
  return cms.find('albums', { limit: 60, depth: 1, sort: '-date' })
}

export function PhotosPage() {
  const res = useLoaderData<typeof photosLoader>()
  const t = useTranslations('pages')
  const albums = res.docs
  return (
    <>
      <Seo title={t('photoGallery')} />
      <InnerPage path="/media/photos" title={t('photoGallery')} variant="navy">
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => {
            const cover = a.cover ?? (a.photos?.[0] as never)
            return (
              <StaggerItem key={a.id}>
                <Link
                  to={`/media/photos/${a.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/90 transition-[translate,box-shadow] duration-300 ease-soft motion-safe:hover:-translate-y-1.5 hover:shadow-xl hover:ring-saffron-400 active:scale-[0.99]"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-950">
                    <Img
                      media={cover}
                      variant="card"
                      alt={mediaAlt(a.cover, a.title)}
                      fill
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/20 to-transparent" />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                    <div>
                      <span aria-hidden className="mb-2.5 block h-1 w-10 rounded-full bg-saffron-500 transition-all duration-300 group-hover:w-16" />
                      <h2 className="font-display text-lg sm:text-xl font-bold leading-snug text-charcoal-950 group-hover:text-saffron-700 transition-colors">
                        {a.title}
                      </h2>
                      {a.description && (
                        <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {a.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3 text-xs font-bold text-saffron-600">
                      <span>{LOCALE === 'mr' ? 'अल्बम पहा' : 'View album'}</span>
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
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
  const album = await cms.findOne('albums', { where: { slug: { equals: decodeURIComponent(params.slug ?? '') } }, depth: 1 })
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
          <Link to="/media/photos" className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-charcoal-950 shadow-sm ring-1 ring-stone-200/80 transition hover:ring-saffron-400">
            <ArrowLeft className="size-4 text-saffron-600 transition-transform group-hover:-translate-x-0.5" />
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
              <h2 className="mt-3 text-lg text-charcoal-900">{v.title}</h2>
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
