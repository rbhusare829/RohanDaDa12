import { createBrowserRouter, redirect, type RouteObject } from 'react-router'
import { layoutLoader, ROOT_ROUTE_ID } from '@/lib/layout'
import { RootLayout } from '@/components/layout/RootLayout'
import { AdminLoading, FatalError, NotFound, PageError, PageSkeleton } from '@/pages/ErrorPages'
import HomePage, { loader as homeLoader } from '@/pages/Home'
import BlogPage, { loader as blogLoader } from '@/pages/Blog'
import PostPage, { loader as postLoader } from '@/pages/BlogPost'
import EventsPage, { loader as eventsLoader } from '@/pages/Events'
import EventPage, { loader as eventLoader } from '@/pages/EventPage'
import SocialWorkPage, { loader as socialWorkLoader } from '@/pages/SocialWork'
import InitiativePage, { loader as initiativeLoader } from '@/pages/Initiative'
import FoundationPage, { loader as foundationLoader } from '@/pages/Foundation'
import FamilyPage, { loader as familyLoader } from '@/pages/Family'
import ContactPage, { loader as contactLoader } from '@/pages/Contact'
import { AlbumPage, PhotosPage, VideosPage, albumLoader, photosLoader, videosLoader } from '@/pages/Media'
import CmsPage, { loader as cmsLoader } from '@/pages/CmsPage'

const pages: RouteObject[] = [
  { index: true, loader: homeLoader, Component: HomePage },
  { path: 'about/family', loader: familyLoader, Component: FamilyPage },
  { path: 'blog', loader: blogLoader, Component: BlogPage },
  { path: 'blog/:slug', loader: postLoader, Component: PostPage },
  { path: 'contact', loader: contactLoader, Component: ContactPage },
  { path: 'events', loader: eventsLoader, Component: EventsPage },
  { path: 'events/:slug', loader: eventLoader, Component: EventPage },
  { path: 'lokmangal/foundation', loader: foundationLoader, Component: FoundationPage },
  { path: 'media/photos', loader: photosLoader, Component: PhotosPage },
  { path: 'media/photos/:slug', loader: albumLoader, Component: AlbumPage },
  { path: 'media/videos', loader: videosLoader, Component: VideosPage },
  { path: 'social-work', loader: socialWorkLoader, Component: SocialWorkPage },
  { path: 'social-work/:slug', loader: initiativeLoader, Component: InitiativePage },
  // the old bilingual addresses: /en/about → /about
  { path: 'en', loader: () => redirect('/') },
  { path: 'en/*', loader: ({ params }) => redirect(`/${params['*'] ?? ''}`) },
  // any page made in the admin under Pages (Biography, Vision, Appeal…), found by its address; nothing found = 404
  { path: '*', loader: cmsLoader, Component: CmsPage },
]

export const router = createBrowserRouter([
  // the admin panel is its own app (loaded only when someone opens /admin)
  { path: 'admin/*', lazy: () => import('@/admin/route'), HydrateFallback: AdminLoading },
  {
    id: ROOT_ROUTE_ID,
    path: '/',
    loader: layoutLoader,
    shouldRevalidate: () => false,
    Component: RootLayout,
    ErrorBoundary: FatalError,
    HydrateFallback: PageSkeleton,
    children: [{ ErrorBoundary: PageError, children: pages }],
  },
  { path: '*', Component: NotFound },
])
