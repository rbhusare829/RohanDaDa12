import { Fragment } from 'react'
import { Link } from 'react-router'

const UPDATES = [
  { to: '/blog/lotus-blog-merit-determination-opportunity', label: 'लोटस शिष्यवृत्ती योजना' },
  { to: '/blog/lokmangal-annapurna-yojana', label: 'लोकमंगल अन्नपूर्णा मोफत भोजन योजना' },
  { to: '/blog/lokmangal-samudayik-vivah-sohala', label: 'सर्वधर्मीय सामुदायिक विवाह सोहळा' },
  { to: '/social-work', label: 'ग्रामीण विकास व जलसंधारण प्रकल्प' },
  { to: '/vision', label: 'नव्या भारताचा संकल्पनामा (Vision 2047)' },
  { to: '/media/photos', label: 'छायाचित्र दालन व महत्त्वाचे क्षण' },
]

/**
 * Scrolling Updates Ticker: a full-width strip directly under the header on the home page.
 * The list is rendered twice so the marquee (which moves by -50%) loops without a gap; the copy is hidden from screen readers.
 */
export function UpdatesTicker({ locale = 'mr' }: { locale?: 'mr' | 'en' }) {
  const isMr = locale !== 'en'

  return (
    <div className="border-b border-stone-200/80 bg-[#fbf9f5]">
      <div className="container-x flex items-center py-2.5">
        <div className="shrink-0 flex items-center gap-2 pr-3 sm:pr-4 border-r border-stone-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#e65100]">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          <span>{isMr ? 'महत्त्वाचे दुवे' : 'Updates'}</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1 ml-3 relative">
          <div className="inline-flex items-center text-xs sm:text-sm text-charcoal-700 font-medium animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1 || undefined} className="inline-flex shrink-0 items-center gap-8 pr-8">
                {UPDATES.map((u, i) => (
                  <Fragment key={u.to}>
                    {i > 0 && <span className="text-stone-300">|</span>}
                    <Link
                      to={u.to}
                      tabIndex={copy === 1 ? -1 : undefined}
                      className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors"
                    >
                      <span className="text-[#ff7a00] font-bold">&rarr;</span> {u.label}
                    </Link>
                  </Fragment>
                ))}
                <span className="text-stone-300">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
