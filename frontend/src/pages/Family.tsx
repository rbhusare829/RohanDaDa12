import { ArrowRight } from 'lucide-react'
import { Link, useLoaderData } from 'react-router'
import { cms } from '@/lib/api'
import { useTranslations } from '@/lib/i18n'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { Img } from '@/components/ui/Img'
import type { Home } from '@/types/cms'

type FamilyBlock = Extract<NonNullable<Home['sections']>[number], { blockType: 'family' }>

export async function loader() {
  return cms.global('home')
}

/** Family page — uses the "Family background" section of the homepage (edit it under Homepage in the admin) */
export default function FamilyPage() {
  const home = useLoaderData<typeof loader>()
  const t = useTranslations('family')
  const block = (home.sections ?? []).find((s): s is FamilyBlock => s.blockType === 'family')
  const members = block?.members ?? []

  return (
    <>
      <Seo title={t('title')} description={t('intro')} />
      <InnerPage path="/about/family" title={block?.heading || t('title')} subtitle={t('intro')} variant="navy">
        <div className="space-y-16 md:space-y-24">
          {members.map((m, i) => {
            const paras = (m.text ?? '').split(/\n\s*\n/).filter(Boolean)
            return (
              <article key={m.id ?? i} className={cn('grid items-center gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-16', i % 2 === 1 && 'md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]')}>
                {mediaUrl(m.image, 'card') && (
                  <div className={cn('overflow-hidden rounded-[1.75rem] bg-cream', i % 2 === 1 && 'md:order-2')}>
                    <Img media={m.image} variant="card" alt={mediaAlt(m.image, m.name ?? '')} sizes="(max-width:768px) 100vw, 40vw" className="h-auto w-full" />
                  </div>
                )}
                <div>
                  {m.relation && <p className="eyebrow">{m.relation}</p>}
                  <h2 className="mt-2 text-[1.8rem] leading-tight text-charcoal-900 md:text-[2.3rem]">{m.name}</h2>
                  <div className="prose-rd mt-5 max-w-2xl">{paras.map((p, k) => <p key={k}>{p}</p>)}</div>
                </div>
              </article>
            )
          })}
        </div>
        <div className="mt-16 border-t border-line pt-10 md:mt-24">
          <Link to="/lokmangal/parivar" className="btn btn-dark">{t('parivar')} <ArrowRight className="size-4" /></Link>
        </div>
      </InnerPage>
    </>
  )
}
