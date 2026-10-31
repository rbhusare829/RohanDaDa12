import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'
// The site's one font (Oct 2026): Anek Devanagari, self-hosted — Devanagari and Latin, weights 100–800 (see index.css)
import '@fontsource-variable/anek-devanagari/wght.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>,
)
