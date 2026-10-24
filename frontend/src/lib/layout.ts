import { useRouteLoaderData } from 'react-router'
import type { Footer, Header, Popup, SiteSetting } from '@/types/cms'
import { cms } from './api'

/** What every page needs: the site settings, the menu, the footer and the popup (loaded once by the root route) */
export type LayoutData = { settings: SiteSetting; header: Header; footer: Footer; popup: Popup }

export const ROOT_ROUTE_ID = 'root'

export async function layoutLoader(): Promise<LayoutData> {
  const [settings, header, footer, popup] = await Promise.all([cms.global('site-settings'), cms.global('header'), cms.global('footer'), cms.global('popup')])
  return { settings, header, footer, popup }
}

export const useLayout = () => useRouteLoaderData(ROOT_ROUTE_ID) as LayoutData
