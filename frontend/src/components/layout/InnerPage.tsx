import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { useLayout } from '@/lib/layout'
import { getSectionMenu } from '@/lib/section-menu'
import { PageBanner, type Crumb } from './PageBanner'

type Props = {
  path: string
  title: string
  subtitle?: string | null
  image?: string | null
  /** object-position for the banner photo (focal point) */
  imagePosition?: string
  crumbs?: Crumb[]
  /** show the section's sibling pages (as tabs on the banner) */
  sideMenu?: boolean
  /** Stitch page header: 'navy' or 'light' (no photo); without it the standard banner */
  variant?: 'navy' | 'light'
  /** small label above the title (Stitch header) */
  eyebrow?: string | null
  /** full width: children provide their own full-bleed sections & container-x */
  fullWidth?: boolean
  children: ReactNode
}

/**
 * Standard inner-page template, identical on every page:
 * banner (breadcrumb, title, sibling pages as tabs) → content on the site grid, starting at the same
 * left edge as the title. Blocks inside decide their own reading width.
 */
export function InnerPage({ path, title, subtitle, image, imagePosition, crumbs, sideMenu = true, variant, eyebrow, fullWidth, children }: Props) {
  const { header } = useLayout()
  const menu = getSectionMenu(path, header)
  const autoCrumbs: Crumb[] = crumbs ?? [...(menu.title && menu.title !== title ? [{ label: menu.title, href: menu.sectionHref }] : []), { label: title }]
  const section = useSectionInView(path, menu.items.map((it) => it.href))
  const tabs = sideMenu && menu.items.length > 1 ? menu.items.map((it) => ({ ...it, active: it.href === (section ? `${path}#${section}` : path) })) : undefined
  return (
    <>
      <PageBanner title={title} subtitle={subtitle} crumbs={autoCrumbs} image={image} imagePosition={imagePosition} tabs={tabs} tabsLabel={menu.title ?? undefined} path={path} variant={variant} eyebrow={eyebrow} />
      {fullWidth ? (
        <main className="relative min-h-[60vh] text-slate-800">
          {children}
        </main>
      ) : (
        <main className="relative min-h-[60vh] bg-white text-slate-800">
          {/* Soft atmospheric gradient top fade from breadcrumb row */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/40 to-transparent" />
          <div className={variant ? 'container-x relative z-10 pb-12 sm:pb-20 pt-8 sm:pt-12 md:pb-28 md:pt-14' : 'container-x relative z-10 pb-12 sm:pb-20 pt-6 sm:pt-10 md:pb-24 md:pt-12'}>
            <div className="min-w-0">{children}</div>
          </div>
        </main>
      )}
    </>
  )
}

/** a tab is "in view" once its section's top has passed under the sticky header + tab bar */
const TOP_OFFSET = 170

/**
 * When some of the section's tabs are parts of this same page (Lokmangal Foundation → #events, #projects), the tab of the part being read
 * is the highlighted one: first from the address (…#projects), then following the scroll. '' = the page itself (its top part).
 * Pages without such tabs never listen to the scroll.
 */
function useSectionInView(path: string, hrefs: string[]) {
  const { hash } = useLocation()
  const ids = hrefs.filter((h) => h.startsWith(`${path}#`)).map((h) => h.slice(path.length + 1))
  const key = ids.join(',')
  const fromHash = ids.includes(hash.slice(1)) ? hash.slice(1) : ''
  const [current, setCurrent] = useState(fromHash)

  // a new #… in the address (a tab or the menu was clicked) shows that tab at once, before the page has finished scrolling
  const [lastHash, setLastHash] = useState(hash)
  if (lastHash !== hash) {
    setLastHash(hash)
    setCurrent(fromHash)
  }

  useEffect(() => {
    if (!key) return
    const list = key.split(',')
    let frame = 0
    const update = () => {
      frame = 0
      let next = ''
      for (const id of list) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= TOP_OFFSET) next = id
      }
      // at the very bottom of the page the last part counts as read, even when it is too short to reach the top
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && list.length) next = list[list.length - 1]
      setCurrent(next)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key])

  return ids.length ? current : ''
}
