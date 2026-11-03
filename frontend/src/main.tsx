import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'
// The site's fonts (the PDF's usage guide), self-hosted — headings: Playfair Display + Noto Serif Devanagari, body: Inter + Noto Sans
// Devanagari; each loads only the letters a page uses (see index.css)
import '@fontsource-variable/playfair-display/wght.css'
import '@fontsource-variable/noto-serif-devanagari/wght.css'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/noto-sans-devanagari/wght.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>,
)
