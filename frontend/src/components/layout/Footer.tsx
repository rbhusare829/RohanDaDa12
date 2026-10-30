import { Mail, MapPin, Phone } from 'lucide-react'
import { useLayout } from '@/lib/layout'
import { useTranslations } from '@/lib/i18n'
import { isLiveLink } from '@/lib/nav'
import { CMSLink } from '../ui/CMSLink'
import { Stagger, StaggerItem } from '../ui/Motion'
import { SocialIcon } from '../ui/SocialIcon'
import { socialLabels } from '@/lib/social'

/** Removed from the footer (Oct 2026) — hidden even if an older footer in the database still lists them */
const HIDDEN_LEGAL = ['/privacy-policy', '/terms', '/disclaimer']
/** Footer menu links removed (Oct 2026): Appeal, Family, All initiatives */
const HIDDEN_LINKS = ['/appeal', '/about/family', '/social-work']

/**
 * Footer (Stitch design, Oct 2026): deep navy with a kesariya top edge — contact details and social links
 * on the left, the footer menus from the CMS beside it, then the copyright line.
 */
export function Footer() {
  const { settings, footer } = useLayout()
  const t = useTranslations('common')
  const social = Object.entries(settings.social ?? {}).filter(([k, v]) => v && k !== 'id')
  const cols = footer.columns ?? []

  return (
    <footer className="on-dark relative z-10 border-t-4 border-saffron-500 bg-[#000d3d] pb-10 pt-16 text-white">
      <div className="container-x">
        {/* phones: one column — the contact block, then each link list under the previous one (Oct 2026); tablets: two side by side */}
        <Stagger className="grid grid-cols-1 gap-x-6 gap-y-8 border-b border-white/15 pb-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <StaggerItem className="flex flex-col items-start gap-4 lg:col-span-4">
            {/* h2: the footer's own headings come after any heading of the page, so no level is skipped */}
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-saffron-400">{t('contactUs')}</h2>
            <img src="/brand/logo-name.svg" alt={settings.siteName} width={180} height={46} loading="lazy" className="h-11 w-auto brightness-0 invert" />
            <ul className="space-y-2.5 pt-2 text-sm text-slate-300">
              {settings.address && (
                <li className="flex gap-2">
                  <MapPin className="mt-0.5 size-[18px] shrink-0 text-saffron-400" /> <span className="whitespace-pre-line">{settings.address}</span>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 break-all transition-colors hover:text-white max-lg:min-h-11">
                    <Mail className="size-[18px] shrink-0 text-saffron-400" /> {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 transition-colors hover:text-white max-lg:min-h-11">
                    <Phone className="size-[18px] shrink-0 text-saffron-400" /> {settings.phone}
                  </a>
                </li>
              )}
            </ul>
            {!!social.length && (
              <ul className="mt-2 flex flex-wrap gap-2" aria-label={t('followUs')}>
                {social.map(([k, v]) => (
                  <li key={k}>
                    <a href={v as string} target="_blank" rel="noopener noreferrer" aria-label={socialLabels[k] ?? k} className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-saffron-700 hover:scale-105 active:scale-95 lg:size-9.5">
                      <SocialIcon name={k === 'whatsappChannel' ? 'whatsapp' : k} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </StaggerItem>

          {cols.map((col, i) => (
            <StaggerItem key={col.id} className={i === cols.length - 1 && cols.length < 4 ? 'flex min-w-0 flex-col gap-3 lg:col-span-3' : 'flex min-w-0 flex-col gap-3 lg:col-span-2.5 lg:col-span-2'}>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-saffron-400">{col.title}</h2>
              <ul className="space-y-2 text-sm text-slate-300 max-lg:space-y-0">
                {col.links?.filter((l) => isLiveLink(l.url) && !HIDDEN_LINKS.includes(l.url ?? '')).map((l) => (
                  <li key={l.id}>
                    <CMSLink url={l.url} newTab={l.newTab} className="group flex items-center gap-1.5 transition-colors hover:text-white max-lg:min-h-11">
                      <span className="text-saffron-400 transition-transform group-hover:translate-x-0.5">&rsaquo;</span>
                      <span>{l.label}</span>
                    </CMSLink>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-slate-400 sm:flex-row">
          <p className="text-center sm:text-left">
            {footer.copyright}
            {footer.developerCredit && (
              <span>
                {' · '}
                {footer.developerUrl ? (
                  <a href={footer.developerUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-white hover:underline">
                    {footer.developerCredit}
                  </a>
                ) : (
                  footer.developerCredit
                )}
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.legalLinks?.filter((l) => isLiveLink(l.url) && !HIDDEN_LEGAL.includes(l.url ?? '')).map((l) => (
              <CMSLink key={l.id} url={l.url} className="underline underline-offset-4 hover:text-white max-lg:inline-flex max-lg:min-h-11 max-lg:items-center">
                {l.label}
              </CMSLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
