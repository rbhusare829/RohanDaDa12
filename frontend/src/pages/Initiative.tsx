import { ArrowLeft, Clapperboard, HeartHandshake, Images, Target } from 'lucide-react'
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { cms } from '@/lib/api'
import { LOCALE, useTranslations } from '@/lib/i18n'
import { mediaAlt, mediaPosition, mediaUrl, toGallery } from '@/lib/media'
import { siteUrl, toMarathiDigits, youtubeId } from '@/lib/utils'
import { NewsCard } from '@/components/blog/BlogParts'
import { PageBanner } from '@/components/layout/PageBanner'
import { Seo } from '@/components/layout/Seo'
import { ProjectVideos } from '@/components/social/ProjectVideos'
import { Gallery } from '@/components/ui/Gallery'
import { Img } from '@/components/ui/Img'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'
import { RichText } from '@/components/ui/RichText'
import { Share } from '@/components/ui/Share'
import { YouTube } from '@/components/ui/YouTube'
import type { Post } from '@/types/cms'
import { notFound } from './helpers'

export async function loader({ params }: LoaderFunctionArgs) {
  const d = await cms.findOne('initiatives', { where: { slug: { equals: decodeURIComponent(params.slug ?? '') } }, depth: 2 })
  if (!d) return notFound()
  const events = (await cms.find('events', { where: { initiative: { equals: d.id } }, depth: 0, limit: 10 })).docs
  return { d, events }
}

const TEXT = {
  mr: {
    back: 'सर्व उपक्रमांकडे परत जा', impact: 'प्रमुख उपलब्धी', objective: 'उद्दिष्ट', videos: 'उपक्रमाचा माहितीपट व व्हिडिओ',
    videoCount: (n: number) => `एकूण ${n} व्हिडिओ उपलब्ध`, photos: 'छायाचित्रे', all: 'सर्व उपक्रम पहा', support: 'या उपक्रमास हातभार लावा',
  },
  en: {
    back: 'Back to all initiatives', impact: 'Key impact', objective: 'Objective', videos: 'Project Video Showcase',
    videoCount: (n: number) => `${n} videos available`, photos: 'Photos', all: 'View all initiatives', support: 'Support this initiative',
  },
}

