import { useSyncExternalStore } from 'react'

const REDUCED = '(prefers-reduced-motion: reduce)'

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** True while the visitor's system asks for less motion; follows a change of that setting while the page is open */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED).matches, () => false)
}
