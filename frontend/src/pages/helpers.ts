/** A loader that cannot find its page: the router shows the "page not found" screen (and the backend already answered 404 for crawlers) */
export const notFound = (): never => {
  throw new Response('Not found', { status: 404, statusText: 'Not Found' })
}

export const searchOf = (request: Request) => new URL(request.url).searchParams

/** "/lokmangal/foundation/" → "/lokmangal/foundation" */
export const cleanPath = (p: string) => `/${p.replace(/^\/+|\/+$/g, '')}`.toLowerCase()
