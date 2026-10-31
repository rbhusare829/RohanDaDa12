import type { Variants } from 'motion/react'

/* Scroll-in animations (Oct 2026) of the Political Career page — its chapters and the Social Activities list — once per block; <MotionConfig reducedMotion="user"> (RootLayout) keeps them still for visitors
   who ask their device for reduced motion. The photo slides in from its own side, the words rise one after another, the red-and-saffron
   bar draws itself, and the key facts rise in turn. */
export const EASE = [0.22, 1, 0.36, 1] as const
export const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
export const rise: Variants = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }
export const draw: Variants = { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, ease: EASE } } }
export const photo = (fromRight: boolean): Variants => ({
  hidden: { opacity: 0, x: fromRight ? 48 : -48, scale: 0.96 },
  show: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.75, ease: EASE } },
})
export const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.2 } } as const
