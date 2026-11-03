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
      <span className={cn('grid size-12 shrink-0 place-items-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110', accent, accent.includes('saffron') ? 'text-ink' : 'text-white')}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-saffron-700">{label}</span>
        <span className="mt-1 block break-words font-display text-base font-bold leading-snug text-charcoal-900">{children}</span>
      </span>
    </>
  )
  const cls = 'group flex h-full items-center gap-4 rounded-2xl border border-line bg-cream p-5 shadow-sm transition-[translate,box-shadow,border-color] duration-300 ease-soft motion-safe:hover:-translate-y-1 hover:border-gold hover:shadow-lg active:scale-[0.99]'
  return href ? <a href={href} className={cls}>{body}</a> : <div className={cls}>{body}</div>
}

/**
 * Contact page (redesign, Oct 2026; Modern Teal + Saffron Nov 2026): the page banner; quick-contact cards (phone, email, address, social links from
 * Site settings) on Cloud; then the form in a Cloud card beside the offices on a Modern Teal card (map, address, phone, email of each).
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
              <QuickCard icon={Phone} label={tc('phone')} href={`tel:${settings.phone.replace(/\s/g, '')}`} accent="bg-saffron-600">{settings.phone}</QuickCard>
            </StaggerItem>
          )}
          {settings.email && (
            <StaggerItem>
              <QuickCard icon={Mail} label={tc('email')} href={`mailto:${settings.email}`} accent="bg-leaf-600">{settings.email}</QuickCard>
            </StaggerItem>
          )}
          {settings.address && (
            <StaggerItem>
              <QuickCard icon={MapPin} label={tc('address')} accent="bg-charcoal-900"><span className="whitespace-pre-line">{settings.address}</span></QuickCard>
            </StaggerItem>
          )}
          {!!social.length && (
            <StaggerItem>
              <div className="flex h-full items-center gap-4 rounded-2xl border border-line bg-cream p-5 shadow-sm">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-saffron-600">
                  <Share2 className="size-5" />
                </span>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-saffron-700">{tc('followUs')}</span>
                  <ul className="mt-2 flex flex-wrap gap-1">
                    {social.map(([k, v]) => (
                      <li key={k}>
                        <a href={v} target="_blank" rel="noopener noreferrer" aria-label={socialLabels[k] ?? k} title={socialLabels[k] ?? k} className="grid size-11 place-items-center rounded-lg bg-paper lg:size-8 text-charcoal-900 ring-1 ring-line transition-all hover:bg-charcoal-900 hover:text-paper hover:ring-charcoal-900">
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
          <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-cream p-6 shadow-[0_24px_60px_-24px_rgba(24,33,38,0.22)] md:p-10 lg:col-span-7">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-saffron-600" />
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-saffron-700">{tc('getInTouch')}</p>
              <h2 className="mt-1 font-display text-3xl font-bold leading-tight tracking-tight text-[#182126] sm:text-4xl">{tc('contactUs')}</h2>
            </div>
            <Suspense fallback={<div aria-hidden className="min-h-[36rem] rounded-2xl bg-ivory" />}>
              <ContactForm offices={offices.map((o) => ({ value: String(o.id), label: o.name }))} />
            </Suspense>
          </Reveal>

          {/* the offices */}
          <Reveal delay={0.1} className="on-dark relative overflow-hidden rounded-3xl border-t-4 border-gold bg-charcoal-900 p-6 text-paper shadow-2xl md:p-8 lg:sticky lg:top-28 lg:col-span-5">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-saffron-600/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-leaf-600/15 blur-3xl" />
            <h2 className="relative flex items-center gap-3 font-display text-2xl font-bold text-paper">
              <span className="grid size-10 place-items-center rounded-xl bg-paper/10 text-gold"><MapPin className="size-5" /></span>
              {t('officeLocations')}
            </h2>
            <div className="relative mt-6 space-y-5">
              {offices.map((o, i) => (
                <article key={o.id} className="overflow-hidden rounded-2xl border border-paper/10 bg-paper/[0.04] backdrop-blur-sm">
                  {o.mapEmbedUrl && <iframe title={o.name} src={o.mapEmbedUrl} loading="lazy" className="h-44 w-full border-0 bg-charcoal-900" referrerPolicy="no-referrer-when-downgrade" />}
                  <div className="space-y-2.5 p-5">
                    <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-paper">
                      <span aria-hidden className={cn('size-2.5 rounded-full', i % 2 ? 'bg-leaf-600' : 'bg-gold')} />
                      {o.name}
                    </h3>
                    {o.address && <p className="flex gap-2.5 text-sm text-paper/80"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" /><span className="whitespace-pre-line">{o.address}</span></p>}
                    {o.phone && <p><a className="flex items-center gap-2.5 text-sm text-paper/80 transition hover:text-paper max-lg:min-h-11" href={`tel:${o.phone.replace(/\s/g, '')}`}><Phone className="size-4 text-gold" /> {o.phone}</a></p>}
                    {o.email && <p><a className="flex items-center gap-2.5 break-all text-sm text-paper/80 transition hover:text-paper max-lg:min-h-11" href={`mailto:${o.email}`}><Mail className="size-4 shrink-0 text-gold" /> {o.email}</a></p>}
                  </div>
                </article>
              ))}
              {!offices.length && <p className="text-paper/80">{tc('address')}: —</p>}
            </div>
          </Reveal>
        </div>
      </InnerPage>
    </>
  )
}
