import { useCallback, useEffect, useId, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowUpRight, CalendarCheck, ChevronDown, FileText, Globe, Mail, Menu, Phone, X } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useLayout } from '@/lib/layout'
import { getLocale, setLocale, useTranslations } from '@/lib/i18n'
import { isMedia, mediaUrl } from '@/lib/media'
import { normalizeNav, type NavNode } from '@/lib/nav'
import { cn, isExternal } from '@/lib/utils'

/* Motion in the header is kept small and quick: opacity and transform only (cheap on a phone), colour changes listed on their own so a keyboard
   focus ring appears at once instead of fading in. Desktop menus start fast and settle softly; the phone drawer uses the familiar "sheet" curve. */
const EASE_MENU = [0.22, 1, 0.36, 1] as const
const EASE_SHEET = [0.32, 0.72, 0, 1] as const

/** 4 Connect Services matching the citizen portal layout */
export const CONNECT_ITEMS = [
  {
    titleMr: 'निवेदन',
    titleEn: 'Petition',
    to: '/grievance',
    icon: FileText,
  },
  {
    titleMr: 'भेटीचे विवरण',
    titleEn: 'Appointment',
    to: '/appointment',
    icon: CalendarCheck,
  },
  {
    titleMr: 'आमंत्रण',
    titleEn: 'Invitation',
    to: '/invitation',
    icon: Mail,
  },
  {
    titleMr: 'संपर्क',
    titleEn: 'Contact',
    to: '/contact',
    icon: Phone,
  },
] as const

