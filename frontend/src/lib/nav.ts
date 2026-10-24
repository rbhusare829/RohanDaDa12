import { isRemovedPath } from './removed'

export type NavNode = { id?: string | null; label: string; url?: string | null; newTab?: boolean | null; children?: NavNode[] | null }

type Raw = { id?: string | null; label: string; url?: string | null; newTab?: boolean | null; children?: Raw[] | null; subItems?: Raw[] | null }

/** Links to pages removed from the website are dropped, even if an older menu in the database still lists them */
export const isLiveLink = (url?: string | null) => !url || !url.startsWith('/') || !isRemovedPath(url.split(/[?#]/)[0])

/** The CMS stores level 3 as "subItems"; the UI gets one uniform `children` tree */
export const normalizeNav = (items: Raw[] | null | undefined): NavNode[] =>
  (items ?? [])
    .filter((n) => isLiveLink(n.url))
    .map((n) => ({ id: n.id, label: n.label, url: n.url, newTab: n.newTab, children: normalizeNav(n.children ?? n.subItems) }))