/** One initiative, laid out like its page on lokmangalfoundation.com: title card → cover photo → objective → story → videos → photos */
export default function InitiativePage() {
  const { d, events } = useLoaderData<typeof loader>()
  const locale = LOCALE
  const t = useTranslations('pages')
  const tc = useTranslations('common')
  const x = TEXT[locale]
  const num = (n: number) => (locale === 'mr' ? toMarathiDigits(n) : String(n))
  const related = (d.relatedPosts ?? []).filter((r): r is Post => typeof r === 'object')
  const url = `${siteUrl()}/social-work/${d.slug}`
  const hasCover = Boolean(mediaUrl(d.heroImage, 'hero') || mediaUrl(d.heroImage))
  const photos = toGallery(d.gallery, d.title)
  const files = (d.videos ?? []).filter((v) => !!v.url)
  const hasVideo = !!d.youtubeUrl || files.length > 0

  return (
    <>
      <Seo title={d.meta?.title || d.title} description={d.meta?.description || d.excerpt} image={mediaUrl(d.meta?.image, 'card') || mediaUrl(d.heroImage, 'card')} />
      <PageBanner
        title={d.title}
        path="/social-work"
        variant="navy"
      >
        {d.stat && (
          <p className="mt-6 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-saffron-500 pl-4">
            <span className="text-[0.95rem] text-highlight">{x.impact}</span>
            <span className="font-display text-xl text-white">{d.stat}</span>
          </p>
        )}
      </PageBanner>

      <div className="container-x pb-10 sm:pb-20 pt-6 sm:pt-10 md:pb-24 md:pt-12">
        <Link to="/lokmangal/foundation#projects" className="tap-pad inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:gap-3 hover:text-charcoal-900">
          <ArrowLeft aria-hidden className="size-4" /> {x.back}
        </Link>

        <article className="mt-8 grid gap-8 sm:gap-14 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-20">
          <div className="min-w-0">
            {hasCover && (
              /* the cover is the first thing seen: a CSS entrance (it starts with the first paint, it does not wait for the animation code to load) */
              <div className="animate-fade-up overflow-hidden rounded-[1.75rem] bg-cream">
                <Img media={d.heroImage} variant="hero" alt={mediaAlt(d.heroImage, d.title)} sizes="(max-width:1024px) 92vw, 860px" priority className="h-auto max-h-[560px] w-full object-cover" style={{ objectPosition: mediaPosition(d.heroImage) }} />
              </div>
            )}

            {d.objective && (
              /* the objective in a soft cream note — the one highlighted block on the page */
              <Reveal as="section" className="mt-6 sm:mt-10 rounded-[1.5rem] bg-cream p-6 md:p-8">
                <h2 className="flex items-center gap-2.5 text-lg font-semibold text-charcoal-900"><Target aria-hidden className="size-5 text-saffron-600" /> {x.objective}</h2>
                <p className="mt-3 text-[1.08rem] leading-relaxed text-ink">{d.objective}</p>
              </Reveal>
            )}

            <Reveal className="mt-6 sm:mt-10 max-w-3xl"><RichText html={d.body} /></Reveal>

            {hasVideo && (
              <Reveal as="section" className="mt-10 sm:mt-16 md:mt-20">
                <h2 className="mb-6 flex items-center gap-2.5 text-[1.5rem] leading-tight text-charcoal-900 md:text-[1.8rem]"><Clapperboard aria-hidden className="size-6 text-saffron-600" /> {x.videos}</h2>
                <div className="space-y-6">
                  {d.youtubeUrl && <YouTube url={d.youtubeUrl} title={d.title} />}
                  {files.length > 0 && (files.some((v) => youtubeId(v.url)) ? files.map((v) => <YouTube key={v.url} url={v.url} title={v.title} />) : <ProjectVideos videos={files} countLabel={x.videoCount(files.length)} />)}
                </div>
              </Reveal>
            )}

            {photos.length > 0 && (
              <section className="mt-10 sm:mt-16 md:mt-20">
                <Reveal as="div">
                  <h2 className="mb-6 flex items-center gap-2.5 text-[1.5rem] leading-tight text-charcoal-900 md:text-[1.8rem]">
                    <Images aria-hidden className="size-6 text-saffron-600" /> {x.photos}
                    <span className="font-display text-base text-saffron-700">({num(photos.length)})</span>
                  </h2>
                </Reveal>
                <Gallery images={photos} />
              </section>
            )}
          </div>

          {/* side column: what to do next, events and sharing — sticks while reading */}
          <aside className="space-y-6 sm:space-y-10 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col gap-3">
              <Link to="/contact" className="btn btn-primary"><HeartHandshake aria-hidden className="size-4" /> {x.support}</Link>
              <Link to="/lokmangal/foundation#projects" className="btn btn-ghost">{x.all}</Link>
            </div>
            {events.length > 0 && (
              <section>
                <h2 className="border-b-2 border-charcoal-900 pb-3 text-lg text-charcoal-900">{t('events')}</h2>
                <ul className="divide-y divide-line">
                  {events.map((e) => <li key={e.id}><Link to={`/events/${e.slug}`} className="flex items-center justify-between gap-3 py-3 font-medium text-charcoal-900 transition hover:text-saffron-700">{e.title} <span aria-hidden>→</span></Link></li>)}
                </ul>
              </section>
            )}
            <div className="border-t border-line pt-6">
              <Share url={url} title={d.title} label={tc('share')} />
            </div>
          </aside>
        </article>

        {related.length > 0 && (
          <section className="mt-12 sm:mt-24 md:mt-28">
            <Reveal><h2 className="mb-9 text-[1.7rem] leading-tight text-charcoal-900 md:text-[2.2rem]">{tc('relatedPosts')}</h2></Reveal>
            <Stagger className="grid gap-x-7 gap-y-8 sm:gap-y-12 md:grid-cols-2 lg:grid-cols-3">{related.map((r) => <StaggerItem key={r.id}><NewsCard post={r} locale={locale} /></StaggerItem>)}</Stagger>
          </section>
        )}
      </div>
    </>
  )
}
