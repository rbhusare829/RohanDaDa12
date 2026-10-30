import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router/dom'
import { router } from './router'
// Marathi typography (matching subhashdeshmukh.com): Mukta for clean body & Baloo 2 + DB Hindi 6 for bold political headings
import '@fontsource/mukta/400.css'
import '@fontsource/mukta/500.css'
import '@fontsource/mukta/600.css'
import '@fontsource/mukta/700.css'
import '@fontsource/mukta/800.css'
import '@fontsource/baloo-2/500.css'
import '@fontsource/baloo-2/600.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/baloo-2/800.css'
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