/** Does a menu link point at the page being shown (`exact`) or at the section that page belongs to? A link to an #anchor or ?query is never "the page". */
function pointsHere(url: string | null | undefined, pathname: string, exact = false) {
  if (!url || !url.startsWith('/') || /[?#]/.test(url)) return false
  if (url === '/') return pathname === '/'
  return pathname === url || (!exact && pathname.startsWith(`${url}/`))
}

/** the item, or one of its sub-items, is the current page (or the section it belongs to) */
const inSection = (n: NavNode, pathname: string): boolean => pointsHere(n.url, pathname) || Boolean(n.children?.some((c) => inSection(c, pathname)))

type LinkProps = { node: NavNode; className?: string; onClick?: () => void; children: ReactNode } & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-current'>

const NavLink = ({ node, className, onClick, children, ...aria }: LinkProps) => {
  if (!node.url) return <span className={className}>{children}</span>
  if (isExternal(node.url) || node.newTab)
    return (
      <a href={node.url} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick} {...aria}>
        {children}
      </a>
    )
  return (
    <Link to={node.url} className={className} onClick={onClick} {...aria}>
      {children}
    </Link>
  )
}

const maskStyle = (logoUrl: string) => ({
  maskImage: `url(${logoUrl})`,
  WebkitMaskImage: `url(${logoUrl})`,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'left center',
  WebkitMaskPosition: 'left center',
})

/**
 * The site's own name logo (रोहन सुभाष देशमुख) traced as a vector (Oct 2026), so it stays sharp on phone screens; the
 * uploaded file is only 373 px wide and looked soft and faint there. Used while the logo in Site settings is that original file —
 * a different logo uploaded in the admin is shown as uploaded.
 */
const VECTOR_LOGO = '/brand/logo-name.svg'
const ORIGINAL_LOGO = 'logo-light.webp'

/** the logo for light backgrounds (or the white one drawn in navy through a mask) */
function Logo({ siteName, logoUrl, logoDarkUrl, small }: { siteName: string; logoUrl?: string | null; logoDarkUrl?: string | null; small?: boolean }) {
  if (logoDarkUrl) return <img src={logoDarkUrl} alt={siteName} width={190} height={48} fetchPriority="high" className={cn('w-auto shrink-0 object-contain object-left transition-opacity duration-200 hover:opacity-80', small ? 'h-8' : 'h-10')} />
  if (logoUrl) return <span role="img" aria-label={siteName} className={cn('block shrink-0 bg-charcoal-950 transition-opacity duration-200 hover:opacity-80', small ? 'h-9 w-[134px]' : 'h-11 w-[164px] max-[379px]:h-10 max-[379px]:w-[146px] xl:h-10 xl:w-[148px]')} style={maskStyle(logoUrl)} />
  return <span className="font-display text-xl font-bold text-charcoal-950 transition-[color] hover:text-saffron-600">{siteName}</span>
}

/** Segmented language toggle: switches dynamically between Marathi (default) and English */
function LanguageToggle({ isMobile = false }: { isMobile?: boolean }) {
  const currentLocale = getLocale()

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={cn(
        'inline-flex items-center rounded-full border border-stone-200/90 bg-stone-100/90 p-0.5 shadow-2xs transition-colors',
        isMobile ? 'text-[11px]' : 'text-xs',
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (currentLocale !== 'mr') setLocale('mr')
        }}
        aria-pressed={currentLocale === 'mr'}
        title={currentLocale === 'en' ? 'Read in Marathi' : 'मराठी मध्ये वाचा'}
        className={cn(
          'flex items-center justify-center rounded-full font-bold transition-all duration-200 active:scale-95 cursor-pointer',
          isMobile ? 'relative px-2 py-0.5 after:absolute after:inset-x-0 after:-inset-y-2.5' : 'px-2.5 py-1',
          currentLocale === 'mr'
            ? 'bg-saffron-600 text-white shadow-xs'
            : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-stone-200/60',
        )}
      >
        मराठी
      </button>
      <button
        type="button"
        onClick={() => {
          if (currentLocale !== 'en') setLocale('en')
        }}
        aria-pressed={currentLocale === 'en'}
        title={currentLocale === 'en' ? 'Read in English' : 'इंग्रजीमध्ये वाचा'}
        className={cn(
          'flex items-center justify-center rounded-full font-bold transition-all duration-200 active:scale-95 cursor-pointer',
          isMobile ? 'relative px-2 py-0.5 after:absolute after:inset-x-0 after:-inset-y-2.5' : 'px-2.5 py-1',
          currentLocale === 'en'
            ? 'bg-saffron-600 text-white shadow-xs'
            : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-stone-200/60',
        )}
      >
        ENG
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ desktop menu */

const navBase =
  "relative flex h-10 items-center gap-1 whitespace-nowrap rounded-lg px-3 text-[0.95rem] font-medium transition-[color] xl:px-3.5 after:pointer-events-none after:absolute after:inset-x-3 after:-bottom-5 after:h-0.5 after:rounded-full after:bg-saffron-600 after:transition-transform after:duration-200 after:ease-out after:content-[''] xl:after:inset-x-3.5"
const navIdle = 'text-charcoal-800 after:origin-right after:scale-x-0 hover:text-saffron-700 hover:after:origin-left hover:after:scale-x-100'
const navOn = 'text-saffron-700 after:origin-left after:scale-x-100'

/** one link inside a dropdown */
function DropLink({ node, pathname, onNavigate }: { node: NavNode; pathname: string; onNavigate: () => void }) {
  const active = inSection(node, pathname)
  const external = isExternal(node.url) || node.newTab
  return (
    <NavLink
      node={node}
      onClick={onNavigate}
      aria-current={pointsHere(node.url, pathname, true) ? 'page' : undefined}
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[0.92rem] leading-snug transition-[color,background-color]',
        active ? 'bg-saffron-50 font-semibold text-saffron-800' : 'text-charcoal-800 hover:bg-saffron-50 hover:text-saffron-800',
      )}
    >
      <span>{node.label}</span>
      {external ? <ArrowUpRight aria-hidden className="size-3.5 shrink-0 opacity-60" /> : active ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-saffron-600" /> : null}
    </NavLink>
  )
}

/** the panel under a menu item */
function Dropdown({ id, items, align, pathname, onNavigate }: { id: string; items: NavNode[]; align: 'left' | 'right' | 'center'; pathname: string; onNavigate: () => void }) {
  const mega = items.some((c) => c.children?.length)
  return (
    <m.div
      id={id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ duration: 0.16, ease: EASE_MENU }}
      className={cn('absolute top-full z-10 pt-1.5', align === 'right' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0 -ml-1.5')}
    >
      <div
        className={cn(
          'rounded-2xl border border-stone-200 bg-white shadow-[0_22px_48px_-16px_rgba(14,30,52,0.3)]',
          mega ? cn('grid gap-x-4 p-4', items.length === 1 ? 'w-72' : items.length === 2 ? 'w-[min(520px,90vw)] grid-cols-2' : 'w-[min(760px,90vw)] grid-cols-3') : 'w-60 p-1.5',
        )}
      >
        {mega ? (
          items.map((c, j) => (
            <div key={c.id ?? j}>
              <NavLink node={c} onClick={onNavigate} className="mb-1 block px-3 pt-1 text-xs font-semibold uppercase tracking-wider text-stone-500 transition-[color] hover:text-saffron-700">
                {c.label}
              </NavLink>
              <ul>
                {c.children?.map((g, k) => (
                  <li key={g.id ?? k}>
                    <DropLink node={g} pathname={pathname} onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <ul>
            {items.map((c, j) => (
              <li key={c.id ?? j}>
                <DropLink node={c} pathname={pathname} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </m.div>
  )
}

/** The menu on wide screens */
function DesktopNav({ nav, pathname }: { nav: NavNode[]; pathname: string }) {
  const [open, setOpen] = useState<number | null>(null)
  const [pinned, setPinned] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const list = useRef<HTMLUListElement>(null)
  const triggers = useRef<(HTMLButtonElement | null)[]>([])
  const uid = useId()

  const [menuFor, setMenuFor] = useState(pathname)
  if (menuFor !== pathname) {
    setMenuFor(pathname)
    setOpen(null)
    setPinned(false)
  }

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      triggers.current[open]?.focus()
      setOpen(null)
      setPinned(false)
    }
    const onPointer = (e: PointerEvent) => {
      if (list.current?.contains(e.target as Node)) return
      setOpen(null)
      setPinned(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(null)
    setPinned(false)
  }
  const show = (i: number) => {
    if (timer.current) clearTimeout(timer.current)
    if (open === i) return
    if (open !== null) {
      setOpen(i)
      setPinned(false)
      return
    }
    timer.current = setTimeout(() => {
      setOpen(i)
      setPinned(false)
    }, 90)
  }
  const hide = () => {
    if (timer.current) clearTimeout(timer.current)
    if (pinned) return
    timer.current = setTimeout(() => setOpen(null), 140)
  }
  const toggle = (i: number) => {
    if (timer.current) clearTimeout(timer.current)
    if (open === i && pinned) close()
    else {
      setOpen(i)
      setPinned(true)
    }
  }

  return (
    <nav aria-label="Main" className="ml-auto hidden self-stretch lg:block">
      <ul ref={list} className="flex h-full items-center gap-0.5 xl:gap-1">
        {nav.map((item, i) => {
          const kids = item.children ?? []
          const hasKids = kids.length > 0
          const isOpen = open === i
          const on = isOpen || inSection(item, pathname)
          const mega = kids.some((c) => c.children?.length)
          const panelId = `${uid}-${i}`
          return (
            <li
              key={item.id ?? i}
              className="relative flex h-full items-center"
              onMouseEnter={hasKids ? () => show(i) : undefined}
              onMouseLeave={hasKids ? hide : undefined}
              onBlur={hasKids ? (e) => { if (isOpen && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) close() } : undefined}
            >
              {hasKids ? (
                <button
                  ref={(el) => { triggers.current[i] = el }}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? panelId : undefined}
                  onClick={() => toggle(i)}
                  className={cn(navBase, on ? navOn : navIdle)}
                >
                  {item.label}
                  <ChevronDown aria-hidden className={cn('size-3.5 shrink-0 opacity-60 transition-transform duration-200', isOpen && 'rotate-180')} />
                </button>
              ) : (
                <NavLink node={item} aria-current={pointsHere(item.url, pathname, true) ? 'page' : undefined} className={cn(navBase, on ? navOn : navIdle)}>
                  {item.label}
                </NavLink>
              )}
              <AnimatePresence>
                {hasKids && isOpen && <Dropdown id={panelId} items={kids} align={mega && kids.length > 1 ? 'center' : i === nav.length - 1 ? 'right' : 'left'} pathname={pathname} onNavigate={close} />}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * 2x2 Connect Dropdown matching subhashdeshmukh.com design (Image 4):
 * Contains:
 * 1. निवेदन (/grievance)
 * 2. भेटीचे विवरण (/appointment)
 * 3. आमंत्रण (/invitation)
 * 4. संपर्क (/contact)
 */
function ConnectMenu({ pathname }: { pathname: string }) {
  const isMr = getLocale() !== 'en'
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isConnectActive = ['/grievance', '/appointment', '/meeting', '/invitation', '/contact'].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(false)
    setPinned(false)
  }

  const show = () => {
    if (timer.current) clearTimeout(timer.current)
    setOpen(true)
  }

  const hide = () => {
    if (timer.current) clearTimeout(timer.current)
    if (pinned) return
    timer.current = setTimeout(() => setOpen(false), 140)
  }

  const toggle = () => {
    if (timer.current) clearTimeout(timer.current)
    if (open && pinned) close()
    else {
      setOpen(true)
      setPinned(true)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerRef.current?.focus()
        close()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  useEffect(() => {
    close()
  }, [pathname])

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'group flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 active:scale-95 cursor-pointer',
          isConnectActive || open
            ? 'bg-[#c25e00] ring-2 ring-[#c25e00]/40 shadow-md'
            : 'bg-[#000d3d] hover:bg-[#c25e00]',
        )}
      >
        <span>{isMr ? 'कनेक्ट' : 'Connect'}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            'size-3.5 transition-transform duration-200 ease-out opacity-80',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96, transition: { duration: 0.1 } }}
            transition={{ duration: 0.18, ease: EASE_MENU }}
            className="absolute right-0 top-full z-50 pt-2"
          >
            {/* Matches Image 4 (media_1793356995960_a83a0043.png): Deep saffron orange rounded card */}
            <div className="w-[316px] rounded-2xl bg-[#c25e00] p-3 shadow-[0_22px_48px_-12px_rgba(194,94,0,0.5)] ring-1 ring-black/5">
              <div className="grid grid-cols-2 gap-2">
                {CONNECT_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.to
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={close}
                      className={cn(
                        'group/item flex items-center gap-2.5 rounded-xl p-2.5 transition-all duration-150 cursor-pointer',
                        active
                          ? 'bg-white/25 shadow-xs font-semibold'
                          : 'hover:bg-white/20 active:bg-white/30',
                      )}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-2xs group-hover/item:bg-white/30 group-hover/item:scale-105 transition-all">
                        <Icon className="size-4.5" />
                      </span>
                      <span className="font-display text-[0.92rem] font-bold text-white tracking-wide leading-tight">
                        {isMr ? item.titleMr : item.titleEn}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ phone & tablet drawer */

const mobileRow = 'flex min-h-12 items-center rounded-xl px-4 text-[1.02rem] font-semibold transition-[color,background-color] active:bg-saffron-100'

function MobileMenu({
  id, nav, pathname, logo, menuLabel, closeLabel, onClose, onNavigate,
}: {
  id: string; nav: NavNode[]; pathname: string; logo: ReactNode; menuLabel: string; closeLabel: string
  onClose: () => void; onNavigate: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const uid = useId()
  const [group, setGroup] = useState<number | null>(() => {
    const i = nav.findIndex((n) => n.children?.length && inSection(n, pathname))
    return i >= 0 ? i : null
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => !el.closest('[inert]'))
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (!panel.current.contains(document.activeElement)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden lg:hidden">
      <m.div
        aria-hidden
        className="absolute inset-0 touch-none bg-charcoal-950/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={onClose}
      />
      <m.div
        id={id}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={menuLabel}
        className="absolute inset-y-0 left-0 flex w-[min(24rem,calc(100vw-3rem))] flex-col bg-ivory shadow-2xl will-change-transform"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.42, ease: EASE_SHEET }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-saffron-100 pl-6 pr-3 sm:h-[4.5rem]">
          {logo}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            autoFocus
            className="grid size-11 place-items-center rounded-xl text-charcoal-800 transition-[color,background-color] hover:bg-saffron-50 hover:text-saffron-800 active:bg-saffron-100"
          >
            <X aria-hidden className="size-6" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <ul className="space-y-1">
            {nav.map((n, i) => {
              const kids = n.children ?? []
              const active = inSection(n, pathname)
              if (!kids.length)
                return (
                  <li key={n.id ?? i}>
                    <NavLink
                      node={n}
                      onClick={onNavigate}
                      aria-current={pointsHere(n.url, pathname, true) ? 'page' : undefined}
                      className={cn(mobileRow, active ? 'bg-saffron-50 text-saffron-800' : 'text-charcoal-900 hover:bg-saffron-50')}
                    >
                      {n.label}
                    </NavLink>
                  </li>
                )
              const open = group === i
              const panelId = `${uid}-${i}`
              return (
                <li key={n.id ?? i}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setGroup(open ? null : i)}
                    className={cn(mobileRow, 'w-full justify-between gap-3 text-left hover:bg-saffron-50', active ? 'text-saffron-800' : 'text-charcoal-900', open && 'bg-saffron-50')}
                  >
                    <span>{n.label}</span>
                    <ChevronDown aria-hidden className={cn('size-5 shrink-0 transition-transform duration-200', open ? 'rotate-180 text-saffron-700' : 'text-stone-400')} />
                  </button>
                  <div id={panelId} className={cn('grid transition-[grid-template-rows] duration-200 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div inert={!open} className="min-h-0 overflow-hidden">
                      <ul className="mb-2 ml-6 mt-1 space-y-0.5 border-l-2 border-saffron-100 pl-2">
                        {kids.map((c, j) => {
                          const here = inSection(c, pathname)
                          return (
                            <li key={c.id ?? j}>
                              <NavLink
                                node={c}
                                onClick={onNavigate}
                                aria-current={pointsHere(c.url, pathname, true) ? 'page' : undefined}
                                className={cn('flex min-h-11 items-center rounded-lg px-3 text-[0.97rem] transition-[color,background-color] active:bg-saffron-100', here ? 'bg-saffron-50 font-semibold text-saffron-800' : 'text-charcoal-800 hover:bg-saffron-50')}
                              >
                                {c.label}
                              </NavLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Panel with 2x2 Connect Box + Language Selector */}
        <div className="shrink-0 space-y-3 border-t border-saffron-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* 2x2 Connect Grid matching desktop Image 4 */}
          <div className="rounded-2xl bg-[#c25e00] p-2.5 shadow-md">
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-orange-100">
              {getLocale() === 'mr' ? 'नागरिक सेवा — थेट कनेक्ट' : 'Citizen Connect Services'}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CONNECT_ITEMS.map((item) => {
                const Icon = item.icon
                const active = pathname === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-2 rounded-xl p-2 transition-all cursor-pointer',
                      active ? 'bg-white/25 font-bold shadow-2xs' : 'hover:bg-white/20 active:bg-white/30',
                    )}
                  >
                    <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {getLocale() === 'mr' ? item.titleMr : item.titleEn}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-stone-200/70 bg-stone-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-700">
              <Globe className="size-3.5 text-saffron-600" />
              <span>{getLocale() === 'mr' ? 'भाषा निवडा:' : 'Language:'}</span>
            </span>
            <LanguageToggle isMobile />
          </div>
        </div>
      </m.div>
    </div>
  )
}

/* ------------------------------------------------------------------ the header */

export function Header() {
  const { header, settings } = useLayout()
  const tn = useTranslations('nav')
  const nav = normalizeNav(header.nav as never)
  const siteName = settings.siteName
  const logoUrl = isMedia(settings.logoLight) && settings.logoLight.filename === ORIGINAL_LOGO ? VECTOR_LOGO : mediaUrl(settings.logoLight)
  const logoDarkUrl = mediaUrl(settings.logoDark)

  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const drawerId = useId()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [menuFor, setMenuFor] = useState(pathname)
  if (menuFor !== pathname) {
    setMenuFor(pathname)
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    const wide = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (wide.matches) setMobileOpen(false)
    }
    wide.addEventListener('change', onChange)
    return () => {
      document.body.style.overflow = ''
      wide.removeEventListener('change', onChange)
    }
  }, [mobileOpen])

  const closeDrawer = useCallback(() => {
    setMobileOpen(false)
    menuButton.current?.focus()
  }, [])
  const leaveDrawer = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b bg-white transition-[box-shadow,border-color] duration-300 lg:bg-white/95 lg:backdrop-blur-md',
          scrolled ? 'border-stone-200/90 shadow-[0_4px_20px_-4px_rgba(0,13,61,0.08)]' : 'border-stone-100',
        )}
      >
        <div className="container-x flex h-16 items-center sm:h-[4.5rem] lg:h-20">
          <Link to="/" className="flex min-h-11 min-w-0 shrink-0 items-center" aria-label={siteName}>
            <Logo siteName={siteName} logoUrl={logoUrl} logoDarkUrl={logoDarkUrl} />
          </Link>

          <DesktopNav nav={nav} pathname={pathname} />

          {/* Desktop Controls: Language Toggle & Connect Dropdown CTA */}
          <div className="ml-3 hidden items-center gap-3 lg:flex xl:ml-5">
            <LanguageToggle />
            <ConnectMenu pathname={pathname} />
          </div>

          {/* Mobile Right Controls: Language Toggle + Hamburger Menu */}
          <div className="ml-auto flex items-center gap-2.5 lg:hidden">
            <LanguageToggle isMobile />

            <button
              ref={menuButton}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={tn('menu')}
              aria-expanded={mobileOpen}
              aria-controls={mobileOpen ? drawerId : undefined}
              className="grid size-11 place-items-center rounded-lg bg-[#000d3d] text-white shadow-xs transition-colors hover:bg-saffron-700 active:scale-95"
            >
              <Menu aria-hidden="true" className="size-5.5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            id={drawerId}
            nav={nav}
            pathname={pathname}
            logo={<Logo siteName={siteName} logoUrl={logoUrl} logoDarkUrl={logoDarkUrl} small />}
            menuLabel={tn('menu')}
            closeLabel={tn('close')}
            onClose={closeDrawer}
            onNavigate={leaveDrawer}
          />
        )}
      </AnimatePresence>
    </>
  )
}
