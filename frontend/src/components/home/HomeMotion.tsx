import { m, type Variants } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Scroll-in motion for the homepage only (Oct 2026) — the same names as ui/Motion, so a section switches by changing its import.
 * Each block fades in and rises (or slides in from the side, `x`) as it comes into view, once, on one soft ease-out curve; the
 * cards of a row follow one another. The rest of the site keeps the quieter ui/Motion. <MotionConfig reducedMotion="user">
 * (RootLayout) keeps everything still for visitors who ask their device for reduced motion — then only the fade remains.
 */

const EASE = [0.22, 1, 0.36, 1] as const
/** starts a little before the block is fully on screen, so it is settled by the time the visitor reads it */
const VIEW = { once: true, amount: 0.15, margin: '0px 0px -60px 0px' } as const

type Tag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'p' | 'span' | 'article' | 'figure'
type Props = { as?: Tag; className?: string; children?: ReactNode; id?: string; style?: CSSProperties }

/** one block: fade in + rise `y` px (or slide in from `x` px to the side) */
export function Reveal({ as = 'div', className, delay = 0, y = 28, x = 0, duration = 0.8, children, id, style }: Props & { delay?: number; y?: number; x?: number; duration?: number }) {
  const M = m[as] as typeof m.div
  return (
    <M
      id={id}
      style={style}
      className={className}
      initial={{ opacity: 0, y: x ? 0 : y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={VIEW}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
}

/** a row or grid whose items (StaggerItem) come in one after another */
export function Stagger({ as = 'div', className, children, style }: Props) {
  const M = m[as] as typeof m.div
  return (
    <M className={className} style={style} variants={list} initial="hidden" whileInView="show" viewport={VIEW}>
      {children}
    </M>
  )
}

export function StaggerItem({ as = 'div', className, children, style }: Props) {
  const M = m[as] as typeof m.div
  return (
    <M className={className} style={style} variants={item}>
      {children}
    </M>
  )
}
