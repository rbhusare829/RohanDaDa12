import { useState, type ReactNode } from 'react'
import { useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { cms } from '@/lib/api'
import { LOCALE, useTranslations } from '@/lib/i18n'
import { mediaPosition, mediaUrl, toGallery } from '@/lib/media'
import { cn, toMarathiDigits } from '@/lib/utils'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { Gallery } from '@/components/ui/Gallery'
import { ScrollRow } from '@/components/ui/ScrollRow'
import { notFound } from './helpers'

export async function loader({ params }: LoaderFunctionArgs) {
  const event = await cms.findOne('events', { where: { slug: { equals: decodeURIComponent(params.slug ?? '') } }, depth: 2 })
  return event ?? notFound()
}

function YearTabs({ tabs }: { tabs: { key: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key)
  if (!tabs.length) return null
  return (
    <div>
      <ScrollRow role="tablist" className="-mx-4 mb-6 sm:mb-10 flex gap-7 border-b border-line px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={active === t.key} onClick={() => setActive(t.key)}
            className={cn('relative min-w-11 shrink-0 px-1 py-3.5 text-center font-display text-lg font-semibold transition focus-visible:outline-offset-[-3px] after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:rounded-full', active === t.key ? 'text-charcoal-900 after:bg-saffron-500' : 'text-muted hover:text-charcoal-900')}>
            {t.label}
          </button>
        ))}
      </ScrollRow>
      {tabs.map((t) => <div key={t.key} role="tabpanel" hidden={active !== t.key}>{t.content}</div>)}
    </div>
  )
}

export default function EventPage() {
  const d = useLoaderData<typeof loader>()
  const locale = LOCALE
  const t = useTranslations('pages')
  const editions = [...(d.editions ?? [])].sort((a, b) => b.year - a.year)
  const ini = typeof d.initiative === 'object' && d.initiative ? d.initiative : null
  return (
    <>
      <Seo title={d.title} description={d.tagline || d.description} image={mediaUrl(d.coverImage, 'card')} />
      <InnerPage
        path={`/events/${d.slug}`}
        title={d.title}
        subtitle={d.tagline || d.description}
        image={mediaUrl(d.coverImage, 'hero')}
        imagePosition={mediaPosition(d.coverImage)}
        crumbs={
          ini
            ? [{ label: t('socialWork'), href: '/social-work' }, { label: ini.title, href: `/social-work/${ini.slug}` }, { label: d.title }]
            : [{ label: locale === 'mr' ? 'लोकमंगल फाऊंडेशन' : 'Lokmangal Foundation', href: '/lokmangal/foundation' }, { label: locale === 'mr' ? 'कार्यक्रम' : 'Events', href: '/lokmangal/foundation#events' }, { label: d.title }]
        }
        variant="navy"
      >
        {(d.body || d.facts?.length) && (
          <div className="mb-10 sm:mb-16 grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
            {d.body && <div className="prose-rd max-w-3xl">{d.body.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}</div>}
            {!!d.facts?.length && (
              <dl className="self-start border-t-2 border-charcoal-900">
                {d.facts.map((f, i) => (
                  <div key={f.id ?? i} className="border-b border-line py-4">
                    <dt className="text-sm font-semibold text-saffron-700">{f.label}</dt>
                    <dd className="mt-1 text-[1.02rem] font-medium text-charcoal-900">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
        <YearTabs
          tabs={editions.map((e) => ({
            key: String(e.year),
            label: locale === 'mr' ? toMarathiDigits(e.year) : String(e.year),
            content: (
              <div>
                {e.title && <h2 className="text-[1.6rem] leading-tight text-charcoal-900 md:text-[2rem]">{e.title}</h2>}
                {e.text && <p className="lead mb-8 mt-3 max-w-3xl">{e.text}</p>}
                <Gallery images={toGallery(e.images, `${d.title} ${e.year}`)} />
              </div>
            ),
          }))}
        />
      </InnerPage>
    </>
  )
}
