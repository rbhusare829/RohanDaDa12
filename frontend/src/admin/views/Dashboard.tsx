import { Link } from 'react-router'
import { BookText, Compass, Handshake, Home, Megaphone, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { admin } from '../api'
import { useAsync, useAuth, useSchema } from '../context'
import { Card, Pill, Spinner } from '../ui'

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
const fmt = (d: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d))

/** First screen of the admin: a greeting, shortcuts to the common jobs, the numbers and the latest messages */
export function Dashboard() {
  const { user } = useAuth()
  const { collection, global } = useSchema()
  const data = useAsync(() => admin.dashboard(), [])
  const c = data.data?.counts
  const can = (slug: string, op: 'create' | 'read' = 'read') => collection(slug)?.permissions[op]

  const actions = [
    { to: '/admin/globals/home', title: 'Edit homepage', text: 'Slider, sections & order', icon: Home, show: global('home')?.permissions.update },
    { to: '/admin/collections/posts/create', title: 'Write a blog post', text: 'English + मराठी', icon: PenLine, show: can('posts', 'create') },
    { to: '/admin/collections/albums/create', title: 'New photo album', text: 'Upload event photos', icon: BookText, show: can('albums', 'create') },
    { to: '/admin/collections/initiatives', title: 'Social initiatives', text: 'Counters, galleries, videos', icon: Handshake, show: can('initiatives') },
    { to: '/admin/globals/header', title: 'Edit menu', text: '3-level mega menu', icon: Compass, show: global('header')?.permissions.update },
    { to: '/admin/globals/popup', title: 'Site popup', text: 'Announcements on/off', icon: Megaphone, show: global('popup')?.permissions.update },
  ].filter((a) => a.show)

  const stats = [
    { label: 'Pages', value: c?.pages, to: '/admin/collections/pages' },
    { label: 'Blog posts', value: c?.posts, to: '/admin/collections/posts' },
    { label: 'Initiatives', value: c?.initiatives, to: '/admin/collections/initiatives' },
    { label: 'Photo albums', value: c?.albums, to: '/admin/collections/albums' },
    { label: 'Photos', value: c?.photos, to: '/admin/collections/media' },
  ].filter((s) => s.value != null)

  return (
    <div>
      <section className="rounded-2xl bg-gradient-to-br from-charcoal-900 to-charcoal-700 p-6 text-white sm:p-8">
        <p className="text-[0.95rem] text-saffron-300">{greeting()}{user?.name ? `, ${user.name}` : ''} 👋</p>
        <h1 className="mt-1 font-display text-[2rem] leading-tight">रोहन सुभाष देशमुख — Website</h1>
        <p className="mt-2 max-w-2xl text-white/75">Manage pages, social work, photos, blog and messages from one place. Every text field has an English and a मराठी version — switch with the language buttons at the top of any edit screen.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white px-4 py-2 text-[0.9rem] font-semibold text-charcoal-900 hover:bg-cream">View website ↗</a>
          {can('contact-messages') && <Link to="/admin/collections/contact-messages" className="rounded-lg px-4 py-2 text-[0.9rem] font-semibold text-white ring-1 ring-white/40 hover:bg-white/10">Open inbox{c?.newMessages ? ` (${c.newMessages} new)` : ''}</Link>}
        </div>
      </section>

      {data.loading && !data.data ? <Spinner /> : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-[1.25rem]">Quick actions</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {actions.map((a) => (
                <Link key={a.to} to={a.to} className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-charcoal-900/10 transition hover:bg-cream hover:ring-saffron-300">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-saffron-50 text-saffron-600"><a.icon className="size-5" /></span>
                  <span className="min-w-0"><span className="block font-semibold">{a.title}</span><span className="block truncate text-[0.82rem] text-charcoal-800/75">{a.text}</span></span>
                </Link>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
              {stats.map((s) => (
                <Link key={s.label} to={s.to} className="rounded-xl bg-charcoal-900/[0.04] px-3 py-3 text-center transition hover:bg-saffron-50">
                  <strong className="block font-display text-[1.6rem] leading-none">{s.value}</strong>
                  <span className="mt-1 block text-[0.78rem] text-charcoal-800/70">{s.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          {can('contact-messages') && (
            <Card>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-[1.25rem]">Latest inbox</h2>
                <Link to="/admin/collections/contact-messages" className="text-[0.88rem] font-semibold text-saffron-700 hover:underline">See all →</Link>
              </div>
              {data.data?.recent.length ? (
                <ul className="mt-3 divide-y divide-charcoal-900/10">
                  {data.data.recent.map((m) => (
                    <li key={m.id}>
                      <Link to={`/admin/collections/contact-messages/${m.id}`} className="flex items-start gap-3 py-3 transition hover:bg-cream/60">
                        <Pill tone={m.status}>{m.status}</Pill>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{m.name}</span>
                          <span className="block truncate text-[0.85rem] text-charcoal-800/75">{(m.subject || m.message || '').slice(0, 90)}</span>
                        </span>
                        <span className="shrink-0 text-[0.78rem] text-charcoal-800/75">{fmt(m.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cn('mt-4 rounded-lg bg-charcoal-900/[0.04] p-6 text-center text-charcoal-800/75')}>No messages yet. Contact form submissions will appear here.</p>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
