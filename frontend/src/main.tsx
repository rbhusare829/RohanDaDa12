import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'
// Stitch design (Oct 2026): Space Grotesk headings, Plus Jakarta Sans text, Literata italic quotes — all self-hosted
// (Tiro Devanagari Marathi in index.css still draws any Marathi words)
import '@fontsource-variable/space-grotesk/wght.css'
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import '@fontsource-variable/literata/opsz-italic.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>,
)
