import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Globe, Home, Inbox, LogOut, Menu, UserRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { admin } from './api'
import { useAsync, useAuth, useSchema } from './context'
import { GROUP_ORDER } from './schema'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] transition', isActive ? 'bg-saffron-500/20 font-semibold text-white' : 'text-white/80 hover:bg-white/[0.08] hover:text-white')

type NavItem = { to: string; label: string }

/** The side menu is built from the schema: groups, in a fixed order, with Homepage / Settings pages before the lists */
function useNav() {
  const { schema } = useSchema()
  return useMemo(() => {
    const groups = new Map<string, NavItem[]>()
    const add = (group: string | undefined, item: NavItem) => groups.set(group ?? 'Other', [...(groups.get(group ?? 'Other') ?? []), item])
    for (const g of schema.globals) if (g.permissions.read) add(g.admin.group, { to: `/admin/globals/${g.slug}`, label: g.label })
    for (const c of schema.collections) if (!c.admin.hidden && c.permissions.read) add(c.admin.group, { to: `/admin/collections/${c.slug}`, label: c.labels.plural })
    const order = [...GROUP_ORDER, ...[...groups.keys()].filter((g) => !GROUP_ORDER.includes(g))]
    return order.filter((g) => groups.has(g) && g !== 'Inbox').map((g) => ({ group: g, items: groups.get(g)! }))
  }, [schema])
}

/** The admin frame: navy side menu, top bar with the account menu, the page */
export function AdminLayout() {
  const { user, logout } = useAuth()
  const { collection } = useSchema()
  const nav = useNav()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  // the phone menu: Escape closes it, and the close button gets the focus when it opens
  useEffect(() => {
    if (!open) return
    closeButton.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const inbox = collection('contact-messages')?.permissions.read
  const unread = useAsync(() => (inbox ? admin.count('contact-messages', { status: { equals: 'new' } }) : Promise.resolve(0)), [inbox, pathname])

  const menu = (
    <>
      <div className="flex items-center gap-3 px-5 pb-4 pt-5">
        <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-700 font-display text-xl text-white">रो</span>
        <div className="leading-tight">
          <p className="font-display text-[1.05rem] text-white">रोहन सुभाष देशमुख</p>
          <p className="text-[0.75rem] text-white/60">Website admin</p>
        </div>
      </div>
      <nav aria-label="Admin" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">
          <NavLink to="/admin" end className={linkClass}><Home className="size-4" /> Dashboard</NavLink>
          {inbox && (
            <NavLink to="/admin/collections/contact-messages" className={linkClass}>
              <Inbox className="size-4" /> Inbox
              {(unread.data ?? 0) > 0 && <span className="ml-auto rounded-full bg-saffron-500 px-2 py-0.5 text-[0.7rem] font-bold text-white">{unread.data}</span>}
            </NavLink>
          )}
        </div>
        {nav.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 pb-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-white/65">{group}</p>
            <ul className="space-y-0.5">
              {items.map((i) => (
                <li key={i.to}><NavLink to={i.to} className={linkClass}>{i.label}</NavLink></li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.9rem] text-white/80 hover:bg-white/[0.08] hover:text-white"><Globe className="size-4" /> View website ↗</a>
        <NavLink to="/admin/account" className={linkClass}><UserRound className="size-4" /> {user?.name || user?.email}</NavLink>
        <button type="button" onClick={async () => (await logout(), navigate('/admin/login'))} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.9rem] text-white/80 hover:bg-white/[0.08] hover:text-white"><LogOut className="size-4" /> Sign out</button>
      </div>
    </>
  )

  return (
    <div className="min-h-dvh bg-[#f5f1ea] text-charcoal-900">
      <aside aria-label="Admin menu" className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-charcoal-900 lg:flex">{menu}</aside>

      {/* phones and tablets: the menu slides over the page */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-hidden tabIndex={-1} className="absolute inset-0 bg-charcoal-950/60" onClick={() => setOpen(false)} />
          <aside aria-label="Admin menu" className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-charcoal-900">
            <button ref={closeButton} type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-2 top-3 grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10"><X className="size-5" /></button>
            {menu}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-charcoal-900/10 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg hover:bg-charcoal-900/[0.06]"><Menu className="size-5" /></button>
          <Link to="/admin" className="font-display text-[1.05rem]">रोहन सुभाष देशमुख <span className="font-sans text-[0.78rem] text-charcoal-800/75">· admin</span></Link>
        </header>
        <main className="mx-auto max-w-[78rem] px-4 pb-24 pt-6 sm:px-6 lg:px-9 lg:pt-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
