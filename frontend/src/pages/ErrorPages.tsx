import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { Helmet } from 'react-helmet-async'

/** "Page not found" — inside the site's header and footer */
export function NotFound() {
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-24 text-center">
      <Helmet>
        <title>Page not found | Rohan Subhash Deshmukh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="animate-fade-up">
        <p className="font-display text-8xl text-saffron-600">404</p>
        <h1 className="mt-4 text-3xl text-charcoal-900">Page not found</h1>
        <p className="mt-3 text-muted">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="btn btn-dark mt-8">Home</Link>
      </div>
    </section>
  )
}

/** A page failed to load: not-found screen for a 404, a friendly retry for anything else (the website stays around it) */
export function PageError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />
  return <Problem />
}

function Problem() {
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-24 text-center" role="alert">
      <div>
        <p className="font-display text-6xl text-saffron-600">:(</p>
        <h1 className="mt-4 text-3xl text-charcoal-900">This page could not be loaded</h1>
        <p className="mt-3 text-muted">Please check your connection and try again.</p>
        <button type="button" onClick={() => window.location.reload()} className="btn btn-dark mt-8">Try again</button>
      </div>
    </section>
  )
}

/** The whole site could not start (for example the server is down): no header or footer to show */
export function FatalError() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream p-6 text-center" role="alert">
      <div>
        <h1 className="text-3xl text-charcoal-900">The website is temporarily unavailable</h1>
        <p className="mt-3 text-muted">Please try again in a few minutes.</p>
        <button type="button" onClick={() => window.location.reload()} className="btn btn-dark mt-8">Try again</button>
      </div>
    </main>
  )
}

/** Shown while the first page is loading: the same banner and grid as a real page, so nothing jumps */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <section className="bg-cream">
        <div className="container-x flex min-h-[17rem] flex-col justify-end pb-10 pt-12 md:min-h-[22rem] md:pb-14 md:pt-16">
          <div className="h-5 w-40 skeleton rounded-full bg-charcoal-900/10" />
          <div className="mt-5 h-11 w-3/4 max-w-xl skeleton rounded-2xl bg-charcoal-900/10 md:h-16" />
          <div className="mt-4 h-6 w-2/3 max-w-lg skeleton rounded-full bg-charcoal-900/[0.07]" />
        </div>
      </section>
      <div className="container-x grid gap-x-7 gap-y-12 pb-20 pt-12 sm:grid-cols-2 md:pt-16 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[16/10] skeleton rounded-[1.25rem] bg-cream" />
            <div className="mt-5 space-y-3">
              <div className="h-5 w-3/4 skeleton rounded-full bg-cream" />
              <div className="h-4 w-full skeleton rounded-full bg-cream" />
              <div className="h-4 w-5/6 skeleton rounded-full bg-cream" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

/** Shown while the admin panel's code is being fetched */
export function AdminLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#f5f1ea] text-charcoal-800/70" role="status">
      Loading the admin…
    </div>
  )
}
