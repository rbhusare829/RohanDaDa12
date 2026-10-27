import { Mail, MapPin, Phone, Share2, type LucideIcon } from 'lucide-react'
import { lazy, Suspense, type ReactNode } from 'react'
import { useLoaderData } from 'react-router'
import { cms } from '@/lib/api'
import { useLayout } from '@/lib/layout'
import { useTranslations } from '@/lib/i18n'
import { socialLabels } from '@/lib/social'
import { cn } from '@/lib/utils'
import { InnerPage } from '@/components/layout/InnerPage'
import { Seo } from '@/components/layout/Seo'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Motion'

// the form (and its form library) is fetched only on this page
const ContactForm = lazy(() => import('@/components/forms/ContactForm').then((m) => ({ default: m.ContactForm })))

export async function loader() {
  return (await cms.find('offices', { limit: 50, sort: 'order' })).docs
}

/** one of the quick-contact cards at the top: icon, label, value */
function QuickCard({ icon: Icon, label, href, accent, children }: { icon: LucideIcon; label: string; href?: string; accent: string; children: ReactNode }) {
  const body = (
    <>
      <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-110', accent)}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-saffron-600">{label}</span>
        <span className="mt-1 block break-words font-display text-base font-bold leading-snug text-charcoal-950">{children}</span>
      </span>
    </>
  )
  const cls = 'group flex h-full items-center gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-saffron-300 hover:shadow-lg'
  return href ? <a href={href} className={cls}>{body}</a> : <div className={cls}>{body}</div>
}

/**
 * Contact page (redesign, Oct 2026): navy page header; quick-contact cards (phone, email, address, social links from
 * Site settings); then the form in a white card beside the offices on a navy card (map, address, phone, email of each).
 */
export default function ContactPage() {
  const offices = useLoaderData<typeof loader>()
  const { settings } = useLayout()
  const t = useTranslations('pages')
  const tc = useTranslations('common')
  const social = Object.entries(settings.social ?? {}).filter(([k, v]) => v && k !== 'id') as [string, string][]

  return (
    <>
      <Seo title={t('contact')} />
      <InnerPage path="/contact" title={t('contact')} subtitle={settings.tagline} variant="navy">
        {/* quick contact */}
        <Stagger className="mb-8 sm:mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mb-16 lg:grid-cols-[1fr_1.4fr_1fr_1.3fr]">
          {settings.phone && (
            <StaggerItem>
              <QuickCard icon={Phone} label={tc('phone')} href={`tel:${settings.phone.replace(/\s/g, '')}`} accent="bg-gradient-to-br from-saffron-600 via-saffron-500 to-[#f97316]">{settings.phone}</QuickCard>
            </StaggerItem>
          )}
          {settings.email && (
            <StaggerItem>
              <QuickCard icon={Mail} label={tc('email')} href={`mailto:${settings.email}`} accent="bg-leaf-600">{settings.email}</QuickCard>
            </StaggerItem>
          )}
          {settings.address && (
            <StaggerItem>
              <QuickCard icon={MapPin} label={tc('address')} accent="bg-charcoal-950"><span className="whitespace-pre-line">{settings.address}</span></QuickCard>
            </StaggerItem>
          )}
          {!!social.length && (
            <StaggerItem>
              <div className="flex h-full items-center gap-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-saffron-500/10 text-saffron-600">
                  <Share2 className="size-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-saffron-600">{tc('followUs')}</span>
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {social.map(([k, v]) => (
                      <li key={k}>
                        <a href={v} target="_blank" rel="noopener noreferrer" aria-label={socialLabels[k] ?? k} title={socialLabels[k] ?? k} className="grid size-11 place-items-center rounded-lg bg-ivory lg:size-8 text-charcoal-900 ring-1 ring-stone-200 transition-all hover:bg-saffron-600 hover:text-white hover:ring-saffron-600">
                          <SocialIcon name={k === 'whatsappChannel' ? 'whatsapp' : k} className="size-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
          )}
        </Stagger>

        <div className="grid grid-cols-1 items-start gap-5 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          {/* the form */}
          <Reveal className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(9,20,34,0.22)] md:p-10 lg:col-span-7">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-saffron-600 via-saffron-500 to-leaf-600" />
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-saffron-500/10 blur-3xl" />
            <div className="relative mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-600">{tc('getInTouch')}</p>
              <h2 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-charcoal-950 sm:text-4xl">{tc('contactUs')}</h2>
            </div>
            <Suspense fallback={<div aria-hidden className="min-h-[36rem] rounded-2xl bg-ivory" />}>
              <ContactForm offices={offices.map((o) => ({ value: String(o.id), label: o.name }))} />
            </Suspense>
          </Reveal>

          {/* the offices */}
          <Reveal delay={0.1} className="on-dark relative overflow-hidden rounded-3xl border-t-4 border-saffron-500 bg-gradient-to-b from-charcoal-950 via-[#0c1a2e] to-[#10233d] p-6 text-white shadow-2xl md:p-8 lg:sticky lg:top-28 lg:col-span-5">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-saffron-600/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-leaf-600/15 blur-3xl" />
            <h2 className="relative flex items-center gap-3 font-display text-2xl font-bold text-white">
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-saffron-500"><MapPin className="size-5" /></span>
              {t('officeLocations')}
            </h2>
            <div className="relative mt-6 space-y-5">
              {offices.map((o, i) => (
                <article key={o.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                  {o.mapEmbedUrl && <iframe title={o.name} src={o.mapEmbedUrl} loading="lazy" className="h-44 w-full border-0 bg-charcoal-900" referrerPolicy="no-referrer-when-downgrade" />}
                  <div className="space-y-2.5 p-5">
                    <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-white">
                      <span aria-hidden className={cn('size-2.5 rounded-full', i % 2 ? 'bg-leaf-600' : 'bg-saffron-500')} />
                      {o.name}
                    </h3>
                    {o.address && <p className="flex gap-2.5 text-sm text-slate-300"><MapPin className="mt-0.5 size-4 shrink-0 text-saffron-500" /><span className="whitespace-pre-line">{o.address}</span></p>}
                    {o.phone && <p><a className="flex items-center gap-2.5 text-sm text-slate-300 transition hover:text-white max-lg:min-h-11" href={`tel:${o.phone.replace(/\s/g, '')}`}><Phone className="size-4 text-saffron-500" /> {o.phone}</a></p>}
                    {o.email && <p><a className="flex items-center gap-2.5 break-all text-sm text-slate-300 transition hover:text-white max-lg:min-h-11" href={`mailto:${o.email}`}><Mail className="size-4 shrink-0 text-saffron-500" /> {o.email}</a></p>}
                  </div>
                </article>
              ))}
              {!offices.length && <p className="text-slate-300">{tc('address')}: —</p>}
            </div>
          </Reveal>
        </div>
      </InnerPage>
    </>
  )
}
