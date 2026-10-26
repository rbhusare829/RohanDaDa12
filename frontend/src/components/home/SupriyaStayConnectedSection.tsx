import { useEffect, useState } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { cms, type FacebookPost } from '@/lib/api'
import { useLayout } from '@/lib/layout'
import { Reveal } from '../ui/Motion'

const FALLBACK_PAGE = 'https://www.facebook.com/rohandeshmukh.official/'
const SHOWN = 3

const dateOf = (iso: string | null, isMr: boolean) => {
  const d = iso ? new Date(iso) : null
  return d && !Number.isNaN(d.getTime()) ? new Intl.DateTimeFormat(isMr ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(d) : ''
}

/**
 * Stay Connected: the Facebook Page's latest posts. They come from the backend (/api/facebook/posts — Facebook only gives them
 * out through its API, with the Page's access token). Until that is set up, or if Facebook does not answer, the card shows a plain
 * "see our Facebook page" button instead — never made-up posts.
 */
export function SupriyaStayConnectedSection({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const isMr = locale !== 'en'
  const { settings } = useLayout()
  const pageUrl = settings.social?.facebook || FALLBACK_PAGE
  const [posts, setPosts] = useState<FacebookPost[] | null>(null) // null = still loading

  useEffect(() => {
    let live = true
    cms.facebookPosts().then(
      (list) => live && setPosts(list.slice(0, SHOWN)),
      () => live && setPosts([]),
    )
    return () => {
      live = false
    }
  }, [])

  return (
    <section className="overflow-hidden border-b border-stone-200 bg-white py-14 sm:py-20">
      <div className="container-x">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-600">{isMr ? 'सोशल मीडिया' : 'Social Media'}</span>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#000d3d] sm:text-3xl lg:text-4xl">{isMr ? 'संपर्कात रहा' : 'Stay Connected'}</h2>
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <span className="h-1 w-14 rounded-full bg-red-600" />
            <span className="h-1 w-3 rounded-full bg-saffron-500" />
          </div>
        </div>

        <Reveal className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {/* Facebook Page header */}
            <div className="flex items-center justify-between gap-3 bg-[#1877F2] p-4 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <img src="/images/portraits/rohan-deshmukh-office.webp" alt="" className="size-11 shrink-0 rounded-full border-2 border-white object-cover object-top" />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold leading-tight text-white">Rohan Subhash Deshmukh</h3>
                  <span className="text-xs text-white/80">Facebook</span>
                </div>
              </div>
              <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full bg-white px-3.5 py-1 text-xs font-extrabold text-[#1877F2] transition-colors hover:bg-slate-100">
                {isMr ? 'फॉलो करा' : 'Follow'}
              </a>
            </div>

            {/* Latest posts */}
            {posts === null ? (
              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
                {Array.from({ length: SHOWN }, (_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-xl bg-stone-100" />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <ul className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <li key={post.id} className="min-w-0">
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-stone-50/50 transition-all hover:-translate-y-0.5 hover:shadow-md">
                      {post.image && (
                        <div className="aspect-[16/10] w-full overflow-hidden bg-stone-200">
                          <img src={post.image} alt="" loading="lazy" className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-2 p-3.5 text-slate-700">
                        {dateOf(post.createdAt, isMr) && <span className="text-[11px] font-semibold text-slate-500">{dateOf(post.createdAt, isMr)}</span>}
                        {post.text && <p className="line-clamp-5 whitespace-pre-line text-[13px] leading-relaxed">{post.text}</p>}
                        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-bold text-[#1877F2]">
                          {isMr ? 'फेसबुकवर पहा' : 'View on Facebook'} <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-14 text-center">
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600">{isMr ? 'ताज्या पोस्ट, कार्यक्रम आणि उपक्रम पाहण्यासाठी आमचे अधिकृत फेसबुक पेज पहा.' : 'See the latest posts, events and initiatives on our official Facebook page.'}</p>
                <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1565d8]">
                  {isMr ? 'फेसबुक पेज पहा' : 'Visit our Facebook page'} <ExternalLink className="size-4" />
                </a>
              </div>
            )}

            {/* Footer */}
            {posts !== null && posts.length > 0 && (
              <div className="border-t border-stone-200 bg-stone-50 p-3 text-center">
                <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#1877F2] hover:underline">
                  <span>{isMr ? 'फेसबुकवर अधिक पहा' : 'View more on Facebook'}</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
