import type { Header } from '@/types/cms'
import { normalizeNav, type NavNode } from './nav'
import { isExternal } from './utils'

export type SectionMenu = { title: string | null; sectionHref?: string; items: { label: string; href: string }[] }

/**
 * Side menu = the siblings of the current page in the header's mega menu.
 * Returns the parent's label (the breadcrumb / section title) and the sibling links.
 */
export function getSectionMenu(path: string, header: Header): SectionMenu {
  const nav = normalizeNav(header.nav as never)
  const walk = (nodes: NavNode[], parent: NavNode | null): { parent: NavNode | null; siblings: NavNode[] } | null => {
    // prefer the deepest match (a section parent often links to its first child page)
    for (const n of nodes) {
      if (n.children?.length) {
        const r = walk(n.children, n)
        if (r) return r
      }
    }
    for (const n of nodes) if (n.url === path) return { parent, siblings: nodes }
    return null
  }
  const found = walk(nav, null)
  if (!found?.parent) return { title: null, items: [] }
  return {
    title: found.parent.label,
    sectionHref: found.parent.url ?? undefined,
    items: found.siblings.filter((s) => s.url && !isExternal(s.url)).map((s) => ({ label: s.label, href: s.url! })),
  }
}
