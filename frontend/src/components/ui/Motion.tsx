import { m, type Variants } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Motion helpers for the whole site (Stitch design, Oct 2026). They use the light `m` components, so they work inside
 * the site's <LazyMotion> (RootLayout); <MotionConfig reducedMotion="user"> there turns the movement off for visitors who
 * ask their device for reduced motion.
 * - Reveal: a block fades and rises once as it scrolls into view.
 * - Stagger + StaggerItem: the items of a row or grid come in one after another.
 * - Lift: a card that rises a little on hover and presses down on tap.
 */

const EASE = [0.2, 0.7, 0.2, 1] as const

type Tag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'dl' | 'p' | 'span' | 'article' | 'figure'

type Props = { as?: Tag; className?: string; children?: ReactNode; id?: string; style?: CSSProperties; ref?: React.Ref<any> }

export function Reveal({ as = 'div', className, delay = 0, y = 6, children, id, style, ref }: Props & { delay?: number; y?: number }) {
  const M = m[as] as typeof m.div
  return (
    <M
      ref={ref}
      id={id}
      style={style}
      className={className}
      initial={{ opacity: 0.9, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '200px' }}
      transition={{ duration: 0.35, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } } }
const item: Variants = {
  hidden: { opacity: 0.9, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
}

export function Stagger({ as = 'div', className, children, style, ref, ...rest }: Props & Record<string, any>) {
  const M = m[as] as typeof m.div
  return (
    <M ref={ref} className={className} style={style} variants={list} initial="show" whileInView="show" viewport={{ once: true, margin: '200px' }} {...rest}>
      {children}
    </M>
  )
}

export function StaggerItem({ as = 'div', className, children, style, ref, ...rest }: Props & Record<string, any>) {
  const M = m[as] as typeof m.div
  return (
    <M ref={ref} className={className} style={style} variants={item} {...rest}>
      {children}
    </M>
  )
}

/** hover lift for cards (desktop) and a gentle press on tap (phones) */
export function Lift({ as = 'div', className, children }: Props) {
  const M = m[as] as typeof m.div
  return (
    <M className={className} whileHover={{ y: -6 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 320, damping: 24 }}>
      {children}
    </M>
  )
}
