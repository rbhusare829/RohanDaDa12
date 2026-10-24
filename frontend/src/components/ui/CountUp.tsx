import { useEffect, useMemo, useRef, useState } from 'react'

const DEVANAGARI = '०१२३४५६७८९'
const toLatin = (s: string) => s.replace(/[०-९]/g, (d) => String(DEVANAGARI.indexOf(d)))
const toDevanagari = (s: string) => s.replace(/[0-9]/g, (d) => DEVANAGARI[Number(d)])

/** Indian grouping (1,00,000) or international (100,000), matching how the editor typed it */
function group(n: number, indian: boolean) {
  const s = String(n)
  if (!indian || s.length <= 3) return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const last3 = s.slice(-3)
  return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
}

type Parsed = { prefix: string; target: number; decimals: number; suffix: string; commas: boolean; indian: boolean; deva: boolean }

/** "३,२२१+" → prefix "", 3221, suffix "+", Devanagari digits, Indian grouping. null when there is no number to animate. */
function parse(value: string): Parsed | null {
  const m = toLatin(value).match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s)
  if (!m) return null
  const [, prefix, num, suffix] = m
  const target = Number(num.replace(/,/g, ''))
  if (!Number.isFinite(target) || target === 0) return null
  // a year (२००७, 2015) is a date, not a quantity — never count it up
  if (!num.includes(',') && !num.includes('.') && target >= 1900 && target <= 2100) return null
  const groups = num.split('.')[0].split(',')
  return {
    prefix: value.slice(0, prefix.length),
    target,
    decimals: num.includes('.') ? num.split('.')[1].length : 0,
    suffix: value.slice(value.length - suffix.length),
    commas: num.includes(','),
    indian: groups.length > 2 && groups.slice(1, -1).every((g) => g.length === 2),
    deva: /[०-९]/.test(value),
  }
}

function format(p: Parsed, n: number) {
  const fixed = p.decimals ? n.toFixed(p.decimals) : String(Math.round(n))
  const [int, dec] = fixed.split('.')
  let out = p.commas ? group(Number(int), p.indian) : int
  if (dec) out += '.' + dec
  return p.prefix + (p.deva ? toDevanagari(out) : out) + p.suffix
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Number that counts up from 0 when it scrolls into view (once).
 * Keeps the editor's format: Marathi digits, commas, "+", "%", "कोटी"…
 * An invisible copy of the final value reserves the width, so nothing jumps; screen readers always read the final value.
 */
export function CountUp({ value, duration = 1800, className }: { value: string; duration?: number; className?: string }) {
  const parsed = useMemo(() => parse(value), [value])
  const ref = useRef<HTMLSpanElement>(null)
  // text shown while counting (for this value); until then the number reads 0, so it never flashes its final value first
  const [counting, setCounting] = useState<{ value: string; text: string } | null>(null)
  const animate = parsed !== null && !reducedMotion()
  const shown = counting?.value === value ? counting.text : animate ? format(parsed, 0) : value

  useEffect(() => {
    const el = ref.current
    if (!parsed || !el || reducedMotion()) return
    let raf = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // ease-out: fast start, gentle finish
        setCounting({ value, text: t < 1 ? format(parsed, parsed.target * eased) : value })
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [parsed, value, duration])

  if (!parsed) return <span className={className}>{value}</span>
  return (
    <span ref={ref} className={`relative inline-block whitespace-nowrap tabular-nums ${className ?? ''}`}>
      {/* invisible final value keeps the width steady while counting */}
      <span aria-hidden className="invisible">{value}</span>
      <span aria-hidden className="absolute inset-0 whitespace-nowrap">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
