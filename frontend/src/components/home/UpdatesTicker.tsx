import { Fragment } from 'react'
import { Link } from 'react-router'

const UPDATES = [
  { to: '/blog/lotus-blog-merit-determination-opportunity', mr: 'लोटस शिष्यवृत्ती योजना', en: 'LOTUS Scholarship Scheme' },
  { to: '/blog/lokmangal-annapurna-yojana', mr: 'लोकमंगल अन्नपूर्णा मोफत भोजन योजना', en: 'Lokmangal Annapurna Free Meal Scheme' },
  { to: '/blog/lokmangal-samudayik-vivah-sohala', mr: 'सर्वधर्मीय सामुदायिक विवाह सोहळा', en: 'Inter-faith Community Weddings' },
  { to: '/social-work', mr: 'ग्रामीण विकास व जलसंधारण प्रकल्प', en: 'Rural Development & Water Conservation' },
  { to: '/vision', mr: 'नव्या भारताचा संकल्पनामा (Vision 2047)', en: 'New India Manifesto (Vision 2047)' },
  { to: '/media/photos', mr: 'छायाचित्र दालन व महत्त्वाचे क्षण', en: 'Photo Gallery & Key Moments' },
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
        {/* it stops while the pointer or keyboard focus is on it; for visitors who ask for less motion it stands still and can be scrolled by hand */}
        <div className="group/ticker overflow-hidden whitespace-nowrap flex-1 ml-3 relative motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]">
          <div className="inline-flex items-center text-xs sm:text-sm text-charcoal-700 font-medium animate-[marquee_35s_linear_infinite] group-hover/ticker:[animation-play-state:paused] group-focus-within/ticker:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1 || undefined} className={`inline-flex shrink-0 items-center gap-8 pr-8${copy === 1 ? ' motion-reduce:hidden' : ''}`}>
                {UPDATES.map((u, i) => (
                  <Fragment key={u.to}>
                    {i > 0 && <span className="text-stone-300">|</span>}
                    <Link
                      to={u.to}
                      tabIndex={copy === 1 ? -1 : undefined}
                      className="inline-flex items-center gap-1.5 hover:text-[#e65100] transition-colors"
                    >
                      <span className="text-[#ff7a00] font-bold">&rarr;</span> {isMr ? u.mr : u.en}
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
