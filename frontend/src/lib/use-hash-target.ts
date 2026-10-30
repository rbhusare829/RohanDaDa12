import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * A link to one part of a page (/social-activities#yuva-sahitya-sammelan, /lokmangal/foundation#projects) lands on it. The browser's own jump can
 * come before the photos above it have their height, so the page aims again once they have settled — unless the visitor has
 * started scrolling by then.
 */
export function useHashTarget() {
  const { hash, pathname } = useLocation()
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (!id) return
    let moved = false
    const stop = () => (moved = true)
    const go = () => !moved && document.getElementById(id)?.scrollIntoView({ block: 'start' })
    window.addEventListener('wheel', stop, { passive: true, once: true })
    window.addEventListener('touchstart', stop, { passive: true, once: true })
    const raf = requestAnimationFrame(go)
    const timers = [250, 700].map((ms) => window.setTimeout(go, ms))
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
    }
  }, [hash, pathname])
}
