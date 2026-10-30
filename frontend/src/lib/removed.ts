/**
 * Pages removed in the Oct 2026 restructure, and the page each one now points to.
 * The backend redirects these addresses (backend/src/lib/seo.js — keep both lists in step); this copy is used by the
 * website itself (development server, links followed inside the site) and to leave them out of the menu.
 */
export const REMOVED_REDIRECTS: Record<string, string> = {
  '/about/achievements': '/about/introduction?tab=family',
  '/about/party-organisation': '/political-career',
  '/about/thoughts': '/blog',
  '/about/leaders': '/about/introduction?tab=family',
  // Family Background: a tab of the परिचय page since Oct 2026 (so it also leaves the menus)
  '/about/biography': '/about/introduction?tab=family',
  '/lokmangal/vishwamangal': '/lokmangal/foundation',
  '/media/downloads': '/media/photos',
  '/grievance': '/contact',
  '/careers': '/contact',
  '/search': '/',
}

export const isRemovedPath = (path: string) => Object.keys(REMOVED_REDIRECTS).some((p) => path === p || path.startsWith(`${p}/`))
