import { Children, useMemo, type ComponentProps, type CSSProperties, type ReactNode, type Ref } from 'react'
import { createPortal } from 'react-dom'
import { m, useReducedMotion, useScroll, useSpring, type Variants } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Motion for the whole site — one rhythm, so every page moves the same way (ui-ux-pro-max motion rules):
 * - only opacity and transform move (never width / height / top / left), so it stays smooth on a phone;
 * - arrivals use one soft ease-out (the same curve as `--ease-soft` in index.css) over 0.5–0.6 s; hover and press feedback is quicker (0.15–0.25 s);
 * - few things move at once: a heading arrives first and its cards follow 70 ms apart (a row never takes longer than 0.5 s in total);
 * - visitors who ask their device for less motion get everything in place at once: there is no hidden first state for them.
 * They use the light `m` components, so they work inside the site's <LazyMotion> (RootLayout); <MotionConfig reducedMotion="user"> there
 * also switches off the movement of everything else that animates.
 * - Reveal: a block fades and rises once as it scrolls into view.
 * - Stagger + StaggerItem: the items of a row or grid come in one after another.
 * - AccentBar: the red + kesariya bar under a heading draws itself in. DrawRule: a thin rule after a heading draws itself out to the right.
 * - Lift: a card that rises a little on hover and presses down on tap.
 * - ReadingProgress: a thin bar at the top of the screen that fills while an article is read.
 */

/** a block animates once, when its top edge has come 10% into the screen (so the visitor sees it happen, not only the end of it) */
const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

type Tag = 'div' | 'section' | 'ul' | 'ol' | 'li' | 'dl' | 'p' | 'span' | 'article' | 'figure'

type Props = { as?: Tag; className?: string; children?: ReactNode; id?: string; style?: CSSProperties; ref?: Ref<HTMLDivElement> }

/** anything else a caller may pass through to the element (aria-*, data-*, handlers); the animation props stay ours */
type Rest = Omit<ComponentProps<typeof m.div>, keyof Props | 'variants' | 'initial' | 'animate' | 'whileInView' | 'viewport' | 'transition'>

export function Reveal({ as = 'div', className, delay = 0, y = 20, x = 0, scale = 1, children, id, style, ref }: Props & { delay?: number; y?: number; x?: number; scale?: number }) {
  const M = m[as] as typeof m.div
  const calm = useReducedMotion()
  return (
    <M
      ref={ref}
      id={id}
      style={style}
      className={className}
      initial={calm ? false : { opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </M>
  )
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

/** `step` = seconds between two items; it shrinks by itself for long lists so the last item still arrives within about half a second */
export function Stagger({ as = 'div', className, children, style, ref, step = 0.07, delay = 0.04, ...rest }: Props & Rest & { step?: number; delay?: number }) {
  const M = m[as] as typeof m.div
  const calm = useReducedMotion()
  const count = Children.count(children)
  const gap = count > 1 ? Math.min(step, 0.5 / (count - 1)) : step
  const list = useMemo<Variants>(() => ({ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }), [gap, delay])
  return (
    <M ref={ref} className={className} style={style} variants={list} initial={calm ? 'show' : 'hidden'} whileInView="show" viewport={VIEWPORT} {...rest}>
      {children}
    </M>
  )
}

export function StaggerItem({ as = 'div', className, children, style, ref, ...rest }: Props & Rest) {
  const M = m[as] as typeof m.div
  return (
    <M ref={ref} className={className} style={style} variants={item} {...rest}>
      {children}
    </M>
  )
}

/**
 * The short red bar and the kesariya dot under a heading: the bar draws itself in, then the dot pops after it.
 * `className` places it (margins, justify-center); `bar` / `dot` change their size.
 */
export function AccentBar({ className, bar = 'h-1 w-14', dot = 'h-1 w-3', center = false }: { className?: string; bar?: string; dot?: string; center?: boolean }) {
  const calm = useReducedMotion()
  return (
    <m.div
      aria-hidden
      className={cn('flex items-center gap-1.5', center && 'justify-center', className)}
      variants={{ hidden: {}, show: { transition: { delayChildren: 0.2, staggerChildren: 0.3 } } }}
      initial={calm ? false : 'hidden'}
      whileInView="show"
      viewport={VIEWPORT}
    >
      <m.span
        className={cn('rounded-full bg-red-600', bar)}
        style={{ originX: center ? 0.5 : 0 }}
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.55, ease: EASE_OUT } } }}
      />
      <m.span
        className={cn('rounded-full bg-saffron-500', dot)}
        variants={{ hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } } }}
      />
    </m.div>
  )
}

/** A thin rule (after a heading, in a flex row) that draws itself out to the right when it scrolls into view */
export function DrawRule({ className, tone = 'bg-saffron-300' }: { className?: string; tone?: string }) {
  const calm = useReducedMotion()
  return (
    <span aria-hidden className={cn('relative h-px flex-1 overflow-hidden bg-line', className)}>
      <m.span
        className={cn('absolute inset-0 origin-left', tone)}
        initial={calm ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
      />
    </span>
  )
}

/** hover lift for cards (desktop) and a gentle press on tap (phones) */
export function Lift({ as = 'div', className, children }: Props) {
  const M = m[as] as typeof m.div
  return (
    <M className={className} whileHover={{ y: -5 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
      {children}
    </M>
  )
}

/**
 * A thin bar at the very top of the screen that fills while the page is scrolled — for long articles (it tells how much is left to read).
 * It is drawn into <body>: while a page settles in (RootLayout's PageStage) its wrapper is transformed, and a `fixed` bar inside it would be
 * placed against the wrapper instead of the screen for that moment.
 */
export function ReadingProgress({ className }: { className?: string }) {
  const calm = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 })
  return createPortal(
    <m.div aria-hidden className={cn('fixed inset-x-0 top-0 z-[89] h-[3px] origin-left bg-gradient-to-r from-red-600 to-saffron-500', className)} style={{ scaleX: calm ? scrollYProgress : smooth }} />,
    document.body,
  )
}
