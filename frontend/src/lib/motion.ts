import { useSyncExternalStore } from 'react'

const REDUCED = '(prefers-reduced-motion: reduce)'

/** The one ease-out of the site: arrive fast, settle softly (the same curve as --ease-soft in index.css). Every entrance in components/ui/Motion.tsx uses it. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** True while the visitor's system asks for less motion; follows a change of that setting while the page is open */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED).matches, () => false)
}
